// api/matches.js
import fetch from 'node-fetch';

const API_KEY = process.env.RIOT_API_KEY;
const REGION_ROUTING = 'americas'; // Match-V5
const LOCAL_REGION = 'la1';        // Summoner

const headers = {
  'X-Riot-Token': API_KEY,
};

export default async function handler(req, res) {
  const { gameName, tagLine } = req.query;
  if (!gameName || !tagLine) {
    return res.status(400).json({ error: 'Faltan parámetros' });
  }

  try {
    const accountUrl = `https://${REGION_ROUTING}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}`;
    const accountRes = await fetch(accountUrl, { headers });
    if (!accountRes.ok) throw new Error('Cuenta no encontrada');
    const { puuid } = await accountRes.json();

    const matchIdsUrl = `https://${REGION_ROUTING}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?count=10`;
    const matchIdsRes = await fetch(matchIdsUrl, { headers });
    const matchIds = await matchIdsRes.json();

    const matches = [];

    for (const matchId of matchIds) {
      const matchUrl = `https://${REGION_ROUTING}.api.riotgames.com/lol/match/v5/matches/${matchId}`;
      const matchRes = await fetch(matchUrl, { headers });
      const matchData = await matchRes.json();

      const info = matchData.info;
      if (info.queueId !== 420) continue;

      const player = info.participants.find(p => p.puuid === puuid);
      const rival = info.participants.find(
        p =>
          p.teamId !== player.teamId &&
          p.teamPosition === player.teamPosition
      );

      matches.push({
        matchId,
        gameStart: info.gameStartTimestamp,
        durationMin: (info.gameDuration / 60).toFixed(1),
        champion: player.championName,
        kda: `${player.kills}/${player.deaths}/${player.assists}`,
        win: player.win,
        position: player.teamPosition,
        damage: player.totalDamageDealtToChampions,
        gold: player.goldEarned,
        vision: player.visionScore,
        cs: player.totalMinionsKilled,
        rival: rival
          ? {
              name: `${rival.riotIdGameName}#${rival.riotIdTagline}`,
              champion: rival.championName,
              damage: rival.totalDamageDealtToChampions,
            }
          : null,
      });
    }

    res.status(200).json({ matches });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
