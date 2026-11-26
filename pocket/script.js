
/* ========================================
   LUPLY POCKET — EXPERIENCE LAB
   Simulazione di ricerca di prossimità
======================================== */

const startButton = document.getElementById("start-demo");
const stopButton = document.getElementById("stop-demo");
const slider = document.getElementById("proximity-slider");
const statusText = document.getElementById("proximity-status");

const radarCore = document.querySelector(".radar-core");
const radarRings = document.querySelectorAll(".radar-ring");

const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
);

let audioContext = null;
let active = false;
let completed = false;
let proximity = 0;
let beepTimer = null;
let pulseAnimation = null;

const activeSounds = new Set();

statusText.setAttribute("aria-live", "polite");


/* ========================================
   SISTEMA AUDIO
======================================== */

function initializeAudio() {

  const AudioContextClass =
    window.AudioContext || window.webkitAudioContext;

  if (!AudioContextClass) return;

  try {

    if (!audioContext) {
      audioContext = new AudioContextClass();
    }

    if (audioContext.state === "suspended") {
      audioContext.resume().catch(() => {});
    }

  } catch (error) {
    console.warn("Audio non disponibile:", error);
  }
}


function playTone(
  frequency,
  duration,
  volume,
  delay = 0
) {

  if (!audioContext ||
      audioContext.state !== "running") return;

  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();

  const startTime = audioContext.currentTime + delay;

  oscillator.type = "sine";
  oscillator.frequency.value = frequency;

  gain.gain.setValueAtTime(0.001, startTime);

  gain.gain.exponentialRampToValueAtTime(
    volume,
    startTime + 0.025
  );

  gain.gain.exponentialRampToValueAtTime(
    0.001,
    startTime + duration
  );

  oscillator.connect(gain);
  gain.connect(audioContext.destination);

  activeSounds.add(oscillator);

  oscillator.onended = () => {
    activeSounds.delete(oscillator);
    oscillator.disconnect();
    gain.disconnect();
  };

  oscillator.start(startTime);
  oscillator.stop(startTime + duration);
}


function stopAllSounds() {

  activeSounds.forEach((oscillator) => {
    try {
      oscillator.stop();
    } catch (error) {
      // Suono già terminato.
    }
  });

  activeSounds.clear();
}


/* ========================================
   ANIMAZIONE RADAR
======================================== */

function pulseRadar() {

  if (reducedMotion.matches) return;
  if (typeof radarCore.animate !== "function") return;

  if (pulseAnimation) {
    pulseAnimation.cancel();
  }

  pulseAnimation = radarCore.animate(
    [
      {
        transform: "translate(-50%, -50%) scale(1)"
      },
      {
        transform: "translate(-50%, -50%) scale(1.7)"
      },
      {
        transform: "translate(-50%, -50%) scale(1)"
      }
    ],
    {
      duration: 280,
      easing: "ease-out"
    }
  );
}


/* ========================================
   AGGIORNAMENTO DELLA PROSSIMITÀ
======================================== */

function updateRadar() {

  const intensity = proximity / 100;

  radarCore.style.background = "#F4A300";

  radarCore.style.boxShadow =
    `0 0 ${25 + proximity * 0.8}px #FF7A00`;

  radarRings.forEach((ring, index) => {

    ring.style.opacity = Math.max(
      0.2,
      0.7 + intensity * 0.3 - index * 0.18
    );

    ring.style.borderColor = "#F4A300";

    ring.style.borderWidth =
      `${1 + intensity * 2}px`;

  });

  if (proximity < 25) {

    statusText.textContent = "Ricerca attiva...";

  } else if (proximity < 50) {

    statusText.textContent = "Ti stai avvicinando";

  } else if (proximity < 75) {

    statusText.textContent = "Sempre più vicini";

  } else if (proximity < 100) {

    statusText.textContent = "Siete vicinissimi!";

  } else {

    completeSearch();

  }
}


/* ========================================
   BIP PROGRESSIVI
======================================== */

function beepLoop() {

  if (!active || completed) return;

  const intensity = proximity / 100;

  const interval = 1400 - intensity * 1220;

  const frequency = 650 + intensity * 250;

  const volume = 0.035 + intensity * 0.09;

  playTone(frequency, 0.12, volume);

  pulseRadar();

  beepTimer = setTimeout(beepLoop, interval);
}


