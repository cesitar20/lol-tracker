// api/excel_sender.js

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const { requestFrom, partidas, username } = req.body;

    console.log("[API] Petición recibida desde:", requestFrom);
    console.log("[API] Enviada por el usuario:", username);
    console.log("[API] Partidas recibidas:", partidas);
    console.log("[API] Total de partidas recibidas:", partidas.length);

    partidas.forEach((p, i) => {
      console.log(`--- Partida ${i + 1} ---`);
      console.log(`ID de la partida: ${p.matchId}`);
      console.log(`Campeón: ${p.champion}`);
      console.log(`Resultado: ${p.win ? "Victoria" : "Derrota"}`);
      console.log(`K/D/A: ${p.kills}/${p.deaths}/${p.assists}`);
      console.log(`Minions: ${p.minions}`);
      console.log(`Línea: ${p.lane}`);
      console.log(`Rival: ${p.rival || "N/A"}`);
      console.log(`Duración: ${p.duration}`);
      console.log(`Gold: ${p.totalGold}`);
      console.log(`Tipo de partida: ${p.gameType}`);
      console.log(`Fecha: ${p.gameDate}`);
      console.log(`Vision Score: ${p.visionScore}`);
      console.log(`---`);
    });

    const data = partidas.map((p) => {
      return {
        champion: p.champion,
        win: p.win,
        kills: p.kills,
        deaths: p.deaths,
        assists: p.assists,
        gameDate: p.gameDate,
      };
    });

    const webAppURL =
      "https://script.google.com/macros/s/AKfycbx_exD5MGWkSKWOGV6lMYoyY2xLSaC8nvk7AdKDoAoJJJs9WBnkB84nvSl2L9Ajs7if/exec"; // <-- Pega aquí tu URL real

    await fetch(webAppURL, {
      method: "POST",
      body: JSON.stringify({ username, partidas }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    return res
      .status(200)
      .json({
        success: true,
        message: "Stats recibidos correctamente",
        data,
        username,
      });
    // dame el for each que lo pueda ver en la consola en el return
  } catch (err) {
    console.error("[API ERROR] Error al procesar stats:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}
