// === api/excel_sender.js ===

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const { requestFrom, partidas, username } = req.body;

    console.log("[API] ===== INICIO DE SOLICITUD =====");
    console.log(`[API] Usuario: ${username}`);
    console.log(`[API] Origen: ${requestFrom}`);
    console.log(`[API] Total de partidas recibidas: ${partidas.length}`);

    const payloadToSend = {
      username,
      partidas: partidas.map((p, index) => {
        const timestamp = new Date(p.gameDate).getTime();
        console.log(`[API] Partida ${index + 1}: matchId=${p.matchId}, gameDateRaw=${p.gameDate}, timestamp=${timestamp}, iso=${new Date(timestamp).toISOString()}`);

        return {
          champion: p.champion || "",
          win: !!p.win,
          kills: Number(p.kills) || 0,
          deaths: Number(p.deaths) || 0,
          assists: Number(p.assists) || 0,
          minions: Number(p.minions) || 0,
          duration: Number(p.duration) || 0,
          totalGold: Number(p.totalGold) || 0,
          visionScore: Number(p.visionScore) || 0,
          lane: p.lane || "",
          rival: p.rival || "",
          gameType: p.gameType || "",
          gameDate: timestamp // Este es el único campo de fecha
        };
      }),
    };

    const webAppURL = "https://script.google.com/macros/s/AKfycbxdwwCuAAjun2UInpgiPIeevKujkjbdh3Wmtd_1_UCJoD5M49_iHbsJk4aPijO-ct57/exec";

    const response = await fetch(webAppURL, {
      method: "POST",
      body: JSON.stringify(payloadToSend),
      headers: { "Content-Type": "application/json" },
    });

    const gsResponse = await response.json();
    if (!gsResponse.success) {
      throw new Error(gsResponse.error || "Error desconocido desde Google Sheets");
    }

    return res.status(200).json({
      success: true,
      inserted: gsResponse.inserted,
      duplicates: gsResponse.duplicates || 0,
    });

  } catch (err) {
    console.error("[API ERROR]", err);
    return res.status(500).json({ error: err.message });
  }
}
