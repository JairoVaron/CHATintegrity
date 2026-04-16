import { getUsuariosGlobal } from "./usuarios.js";
import { setModo } from "./estado.js";

let chatActivoSocketId = null;
let chatActivoUserId = null;

// chats guardados por socketId
let chats = JSON.parse(localStorage.getItem("chats")) || {};

// notificaciones
let tituloOriginal = document.title;
let notificaciones = {};

// sonido
const sonido = new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg");
sonido.volume = 1;


// =========================
// COLOR PARA USUARIOS
// =========================
function getColorFromName(nombre) {
    let hash = 0;

    for (let i = 0; i < nombre.length; i++) {
        hash = nombre.charCodeAt(i) + ((hash << 5) - hash);
    }

    const colores = [
        "#3b82f6",
        "#10b981",
        "#f59e0b",
        "#ef4444",
        "#8b5cf6",
        "#ec4899",
        "#06b6d4",
        "#22c55e"
    ];

    return colores[Math.abs(hash) % colores.length];
}


// =========================
// CHAT PRIVADO
// =========================
export function initPrivado(socket) {

    const listaUsuarios = document.getElementById("listaUsuarios");
    const form = document.getElementById("formChat");
    const input = document.getElementById("inputMensaje");
    const header = document.getElementById("chatHeader");
    const btnGlobal = document.getElementById("btnGlobal");

    window.addEventListener("focus", () => {
        document.title = tituloOriginal;
    });



    // =========================
    // SONIDO NOTIFICACION
    // =========================
    let audioHabilitado = false;

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

        console.log("🌍 VOLVIENDO A CHAT GLOBAL");

        // resetear chat privado
        chatActivoSocketId = null;
        chatActivoUserId = null;

        // cambiar modo
        setModo("global");

        // cambiar título
        header.textContent = "Chat Global";

        // limpiar mensajes (el global los vuelve a pintar)
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

        if (!socketId) {
            console.log("❌ socketId vacío");
            return;
        }

        chatActivoSocketId = socketId;
        chatActivoUserId = userId;

        // ❌ quitar notificación al abrir
        delete notificaciones[socketId];
        actualizarNotificacionesUI();

        setModo("privado");

        // 🔥 mostrar nombre en header
        const usuarios = getUsuariosGlobal();
        const user = usuarios.find(u => u.socketId === socketId);

        header.textContent = user?.nombre || "Chat privado";

        // crear chat si no existe
        if (!chats[socketId]) {
            chats[socketId] = [];
        }

        render(socketId);

        console.log("✅ CHAT ABIERTO CON:", socketId, userId);
    });


    // =========================
    // ENVIAR MENSAJE
    // =========================
    form.addEventListener("submit", (e) => {
        e.preventDefault();

        if (!chatActivoSocketId) {
            console.log("❌ No hay chat activo");
            return;
        }

        const mensaje = input.value.trim();
        if (!mensaje) return;

        console.log("📤 ENVIANDO A:", chatActivoSocketId);

        socket.emit("mensaje_privado", {
            toSocketId: chatActivoSocketId,
            mensaje
        });

        input.value = "";
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
            nombre: data.from.nombre
        });

        save();

        // 🔔 NOTIFICACIONES
        if (!data.propio) {

            const estasEnEseChat = socketId === chatActivoSocketId;

            // SOLO si NO estás viendo ese chat
            if (!estasEnEseChat) {

                // campanita en lista
                notificaciones[socketId] = (notificaciones[socketId] || 0) + 1;
                actualizarNotificacionesUI();

                // título pestaña
                document.title = `${data.from.nombre} te escribió 💬`;

                // sonido
                if (audioHabilitado) {
                    sonido.currentTime = 0;
                    sonido.play().catch(() => {});
                }
            }
        }


        // render solo si estás en ese chat
        if (socketId === chatActivoSocketId) {
            render(socketId);
        }
    });


    // =========================
    // RENDER MENSAJES
    // =========================
    function render(socketId) {

        const lista = document.getElementById("listaMensajes");
        lista.innerHTML = "";

        (chats[socketId] || []).forEach(msg => {

            const wrap = document.createElement("div");

            wrap.classList.add(
                "mensaje-wrapper",
                msg.propio ? "mensaje-wrapper-mio" : "mensaje-wrapper-otro"
            );

            // 🔥 CONTENEDOR
            const mensajeBox = document.createElement("div");
            mensajeBox.classList.add("mensaje");

            const nombre = msg.propio ? "Tú" : msg.nombre;

            mensajeBox.dataset.letter = nombre ? nombre[0].toUpperCase() : "U";

            // 🔥 AVATAR SOLO SI NO ES TUYO
            if (!msg.propio) {
                const avatar = document.createElement("div");
                avatar.classList.add("mensaje-avatar");

                // 🔥 COLOR ÚNICO
                avatar.style.background = getColorFromName(nombre);

                mensajeBox.appendChild(avatar);
            }

            // 🔥 CONTENIDO
            const contenido = document.createElement("div");
            contenido.classList.add("mensaje-contenido");

            const autor = document.createElement("div");
            autor.classList.add("mensaje-autor");
            autor.textContent = nombre;

            const burbuja = document.createElement("div");
            burbuja.classList.add(
                "mensaje-item",
                msg.propio ? "mensaje-mio" : "mensaje-otro"
            );

            burbuja.textContent = msg.mensaje;

            contenido.appendChild(autor);
            contenido.appendChild(burbuja);

            mensajeBox.appendChild(contenido);
            wrap.appendChild(mensajeBox);

            lista.appendChild(wrap);
        });

        lista.scrollTop = lista.scrollHeight;
    }


    // =========================
    // ENVIAR MENSAJE
    // =========================
    function actualizarNotificacionesUI() {

        const items = document.querySelectorAll("#listaUsuarios li");

        items.forEach(li => {

            const socketId = li.dataset.id;

            // eliminar si ya existe
            let badge = li.querySelector(".notif");

            if (badge) badge.remove();

            // si hay notificación → crear
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
    // GUARDAR
    // =========================
    function save() {
        localStorage.setItem("chats", JSON.stringify(chats));
    }
}