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

        try {
            const res = await fetch("/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: email.value,
                    password: password.value
                })
            });

            // PROTECCIÓN CONTRA 502 / HTML
            const text = await res.text();

            let data;
            try {
                data = JSON.parse(text);
            } catch (e) {
                console.error("Respuesta no JSON:", text);
                alert("Error servidor (no JSON)");
                return;
            }

            if (!data.ok) {
                alert(data.error || "Credenciales incorrectas");
                return;
            }

            currentUser = data.user;
            socket.emit("auth", currentUser);

            loginView.style.display = "none";

            if (usuarioActual) {
                usuarioActual.textContent = currentUser.nickname;
            }

            console.log("LOGIN OK:", currentUser);

        } catch (err) {
            console.error("Error login:", err);
            alert("Error de conexión con el servidor");
        }
    });
}