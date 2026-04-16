// usuarios.js
// usuarios.js

let usuariosGlobal = []; 
let socketGlobal = null;
let username = null;


// =========================
// INIT
// =========================
export function initUsuario(socket) {

    socketGlobal = socket;

    console.log("INIT USUARIO OK");

    window.addEventListener("DOMContentLoaded", () => {

        const usuarioActual = document.getElementById("usuarioActual");

        // ⚠️ Este sistema ahora usa LOGIN, así que solo mostramos nombre
        socketGlobal.on("connect", () => {
            console.log("Socket conectado");
        });
    });
}


// =========================
// GETTERS
// =========================
export function getUsername() {
    return username;
}


// =========================
// USERS STATE
// =========================
export function setUsuariosGlobal(usuarios) {
    usuariosGlobal = usuarios;
}

export function getUsuariosGlobal() {
    return usuariosGlobal;
}


// =========================
// RENDER USERS (🔥 ARREGLADO)
// =========================
export function renderUsuarios(usuarios) {

    const lista = document.getElementById("listaUsuarios");

    if (!lista) {
        console.error("❌ listaUsuarios NO existe en el HTML");
        return;
    }

    lista.innerHTML = "";

    usuarios.forEach(u => {

        const li = document.createElement("li");

        // 🔥 CLASE NECESARIA PARA EL CSS
        li.classList.add("user-item");

        // 🔥 DATA PARA EL AVATAR (LA SOLUCIÓN REAL)
        li.dataset.letter = u.nombre ? u.nombre[0].toUpperCase() : "U";

        // IDs (los tuyos)
        li.dataset.id = u.socketId;
        li.dataset.userid = u.userId;

        // 🔥 ESTRUCTURA CORRECTA
        li.innerHTML = `
            <span class="user-item-name">${u.nombre}</span>
        `;

        lista.appendChild(li);
    });

    console.log("RENDER OK:", usuarios);
}
