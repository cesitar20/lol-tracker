export default async function handler(req, res) {
  console.log("[INFO] fetch_matches invocado:", req.method, req.query);
  const RIOT_API_KEY = process.env.RIOT_API_KEY;
  const { gameName, tagLine, queueId, days } = req.query;

  if (!RIOT_API_KEY)
    return res.status(500).json({ error: "RIOT_API_KEY not set" });
  if (!gameName || !tagLine)
    return res.status(400).json({ error: "Missing gameName or tagLine" });

  const region = "americas";
  const headers = { "X-Riot-Token": RIOT_API_KEY };

  // Cache en memoria (objeto simple para este ejemplo)
  const cache = new Map(); // Persiste entre solicitudes si el servidor no se reinicia

  try {
    // Obtener PUUID con cache
    const cacheKeyPuuid = `${gameName}:${tagLine}`;
    let puuid = cache.get(cacheKeyPuuid);
    if (!puuid) {
      const puuidRes = await fetch(
        `https://${region}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}`,
        { headers }
      );
      const puuidData = await puuidRes.json();
      if (!puuidRes.ok)
        throw new Error(puuidData.status?.message || "Error getting PUUID");
      puuid = puuidData.puuid;
      cache.set(cacheKeyPuuid, puuid);
      console.log("[INFO] PUUID cached:", cacheKeyPuuid);
    }

    // Obtener IDs de partidas
    let idsUrl = `https://${region}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?count=30`;
    if (queueId) idsUrl += `&queue=${queueId}`;
    // Agregar filtro de fecha si es posible (API permite startTime/endTime)
    const now = Date.now();
    const cutoff = days
      ? now - parseInt(days) * 24 * 60 * 60 * 1000
      : now - 24 * 60 * 60 * 1000;
    idsUrl += `&startTime=${Math.floor(cutoff / 1000)}&endTime=${Math.floor(
      now / 1000
    )}`;

    const idsRes = await fetch(idsUrl, { headers });
    if (!idsRes.ok) throw new Error("Error fetching match IDs");

    const matchIds = await idsRes.json();
    console.log("[INFO] Match IDs:", matchIds.length);

    // Obtener detalles de partidas en paralelo (con límite para evitar rate limiting)
    const matches = [];
    const batchSize = 10; // Límite para evitar exceder rate limits
    for (let i = 0; i < matchIds.length; i += batchSize) {
      const batch = matchIds.slice(i, i + batchSize);
      const batchPromises = batch.map(async (id) => {
        const cacheKeyMatch = `match:${id}`;
        let matchDetail = cache.get(cacheKeyMatch);
        if (!matchDetail) {
          const detailRes = await fetch(
            `https://${region}.api.riotgames.com/lol/match/v5/matches/${id}`,
            { headers }
          );
          if (!detailRes.ok) return null;
          matchDetail = await detailRes.json();
          cache.set(cacheKeyMatch, matchDetail);
          console.log("[INFO] Match cached:", id);
        }

        const player = matchDetail.info.participants.find(
          (p) => p.puuid === puuid
        );
        const rival = matchDetail.info.participants.find(
          (p) =>
            p.teamId !== player.teamId && p.teamPosition === player.teamPosition
        );

        return {
          matchId: id,
          champion: player.championName,
          kills: player.kills,
          deaths: player.deaths,
          assists: player.assists,
          win: player.win,
          minions: player.totalMinionsKilled,
          lane: player.teamPosition,
          rival: rival ? rival.championName : null,
          duration: matchDetail.info.gameDuration,
          totalGold: player.goldEarned,
          gameType: matchDetail.info.gameMode,
          gameDate: matchDetail.info.gameCreation,
          visionScore: player.visionScore,
        };
      });

      const batchResults = await Promise.all(batchPromises);
      matches.push(...batchResults.filter((m) => m !== null));
    }

    return res.status(200).json({ matches });
  } catch (error) {
    console.error("[ERROR] fetch_matches:", error);
    return res.status(500).json({ error: "Server error" });
  }
}
