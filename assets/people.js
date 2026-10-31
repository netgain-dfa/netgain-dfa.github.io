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

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function esc(s) { return s.replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }

function linkRow(p) {
  const out = [];
  if (p.email) out.push(`<a href="mailto:${esc(p.email)}">Email</a>`);
  if (p.profile) out.push(`<a href="${esc(p.profile)}">University profile</a>`);
  if (p.linkedin) out.push(`<a href="${esc(p.linkedin)}">LinkedIn</a>`);
  if (p.orcid) out.push(`<a href="${esc(p.orcid)}">ORCID</a>`);
  return out.join(" · ");
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
