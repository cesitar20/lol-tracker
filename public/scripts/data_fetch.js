(() => {
  const DefaultBackground = "linear-gradient(to right, ghostwhite, gainsboro)";
  const ErrorBackground = "linear-gradient(to right, crimson, darkred)";
  const SuccessBackground = "linear-gradient(to right, mediumseagreen, mediumspringgreen)";
  const InfoBackground = "linear-gradient(to right, darkturquoise, deepskyblue)";
  const WarningBackground = "linear-gradient(to right, goldenrod, darkorange)";

  function merge(base, over) {
    return { ...base, ...over, style: { ...base.style, ...over.style } };
  }
  const baseOptions = {
    defaultOptions: { duration: 3000, close: true, gravity: 'bottom', position: 'right', stopOnFocus: true,
      style: { color: '#fff', fontSize: '16px', borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
  };
  window.toaster = {
    showErrorToast: opts => Toastify(merge(baseOptions.defaultOptions, { text: opts.text, style: { background: ErrorBackground }})).showToast(),
    showSuccessToast: opts => Toastify(merge(baseOptions.defaultOptions, { text: opts.text, style: { background: SuccessBackground }})).showToast(),
    showInfoToast: opts => Toastify(merge(baseOptions.defaultOptions, { text: opts.text, style: { background: InfoBackground }})).showToast(),
  };
})();

const ENDPOINT = '/api/fetch_matches';
let isSearching = false;

// Función para formatear duración (segundos a MM:SS)
function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Función para formatear fecha
function formatDate(dateString) {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

async function buscarPartidas() {
  if (isSearching) {
    console.warn('[WARN] Búsqueda ya en curso');
    return;
  }
  isSearching = true;
  const btn = document.getElementById('btnBuscar');
  btn.disabled = true;
  window.toaster.showInfoToast({ text: 'Iniciando búsqueda...' });

  const name = document.getElementById('summonerName').value.trim();
  const tag  = document.getElementById('tagLine').value.trim();
  const queue= document.getElementById('queueSelect').value;
  console.log('[INFO] Inputs:', { name, tag, queue });

  if (!name || !tag) {
    window.toaster.showErrorToast({ text: 'Falta nombre o tag' });
    btn.disabled = false;
    isSearching = false;
    return;
  }

  const url = `${ENDPOINT}?gameName=${encodeURIComponent(name)}`
            + `&tagLine=${encodeURIComponent(tag)}`
            + `&queueId=${encodeURIComponent(queue)}`;
  console.log('[INFO] Fetching:', url);

  try {
    const res = await fetch(url);
    console.log('[DEBUG] Status:', res.status);
    if (!res.ok) {
      const err = await res.json();
      console.error('[ERROR] API:', err);
      window.toaster.showErrorToast({ text: err.error || 'Error en API' });
      return;
    }
    const { matches } = await res.json();
    console.log('[INFO] Matches recibidos:', matches);
    window.toaster.showSuccessToast({ text: `Encontradas ${matches.length} partidas` });

    const tbody = document.querySelector('#tablaResultados tbody');
    tbody.innerHTML = '';
    if (!matches.length) {
      const row = document.createElement('tr');
      row.innerHTML = '<td colspan="11" style="text-align:center">No se encontraron partidas.</td>';
      tbody.appendChild(row);
    } else {
      matches.forEach(m => {
        console.log('[DEBUG] Render:', m.matchId);
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${m.champion}</td>
          <td>${m.kills}/${m.deaths}/${m.assists}</td>
          <td>${m.win ? '✅' : '❌'}</td>
          <td>${m.minions}</td>
          <td>${m.lane}</td>
          <td>${m.rival || 'N/A'}</td>
          <td>${formatDuration(m.duration)}</td>
          <td>${m.totalGold.toLocaleString()}</td>
          <td>${m.gameType}</td>
          <td>${formatDate(m.gameDate)}</td>
          <td>${m.visionScore}</td>
        `;
        tbody.appendChild(tr);
      });
    }
  } catch (err) {
    console.error('[ERROR] Exception:', err);
    window.toaster.showErrorToast({ text: 'Error en conexión' });
  } finally {
    btn.disabled = false;
    isSearching = false;
  }
}

document.getElementById('btnBuscar').addEventListener('click', buscarPartidas);