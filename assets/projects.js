// Projects page. Data lives in data/projects.csv; partner logos in assets/partners/.
// Partner logo file name: the partner name lower-cased, non-letters replaced by hyphens, .png
// e.g. "Office for Environmental Protection" -> assets/partners/office-for-environmental-protection.png
// If no logo file exists, the partner name is shown as text.

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
const INSTITUTIONS = { "st-andrews": "St Andrews", "glasgow": "Glasgow", "aberdeen": "Aberdeen", "durham": "Durham" };

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
function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function esc(s) { return s.replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
function slug(s) { return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""); }

fetch("data/projects.csv").then(r => r.text()).then(text => {
  const projects = parseCSV(text).map((p, i) => ({
    ...p, id: i,
    cohort: Number(p.cohort),
    topics: p.topics.split(";").map(t => t.trim()).filter(Boolean),
    partners: p.partners.split(";").map(t => t.trim()).filter(Boolean),
  }));
  const order = shuffle(projects.slice());
  const list = document.getElementById("project-list");
  const filters = { cohort: null, institution: null, topic: null };
  let query = "";

  function partnerHTML(name) {
    const file = `assets/partners/${slug(name)}.png`;
    return `<span class="partner"><img src="${file}" alt="${esc(name)}" title="${esc(name)}" loading="lazy" onerror="this.replaceWith(Object.assign(document.createElement('span'),{textContent:this.alt}))"></span>`;
  }

  function render() {
    const q = query.toLowerCase();
    const shown = order.filter(p =>
      (filters.cohort === null || p.cohort === filters.cohort) &&
      (filters.institution === null || p.institution === filters.institution) &&
      (filters.topic === null || p.topics.includes(filters.topic)) &&
      (!q || [p.title, p.student, p.supervisor, p.partners.join(" "), p.summary].join(" ").toLowerCase().includes(q))
    );
    list.innerHTML = shown.map(p => `
      <li class="project-row inst-${p.institution}">
        <button class="project-toggle" aria-expanded="false" aria-controls="sum-${p.id}">
          <span class="project-title">${esc(p.title)}</span>
          <span class="project-team">${p.student ? esc(p.student) + ", " : "Supervised by "}${esc(p.supervisor)}</span>
          <span class="project-team">${esc(p.partners.join(", "))}</span>
          <span class="project-where">Cohort ${p.cohort}, ${INSTITUTIONS[p.institution]}</span>
        </button>
        <div class="project-summary" id="sum-${p.id}" hidden>
          <p>${p.summary ? esc(p.summary) : "Project summary to follow."}</p>
          <div class="partners">${p.partners.map(partnerHTML).join("")}</div>
        </div>
      </li>`).join("");
    list.querySelectorAll(".project-toggle").forEach(b => b.addEventListener("click", () => {
      const open = b.getAttribute("aria-expanded") !== "true";
      list.querySelectorAll('.project-toggle[aria-expanded="true"]').forEach(o => {
        if (o === b) return;
        o.setAttribute("aria-expanded", "false");
        document.getElementById(o.getAttribute("aria-controls")).hidden = true;
        o.closest(".project-row").classList.remove("open");
      });
      b.setAttribute("aria-expanded", open);
      document.getElementById(b.getAttribute("aria-controls")).hidden = !open;
      b.closest(".project-row").classList.toggle("open", open);
    }));
    document.getElementById("count").textContent =
      shown.length === projects.length ? `${projects.length} projects` : `${shown.length} of ${projects.length}`;
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

  const cohorts = document.querySelector('[data-group="cohort"]');
  [...new Set(projects.map(p => p.cohort))].sort().forEach(c => cohorts.appendChild(chip("cohort", c, `Cohort ${c}`)));
  const insts = document.querySelector('[data-group="institution"]');
  Object.entries(INSTITUTIONS).forEach(([k, v]) => insts.appendChild(chip("institution", k, v, "inst-" + k)));
  const present = new Set(projects.flatMap(p => p.topics));
  const topics = document.querySelector('[data-group="topic"]');
  Object.entries(TOPICS).filter(([k]) => present.has(k)).forEach(([k, v]) => topics.appendChild(chip("topic", k, v)));
  document.getElementById("search").addEventListener("input", e => { query = e.target.value.trim(); render(); });

  render();
});
