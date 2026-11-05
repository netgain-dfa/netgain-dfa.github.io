const UNI_LOGO = { "st-andrews": "university-of-st-andrews.png", "glasgow": "university-of-glasgow.png", "aberdeen": "university-of-aberdeen.png", "durham": "durham-university.png" };
// Management team, from data/team.csv. Photos in assets/people/, named by photoname + type columns.
fetch("data/team.csv?v=" + DATA_V).then(r => r.text()).then(text => {
  const all = parseCSV(text);
  // Director and programme manager first, in sheet order; everyone else shuffled on each visit.
  const fixed = all.filter(p => /director|programme manager/i.test(p.role));
  const rest = shuffle(all.filter(p => !fixed.includes(p)));
  const team = fixed.concat(rest);
  const list = document.getElementById("team-list");
  list.innerHTML = team.map(p => `
    <li class="person inst-${p.institution}">
      <img src="${esc(imagePath("assets/people", p.photoname, p.type, p.name))}" alt="" loading="lazy" onerror="this.onerror=null;this.src='assets/brand/mark.png';this.classList.add('placeholder')">
      <div>
        <h3>${esc(p.name)}</h3>
        <p class="meta">${p.role ? esc(p.role) + "<br>" : ""}<span class="affil">${INSTITUTIONS[p.institution] || esc(p.institution)}</span></p>
        <p class="links">${linkRow(p)}</p>
      </div>
      <img class="uni-logo" src="assets/partners/${UNI_LOGO[p.institution] || ""}" alt="${INSTITUTIONS[p.institution] || ""}" loading="lazy" onerror="this.remove()">
    </li>`).join("");
});
