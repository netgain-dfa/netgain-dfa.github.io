// People page. Data lives in data/people.csv; photos in assets/people/.
// To add someone: add a row to the CSV and drop a square photo named <slug>.jpg into assets/people/.
// If the photo column is blank, assets/people/<slug>.jpg is used.

const TOPICS = {
  "marine": "Marine",
  "uplands": "Uplands and peatland",
  "farming": "Farming and land use",
  "urban": "Urban",
  "finance": "Finance and markets",
  "policy": "Policy and governance",
  "monitoring": "Monitoring and data",
  "wildlife": "Wildlife management",
  "restoration": "Restoration",
};

const INSTITUTIONS = {
  "st-andrews": "St Andrews",
  "glasgow": "Glasgow",
  "aberdeen": "Aberdeen",
  "durham": "Durham",
};

function parseCSV(text) {
  const rows = []; let row = [], field = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') q = false;
      else field += c;
    } else if (c === '"') q = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else if (c !== "\r") field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  const head = rows.shift();
  return rows.filter(r => r.length > 1).map(r => Object.fromEntries(head.map((h, i) => [h, (r[i] || "").trim()])));
}

const ICONS = {
  email: '<svg viewBox="0 0 24 24"><path d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm1 2.4V17h16V7.4l-8 5.3-8-5.3zM4.6 7l7.4 4.9L19.4 7H4.6z"/></svg>',
  website: '<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm7.9 9h-3a15.7 15.7 0 0 0-1.3-5.6A8 8 0 0 1 19.9 11zM12 4.1c.9 1.1 2 3.4 2.3 6.9H9.7c.3-3.5 1.4-5.8 2.3-6.9zM4.1 13h3c.1 2 .6 3.9 1.3 5.6A8 8 0 0 1 4.1 13zm3-2h-3a8 8 0 0 1 4.3-5.6A15.7 15.7 0 0 0 7.1 11zM12 19.9c-.9-1.1-2-3.4-2.3-6.9h4.6c-.3 3.5-1.4 5.8-2.3 6.9zm3.6-1.3c.7-1.7 1.2-3.6 1.3-5.6h3a8 8 0 0 1-4.3 5.6z"/></svg>',
  linkedin: '<svg viewBox="0 0 24 24"><path d="M20.4 2H3.6A1.6 1.6 0 0 0 2 3.6v16.8A1.6 1.6 0 0 0 3.6 22h16.8a1.6 1.6 0 0 0 1.6-1.6V3.6A1.6 1.6 0 0 0 20.4 2zM8 19H5V9.5h3V19zM6.5 8.2a1.7 1.7 0 1 1 0-3.4 1.7 1.7 0 0 1 0 3.4zM19 19h-3v-4.6c0-1.1 0-2.5-1.5-2.5S12.7 13 12.7 14.3V19h-3V9.5h2.9v1.3c.4-.8 1.4-1.5 2.8-1.5 3 0 3.6 2 3.6 4.6V19z"/></svg>',
  scholar: '<svg viewBox="0 0 24 24"><path d="M12 3 1 9l11 6 9-4.9V17h2V9L12 3zm0 14.2-6-3.3V17c0 1.7 2.7 3 6 3s6-1.3 6-3v-3.1l-6 3.3z"/></svg>',
  orcid: '<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM8.2 16.5H6.8V8.9h1.4v7.6zM7.5 7.9a.9.9 0 1 1 0-1.8.9.9 0 0 1 0 1.8zm3 .9h3.3c3.1 0 4.5 2.2 4.5 3.8 0 2-1.5 3.9-4.5 3.9h-3.3V8.8zm1.4 1.2v5.2h1.9c2.4 0 3-1.8 3-2.6 0-1.4-.9-2.6-3-2.6h-1.9z"/></svg>',
  github: '<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.3-3.4-1.3-.4-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.6 2.4 1.1 3 .9.1-.7.4-1.1.6-1.4-2.2-.3-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.8 1a9.5 9.5 0 0 1 5 0c1.9-1.3 2.7-1 2.7-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.9-2.4 4.7-4.6 5 .4.3.7.9.7 1.9v2.8c0 .3.2.6.7.5A10 10 0 0 0 12 2z"/></svg>',
};
const LINK_ORDER = [["email","Email"],["profile","Website"],["linkedin","LinkedIn"],["scholar","Google Scholar"],["orcid","ORCID"],["github","GitHub"]];

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function esc(s) { return s.replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }

function linkRow(p) {
  return LINK_ORDER.map(([k, label]) => {
    const iconKey = k === "profile" ? "website" : k;
    const v = p[k];
    if (!v) return `<span title="${label}: not provided" aria-hidden="true">${ICONS[iconKey]}</span>`;
    const href = k === "email" ? "mailto:" + v : v;
    return `<a href="${esc(href)}" title="${label}" aria-label="${label}">${ICONS[iconKey]}</a>`;
  }).join("");
}

fetch("data/people.csv").then(r => r.text()).then(text => {
  const people = parseCSV(text).map(p => ({
    ...p,
    cohort: Number(p.cohort),
    topics: p.topics.split(";").map(t => t.trim()).filter(Boolean),
    photo: p.photo || `assets/people/${p.slug}.jpg`,
  }));
  const order = shuffle(people.slice());
  const list = document.getElementById("people-list");
  const filters = { cohort: null, institution: null, topic: null };

  function render() {
    const shown = order.filter(p =>
      (filters.cohort === null || p.cohort === filters.cohort) &&
      (filters.institution === null || p.institution === filters.institution) &&
      (filters.topic === null || p.topics.includes(filters.topic))
    );
    list.innerHTML = shown.map(p => `
      <li class="person inst-${p.institution}">
        <img src="${esc(p.photo)}" alt="" loading="lazy">
        <div>
          <h3>${esc(p.name)}</h3>
          <p class="meta">${INSTITUTIONS[p.institution] || esc(p.institution)} · Cohort ${p.cohort}${p.partner ? " · with " + esc(p.partner) : ""}</p>
          <p class="project">${esc(p.project)}</p>
          <p class="links">${linkRow(p)}</p>
        </div>
      </li>`).join("");
    document.getElementById("count").textContent =
      shown.length === people.length ? `${people.length} doctoral researchers` : `${shown.length} of ${people.length}`;
  }

  function chip(group, value, label, extra) {
    const b = document.createElement("button");
    b.type = "button"; b.textContent = label; b.className = "chip " + (extra || "");
    b.setAttribute("aria-pressed", "false");
    b.addEventListener("click", () => {
      filters[group] = filters[group] === value ? null : value;
      document.querySelectorAll(`[data-group="${group}"] .chip`).forEach(c => c.setAttribute("aria-pressed", c === b && filters[group] !== null));
      render();
    });
    return b;
  }

  const cohortsPresent = [...new Set(people.map(p => p.cohort))].sort();
  const cohorts = document.querySelector('[data-group="cohort"]');
  cohortsPresent.forEach(c => cohorts.appendChild(chip("cohort", c, `Cohort ${c}`)));
  const insts = document.querySelector('[data-group="institution"]');
  Object.entries(INSTITUTIONS).forEach(([k, v]) => insts.appendChild(chip("institution", k, v, "inst-" + k)));
  const topicsPresent = new Set(people.flatMap(p => p.topics));
  const topics = document.querySelector('[data-group="topic"]');
  Object.entries(TOPICS).filter(([k]) => topicsPresent.has(k)).forEach(([k, v]) => topics.appendChild(chip("topic", k, v)));

  render();
});
