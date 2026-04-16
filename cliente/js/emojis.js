// emojis.js
const btnEmoji = document.getElementById("btnEmoji");
const panelEmoji = document.getElementById("panelEmoji");
const input = document.getElementById("inputMensaje");

export function initEmojis() {
    btnEmoji.addEventListener("click", () => {
        panelEmoji.style.display =
            panelEmoji.style.display === "flex" ? "none" : "flex";
    });

    panelEmoji.querySelectorAll("span").forEach(emoji => {
        emoji.addEventListener("click", () => {
            input.value += emoji.textContent;
            panelEmoji.style.display = "none";
            input.focus();
        });
    });
}