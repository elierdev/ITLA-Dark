document.querySelectorAll(".defaultuserpic").forEach(img => {
    img.src = "https://i.imgur.com/scCsFte.jpeg";
});

chrome.storage.sync.get("accentColor", ({ accentColor }) => {
    if (accentColor) {
        document.documentElement.style.setProperty("--accent", accentColor);
    }
});

const btnPomodoro = document.createElement("div");
btnPomodoro.id = "pomodoro-button";
btnPomodoro.className = "pomodoro-btn";
btnPomodoro.textContent = "Iniciar Pomodoro";
btnPomodoro.style.cursor = "pointer";

let tiempoPomodoro = 25 * 60; // 25 minutos
let tiempoDescanso = 5 * 60; // 5 minutos
let totalSegundos = tiempoPomodoro;
let intervaloID = null;
let estaCorriendo = false;
let enDescanso = false;

const sonidoPomodoro = new Audio(chrome.runtime.getURL("success.mp3"));
const sonidoDescanso = new Audio(chrome.runtime.getURL("success.mp3"));

function formatTime(segundos) {
    const minutos = Math.floor(segundos / 60);
    const segundosRestantes = segundos % 60;
    return `${String(minutos).padStart(2, "0")}:${String(segundosRestantes).padStart(2, "0")}`;
}

function actualizarDisplay() {
    if (enDescanso) {
        btnPomodoro.textContent = `Descanso: ${formatTime(totalSegundos)}`;
    } else {
        btnPomodoro.textContent = formatTime(totalSegundos);
    }
}

function tick() {
    totalSegundos--;
    actualizarDisplay();

    if (totalSegundos <= 0) {
        clearInterval(intervaloID);
        estaCorriendo = false;

        if (!enDescanso) {
            // Pomodoro terminado → inicia descanso
            sonidoPomodoro.play();
            btnPomodoro.style.backgroundColor = "#386738";
            btnPomodoro.textContent = "Descanso iniciado (5 min)";
            enDescanso = true;
            totalSegundos = tiempoDescanso;
            setTimeout(iniciarPomodoro, 1000); // iniciar descanso tras 1s
        } else {
            // Descanso terminado → volver a Pomodoro
            sonidoDescanso.play();
            btnPomodoro.textContent = "Se acabó el tiempo de descanso";
            btnPomodoro.style.backgroundColor = "#ffbf00";
            btnPomodoro.style.color = "black";
            enDescanso = false;
            totalSegundos = tiempoPomodoro;
            setTimeout(() => {
                btnPomodoro.textContent = "Iniciar Pomodoro";
                btnPomodoro.style.backgroundColor = "var(--accent)";
            }, 3000);
        }
    }
}

function iniciarPomodoro() {
    if (!estaCorriendo) {
        estaCorriendo = true;
        btnPomodoro.style.backgroundColor = "var(--accent)";
        btnPomodoro.style.color = "black";
        intervaloID = setInterval(tick, 1000);
    }
}

function detenerPomodoro() {
    if (estaCorriendo) {
        clearInterval(intervaloID);
        estaCorriendo = false;
        btnPomodoro.textContent = `||`;
        btnPomodoro.style.backgroundColor = "#ffbf00";
        btnPomodoro.style.color = "black";
    }
}

btnPomodoro.addEventListener("click", function () {
    if (estaCorriendo) {
        detenerPomodoro();
    } else {
        iniciarPomodoro();
    }
});

actualizarDisplay();
document.body.appendChild(btnPomodoro);
