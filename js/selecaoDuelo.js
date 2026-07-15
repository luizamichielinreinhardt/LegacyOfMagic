(function () {
  "use strict";

  const gradeP1 = document.getElementById("grade-casas-p1");
  const gradeP2 = document.getElementById("grade-casas-p2");
  const btnIniciar = document.getElementById("btn-iniciar-duelo");

  const estado = { p1: null, p2: null, highlightP1: 0, highlightP2: 0 };

  function marcarSelecionada(grade, casa) {
    grade.querySelectorAll(".casa-btn").forEach((b) => {
      b.classList.toggle("selecionada", b.dataset.casa === casa);
    });
  }

  function atualizarLinkIniciar() {
    if (estado.p1 && estado.p2) {
      // Corrigido de duelo-jogo.html para dueloJogo.html
      btnIniciar.href = `/html/dueloJogo.html?p1=${estado.p1}&p2=${estado.p2}`;
      btnIniciar.classList.remove("desabilitado");
    } else {
      btnIniciar.href = "#";
      btnIniciar.classList.add("desabilitado");
    }
  }

  gradeP1.querySelectorAll(".casa-btn").forEach((btn, i) => {
    btn.addEventListener("click", () => {
      estado.p1 = btn.dataset.casa;
      estado.highlightP1 = i;
      marcarSelecionada(gradeP1, estado.p1);
      atualizarLinkIniciar();
    });
  });

  gradeP2.querySelectorAll(".casa-btn").forEach((btn, i) => {
    btn.addEventListener("click", () => {
      estado.p2 = btn.dataset.casa;
      estado.highlightP2 = i;
      marcarSelecionada(gradeP2, estado.p2);
      atualizarLinkIniciar();
    });
  });

  // Atalhos de teclado
  document.addEventListener("keydown", (ev) => {
    const tecla = ev.key.toLowerCase();
    if (tecla === "w") mover(gradeP1, "highlightP1", -1);
    else if (tecla === "s") mover(gradeP1, "highlightP1", 1);
    else if (["1", "2", "3"].includes(tecla)) selecionar(gradeP1, Number(tecla) - 1);

    if (ev.key === "ArrowUp") mover(gradeP2, "highlightP2", -1);
    else if (ev.key === "ArrowDown") mover(gradeP2, "highlightP2", 1);
    else if (tecla === "j") selecionar(gradeP2, 0);
    else if (tecla === "k") selecionar(gradeP2, 1);
    else if (tecla === "l") selecionar(gradeP2, 2);
  });

  function mover(grade, chave, delta) {
    const botoes = grade.querySelectorAll(".casa-btn");
    estado[chave] = (estado[chave] + delta + botoes.length) % botoes.length;
    botoes.forEach((b) => b.classList.remove("foco-teclado"));
    botoes[estado[chave]].classList.add("foco-teclado");
    botoes[estado[chave]].focus();
  }

  function selecionar(grade, indice) {
    const botoes = grade.querySelectorAll(".casa-btn");
    if (botoes[indice]) botoes[indice].click();
  }
})();