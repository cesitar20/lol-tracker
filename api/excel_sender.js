// api/excel_handling.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { requestFrom } = req.body;
    console.log('[API] Petición recibida desde:', requestFrom);

    // Aquí luego vas a hacer el webhook u otra lógica privada
    // Por ahora es simulado
    console.log('[API] Procesando generación de stats...');

    return res.status(200).json({ success: true, message: 'Stats procesados correctamente (simulado)' });
  } catch (err) {
    console.error('[API ERROR] Error al procesar stats:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
