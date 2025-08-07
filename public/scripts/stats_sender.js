// scripts/stats_sender.js

export async function sendStats() {
  const btn = document.getElementById("btnSendStats");

  if (!btn) {
    console.error("[ERROR] Botón no encontrado");
    return;
  }

  if (btn.disabled) {
    console.warn("[WARN] Ya está en proceso");
    return;
  }

  // Obtener datos de partidas desde memoria global
  const partidas = window.currentMatches;
  console.log("[INFO] Partidas a enviar:", partidas);
  if (!partidas || !partidas.length) {
    window.toaster.showErrorToast({ text: "No hay partidas cargadas para enviar" });
    return;
  }

  btn.disabled = true;
  window.toaster.showInfoToast({ text: "Enviando stats..." });

  try {
    const res = await fetch('/api/excel_sender', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        requestFrom: 'stats_button',
        partidas
      })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Error desconocido');
    }

    window.toaster.showSuccessToast({ text: 'Stats enviados correctamente' });
    console.log('[INFO] Respuesta de API:', data);
  } catch (err) {
    console.error('[ERROR] Falló el envío:', err);
    window.toaster.showErrorToast({ text: 'Error al enviar stats' });
  } finally {
    btn.disabled = false;
  }
}
