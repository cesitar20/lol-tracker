export function setupModal(sendStatsFunction) {
  const modal = document.getElementById('confirmModal');
  const closeBtn = document.querySelector('.close-btn');
  const confirmBtn = document.getElementById('confirmSend');
  const cancelBtn = document.getElementById('cancelSend');
  const modalMessage = document.getElementById('modalMessage');

  // Función para abrir el modal con un mensaje específico
  function openModal(message) {
    modalMessage.textContent = message;
    modal.style.display = 'block';
  }

  // Función para cerrar el modal
  function closeModal() {
    modal.style.display = 'none';
  }

  // Evento para cerrar el modal al hacer clic en la 'x'
  closeBtn.addEventListener('click', closeModal);

  // Evento para cerrar el modal al hacer clic en 'Cancelar'
  cancelBtn.addEventListener('click', closeModal);

  // Evento para confirmar y ejecutar la función sendStats
  confirmBtn.addEventListener('click', () => {
    closeModal();
    sendStatsFunction();
  });

  // Cerrar el modal si se hace clic fuera de él
  window.addEventListener('click', (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  // Retornar la función para abrir el modal, para que pueda ser llamada desde otros archivos
  return openModal;
}