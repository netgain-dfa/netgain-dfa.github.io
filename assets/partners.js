// Partners page. Data lives in data/partners.csv; logos in assets/partners/.
// tier: funded | delivered | partnership (several allowed, separated by semicolons, e.g. "funded; delivered")
// logoname + type: file name (without extension) and extension of the logo in assets/partners/.
// If logoname is blank the slug of the name is used; if the file is missing, the NETGAIN mark is shown.

const TIERS = [
  ["funded", "Funded by", "The research council and universities that fund the programme, and the organisations that have invested in studentships."],
  ["delivered", "Delivered with", "Organisations that co-designed and co-supervise NETGAIN projects and host placements."],
  ["partnership", "In partnership with", "Organisations that helped co-design and co-create NETGAIN during the proposal phase."],
];
const PLACEHOLDER = "assets/brand/mark.png";


fetch("data/partners.csv?v=" + DATA_V).then(r => r.text()).then(text => {
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
        const logo = imagePath("assets/partners", p.logoname, p.type, p.name);
        const inner = `<span class="logo-box"><img src="${esc(logo)}" alt="${esc(p.name)}" loading="lazy" onerror="this.replaceWith(Object.assign(document.createElement('span'),{className:'logo-text',textContent:this.alt}))"></span><span class="logo-name">${esc(p.name)}</span>`;
        return p.url ? `<li><a href="${esc(p.url)}">${inner}</a></li>` : `<li><span class="nolink">${inner}</span></li>`;
      }).join("") + `</ul>`;
    main.appendChild(sec);
  });
});
