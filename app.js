// Checador iOS — lógica de cálculo
(function () {
  const entradaDisplay = document.getElementById('entradaDisplay');
  const salidaComerDisplay = document.getElementById('salidaComerDisplay');
  const regresoComerDisplay = document.getElementById('regresoComerDisplay');
  const salidaDisplay = document.getElementById('salidaDisplay');

  const entradaInput = document.getElementById('entradaInput');
  const salidaComerInput = document.getElementById('salidaComerInput');
  const regresoComerInput = document.getElementById('regresoComerInput');

  const horasTrabajadas = document.getElementById('horasTrabajadas');
  const lblTiempoComida = document.getElementById('lblTiempoComida');
  const tiempoComida = document.getElementById('tiempoComida');
  const ajusteEntrada = document.getElementById('ajusteEntrada');

  const MIN_ENTRADA_MIN = 8 * 60; // 8:00 a.m. en minutos
  const JORNADA_MIN = 9 * 60; // 9 horas de trabajo

  function pad(n) { return n.toString().padStart(2, '0'); }

  function format12(mins) {
    const minutesInDay = 24 * 60;
    let m = ((mins % minutesInDay) + minutesInDay) % minutesInDay;
    let h = Math.floor(m / 60);
    let mm = m % 60;
    const isPM = h >= 12;
    let h12 = h % 12; if (h12 === 0) h12 = 12;
    const suf = isPM ? 'p.m.' : 'a.m.';
    return `${h12}:${pad(mm)} ${suf}`;
  }

  function formatHM(totalMins) {
    const h = Math.floor(Math.abs(totalMins) / 60);
    const m = Math.abs(totalMins) % 60;
    return `${h}:${pad(m)} h`;
  }

  function toMinutes(valueHHMM) {
    if (!valueHHMM) return 0;
    const [hh, mm] = valueHHMM.split(':').map(Number);
    return (hh * 60) + mm;
  }

  function openPicker(inputEl) {
    try { inputEl.showPicker && inputEl.showPicker(); }
    catch { /* ignore */ }
    inputEl.click();
    inputEl.focus({ preventScroll: true });
  }

  function updateDisplays() {
    entradaDisplay.textContent = format12(toMinutes(entradaInput.value));
    salidaComerDisplay.textContent = format12(toMinutes(salidaComerInput.value));
    regresoComerDisplay.textContent = format12(toMinutes(regresoComerInput.value));
  }

  function calculate() {
    const entrada = toMinutes(entradaInput.value);
    const salidaComer = toMinutes(salidaComerInput.value);
    const regresoComer = toMinutes(regresoComerInput.value);

    const entradaAjustada = Math.max(entrada, MIN_ENTRADA_MIN);

    const durComida = Math.max(0, regresoComer - salidaComer);

    // Salida = entrada ajustada + 9:00 + tiempo de comida
    const salida = entradaAjustada + JORNADA_MIN + durComida;

    salidaDisplay.textContent = format12(salida);

    // Horas trabajadas (siempre 9:00 hrs)
    horasTrabajadas.textContent = formatHM(JORNADA_MIN);

    // Tiempo de comida
    const warn = durComida < 60; // menos de 1 hr
    tiempoComida.textContent = formatHM(durComida);
    tiempoComida.classList.toggle('warning', warn);
    lblTiempoComida.classList.toggle('warning', warn);

    // Mensaje de ajuste
    if (entrada < MIN_ENTRADA_MIN) {
      ajusteEntrada.textContent = 'Entrada ajustada a 8:00 a.m.';
    } else {
      ajusteEntrada.textContent = 'La hora de entrada no fue ajustada.';
    }
  }

  entradaDisplay.addEventListener('click', () => openPicker(entradaInput));
  salidaComerDisplay.addEventListener('click', () => openPicker(salidaComerInput));
  regresoComerDisplay.addEventListener('click', () => openPicker(regresoComerInput));

  [entradaInput, salidaComerInput, regresoComerInput].forEach(el => {
    el.addEventListener('input', () => { updateDisplays(); calculate(); });
    el.addEventListener('change', () => { updateDisplays(); calculate(); });
  });

  updateDisplays();
  calculate();

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    });
  }
})();
