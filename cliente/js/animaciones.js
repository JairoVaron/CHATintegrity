// archivo animaciones.js

// ==========================
// NUEVO MENSAJE
// ==========================
function animarNuevoMensaje(elemento) {
    elemento.style.opacity = "0";
    elemento.style.transform = "translateY(10px)";

    requestAnimationFrame(() => {
        elemento.style.transition = "opacity 0.25s ease, transform 0.25s ease";
        elemento.style.opacity = "1";
        elemento.style.transform = "translateY(0)";
    });
}


// ==========================
// MENSAJE PROPIO (rebote)
// ==========================
function animarMensajePropio(elemento) {
    elemento.style.animation = "none";
    elemento.offsetHeight; // reflow
    elemento.style.animation = "mensajeBounce 0.25s ease";
}


// ==========================
// ENTRADA LATERAL (más limpia)
// ==========================
function animarEntradaLateral(elemento, esMio) {
    elemento.style.opacity = "0";
    elemento.style.transform = esMio 
        ? "translateX(20px)" 
        : "translateX(-20px)";

    requestAnimationFrame(() => {
        elemento.style.transition = "opacity 0.25s ease, transform 0.25s ease";
        elemento.style.opacity = "1";
        elemento.style.transform = "translateX(0)";
    });
}


// ==========================
// EFECTO ENVÍO (form)
// ==========================
const form = document.getElementById("formChat");

if(form){
  form.addEventListener("submit", () => {
    form.style.transition = "transform 0.1s ease";
    form.style.transform = "scale(0.97)";
    
    setTimeout(() => {
      form.style.transform = "scale(1)";
    }, 100);
  });
}


// ==========================
// HIGHLIGHT MENSAJE NUEVO
// ==========================
function highlightMensaje(el){
  el.style.transition = "background 0.4s ease";
  el.style.background = "rgba(59,130,246,0.15)";

  setTimeout(()=>{
    el.style.background = "";
  }, 400);
}


// ==========================
// AVATAR AUTOMÁTICO USUARIOS (inicial)
// ==========================
function aplicarInicialesUsuarios() {
  const usuarios = document.querySelectorAll("#listaUsuarios .user-item");

  usuarios.forEach(item => {
    const nombreEl = item.querySelector(".user-item-name");
    if (!nombreEl) return;

    const nombre = nombreEl.textContent.trim();

    if (nombre.length > 0) {
      item.dataset.letter = nombre[0].toUpperCase();
    }
  });
}


// ==========================
// INICIALIZACIÓN SEGURA
// ==========================

document.addEventListener("DOMContentLoaded", () => {

  // Ejecutar una vez al cargar
  aplicarInicialesUsuarios();

  // Observar cambios dinámicos (usuarios que entran/salen)
  const listaUsuarios = document.getElementById("listaUsuarios");

  if (listaUsuarios) {
    const observer = new MutationObserver(() => {
      aplicarInicialesUsuarios();
    });

    observer.observe(listaUsuarios, {
      childList: true,
      subtree: true
    });
  }

});


// ==========================
// FUNCIONES POLÍTICA
// ==========================
function abrirPolitica() {
  const login = document.getElementById("loginView");
  const politica = document.getElementById("politicaView");

  if (!login || !politica) return;

  login.classList.add("hidden");
  politica.classList.remove("hidden");
}

function cerrarPolitica() {
  const login = document.getElementById("loginView");
  const politica = document.getElementById("politicaView");

  if (!login || !politica) return;

  politica.classList.add("hidden");
  login.classList.remove("hidden");
}

// 👇 ESTO DEBE IR DESPUÉS DE LAS FUNCIONES
window.abrirPolitica = abrirPolitica;
window.cerrarPolitica = cerrarPolitica;


// ==========================
// EXPORT (si usas módulos)
// ==========================
export {
  animarNuevoMensaje,
  animarMensajePropio,
  animarEntradaLateral,
  highlightMensaje
};



