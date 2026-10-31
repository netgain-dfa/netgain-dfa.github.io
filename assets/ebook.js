// eBook page: lists records from the Zenodo community "netgainebook" via Zenodo's public API.
// Nothing to maintain here; publish a chapter to the community on Zenodo and it appears.
const COMMUNITY = "netgainebook";
const API = `https://zenodo.org/api/records?communities=${COMMUNITY}&sort=newest&size=100`;

function stripHTML(html) { const d = document.createElement("div"); d.innerHTML = html || ""; return (d.textContent || "").trim(); }
function fmt(iso) { const d = new Date(iso); return isNaN(d) ? esc(iso) : d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }); }

const list = document.getElementById("ebook-list");
const status = document.getElementById("ebook-status");

fetch(API, { headers: { "Accept": "application/json" } })
  .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
  .then(data => {
    const hits = (data.hits && data.hits.hits) || [];
    if (!hits.length) { status.textContent = "No chapters have been published yet."; return; }
    status.textContent = `${hits.length} ${hits.length === 1 ? "chapter" : "chapters"}, newest first.`;
    list.innerHTML = hits.map((h, i) => {
      const m = h.metadata || {};
      const creators = (m.creators || []).map(c => c.name).join(", ");
      const type = (m.resource_type && (m.resource_type.title || m.resource_type.type)) || "";
      const doi = h.doi || m.doi || "";
      const link = doi ? `https://doi.org/${doi}` : (h.links && h.links.self_html) || `https://zenodo.org/records/${h.id}`;
      const desc = stripHTML(m.description);
      return `
      <li class="project-row ebook-row">
        <button class="project-toggle" aria-expanded="false" aria-controls="eb-${i}">
          <span class="project-title">${esc(m.title || "Untitled")}</span>
          <span class="project-team">${esc(creators)}</span>
          <span class="project-where">${fmt(m.publication_date || h.created)}${type ? " · " + esc(type) : ""}</span>
        </button>
        <div class="project-summary" id="eb-${i}" hidden>
          <p>${desc ? esc(desc) : "No abstract provided."}</p>
          <p class="seminar-links"><a href="${esc(link)}">Read on Zenodo</a>${doi ? ` · <span class="doi">DOI ${esc(doi)}</span>` : ""}</p>
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
    status.innerHTML = `The chapter list could not be loaded just now. <a href="https://zenodo.org/communities/${COMMUNITY}/records?sort=newest">Browse the eBook on Zenodo</a>.`;
  });
