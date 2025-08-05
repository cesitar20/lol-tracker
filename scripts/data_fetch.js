async function buscarMatches() {
  const gameName = document.getElementById('gameName').value.trim();
  const tagLine = document.getElementById('tagLine').value.trim();
  const loading = document.getElementById('loading');
  const tableBody = document.querySelector('#matchTable tbody');

  // Limpiar tabla y mensajes anteriores
  tableBody.innerHTML = '';
  loading.textContent = 'Buscando partidas...';
  console.log('[INFO] Iniciando búsqueda para:', gameName, tagLine);

  if (!gameName || !tagLine) {
    loading.textContent = 'Por favor ingresa el nombre y tag del jugador.';
    console.warn('[WARN] Falta nombre o tag');
    return;
  }

  try {
    // ⚠️ Aquí va tu futura llamada al backend (serverless API)
    // Por ahora lo simulamos
    const response = await fakeMatchData(); // función simulada

    console.log('[INFO] Datos recibidos:', response);

    if (!Array.isArray(response)) {
      throw new Error('La respuesta no es una lista de partidas');
    }

    if (response.length === 0) {
      loading.textContent = 'No se encontraron partidas recientes.';
      return;
    }

    // Insertar datos en la tabla
    response.forEach(match => {
      const row = document.createElement('tr');

      row.innerHTML = `
        <td>${match.champion}</td>
        <td>${match.kda}</td>
        <td>${match.win ? 'Sí' : 'No'}</td>
        <td>${match.role}</td>
        <td>${match.damage}</td>
        <td>${match.vision}</td>
        <td>${match.minions}</td>
        <td>${match.rival}</td>
      `;

      tableBody.appendChild(row);
    });

    loading.textContent = `Mostrando ${response.length} partidas.`;

  } catch (err) {
    console.error('[ERROR] Fallo al obtener partidas:', err);
    loading.textContent = 'Ocurrió un error al buscar partidas.';
  }
}

// Simulación de respuesta de API
async function fakeMatchData() {
  console.log('[DEBUG] Llamando fakeMatchData...');
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          champion: 'Ahri',
          kda: '7/2/9',
          win: true,
          role: 'MID',
          damage: 23000,
          vision: 18,
          minions: 170,
          rival: 'Zed'
        },
        {
          champion: 'Lux',
          kda: '2/5/11',
          win: false,
          role: 'SUPP',
          damage: 9000,
          vision: 28,
          minions: 25,
          rival: 'Brand'
        }
      ]);
    }, 1000); // Simula 1 segundo de espera
  });
}
