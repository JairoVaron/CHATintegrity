// archivo chat.js

import { getUser } from "./auth.js";
import { getModo } from "./estado.js";

// IMPORT RECICLAJE
import {
    getColorFromName,
    obtenerHora,
    crearBurbuja,
    crearHora
} from "./reciclaje.js";

const form = document.getElementById("formChat");
const input = document.getElementById("inputMensaje");
const lista = document.getElementById("listaMensajes");
const contenedorScroll = document.querySelector(".mensajes-container");

// AGRUPACIÓN GLOBAL
let ultimoRemitenteGlobal = null;
let ultimoGrupoGlobal = null;


// =========================
// INIT CHAT
// =========================
export function initChat(socket) {

    // =========================
    // ESCRIBIENDO GLOBAL
    // =========================
    let typingTimeout;

    input.addEventListener("input", () => {

        if (getModo() !== "global") return;

        console.log("Enviando escribiendo_global");

        socket.emit("escribiendo_global");

        clearTimeout(typingTimeout);

        typingTimeout = setTimeout(() => {
            socket.emit("dejo_escribir_global");
        }, 1000);
    });


    const subtitle = document.getElementById("chatSubtitle");
    let typingTimer;

    socket.on("escribiendo_global", (data) => {

        if (getModo() !== "global") return;

        console.log("Alguien escribe:", data.nombre);

        subtitle.textContent = `${data.nombre} está escribiendo...`;

        clearTimeout(typingTimer);

        typingTimer = setTimeout(() => {
            subtitle.textContent = "Todos los usuarios";
        }, 1500);
    });

    socket.on("dejo_escribir_global", () => {

        if (getModo() !== "global") return;

        subtitle.textContent = "Todos los usuarios";
    });


    // =========================
    // RECIBIR MENSAJES GLOBAL
    // =========================
    socket.on("chat", (data) => {

        if (getModo() !== "global") return;

        data.hora = obtenerHora();

        renderMensaje(data);
    });

    // =========================
    // ENVIAR MENSAJES GLOBAL
    // =========================
    form.addEventListener("submit", (e) => {

        e.preventDefault();

        if (getModo() !== "global") return;

        const user = getUser();

        if (!user) {
            alert("Debes iniciar sesión");
            return;
        }

        const mensaje = input.value.trim();
        if (!mensaje) return;

        socket.emit("chat", { mensaje });

        input.value = "";
    });
}


// =========================
// RENDER MENSAJE GLOBAL
// =========================
export function renderMensaje(data) {

    const user = getUser();
    const nombre = data.nombre;
    const esMio = nombre === user?.nickname;

    const esMismoUsuario = nombre === ultimoRemitenteGlobal;

    let wrap;

    // =========================
    // AGRUPAR
    // =========================
    if (esMismoUsuario && ultimoGrupoGlobal) {

        wrap = ultimoGrupoGlobal;

    } else {

        wrap = document.createElement("div");

        wrap.classList.add(
            "mensaje-wrapper",
            esMio ? "mensaje-wrapper-mio" : "mensaje-wrapper-otro"
        );

        const mensajeBox = document.createElement("div");
        mensajeBox.classList.add("mensaje");
        mensajeBox.dataset.letter = nombre ? nombre[0].toUpperCase() : "U";

        // AVATAR
        if (!esMio) {
            const avatar = document.createElement("div");
            avatar.classList.add("mensaje-avatar");
            avatar.style.background = getColorFromName(nombre);
            mensajeBox.appendChild(avatar);
        }

        // CONTENIDO
        const contenido = document.createElement("div");
        contenido.classList.add("mensaje-contenido");

        // NOMBRE (solo una vez)
        const autor = document.createElement("div");
        autor.classList.add("mensaje-autor");
        autor.textContent = nombre;

        contenido.appendChild(autor);

        mensajeBox.appendChild(contenido);
        wrap.appendChild(mensajeBox);

        lista.appendChild(wrap);

        // guardar grupo
        ultimoGrupoGlobal = wrap;
        ultimoRemitenteGlobal = nombre;
    }

    // =========================
    // AGREGAR MENSAJE
    // =========================
    const contenido = wrap.querySelector(".mensaje-contenido");

    const burbuja = crearBurbuja({
        mensaje: data.mensaje,
        propio: esMio
    });

    contenido.appendChild(burbuja);

    // HORA
    contenido.appendChild(crearHora(data.hora));

    requestAnimationFrame(() => {
        contenedorScroll.scrollTo({
            top: contenedorScroll.scrollHeight,
            behavior: "smooth"
        });
    });
}

console.log(
    contenedorScroll.scrollHeight,
    contenedorScroll.clientHeight
);