/* ========================================
   INCONTRO RAGGIUNTO
======================================== */

function completeSearch() {

  if (!active || completed) return;

  completed = true;

  clearTimeout(beepTimer);
  stopAllSounds();

  statusText.textContent = "Vi siete trovati!";
  statusText.style.color = "#65D98B";

  radarCore.style.background = "#65D98B";

  radarCore.style.boxShadow =
    "0 0 85px #65D98B";

  radarRings.forEach((ring) => {

    ring.style.borderColor = "#65D98B";
    ring.style.opacity = "0.85";

  });

  slider.disabled = true;

  startButton.textContent = "Incontro raggiunto";

  // Firma sonora sperimentale Luply.

  playTone(660, 0.18, 0.08, 0);
  playTone(880, 0.18, 0.08, 0.15);
  playTone(1100, 0.35, 0.09, 0.30);

  pulseRadar();
}


/* ========================================
   AVVIO DELLA SIMULAZIONE
======================================== */

function startSimulation() {

  if (active) return;

  initializeAudio();

  active = true;
  completed = false;
  proximity = 0;

  slider.value = 0;
  slider.disabled = false;

  startButton.disabled = true;
  stopButton.disabled = false;

  startButton.textContent = "Simulazione attiva";

  statusText.style.color = "#FFFFFF";

  updateRadar();

  beepLoop();
}


/* ========================================
   INTERRUZIONE E RESET
======================================== */

function stopSimulation() {

  active = false;
  completed = false;
  proximity = 0;

  clearTimeout(beepTimer);
  stopAllSounds();

  if (pulseAnimation) {
    pulseAnimation.cancel();
  }

  slider.value = 0;
  slider.disabled = true;

  startButton.disabled = false;
  stopButton.disabled = true;

  startButton.textContent = "Avvia simulazione";

  statusText.textContent = "Ricerca non attiva";
  statusText.style.color = "#FFFFFF";

  radarCore.style.background = "#F4A300";

  radarCore.style.boxShadow =
    "0 0 35px #FF7A00";

  radarRings.forEach((ring) => {

    ring.style.borderColor = "";
    ring.style.borderWidth = "";
    ring.style.opacity = "";

  });
}


/* ========================================
   EVENTI
======================================== */

startButton.addEventListener(
  "click",
  startSimulation
);

stopButton.addEventListener(
  "click",
  stopSimulation
);

slider.addEventListener("input", () => {

  if (!active || completed) return;

  proximity = Number(slider.value);

  updateRadar();

});


/* Interrompe l'audio quando si cambia scheda. */

document.addEventListener("visibilitychange", () => {

  if (document.hidden && active) {
    stopSimulation();
  }

});

window.addEventListener("pagehide", stopSimulation);


/* Abilita il pulsante iniziale. */

startButton.disabled = false;


/* ========================================
   LUPLY POCKET — SCROLL ANIMATIONS
======================================== */

function initializeScrollAnimations() {

  // Rispetta le preferenze di accessibilità.

  if (reducedMotion.matches) return;

  if (!("IntersectionObserver" in window)) return;

  if (typeof Element.prototype.animate !== "function") return;

  // Seleziona gli elementi da animare.

  const animatedElements = document.querySelectorAll(`
    .manifesto h2,
    .manifesto p,
    .section-heading,
    .wide-image,
    .design-card,
    .lifestyle-grid img,
    .experience-card,
    .search-content,
    .search-section > img,
    .connection > img,
    .colors > h2,
    .colors > img,
    .color-options,
    .interest > h2,
    .faq-section > h2
  `);

  const scrollObserver = new IntersectionObserver(
    (entries) => {

      entries.forEach((entry) => {

        if (!entry.isIntersecting) return;

        if (!reducedMotion.matches) {

          entry.target.animate(
            [
              {
                opacity: 0.35,
                transform: "translateY(22px)"
              },
              {
                opacity: 1,
                transform: "translateY(0)"
              }
            ],
            {
              duration: 900,
              easing: "cubic-bezier(0.22, 1, 0.36, 1)"
            }
          );

        }

        // L'animazione viene eseguita una sola volta.

        scrollObserver.unobserve(entry.target);

      });

    },
    {
      threshold: 0.12
    }
  );

  animatedElements.forEach((element) => {

    scrollObserver.observe(element);

  });

}

initializeScrollAnimations();
