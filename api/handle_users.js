import 'dotenv/config';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Faltan usuario o contraseña' });
  }

  try {
    const usersJson = process.env.USERS_JSON;
    if (!usersJson) {
      return res.status(500).json({ error: 'Configuración de usuarios no encontrada' });
    }

    const USERS = JSON.parse(usersJson);
    const user = USERS.find(
      u => u.username === username && u.password === password
    );

    if (user) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }
  } catch (error) {
    console.error('Error en autenticación:', error);
    return res.status(500).json({ error: 'Error en el servidor' });
  }
}