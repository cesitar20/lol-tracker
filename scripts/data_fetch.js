// scripts/data_fetch.js

const API_KEY = "TU_TOKEN_AQUI"; // Reemplaza esto cada 24h
const REGION_ROUTING = "americas"; // Para LAN
const LOCAL_REGION = "la1"; // Región local para Riot ID

async function buscarPartidas() {
  const name = document.getElementById("summonerName").value.trim();
  const tag = document.getElementById("tagLine").value.trim();
  const queue = document.getElementById("queueSelect").value;

  if (!name || !tag) {
    alert("Por favor ingresa un nombre y tag.");
    return;
  }

  console.log("Buscando jugador:", name, "#", tag);
  const puuid = await getPUUID(name, tag);

  if (!puuid) {
    alert("No se encontró el jugador");
    return;
  }

  console.log("PUUID obtenido:", puuid);
  const matchIds = await getMatchIds(puuid, queue);

  if (!matchIds || matchIds.length === 0) {
    alert("No se encontraron partidas.");
    return;
  }

  console.log("Match IDs:", matchIds);

  const tablaBody = document.querySelector("#tablaResultados tbody");
  tablaBody.innerHTML = "";

  for (let matchId of matchIds) {
    const matchData = await getMatchDetails(matchId);
    if (!matchData) continue;

    const player = matchData.info.participants.find(p => p.puuid === puuid);
    if (!player) continue;

    const rival = matchData.info.participants.find(p =>
      p.teamId !== player.teamId &&
      p.individualPosition === player.individualPosition
    );

    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${player.championName}</td>
      <td>${player.kills}/${player.deaths}/${player.assists}</td>
      <td>${player.win ? "Sí" : "No"}</td>
      <td>${player.totalMinionsKilled}</td>
      <td>${formatearPosicion(player.teamPosition)}</td>
      <td>${rival ? rival.championName : "?"}</td>
    `;
    tablaBody.appendChild(fila);
  }
}

function formatearPosicion(pos) {
  const map = {
    "TOP": "Top",
    "JUNGLE": "Jungla",
    "MIDDLE": "Mid",
    "BOTTOM": "ADC",
    "UTILITY": "Soporte",
  };
  return map[pos] || pos;
}

async function getPUUID(name, tag) {
  const url = `https://${REGION_ROUTING}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${name}/${tag}`;
  try {
    const res = await fetch(url, {
      headers: { "X-Riot-Token": API_KEY }
    });
    if (!res.ok) throw new Error("Error al obtener PUUID");
    const data = await res.json();
    return data.puuid;
  } catch (e) {
    console.error("Error getPUUID:", e);
    return null;
  }
}

async function getMatchIds(puuid, queue) {
  let url = `https://${REGION_ROUTING}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=10`;
  if (queue) url += `&queue=${queue}`;
  try {
    const res = await fetch(url, {
      headers: { "X-Riot-Token": API_KEY }
    });
    if (!res.ok) throw new Error("Error al obtener match IDs");
    return await res.json();
  } catch (e) {
    console.error("Error getMatchIds:", e);
    return [];
  }
}

async function getMatchDetails(matchId) {
  const url = `https://${REGION_ROUTING}.api.riotgames.com/lol/match/v5/matches/${matchId}`;
  try {
    const res = await fetch(url, {
      headers: { "X-Riot-Token": API_KEY }
    });
    if (!res.ok) throw new Error("Error al obtener match details");
    return await res.json();
  } catch (e) {
    console.error("Error getMatchDetails:", e);
    return null;
  }
}
