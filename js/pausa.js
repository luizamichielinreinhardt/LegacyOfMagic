// pausa.js — mesmo overlay de pausa nas páginas jogo.html e duelo-jogo.html
(function () {
  "use strict";

  const overlay = document.getElementById("pause-overlay");
  const btnPausar = document.getElementById("btn-pausar");
  const btnContinuar = document.getElementById("btn-continuar-pausa");
  if (!overlay) return;

  function abrir() {
    overlay.classList.add("ativa");
    // HOOK: pausar o loop do jogo, se existir (window.pausarJogo)
    if (typeof window.pausarJogo === "function") window.pausarJogo();
  }
  function fechar() {
    overlay.classList.remove("ativa");
    // HOOK: retomar o loop do jogo, se existir (window.retomarJogo)
    if (typeof window.retomarJogo === "function") window.retomarJogo();
  }

  if (btnPausar) btnPausar.addEventListener("click", abrir);
  if (btnContinuar) btnContinuar.addEventListener("click", fechar);

  document.addEventListener("keydown", (ev) => {
    if (ev.key !== "Escape") return;
    overlay.classList.contains("ativa") ? fechar() : abrir();
  });
})();