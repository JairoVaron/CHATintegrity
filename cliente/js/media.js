// media.js
export function initMedia(socket) {

    const inputImagen = document.getElementById("inputImagen");
    const btnImagen = document.getElementById("btnImagen");

    // 🔥 seguridad: si no existen, no rompe la app
    if (!inputImagen || !btnImagen) return;

    btnImagen.addEventListener("click", () => {
        inputImagen.click();
    });

    inputImagen.addEventListener("change", async () => {

        const file = inputImagen.files[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onload = () => {

            // 🔥 IMPORTANTE: ahora depende del login (no username viejo)
            socket.emit("imagen", {
                imagen: reader.result
            });
        };

        reader.readAsDataURL(file);
    });
}