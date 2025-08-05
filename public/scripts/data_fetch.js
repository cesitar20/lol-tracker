// Inicializar ToastifyPreFab (usar tu snippet aquí)
(() => {
  const DefaultBackground = "linear-gradient(to right, ghostwhite, gainsboro)";
  const ErrorBackground = "linear-gradient(to right, crimson, darkred)";
  const SuccessBackground = "linear-gradient(to right, mediumseagreen, mediumspringgreen)";
  const InfoBackground = "linear-gradient(to right, darkturquoise, deepskyblue)";
  const WarningBackground = "linear-gradient(to right, goldenrod, darkorange)";

  function BuildToastifyPreFab({ defaultOptions = {}, overrideDefaultOptions = {}, overrideErrorOptions = {}, overrideSuccessOptions = {}, overrideInfoOptions = {}, overrideWarningOptions = {}, } = {}) {
    const options = { ...defaultOptions, ...overrideDefaultOptions, style: { ...defaultOptions.style, ...overrideDefaultOptions.style }};
    const merge = (base, over) => ({ ...base, ...over, style: { ...base.style, ...over.style }});
    const toastError   = opt => Toastify(merge(options,opt, overrideErrorOptions)).showToast();
    const toastSuccess = opt => Toastify(merge(options,opt, overrideSuccessOptions)).showToast();
    const toastInfo    = opt => Toastify(merge(options,opt, overrideInfoOptions)).showToast();
    return { showErrorToast: toastError, showSuccessToast: toastSuccess, showInfoToast: toastInfo };
  }
  window.toaster = BuildToastifyPreFab({
    defaultOptions: { duration: 3000, close: true, gravity: 'bottom', position: 'right', stopOnFocus: true, style: { color: '#fff', fontSize: '16px', borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' } },
    overrideErrorOptions: { text: 'Error', style: { background: ErrorBackground } },
    overrideSuccessOptions: { text: 'Éxito', style: { background: SuccessBackground } },
    overrideInfoOptions: { text: 'Info', style: { background: InfoBackground } }
  });
})();

const ENDPOINT = '/api/fetch_matches';

async function buscarPartidas() {
  toaster.showInfoToast({ text: 'Iniciando búsqueda...' });
  const name = document.getElementById('summonerName').value.trim();
  const tag  = document.getElementById('tagLine').value.trim();
  const queue= document.getElementById('queueSelect').value;

  console.log('[INFO] Inputs:', { name, tag, queue });
  if (!name || !tag) {
    toaster.showErrorToast({ text: 'Falta nombre o tag' });
    return;
  }

  try {
    const url = `${ENDPOINT}?gameName=${encodeURIComponent(name)}&tagLine=${encodeURIComponent(tag)}&queueId=${encodeURIComponent(queue)}`;
    console.log('[INFO] Fetching:', url);
    const res = await fetch(url);
    console.log('[DEBUG] Status:', res.status);
    if (!res.ok) {
      const err = await res.json();
      console.error('[ERROR]', err);
      toaster.showErrorToast({ text: err.error });
      return;
    }

    const { matches } = await res.json();
    toaster.showSuccessToast({ text: `Encontradas ${matches.length} partidas` });
    const tbody = document.querySelector('#tablaResultados tbody');
    tbody.innerHTML = '';

    if (!matches.length) {
      const row = document.createElement('tr'); row.innerHTML = '<td colspan="6">Sin partidas</td>'; tbody.appendChild(row);
      return;
    }

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
      `;
      tbody.appendChild(tr);
    });

  } catch (err) {
    console.error('[ERROR] Exception:', err);
    toaster.showErrorToast({ text: 'Error en conexión' });
  }
}

document.getElementById('btnBuscar').addEventListener('click', buscarPartidas);