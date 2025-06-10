///////////////////////////////////////
//  #region Elementos del DOM
///////////////////////////////////////
const _inputLimite = document.getElementById("limite");
const _inputVolumen = document.getElementById("volumen");
const _form = document.querySelector("form");

///////////////////////////////////////
//  #region Events Listeners
///////////////////////////////////////

_inputLimite.addEventListener("input", () => {
  if (_inputLimite.value < 1) {
    _inputLimite.value = 1;
  }
});

_form.addEventListener("submit", async (e) => {
  e.preventDefault();
  await window.lolAPI.saveValue("limite", _inputLimite.value);
  await window.lolAPI.saveValue("volumen", _inputVolumen.value);
  await window.lolAPI.closeConfig();
});

////////////////////////////////////////
// #region Comunicación con el IPCMain
////////////////////////////////////////
const getValues = async () => {
  const limite = (await window.lolAPI.getValue("limite")) ?? 60;
  const volumen = (await window.lolAPI.getValue("volumen")) ?? 10;
  _inputLimite.value = limite;
  _inputVolumen.value = volumen;
};

getValues();
