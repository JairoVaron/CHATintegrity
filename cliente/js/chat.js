import { getUser } from "./auth.js";
import { getModo } from "./estado.js";

const form = document.getElementById("formChat");
const input = document.getElementById("inputMensaje");
const lista = document.getElementById("listaMensajes");


// =========================
// COLOR PARA USUARIOS
// =========================
function getColorFromName(nombre) {
    let hash = 0;

    for (let i = 0; i < nombre.length; i++) {
        hash = nombre.charCodeAt(i) + ((hash << 5) - hash);
    }

    const colores = [
        "#3b82f6", // azul
        "#10b981", // verde
        "#f59e0b", // amarillo
        "#ef4444", // rojo
        "#8b5cf6", // violeta
        "#ec4899", // rosa
        "#06b6d4", // cyan
        "#22c55e"  // verde claro
    ];

    return colores[Math.abs(hash) % colores.length];
}

export function initChat(socket) {

    // =========================
    // RECIBIR MENSAJES GLOBAL
    // =========================
    socket.on("chat", (data) => {

        if (getModo() !== "global") return;

        renderMensaje(data);
    });

    // =========================
    // ENVIAR MENSAJES GLOBAL
    // =========================
    form.addEventListener("submit", (e) => {

        e.preventDefault();

        // solo chat global
        if (getModo() !== "global") return;

        const user = getUser(); // 🔥 LOGIN REAL

        if (!user) {
            alert("Debes iniciar sesión");
            return;
        }

        const mensaje = input.value.trim();

        if (!mensaje) return;

        socket.emit("chat", {
            mensaje
        });

        input.value = "";
    });
}


// =========================
// RENDER MENSAJE GLOBAL
// =========================
export function renderMensaje(data) {

    const user = getUser();
    const esMio = data.nombre === user?.nickname;

    let wrap = document.createElement("div");

    wrap.classList.add(
        "mensaje-wrapper",
        esMio ? "mensaje-wrapper-mio" : "mensaje-wrapper-otro"
    );

    // 🔥 CONTENEDOR FLEX
    let mensajeBox = document.createElement("div");
    mensajeBox.classList.add("mensaje");
    mensajeBox.dataset.letter = data.nombre ? data.nombre[0].toUpperCase() : "U";

    // 🔥 AVATAR (solo otros usuarios)
    if (!esMio) {
        let avatar = document.createElement("div");
        avatar.classList.add("mensaje-avatar");
        avatar.style.background = getColorFromName(data.nombre); // 🔥 COLOR ÚNICO
        mensajeBox.appendChild(avatar);
    }

    // 🔥 CONTENIDO
    let contenido = document.createElement("div");
    contenido.classList.add("mensaje-contenido");

    let autor = document.createElement("div");
    autor.classList.add("mensaje-autor");
    autor.textContent = data.nombre;

    let burbuja = document.createElement("div");
    burbuja.classList.add(
        "mensaje-item",
        esMio ? "mensaje-mio" : "mensaje-otro"
    );

    burbuja.textContent = data.mensaje;

    contenido.appendChild(autor);
    contenido.appendChild(burbuja);

    mensajeBox.appendChild(contenido);

    wrap.appendChild(mensajeBox);

    lista.appendChild(wrap);

    lista.scrollTop = lista.scrollHeight;
}