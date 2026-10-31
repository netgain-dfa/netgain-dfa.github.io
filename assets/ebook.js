// eBook page: lists chapters from data/ebook.json, which a scheduled GitHub Action
// refreshes daily from the Zenodo community "netgainebook". Run the action manually
// (Actions tab, "Update eBook chapter list from Zenodo") to refresh sooner.
const COMMUNITY = "netgainebook";

function stripHTML(html) { const d = document.createElement("div"); d.innerHTML = html || ""; return (d.textContent || "").trim(); }
function fmt(iso) { const d = new Date(iso); return isNaN(d) ? esc(iso) : d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }); }

const list = document.getElementById("ebook-list");
const status = document.getElementById("ebook-status");

fetch("data/ebook.json?t=" + Math.floor(Date.now() / 3600000))
  .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
  .then(data => {
    const hits = data.hits || [];
    if (!hits.length) { status.textContent = "No chapters have been published yet."; return; }
    status.textContent = `${hits.length} ${hits.length === 1 ? "chapter" : "chapters"}, newest first.`;
    list.innerHTML = hits.map((h, i) => {
      const creators = (h.creators || []).join(", ");
      const link = h.doi ? `https://doi.org/${h.doi}` : (h.link || `https://zenodo.org/records/${h.id}`);
      const desc = stripHTML(h.description);
      return `
      <li class="project-row ebook-row">
        <button class="project-toggle" aria-expanded="false" aria-controls="eb-${i}">
          <span class="project-title">${esc(h.title || "Untitled")}</span>
          <span class="project-team">${esc(creators)}</span>
          <span class="project-where">${fmt(h.date)}${h.type ? " · " + esc(h.type) : ""}</span>
        </button>
        <div class="project-summary" id="eb-${i}" hidden>
          <p>${desc ? esc(desc) : "No abstract provided."}</p>
          <p class="seminar-links"><a href="${esc(link)}">Read on Zenodo</a>${h.doi ? ` · <span class="doi">DOI ${esc(h.doi)}</span>` : ""}</p>
        </div>
      </li>`;
    }).join("");
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
  })
  .catch(() => {
    status.innerHTML = `The chapter list is not available yet. <a href="https://zenodo.org/communities/${COMMUNITY}/records?sort=newest">Browse the eBook on Zenodo</a>.`;
  });
