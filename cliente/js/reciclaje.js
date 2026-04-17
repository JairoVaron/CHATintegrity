// =========================
// COLOR PARA USUARIOS
// =========================
export function getColorFromName(nombre) {
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
// FORMATEAR HORA
// =========================
export function obtenerHora() {
    return new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
    });
}


// =========================
// CREAR BURBUJA MENSAJE
// =========================
export function crearBurbuja({ mensaje, propio }) {
    const burbuja = document.createElement("div");

    burbuja.classList.add(
        "mensaje-item",
        propio ? "mensaje-mio" : "mensaje-otro"
    );

    burbuja.textContent = mensaje;

    return burbuja;
}


// =========================
// CREAR HORA DOM
// =========================
export function crearHora(horaTexto) {
    const hora = document.createElement("div");
    hora.classList.add("mensaje-hora");
    hora.textContent = horaTexto;
    return hora;
}


// =========================
// CREAR ESTADO ✔✔
// =========================
export function crearEstado(estado) {
    const estadoDiv = document.createElement("div");
    estadoDiv.classList.add("mensaje-estado");
    estadoDiv.textContent = estado === "leido" ? "✔✔" : "✔";
    return estadoDiv;
}