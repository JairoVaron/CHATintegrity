//auth.js
let currentUser = null;

// ======================
// EXPORT USER GLOBAL
// ======================
export function getUser() {
    return currentUser;
}

export function initAuth(socket) {

    const loginView = document.getElementById("loginView");

    const email = document.getElementById("loginEmail");
    const password = document.getElementById("loginPassword");

    const regEmail = document.getElementById("regEmail");
    const regPassword = document.getElementById("regPassword");
    const regNickname = document.getElementById("regNickname");

    const btnLogin = document.getElementById("btnLogin");
    const btnRegister = document.getElementById("btnRegister");

    const usuarioActual = document.getElementById("usuarioActual");

    // ======================
    // VALIDACIÓN DOM
    // ======================
    if (!btnLogin || !btnRegister) {
        console.error("Auth: elementos del DOM no encontrados");
        return;
    }

    // ======================
    // REGISTER
    // ======================
    btnRegister.addEventListener("click", async () => {

        const res = await fetch("/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: regEmail.value,
                password: regPassword.value,
                nickname: regNickname.value || "Usuario"
            })
        });

        const data = await res.json();

        if (data.ok) {
            alert("Usuario creado correctamente");
        } else {
            alert(data.error || "Error al registrar");
        }
    });

    // ======================
    // LOGIN
    // ======================
    btnLogin.addEventListener("click", async () => {

        if (!email.value || !password.value) {
            alert("Completa el login");
            return;
        }

        try {
            const res = await fetch("/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: email.value,
                    password: password.value
                })
            });

            const data = await res.json();

            if (!data.ok) {
                alert("Credenciales incorrectas");
                return;
            }

            // GUARDAR USUARIO GLOBAL
            currentUser = data.user;

            // SOCKET AUTH
            socket.emit("auth", currentUser);

            // ocultar login
            loginView.style.display = "none";

            // UI
            if (usuarioActual) {
                usuarioActual.textContent = currentUser.nickname;
            }

            console.log("LOGIN OK:", currentUser);

        } catch (err) {
            console.error("Error login:", err);
            alert("Error de servidor");
        }
    });
}