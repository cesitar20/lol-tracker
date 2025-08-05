// public/scripts/data_fetch.js

const ENDPOINT = '/api/fetch_matches';

async function buscarPartidas() {
  console.log('[INFO] Ejecutando buscarPartidas()');
  const name = document.getElementById('summonerName').value.trim();
  const tag  = document.getElementById('tagLine'     ).value.trim();
  const queue= document.getElementById('queueSelect').value;

  console.log('[INFO] Inputs recibidos:', { name, tag, queue });

  if (!name || !tag) {
    console.warn('[WARN] Falta nombre o tag');
    alert('Debes ingresar Nombre y Tag');
    return;
  }

  const url = `${ENDPOINT}?gameName=${encodeURIComponent(name)}`
            + `&tagLine=${encodeURIComponent(tag)}`
            + `&queueId=${encodeURIComponent(queue)}`;

  console.log('[INFO] Llamando al endpoint:', url);

  try {
    const res = await fetch(url);
    console.log('[DEBUG] Status de la respuesta:', res.status);

    if (!res.ok) {
      const err = await res.json();
      console.error('[ERROR] API respondió error:', err);
      alert('Error: ' + (err.error || res.statusText));
      return;
    }

    const { matches } = await res.json();
    console.log('[INFO] Matches recibidos:', matches);

    const tbody = document.querySelector('#tablaResultados tbody');
    tbody.innerHTML = '';

    if (!matches.length) {
      console.warn('[WARN] No se encontraron partidas');
      const row = document.createElement('tr');
      row.innerHTML = '<td colspan="6" style="text-align:center">No se encontraron partidas.</td>';
      tbody.appendChild(row);
      return;
    }

    matches.forEach(m => {
      console.log('[DEBUG] Renderizando partida:', m.matchId);
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
    console.error('[ERROR] Excepción en buscarPartidas():', err);
    alert('Ocurrió un error al buscar partidas. Revisa la consola.');
  }
}

// Asociar el botón a la función
document.getElementById('btnBuscar').addEventListener('click', buscarPartidas);
