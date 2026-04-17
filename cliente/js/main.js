// main.js
console.log("MAIN.JS CARGÓ");

// =========================
// IMPORTS
// =========================
import { renderUsuarios, setUsuariosGlobal } from "./usuarios.js";
import { initChat } from "./chat.js";
import { initEmojis } from "./emojis.js";
import { initMedia } from "./media.js";
import { initPrivado } from "./privado.js";
import { initAuth } from "./auth.js";

// ⚠️ IMPORTANTE: animaciones NO se usan aquí directamente,
// pero se cargan para asegurar que el módulo esté disponible
import "./animaciones.js";

// =========================
// SOCKET
// =========================
const socket = io();

if (!socket) {
  console.error("Socket no inicializado");
} else {
  console.log("SOCKET:", socket);
}

// =========================
// USUARIOS ONLINE
// =========================
socket.on("lista_usuarios", (usuarios) => {
  if (!usuarios) return;

  console.log("👥 USUARIOS RECIBIDOS FRONT:", usuarios);

  try {
    setUsuariosGlobal(usuarios);
    renderUsuarios(usuarios);
  } catch (error) {
    console.error("Error renderizando usuarios:", error);
  }
});

// =========================
// INIT APP
// =========================
document.addEventListener("DOMContentLoaded", () => {
  try {
    initAuth(socket);
    initChat(socket);
    initEmojis();
    initMedia(socket);
    initPrivado(socket);

    console.log("MAIN OK");
  } catch (error) {
    console.error("Error inicializando app:", error);
  }
});