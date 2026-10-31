// Partners page. Data lives in data/partners.csv; logos in assets/partners/.
// tier: funded | delivered | partnership
// logo: optional. If blank, assets/partners/<slug>.png is used; if that file is missing, the NETGAIN mark is shown.

const TIERS = [
  ["funded", "Funded by", "The research council and universities that fund the programme, and the organisations that have invested in studentships."],
  ["delivered", "Delivered with", "Organisations that co-designed and co-supervise NETGAIN projects and host placements."],
  ["partnership", "In partnership with", "Organisations that helped co-design and co-create NETGAIN during the proposal phase."],
];
const PLACEHOLDER = "assets/brand/mark.png";

function parseCSV(text) {
  const rows = []; let row = [], field = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"' && text[i + 1] === '"') { field += '"'; i++; } else if (c === '"') q = false; else field += c; }
    else if (c === '"') q = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else if (c !== "\r") field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  const head = rows.shift();
  return rows.filter(r => r.length > 1).map(r => Object.fromEntries(head.map((h, i) => [h, (r[i] || "").trim()])));
}
function esc(s) { return s.replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
function slug(s) { return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""); }
function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

fetch("data/partners.csv").then(r => r.text()).then(text => {
  const partners = parseCSV(text);
  const main = document.getElementById("tiers");
  TIERS.forEach(([key, title, blurb]) => {
    const items = partners.filter(p => p.tier === key);
    if (!items.length) return;
    // Funders keep their order; the other tiers are shuffled so no organisation is always first.
    const list = key === "funded" ? items : shuffle(items.slice());
    const sec = document.createElement("section");
    sec.className = "tier";
    sec.innerHTML = `<h2>${title}</h2><p class="quiet">${blurb}</p><ul class="logo-grid">` +
      list.map(p => {
        const logo = p.logo || `assets/partners/${slug(p.name)}.png`;
        const inner = `<span class="logo-box"><img src="${esc(logo)}" alt="" loading="lazy" onerror="this.onerror=null;this.src='${PLACEHOLDER}';this.classList.add('placeholder')"></span><span class="logo-name">${esc(p.name)}</span>`;
        return p.url ? `<li><a href="${esc(p.url)}">${inner}</a></li>` : `<li><span class="nolink">${inner}</span></li>`;
      }).join("") + `</ul>`;
    main.appendChild(sec);
  });
});
