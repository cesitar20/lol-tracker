// api/fetch_matches.js

export default async function handler(req, res) {
  console.log('[INFO] fetch_matches invocado:', req.method, req.query);
  const RIOT_API_KEY = process.env.RIOT_API_KEY;
  const { gameName, tagLine, queueId } = req.query;

  if (!RIOT_API_KEY) {
    console.error('[ERROR] RIOT_API_KEY no definida');
    return res.status(500).json({ error: 'RIOT_API_KEY not set' });
  }
  if (!gameName || !tagLine) {
    console.warn('[WARN] Parámetros faltantes:', req.query);
    return res.status(400).json({ error: 'Missing gameName or tagLine' });
  }

  const region = 'americas';
  const headers = { 'X-Riot-Token': RIOT_API_KEY };

  try {
    // 1) Obtener PUUID
    const puuidRes = await fetch(
      `https://${region}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}`,
      { headers }
    );
    const puuidData = await puuidRes.json();
    if (!puuidRes.ok) throw new Error(puuidData.status?.message || 'Error getting PUUID');
    const puuid = puuidData.puuid;
    console.log('[INFO] PUUID obtenido:', puuid);

    // 2) Obtener match IDs
    let idsUrl = `https://${region}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?count=10`;
    if (queueId) idsUrl += `&queue=${queueId}`;
    console.log('[INFO] URL de match IDs:', idsUrl);

    const idsRes = await fetch(idsUrl, { headers });
    if (!idsRes.ok) throw new Error('Error fetching match IDs');
    const matchIds = await idsRes.json();
    console.log('[INFO] Match IDs:', matchIds);

    // 3) Obtener detalles y formatear
    const matches = [];
    for (const id of matchIds) {
      console.log('[DEBUG] Obteniendo detalles de:', id);
      const detailRes = await fetch(
        `https://${region}.api.riotgames.com/lol/match/v5/matches/${id}`, 
        { headers }
      );
      if (!detailRes.ok) {
        console.warn('[WARN] Falló fetch match detail:', id);
        continue;
      }
      const detail = await detailRes.json();

      const player = detail.info.participants.find(p => p.puuid === puuid);
      const rival  = detail.info.participants.find(p =>
        p.teamId !== player.teamId &&
        p.teamPosition === player.teamPosition
      );

      matches.push({
        matchId: id,
        champion: player.championName,
        kills:     player.kills,
        deaths:    player.deaths,
        assists:   player.assists,
        win:       player.win,
        minions:   player.totalMinionsKilled,
        lane:      player.teamPosition,
        rival:     rival ? rival.championName : null
      });
    }

    return res.status(200).json({ matches });

  } catch (error) {
    console.error('[ERROR] fetch_matches:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}
