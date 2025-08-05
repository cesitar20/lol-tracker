const API_KEY = "RGAPI-5ad6963b-eef4-4942-b937-573d1e529d1b"; // Cámbiala cada 24h
const REGION = "americas";
const PLATFORM = "la1";

async function fetchData(url) {
  console.log("Fetching URL:", url);
  try {
    const res = await fetch(url, {
      headers: { "X-Riot-Token": API_KEY }
    });

    if (!res.ok) {
      console.error("API Error", res.status, await res.text());
      return null;
    }

    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Error en fetchData:", err);
    return null;
  }
}

async function buscarPartidas() {
  const queueId = document.getElementById("queueSelect").value;
  const gameName = prompt("Nombre del invocador (sin #):");
  const tagLine = prompt("Tag (por ejemplo LAN):");

  if (!gameName || !tagLine) {
    alert("Debes ingresar el nombre y tag.");
    return;
  }

  const resultadosDiv = document.getElementById("resultados");
  resultadosDiv.innerHTML = "Buscando...";

  const accountUrl = `https://${REGION}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}`;
  const account = await fetchData(accountUrl);
  if (!account || !account.puuid) {
    resultadosDiv.innerHTML = "No se encontró el usuario.";
    return;
  }

  const matchIdsUrl = `https://${REGION}.api.riotgames.com/lol/match/v5/matches/by-puuid/${account.puuid}/ids?count=10${queueId ? `&queue=${queueId}` : ''}`;
  const matchIds = await fetchData(matchIdsUrl);
  if (!matchIds || matchIds.length === 0) {
    resultadosDiv.innerHTML = "No se encontraron partidas.";
    return;
  }

  let html = "<table border='1'><tr><th>Campeón</th><th>KDA</th><th>Victoria</th><th>Minions</th><th>Rol</th><th>Enemigo</th></tr>";

  for (const matchId of matchIds) {
    const matchUrl = `https://${REGION}.api.riotgames.com/lol/match/v5/matches/${matchId}`;
    const matchData = await fetchData(matchUrl);
    if (!matchData || !matchData.info) continue;

    const player = matchData.info.participants.find(p => p.puuid === account.puuid);
    const enemy = matchData.info.participants.find(p =>
      p.teamId !== player.teamId &&
      p.teamPosition === player.teamPosition
    );

    html += `<tr>
      <td>${player.championName}</td>
      <td>${player.kills}/${player.deaths}/${player.assists}</td>
      <td>${player.win ? "✅" : "❌"}</td>
      <td>${player.totalMinionsKilled}</td>
      <td>${player.teamPosition}</td>
      <td>${enemy ? `${enemy.championName}` : "-"}</td>
    </tr>`;
  }

  html += "</table>";
  resultadosDiv.innerHTML = html;
}
