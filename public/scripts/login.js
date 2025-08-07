function setupAuth() {
  const loginContainer = document.getElementById("login-container");
  const mainContainer = document.getElementById("main-container");
  const btnLogin = document.getElementById("btnLogin");
  const btnLogout = document.getElementById("btnLogout");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");

  function checkAuth() {
    // Siempre forzar logout al cargar la página
    localStorage.removeItem("isAuthenticated");
    loginContainer.style.display = "block";
    mainContainer.style.display = "none";
  }

  btnLogin.addEventListener("click", async () => {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !password) {
      window.toaster.showErrorToast({ text: "Faltan usuario o contraseña" });
      return;
    }

    try {
      const response = await fetch("/api/handle_users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem("isAuthenticated", "true");
        window.toaster.showSuccessToast({ text: "Inicio de sesión exitoso" });
        loginContainer.style.display = "none";
        mainContainer.style.display = "block";
        window.currentUsername = username; // Esto lo agregas después del login exitoso
      } else {
        window.toaster.showErrorToast({
          text: data.error || "Usuario o contraseña incorrectos",
        });
      }
    } catch (error) {
      console.error("Error en login:", error);
      window.toaster.showErrorToast({ text: "Error en conexión" });
    }
  });

  btnLogout.addEventListener("click", () => {
    localStorage.removeItem("isAuthenticated");
    window.toaster.showInfoToast({ text: "Sesión cerrada" });
    loginContainer.style.display = "block";
    mainContainer.style.display = "none";
    usernameInput.value = "";
    passwordInput.value = "";
  });

  checkAuth();
}

export { setupAuth };
