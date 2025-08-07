// api/excel_handling.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { requestFrom, partidas } = req.body;

    console.log('[API] Petición recibida desde:', requestFrom);
    console.log('[API] Total de partidas recibidas:', partidas.length);

    partidas.forEach((p, i) => {
      console.log(`--- Partida ${i + 1} ---`);
      console.log(`Campeón: ${p.champion}`);
      console.log(`Resultado: ${p.win ? 'Victoria' : 'Derrota'}`);
      console.log(`K/D/A: ${p.kills}/${p.deaths}/${p.assists}`);
      console.log(`Fecha: ${p.gameDate}`);
      console.log(`---`);
    });
    const data = partidas.map(p => {
      return {
        champion: p.champion,
        win: p.win,
        kills: p.kills,
        deaths: p.deaths,
        assists: p.assists,
        gameDate: p.gameDate,
      };
    });

    return res.status(200).json({ success: true, message: 'Stats recibidos correctamente', data });
    // dame el for each que lo pueda ver en la consola en el return
  } catch (err) {
    console.error('[API ERROR] Error al procesar stats:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
