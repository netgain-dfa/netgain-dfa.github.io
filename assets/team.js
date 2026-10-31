// Management team, from data/team.csv. Photos: assets/people/<slug>.jpg (optional).
fetch("data/team.csv").then(r => r.text()).then(text => {
  const team = parseCSV(text);
  const list = document.getElementById("team-list");
  list.innerHTML = team.map(p => `
    <li class="person inst-${p.institution}">
      <img src="assets/people/${slug(p.name)}.jpg" alt="" loading="lazy" onerror="this.onerror=null;this.src='assets/brand/mark.png';this.classList.add('placeholder')">
      <div>
        <h3>${esc(p.name)}</h3>
        <p class="meta">${p.role ? esc(p.role) + "<br>" : ""}${INSTITUTIONS[p.institution] || esc(p.institution)}</p>
        <p class="links">${linkRow(p)}</p>
      </div>
    </li>`).join("");
});
