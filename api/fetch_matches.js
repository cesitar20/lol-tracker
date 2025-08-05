// api/fetch_matches.js

export default async function handler(req, res) {
  const RIOT_API_KEY = process.env.RIOT_API_KEY;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { gameName, tagLine } = req.body;

  if (!gameName || !tagLine) {
    return res.status(400).json({ error: 'Faltan parámetros' });
  }

  console.log(`[INFO] Buscando partidas de: ${gameName}#${tagLine}`);

  try {
    const region = 'americas'; // para LAN
    const accountUrl = `https://${region}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}`;
    const accountRes = await fetch(accountUrl, {
      headers: { 'X-Riot-Token': RIOT_API_KEY }
    });

    if (!accountRes.ok) {
      return res.status(500).json({ error: 'Error al obtener PUUID' });
    }

    const { puuid } = await accountRes.json();

    const matchIdsUrl = `https://${region}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?count=5`;
    const matchesRes = await fetch(matchIdsUrl, {
      headers: { 'X-Riot-Token': RIOT_API_KEY }
    });

    if (!matchesRes.ok) {
      return res.status(500).json({ error: 'Error al obtener IDs de partidas' });
    }

    const matchIds = await matchesRes.json();

    const matchDetails = await Promise.all(
      matchIds.map(async (matchId) => {
        const detailUrl = `https://${region}.api.riotgames.com/lol/match/v5/matches/${matchId}`;
        const detailRes = await fetch(detailUrl, {
          headers: { 'X-Riot-Token': RIOT_API_KEY }
        });

        if (!detailRes.ok) return null;
        const match = await detailRes.json();

        const participant = match.info.participants.find(p => p.puuid === puuid);
        if (!participant) return null;

        return {
          champion: participant.championName,
          kda: `${participant.kills}/${participant.deaths}/${participant.assists}`,
          win: participant.win,
          role: participant.teamPosition,
          damage: participant.totalDamageDealtToChampions,
          vision: participant.visionScore,
          minions: participant.totalMinionsKilled,
          rival: 'N/A' // Puedes buscar al rival si quieres
        };
      })
    );

    const cleaned = matchDetails.filter(m => m !== null);
    return res.status(200).json(cleaned);

  } catch (err) {
    console.error('[ERROR]', err);
    return res.status(500).json({ error: 'Fallo interno del servidor' });
  }
}
