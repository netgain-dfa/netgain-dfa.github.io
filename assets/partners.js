// Partners page. Data lives in data/partners.csv; logos in assets/partners/.
// tier: funded | delivered | partnership (several allowed, separated by semicolons, e.g. "funded; delivered")
// logo: optional. If blank, assets/partners/<slug>.png is used; if that file is missing, the NETGAIN mark is shown.

const TIERS = [
  ["funded", "Funded by", "The research council and universities that fund the programme, and the organisations that have invested in studentships."],
  ["delivered", "Delivered with", "Organisations that co-designed and co-supervise NETGAIN projects and host placements."],
  ["partnership", "In partnership with", "Organisations that helped co-design and co-create NETGAIN during the proposal phase."],
];
const PLACEHOLDER = "assets/brand/mark.png";


fetch("data/partners.csv").then(r => r.text()).then(text => {
  const partners = parseCSV(text);
  const main = document.getElementById("tiers");
  TIERS.forEach(([key, title, blurb]) => {
    const items = partners.filter(p => p.tier.split(";").map(t => t.trim()).includes(key));
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
