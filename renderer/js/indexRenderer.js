///////////////////////////////////////
//  #region Variables globales
///////////////////////////////////////
let startTime = null;
let timeInterval = null;
let soundVineBoom = new Audio("sounds/vine_boom.mp3");
let soundHonk = new Audio("sounds/honk.mp3");
let volumen = 1;
let currentStatus = "idle";

///////////////////////////////////////
//  #region Elementos del DOM
///////////////////////////////////////

const _container = document.getElementById("container");
const _title = document.getElementById("title");
const _timer = document.getElementById("timer");
const _image = document.getElementById("image");
const _message = document.getElementById("message");

const _minimizeButton = document.getElementById("minimize");
const _closeButton = document.getElementById("close");
const _configButton = document.getElementById("button-config");

///////////////////////////////////////
//  #region Events Listeners
///////////////////////////////////////

_minimizeButton.addEventListener("click", async () => {
  await window.lolAPI.minimize();
});

_closeButton.addEventListener("click", async () => {
  await window.lolAPI.close();
});

_configButton.addEventListener("click", async () => {
  await window.lolAPI.openConfig();
});

///////////////////////////////////////
//  #region Funciones de control
///////////////////////////////////////

const updateState = (state) => {
  if (state === "idle" && currentStatus != "idle") {
    currentStatus = "idle";
    _image.src = "sprites/teemo_01.png";
    _container.classList.remove("bg-red");
    _container.classList.remove("bg-orange");
    _container.classList.add("bg-blue");
    _title.innerText = "Lol cerrado";
    _message.innerText =
      "¡Buen trabajo, invocador! Hoy no has tocado la Grieta";
  }
  if (state === "playing" && currentStatus != "playing") {
    currentStatus = "playing";
    soundVineBoom.volume = volumen;
    soundVineBoom.play();
    _image.src = "sprites/teemo_02.png";
    _container.classList.remove("bg-red");
    _container.classList.remove("bg-blue");
    _container.classList.add("bg-orange");
    _message.innerText = "Hmm... ya abriste el LoL otra vez";
  }
  if (state === "exceeded" && currentStatus != "exceeded") {
    currentStatus = "exceeded";
    soundHonk.volume = volumen;
    soundHonk.play();
    _image.src = "sprites/teemo_03.png";
    _container.classList.remove("bg-blue");
    _container.classList.remove("bg-orange");
    _container.classList.add("bg-red");
    _message.innerText = "¡Mucho lol! ¡Cierralo! ";
  }
};

////////////////////////////////////////
// #region Comunicación con el IPCMain
////////////////////////////////////////

window.lolAPI.onLolStarted((event, timeStamp) => {
  startTime = timeStamp;

  if (timeInterval) clearInterval(timeInterval);

  updateState("playing");

  timeInterval = setInterval(() => {
    const now = Date.now();
    const diff = now - startTime;
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    _title.innerText = `Jugando lol ${minutes < 10 ? "0" + minutes : minutes}:${
      seconds < 10 ? "0" + seconds : seconds
    }`;
  }, 1000);
});

window.lolAPI.onLolStopped((event) => {
  startTime = null;
  clearInterval(timeInterval);
  timeInterval = null;

  updateState("idle");
});

window.lolAPI.onLolExceeded((event) => {
  updateState("exceeded");
});

window.lolAPI.onGetVolume((event, newVolumen) => {
  volumen = newVolumen != null ? newVolumen / 10 : 1;
  console.log("el volumen es " + volumen);
});
