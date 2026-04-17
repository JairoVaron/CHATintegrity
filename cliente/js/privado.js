// archivo privado.js

import { getUsuariosGlobal } from "./usuarios.js";
import { setModo } from "./estado.js";

// IMPORT RECICLAJE
import {
    getColorFromName,
    obtenerHora,
    crearBurbuja,
    crearHora,
    crearEstado
} from "./reciclaje.js";

let chatActivoSocketId = null;
let chatActivoUserId = null;
let chats = JSON.parse(localStorage.getItem("chats")) || {};
let tituloOriginal = document.title;
let notificaciones = {};
let ultimoRemitente = null;
let ultimoGrupo = null;

// sonido
const sonido = new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg");
sonido.volume = 1;


// =========================
// CHAT PRIVADO
// =========================
export function initPrivado(socket) {

    let typingTimer;
    let typingTimeout;
    let audioHabilitado = false;

    const listaUsuarios = document.getElementById("listaUsuarios");
    const form = document.getElementById("formChat");
    const input = document.getElementById("inputMensaje");
    const header = document.getElementById("chatHeader");
    const btnGlobal = document.getElementById("btnGlobal");
    const contenedorScroll = document.querySelector(".mensajes-container");


    window.addEventListener("focus", () => {
        document.title = tituloOriginal;
    });

    // =========================
    // ESCRIBIENDO MENSAJE
    // =========================   
    input.addEventListener("input", () => {

        if (!chatActivoSocketId) return;

        console.log("Escribiendo privado..."); 

        socket.emit("escribiendo_privado", {
            to: chatActivoSocketId
        });

        clearTimeout(typingTimeout);

        typingTimeout = setTimeout(() => {
            socket.emit("dejo_escribir_privado", {
                to: chatActivoSocketId
            });
        }, 1000);
    });


    // =========================
    // SONIDO NOTIFICACION
    // =========================
    document.addEventListener("click", () => {
        if (!audioHabilitado) {
            sonido.play()
                .then(() => {
                    sonido.pause();
                    sonido.currentTime = 0;
                    audioHabilitado = true;
                    console.log("🔊 Audio habilitado");
                })
                .catch(err => console.log("Error audio:", err));
        }
    }, { once: true });


    // =========================
    // VOLVIENDO AL CHAT GLOBAL
    // =========================
    btnGlobal.addEventListener("click", () => {
        console.log("VOLVIENDO A CHAT GLOBAL");

        chatActivoSocketId = null;
        chatActivoUserId = null;

        setModo("global");

        header.textContent = "Chat Global";

        document.getElementById("listaMensajes").innerHTML = "";
    });


    // =========================
    // CLICK USUARIO → ABRIR CHAT
    // =========================
    listaUsuarios.addEventListener("click", (e) => {
        const li = e.target.closest("li");
        if (!li) return;

        const socketId = li.dataset.id;
        const userId = li.dataset.userid;

        if (!socketId) return;

        chatActivoSocketId = socketId;
        chatActivoUserId = userId;

        socket.emit("mensajes_leidos", {
            from: socket.id,
            to: socketId
        });

        if (chats[socketId]) {
            chats[socketId].forEach(msg => {
                if (msg.propio) msg.estado = "leido";
            });
        }

        delete notificaciones[socketId];
        actualizarNotificacionesUI();

        setModo("privado");

        const usuarios = getUsuariosGlobal();
        const user = usuarios.find(u => u.socketId === socketId);

        header.textContent = user?.nombre || "Chat privado";

        if (!chats[socketId]) {
            chats[socketId] = [];
        }

        render(socketId);
    });


    // =========================
    // ENVIAR MENSAJE
    // =========================
    form.addEventListener("submit", (e) => {
        e.preventDefault();

        if (!chatActivoSocketId) return;

        const mensaje = input.value.trim();
        if (!mensaje) return;

        socket.emit("mensaje_privado", {
            toSocketId: chatActivoSocketId,
            mensaje
        });

        input.value = "";

        requestAnimationFrame(() => {
            contenedorScroll.scrollTo({
                top: contenedorScroll.scrollHeight,
                behavior: "smooth"
            });
        });
    });


    // =========================
    // RECIBIR MENSAJES
    // =========================
    socket.on("mensaje_privado", (data) => {

        const socketId = data.propio
            ? data.to
            : data.from.socketId;

        if (!chats[socketId]) {
            chats[socketId] = [];
        }

        chats[socketId].push({
            mensaje: data.mensaje,
            propio: data.propio,
            nombre: data.from.nombre,
            hora: obtenerHora(), 
            estado: data.propio ? "enviado" : "leido"
        });

        save();

        if (!data.propio) {
            const estasEnEseChat = socketId === chatActivoSocketId;

            if (!estasEnEseChat) {
                notificaciones[socketId] = (notificaciones[socketId] || 0) + 1;
                actualizarNotificacionesUI();

                document.title = `${data.from.nombre} te escribió 💬`;

                if (audioHabilitado) {
                    sonido.currentTime = 0;
                    sonido.play().catch(() => {});
                }
            }
        }

        if (socketId === chatActivoSocketId) {

            render(socketId);

            if (!data.propio) {
                socket.emit("mensajes_leidos", {
                    from: socket.id,
                    to: socketId
                });
            }
        }
    });


    // =========================
    // RENDER MENSAJES
    // =========================
    function render(socketId) {

        const lista = document.getElementById("listaMensajes");
        lista.innerHTML = "";

        ultimoRemitente = null;
        ultimoGrupo = null;

        (chats[socketId] || []).forEach(msg => {

            const nombre = msg.propio ? "Tú" : msg.nombre;
            const esMismoUsuario = nombre === ultimoRemitente;

            let wrap;

            if (esMismoUsuario && ultimoGrupo) {
                wrap = ultimoGrupo;
            } else {

                wrap = document.createElement("div");

                wrap.classList.add(
                    "mensaje-wrapper",
                    msg.propio ? "mensaje-wrapper-mio" : "mensaje-wrapper-otro"
                );

                const mensajeBox = document.createElement("div");
                mensajeBox.classList.add("mensaje");

                mensajeBox.dataset.letter = nombre ? nombre[0].toUpperCase() : "U";

                if (!msg.propio) {
                    const avatar = document.createElement("div");
                    avatar.classList.add("mensaje-avatar");
                    avatar.style.background = getColorFromName(nombre);
                    mensajeBox.appendChild(avatar);
                }

                const contenido = document.createElement("div");
                contenido.classList.add("mensaje-contenido");

                const autor = document.createElement("div");
                autor.classList.add("mensaje-autor");
                autor.textContent = nombre;

                contenido.appendChild(autor);

                mensajeBox.appendChild(contenido);
                wrap.appendChild(mensajeBox);

                lista.appendChild(wrap);

                ultimoGrupo = wrap;
                ultimoRemitente = nombre;
            }

            const contenido = wrap.querySelector(".mensaje-contenido");

            const burbuja = crearBurbuja({
                mensaje: msg.mensaje,
                propio: msg.propio
            });

            contenido.appendChild(burbuja);

            contenido.appendChild(crearHora(msg.hora));

            if (msg.propio) {
                contenido.appendChild(crearEstado(msg.estado));
            }
        });

        requestAnimationFrame(() => {
            contenedorScroll.scrollTo({
                top: contenedorScroll.scrollHeight,
                behavior: "smooth"
            });
        });
    }


    // =========================
    // NOTIFICACIONES UI
    // =========================
    function actualizarNotificacionesUI() {
        const items = document.querySelectorAll("#listaUsuarios li");

        items.forEach(li => {

            const socketId = li.dataset.id;
            let badge = li.querySelector(".notif");

            if (badge) badge.remove();

            if (notificaciones[socketId]) {

                const notif = document.createElement("span");
                notif.classList.add("notif");

                const cantidad = notificaciones[socketId];

                notif.textContent = cantidad > 1 
                    ? `🔔 ${cantidad}` 
                    : "🔔";

                li.appendChild(notif);
            }
        });
    }


    // =========================
    // MENSAJES LEIDOS
    // =========================
    socket.on("mensajes_leidos", ({ from }) => {

        const socketId = from;

        if (chats[socketId]) {

            chats[socketId].forEach(msg => {
                if (msg.propio) msg.estado = "leido";
            });

            save();

            if (socketId === chatActivoSocketId) {
                render(socketId);
            }
        }
    });


    // =========================
    // ESCRIBIENDO
    // =========================
    socket.on("escribiendo_privado", (data) => {

        console.log("Privado:", data); 

        if (data.from.socketId !== chatActivoSocketId) return;

        header.textContent = `${data.from.nombre} está escribiendo...`;

        clearTimeout(typingTimer);

        typingTimer = setTimeout(() => {
            actualizarHeaderNormal(header);
        }, 1500);
    });

    socket.on("dejo_escribir_privado", (data) => {

        if (data.from !== chatActivoSocketId) return;

        actualizarHeaderNormal(header);
    });


    // =========================
    // GUARDAR
    // =========================
    function save() {
        localStorage.setItem("chats", JSON.stringify(chats));
    }
}


// =========================
// HEADER NORMAL
// =========================
function actualizarHeaderNormal(header) {
    const usuarios = getUsuariosGlobal();
    const user = usuarios.find(u => u.socketId === chatActivoSocketId);

    header.textContent = user?.nombre || "Chat privado";
}