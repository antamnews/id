const providerFilter = document.getElementById('providerFilter');
const autorefresh = document.getElementById('autorefresh');
const tableBody = document.querySelector('#winrateTable tbody');
const lastUpdatedEl = document.getElementById('lastUpdated');

let currentSnapshot = null;

function render(snapshot) {
  currentSnapshot = snapshot;
  lastUpdatedEl.textContent = 'Last updated: ' + new Date(snapshot.generated_at).toLocaleString();

  // populate provider filter
  const providers = Array.from(new Set(snapshot.data.map(d => d.provider)));
  providerFilter.innerHTML = '<option value="all">All</option>' + providers.map(p => `<option>${p}</option>`).join('');

  const selected = providerFilter.value;
  const rows = snapshot.data
    .filter(r => selected === 'all' || r.provider === selected)
    .sort((a,b) => b.winrate - a.winrate)
    .map((r, i) => `
      <tr>
        <td>${i+1}</td>
        <td>${r.game}</td>
        <td>${r.provider}</td>
        <td>${r.rtp}%</td>
        <td>${r.winrate}%</td>
        <td>${r.plays}</td>
        <td>${new Date(r.updated_at).toLocaleTimeString()}</td>
      </tr>
    `).join('');

  tableBody.innerHTML = rows;
}

// Fetch initial snapshot
fetch('/api/winrate/latest').then(r => r.json()).then(render).catch(err => {
  console.error(err);
  lastUpdatedEl.textContent = 'Failed to load data';
});

// SSE
let evtSource = null;
function connectSSE() {
  if (evtSource) evtSource.close();
  evtSource = new EventSource('/api/winrate/stream');
  evtSource.onmessage = e => {
    try {
      const data = JSON.parse(e.data);
      if (autorefresh.checked) render(data);
    } catch (err) { console.error('SSE parse error', err); }
  };
  evtSource.onerror = err => {
    console.warn('SSE error, reconnecting in 3s', err);
    evtSource.close();
    setTimeout(connectSSE, 3000);
  };
}
connectSSE();

providerFilter.addEventListener('change', () => {
  if (currentSnapshot) render(currentSnapshot);
});

// allow manual polling if autorefresh is off
setInterval(() => {
  if (!autorefresh.checked) return;
  // poll backup endpoint
  fetch('/api/winrate/latest').then(r=>r.json()).then(render).catch(()=>{});
}, 10000);
