(function () {
  "use strict";

  const overlay = document.getElementById("pause-overlay");
  const btnPausar = document.getElementById("btn-pausar");
  const btnContinuar = document.getElementById("btn-continuar-pausa");
  if (!overlay) return;

  function abrir() {
    overlay.classList.add("ativa");
    if (typeof window.pausarJogo === "function") window.pausarJogo();
  }
  function fechar() {
    overlay.classList.remove("ativa");
    if (typeof window.retomarJogo === "function") window.retomarJogo();
  }

  if (btnPausar) btnPausar.addEventListener("click", abrir);
  if (btnContinuar) btnContinuar.addEventListener("click", fechar);

  document.addEventListener("keydown", (ev) => {
    if (ev.key !== "Escape") return;
    overlay.classList.contains("ativa") ? fechar() : abrir();
  });
})();