const scenes = Array.from(document.querySelectorAll(".scene"));
const btnMute = document.getElementById("btnMute");
const btnReset = document.getElementById("btnReset");
const signalWord = document.getElementById("signalWord");

const sndStatic = document.getElementById("sndStatic");
const sndRumble = document.getElementById("sndRumble");
const sndBeep   = document.getElementById("sndBeep");

let soundOn = true;
let historyStack = ["start"];
let logUnlocked = false;

function getScene(name){
  return document.querySelector(`.scene[data-scene="${name}"]`);
}

function showScene(name){
  scenes.forEach(s => s.classList.remove("active"));
  const scene = getScene(name);
  if (!scene) return;

  scene.classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function safePlay(audioEl, volume = 0.7){
  if (!soundOn || !audioEl) return;
  audioEl.pause();
  audioEl.currentTime = 0;
  audioEl.volume = volume;
  audioEl.play().catch(() => {});
}

function go(next){
  historyStack.push(next);
  showScene(next);

  // Always give a little “signal feedback”
  safePlay(sndStatic, 0.55);

  // Add rumble on big moments
  if (next.includes("ending") || next === "tunnel" || next === "ghost") {
    safePlay(sndRumble, 0.35);
  }
}

function back(){
  if (historyStack.length <= 1) return;
  historyStack.pop();
  showScene(historyStack[historyStack.length - 1]);
  safePlay(sndBeep, 0.35);
}

// Click handling for navigation
document.addEventListener("click", (e) => {
  const nextBtn = e.target.closest("[data-next]");
  const backBtn = e.target.closest("[data-back]");

  if (nextBtn){
    const next = nextBtn.getAttribute("data-next");
    go(next);
  }

  if (backBtn){
    back();
  }
});

// Sound toggle
btnMute.addEventListener("click", () => {
  soundOn = !soundOn;
  btnMute.setAttribute("aria-pressed", String(!soundOn));
  btnMute.textContent = soundOn ? "Sound: ON" : "Sound: OFF";
  if (soundOn) safePlay(sndBeep, 0.35);
});

// Restart
btnReset.addEventListener("click", () => {
  historyStack = ["start"];
  showScene("start");
  safePlay(sndBeep, 0.4);
});

// Hover “signal” distortion
signalWord?.addEventListener("mouseenter", () => {
  document.body.classList.add("distort");
});
signalWord?.addEventListener("mouseleave", () => {
  document.body.classList.remove("distort");
});

// Inject distortion CSS
const style = document.createElement("style");
style.textContent = `
  body.distort .card {
    border-color: rgba(255, 59, 214, 0.35);
    box-shadow: 0 0 34px rgba(255, 59, 214, 0.10), 0 20px 60px rgba(0,0,0,0.55);
    transform: skewX(-0.2deg);
  }
  body.distort .bg-flicker {
    animation-duration: 2.6s;
    opacity: 0.75;
  }
  body.distort .glitch {
    filter: saturate(1.15) contrast(1.1);
  }
`;
document.head.appendChild(style);

// Scroll unlock (hidden log)
window.addEventListener("scroll", () => {
  if (logUnlocked) return;

  const nearBottom =
    window.innerHeight + window.scrollY >= document.body.offsetHeight - 60;

  if (nearBottom){
    logUnlocked = true;
    historyStack.push("log");
    showScene("log");
    safePlay(sndBeep, 0.45);
  }
});