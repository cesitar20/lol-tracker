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

  try {
    const puuidRes = await fetch(
      `https://${region}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}`,
      { headers }
    );
    const puuidData = await puuidRes.json();
    if (!puuidRes.ok)
      throw new Error(puuidData.status?.message || "Error getting PUUID");

    const puuid = puuidData.puuid;
    let idsUrl = `https://${region}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?count=100`;
    if (queueId) idsUrl += `&queue=${queueId}`;

    const idsRes = await fetch(idsUrl, { headers });
    if (!idsRes.ok) throw new Error("Error fetching match IDs");

    const matchIds = await idsRes.json();
    const now = Date.now();
    const cutoff = days
      ? now - parseInt(days) * 24 * 60 * 60 * 1000
      : now - 24 * 60 * 60 * 1000;

    const matches = [];

    for (const id of matchIds) {
      const detailRes = await fetch(
        `https://${region}.api.riotgames.com/lol/match/v5/matches/${id}`,
        { headers }
      );
      if (!detailRes.ok) continue;

      const detail = await detailRes.json();
      const gameTime = detail.info.gameCreation;

      if (gameTime < cutoff) continue;

      const player = detail.info.participants.find((p) => p.puuid === puuid);
      const rival = detail.info.participants.find(
        (p) =>
          p.teamId !== player.teamId && p.teamPosition === player.teamPosition
      );

      matches.push({
        matchId: id,
        champion: player.championName,
        kills: player.kills,
        deaths: player.deaths,
        assists: player.assists,
        win: player.win,
        minions: player.totalMinionsKilled,
        lane: player.teamPosition,
        rival: rival ? rival.championName : null,
        duration: detail.info.gameDuration,
        totalGold: player.goldEarned,
        gameType: detail.info.gameMode,
        gameDate: detail.info.gameCreation,
        visionScore: player.visionScore,
      });
    }

    return res.status(200).json({ matches });
  } catch (error) {
    console.error("[ERROR] fetch_matches:", error);
    return res.status(500).json({ error: "Server error" });
  }
}
