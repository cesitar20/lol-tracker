export default async function handler(req, res) {
  const RIOT_API_KEY = process.env.RIOT_API_KEY;
  const { gameName, tagLine, queueId } = req.query;

  if (!RIOT_API_KEY) {
    return res.status(500).json({ error: 'RIOT_API_KEY is not set in environment variables.' });
  }

  if (!gameName || !tagLine || !queueId) {
    return res.status(400).json({ error: 'Missing required query parameters.' });
  }

  const REGION = 'americas'; // para LAN
  const PLATFORM = 'la1';    // para LAN

  const headers = {
    "X-Riot-Token": RIOT_API_KEY
  };

  try {
    // Obtener PUUID
    const puuidRes = await fetch(
      `https://${REGION}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}`,
      { headers }
    );
    const puuidData = await puuidRes.json();

    if (!puuidRes.ok) {
      throw new Error(puuidData.status?.message || 'Error getting PUUID');
    }

    const puuid = puuidData.puuid;

    // Obtener lista de partidas
    const matchIdsRes = await fetch(
      `https://${REGION}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?queue=${queueId}&count=10`,
      { headers }
    );
    const matchIds = await matchIdsRes.json();

    const matches = [];

    for (const matchId of matchIds) {
      const matchRes = await fetch(
        `https://${REGION}.api.riotgames.com/lol/match/v5/matches/${matchId}`,
        { headers }
      );
      const matchData = await matchRes.json();

      if (!matchRes.ok) {
        console.log(`Error fetching match ${matchId}`);
        continue;
      }

      const player = matchData.info.participants.find(p => p.puuid === puuid);
      if (!player) continue;

      matches.push({
        matchId,
        champion: player.championName,
        kills: player.kills,
        deaths: player.deaths,
        assists: player.assists,
        win: player.win,
        lane: player.lane,
        role: player.role,
        gameDuration: matchData.info.gameDuration,
      });
    }

    return res.status(200).json({ matches });

  } catch (error) {
    console.error('Fetch error:', error.message);
    return res.status(500).json({ error: 'Server error occurred.' });
  }
}
