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






fetch("data/people.csv?v=" + DATA_V).then(r => r.text()).then(text => {
  const people = parseCSV(text).map(p => ({
    ...p,
    cohort: Number(p.cohort),
    topics: p.topics.split(";").map(t => t.trim()).filter(Boolean),
    photo: p.photo || `assets/people/${p.slug}.jpg`,
  }));
  const order = shuffle(people.slice());
  const list = document.getElementById("people-list");
  const filters = { cohort: null, institution: null, topic: null };
  let query = "";

  function render() {
    const shown = order.filter(p =>
      (filters.cohort === null || p.cohort === filters.cohort) &&
      (filters.institution === null || p.institution === filters.institution) &&
      (filters.topic === null || p.topics.includes(filters.topic)) &&
      (!query || [p.name, p.project, p.supervisor, p.partner, p.topics.join(" "), INSTITUTIONS[p.institution] || "", "cohort " + p.cohort].join(" ").toLowerCase().includes(query))
    );
    list.innerHTML = shown.map(p => `
      <li class="person inst-${p.institution}">
        <button class="open-person" data-slug="${esc(p.slug)}" aria-label="More about ${esc(p.name)}"><img src="${esc(p.photo)}" alt="" loading="lazy"></button>
        <div>
          <h3>${esc(p.name)} <button class="open-person bio-btn" data-slug="${esc(p.slug)}">bio</button></h3>
          <p class="project">${esc(p.project)}</p>
          <p class="meta">Supervised by ${esc(p.supervisor)}<br>Cohort ${p.cohort}, ${INSTITUTIONS[p.institution] || esc(p.institution)}${p.partner ? "<br>" + esc(p.partner) : ""}</p>
          <p class="links">${linkRow(p)}</p>
        </div>
      </li>`).join("");
    document.getElementById("count").textContent =
      shown.length === people.length ? `${people.length} doctoral researchers` : `${shown.length} of ${people.length}`;
    list.querySelectorAll(".open-person").forEach(b => b.addEventListener("click", () => openPerson(b.dataset.slug)));
  }

  // Lightbox
  const box = document.getElementById("lightbox");
  const boxBody = box.querySelector(".lightbox-body");
  let lastFocus = null;
  function openPerson(slug) {
    const p = people.find(x => x.slug === slug);
    if (!p) return;
    lastFocus = document.activeElement;
    boxBody.innerHTML = `
      <img src="${esc(p.photo)}" alt="">
      <div>
        <h2>${esc(p.name)}</h2>
        <p class="meta">Cohort ${p.cohort}, ${INSTITUTIONS[p.institution] || esc(p.institution)}<br>Supervised by ${esc(p.supervisor)}${p.partner ? "<br>With " + esc(p.partner) : ""}</p>
        <p class="project">${esc(p.project)}</p>
        ${p.bio ? `<p class="bio">${esc(p.bio)}</p>` : ""}
        <p class="links">${linkRow(p)}</p>
      </div>`;
    box.hidden = false;
    document.body.style.overflow = "hidden";
    box.querySelector(".lightbox-close").focus();
  }
  function closeBox() {
    box.hidden = true;
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }
  box.querySelector(".lightbox-close").addEventListener("click", closeBox);
  box.addEventListener("click", e => { if (e.target === box) closeBox(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !box.hidden) closeBox(); });

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
  const cohorts = document.querySelector('[data-group="cohort"]') || document.createElement("span");
  cohortsPresent.forEach(c => cohorts.appendChild(chip("cohort", c, `Cohort ${c}`)));
  const insts = document.querySelector('[data-group="institution"]') || document.createElement("span");
  Object.entries(INSTITUTIONS).forEach(([k, v]) => insts.appendChild(chip("institution", k, v, "inst-" + k)));
  const search = document.getElementById("search");
  if (search) search.addEventListener("input", e => { query = e.target.value.trim().toLowerCase(); render(); });

  render();
});
