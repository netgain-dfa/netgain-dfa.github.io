// Seminars page. Data lives in data/seminars.csv.
// Columns: date (YYYY-MM-DD), time (HH:MM, optional), title, speaker, organisation, host, location,
//          abstract, register (URL), recording (URL), chapter (URL to e-book chapter)
// Upcoming = date is today or later. Upcoming sorted soonest first; past sorted most recent first.

function fmtDate(iso) {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

fetch("data/seminars.csv").then(r => r.text()).then(text => {
  const all = parseCSV(text).map((s, i) => ({ ...s, id: i }));
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const upcoming = all.filter(s => new Date(s.date + "T12:00:00") >= today).sort((a, b) => a.date.localeCompare(b.date));
  const past = all.filter(s => new Date(s.date + "T12:00:00") < today).sort((a, b) => b.date.localeCompare(a.date));
  const list = document.getElementById("seminar-list");
  const tabs = document.querySelectorAll(".tab");
  let query = "";

  function links(s, isPast) {
    const out = [];
    if (!isPast && s.register) out.push(`<a href="${esc(s.register)}">Register</a>`);
    out.push(s.chapter ? `<a href="${esc(s.chapter)}">E-book chapter</a>` : `<span class="dead">E-book chapter</span>`);
    if (isPast) out.push(s.recording ? `<a href="${esc(s.recording)}">Recording</a>` : `<span class="dead">Recording</span>`);
    return out.join(" · ");
  }

  function render(which) {
    const isPast = which === "past";
    const q = query.toLowerCase();
    const items = (isPast ? past : upcoming).filter(s => !q || [s.title, s.speaker, s.organisation, s.abstract].join(" ").toLowerCase().includes(q));
    if (!items.length) {
      list.innerHTML = `<li class="empty">${isPast ? "No past seminars match." : "No upcoming seminars are scheduled yet. Dates are announced here and by email."}</li>`;
      return;
    }
    list.innerHTML = items.map(s => `
      <li class="project-row seminar-row">
        <button class="project-toggle" aria-expanded="false" aria-controls="sem-${s.id}">
          <span class="project-title">${esc(s.title)}</span>
          <span class="project-team">${esc(s.speaker)}${s.organisation ? ", " + esc(s.organisation) : ""}</span>
          <span class="project-where">${fmtDate(s.date)}${s.time ? ", " + esc(s.time) : ""}${s.location ? " · " + esc(s.location) : ""}</span>
        </button>
        <div class="project-summary" id="sem-${s.id}" hidden>
          <p>${s.abstract ? esc(s.abstract) : "Abstract to follow."}</p>
          <p class="seminar-links">${links(s, isPast)}</p>
        </div>
      </li>`).join("");
    list.querySelectorAll(".project-toggle").forEach(b => b.addEventListener("click", () => {
      const open = b.getAttribute("aria-expanded") !== "true";
      list.querySelectorAll('.project-toggle[aria-expanded="true"]').forEach(o => {
        if (o === b) return;
        o.setAttribute("aria-expanded", "false");
        document.getElementById(o.getAttribute("aria-controls")).hidden = true;
      });
      b.setAttribute("aria-expanded", open);
      document.getElementById(b.getAttribute("aria-controls")).hidden = !open;
    }));
  }

  let current = upcoming.length ? "upcoming" : "past";
  tabs.forEach(t => {
    t.setAttribute("aria-selected", t.dataset.tab === current);
    const n = t.dataset.tab === "past" ? past.length : upcoming.length;
    t.textContent = `${t.textContent.trim()} (${n})`;
    t.addEventListener("click", () => {
      current = t.dataset.tab;
      tabs.forEach(x => x.setAttribute("aria-selected", x === t));
      render(current);
    });
  });
  const search = document.getElementById("search");
  if (search) search.addEventListener("input", e => { query = e.target.value.trim(); render(current); });
  render(current);
});
