const state = { schemes: [], filter: "all", search: "" };
const symbols = { education:"▤", agriculture:"⌁", women:"✿", business:"↗", health:"✚", housing:"⌂", general:"✳" };
const categoryNames = { education:"Education", agriculture:"Agriculture", women:"Women & child", business:"Business", health:"Health", housing:"Housing", general:"General welfare" };

async function loadSchemes() {
  const grid = document.getElementById("schemeGrid");
  try {
    const res = await fetch("/api/schemes");
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Could not load schemes");
    state.schemes = data.schemes || [];
    renderSchemes();
    document.getElementById("schemeCount").textContent = `${state.schemes.length} catalogue entries · verify details on official portals`;
  } catch (e) {
    grid.innerHTML = `<div class="loading-card">The catalogue could not load. Please refresh or check the deployment logs.</div>`;
    document.getElementById("schemeCount").textContent = "Catalogue temporarily unavailable";
  }
}
function esc(s="") { return String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
function renderSchemes() {
  const grid = document.getElementById("schemeGrid");
  const items = state.schemes.filter(s => (state.filter === "all" || s.category === state.filter) &&
    (state.search === "" || `${s.name} ${s.category} ${s.description} ${s.ministry || ""}`.toLowerCase().includes(state.search)));
  if (!items.length) grid.innerHTML = `<div class="loading-card">No matching schemes found. Try another search or category.</div>`;
  else grid.innerHTML = items.map(s => `<article class="scheme-card">
    <div class="scheme-card-top"><span class="scheme-category">${esc(categoryNames[s.category] || "Government scheme")}</span><span>${symbols[s.category] || "✳"}</span></div>
    <h3>${esc(s.name)}</h3><p>${esc(s.description)}</p>
    <div class="scheme-card-bottom"><span>${esc(s.level || "Central")}</span><a href="${safeUrl(s.official_url)}" target="_blank" rel="noopener">Official details ↗</a></div>
  </article>`).join("");
  document.getElementById("schemeCount").textContent = `${items.length} scheme${items.length === 1 ? "" : "s"} shown`;
}
function safeUrl(url) { try { const u = new URL(url); return ["https:"].includes(u.protocol) ? u.href : "https://www.myscheme.gov.in/"; } catch { return "https://www.myscheme.gov.in/"; } }

document.getElementById("schemeSearch").addEventListener("input", e => { state.search = e.target.value.trim().toLowerCase(); renderSchemes(); });
document.getElementById("filterRow").addEventListener("click", e => {
  const btn = e.target.closest("[data-filter]"); if (!btn) return;
  state.filter = btn.dataset.filter;
  document.querySelectorAll(".filter-chip").forEach(b => b.classList.toggle("active", b === btn));
  renderSchemes();
});

document.getElementById("profileForm").addEventListener("submit", async e => {
  e.preventDefault();
  const form = new FormData(e.currentTarget);
  const profile = Object.fromEntries(form.entries());
  const status = document.getElementById("formStatus");
  status.textContent = "Finding relevant schemes…";
  const btn = e.currentTarget.querySelector("button[type=submit]");
  btn.disabled = true;
  try {
    const res = await fetch("/api/match", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(profile) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Matching failed");
    renderMatches(data.matches || [], profile);
    status.textContent = `Found ${data.matches.length} possible match(es). Review the official criteria before applying.`;
  } catch (err) { status.textContent = err.message || "Could not find matches. Please try again."; }
  finally { btn.disabled = false; }
});

function renderMatches(matches, profile) {
  document.getElementById("resultsEmpty").hidden = true;
  const content = document.getElementById("resultsContent"); content.hidden = false;
  if (!matches.length) {
    content.innerHTML = `<div class="results-header"><div><div class="eyebrow">YOUR RESULTS</div><h3>No close matches yet</h3><p>Try “all relevant areas” or check the official scheme directory.</p></div></div><a class="button button-primary" href="https://www.myscheme.gov.in/" target="_blank" rel="noopener">Open myScheme ↗</a>`;
    return;
  }
  content.innerHTML = `<div class="results-header"><div><div class="eyebrow">YOUR PERSONALIZED SHORTLIST</div><h3>Places to start exploring.</h3><p>For ${esc(profile.occupation)} · ${esc(profile.state)}</p></div><span class="match-count">${matches.length} MATCHES</span></div><div class="match-list">${matches.map(m => `<article class="match-card">
    <div class="match-top"><span class="scheme-symbol">${symbols[m.category] || "✳"}</span><div><h4>${esc(m.name)}</h4><div class="scheme-ministry">${esc(m.ministry || "Government scheme")}</div></div><span class="match-score">${m.score}% fit</span></div>
    <p>${esc(m.description)}</p><div class="match-reason"><b>Why it appeared:</b> ${esc(m.reason)}</div>
    <div class="match-links"><a href="${safeUrl(m.official_url)}" target="_blank" rel="noopener">Verify official details ↗</a><span>${esc(m.level || "Central scheme")}</span></div>
  </article>`).join("")}</div><div class="result-tip"><span>✦</span> This is an indicative match, not an eligibility decision. The scheme authority makes the final decision.</div>`;
}

document.getElementById("pinForm").addEventListener("submit", async e => {
  e.preventDefault();
  const input = document.getElementById("pincode").value.trim();
  const result = document.getElementById("pinResult");
  if (!/^\d{6}$/.test(input)) { result.textContent = "Enter a valid 6-digit Indian PIN code."; return; }
  result.textContent = "Looking up postal details…";
  try {
    const res = await fetch(`/api/pincode?pin=${encodeURIComponent(input)}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Lookup failed");
    result.innerHTML = `<b>${esc(data.district || "District not listed")}, ${esc(data.state || "State not listed")}</b><br>${esc(data.officeCount)} post office result(s) returned by the public postal lookup.`;
  } catch (err) { result.textContent = err.message || "Could not retrieve postal details. Try again later."; }
});

loadSchemes();
