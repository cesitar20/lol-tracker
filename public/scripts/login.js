const USERS = [
  { username: 'Camilo', password: 'asdsad' }, // Usuario 1
  { username: 'Taurus', password: 'asdc3jcK031LLjsd' }, // Usuario 2
  { username: 'Zafiro', password: '1jdbcD34asdfasd3' }, // Usuario 3
  { username: 'Tatan', password: 'oapsdu3fabdOOs0s' }, // Usuario 4
  { username: 'Frannex', password: 'huxd1bw9RbhHA123' }, // Usuario 5
  { username: 'Shizuka', password: '1ubdGAJ813ebHAcE' }, // Usuario 6
  { username: 'Suplente', password: '12Has9dn31$YASsd' }, // Usuario 7
  { username: 'Cesar', password: 'LolStats2025' }, // Usuario 8
  { username: 'Zeith', password: 'yu72fJ2bfdW1jasd' }, // Usuario 9
  { username: 'Hackfaster', password: 'NoxOmen2025#01FM' }  // Usuario 10
];

function setupAuth() {
  const loginContainer = document.getElementById('login-container');
  const mainContainer = document.getElementById('main-container');
  const btnLogin = document.getElementById('btnLogin');
  const btnLogout = document.getElementById('btnLogout');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');

  function checkAuth() {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (isAuthenticated === 'true') {
      loginContainer.style.display = 'none';
      mainContainer.style.display = 'block';
    } else {
      loginContainer.style.display = 'block';
      mainContainer.style.display = 'none';
    }
  }

  btnLogin.addEventListener('click', () => {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    const user = USERS.find(
      u => u.username === username && u.password === password
    );

    if (user) {
      localStorage.setItem('isAuthenticated', 'true');
      window.toaster.showSuccessToast({ text: 'Inicio de sesión exitoso' });
      loginContainer.style.display = 'none';
      mainContainer.style.display = 'block';
    } else {
      window.toaster.showErrorToast({ text: 'Usuario o contraseña incorrectos' });
    }
  });

  btnLogout.addEventListener('click', () => {
    localStorage.removeItem('isAuthenticated');
    window.toaster.showInfoToast({ text: 'Sesión cerrada' });
    loginContainer.style.display = 'block';
    mainContainer.style.display = 'none';
    usernameInput.value = '';
    passwordInput.value = '';
  });

  checkAuth();
}

export { setupAuth };