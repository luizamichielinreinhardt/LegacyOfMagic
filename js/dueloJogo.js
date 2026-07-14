// duelo-jogo.js — placeholder da engine do modo duelo
// TODO: implementar window.iniciarDuelo(casaP1, casaP2) e redirecionar
// para fim-duelo.html?vencedor=...&p1=...&p2=... ao fim da partida
(function () {
  "use strict";

  const NOME_CASA = {
    grifinoria: "Grifinória",
    sonserina: "Sonserina",
    corvinal: "Corvinal",
    lufalufa: "Lufa-Lufa",
  };

  const params = new URLSearchParams(window.location.search);
  const p1 = params.get("p1") || "grifinoria";
  const p2 = params.get("p2") || "sonserina";

  document.getElementById("duelo-nome-p1").textContent = `P1 · ${NOME_CASA[p1] || p1}`;
  document.getElementById("duelo-nome-p2").textContent = `P2 · ${NOME_CASA[p2] || p2}`;

  const canvas = document.getElementById("canvas-duelo");
  const ctx = canvas.getContext("2d");

  function desenharPlaceholder() {
    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = "#05060f";
    ctx.fillRect(0, 0, w, h);

    ctx.textAlign = "center";
    ctx.fillStyle = "#ecdfba";
    ctx.font = "600 42px Cinzel, serif";
    ctx.fillText("Motor de duelo ainda não conectado", w / 2, h / 2 - 30);

    ctx.fillStyle = "#b9ad8c";
    ctx.font = "28px 'EB Garamond', serif";
    ctx.fillText(`${NOME_CASA[p1] || p1}  vs  ${NOME_CASA[p2] || p2}`, w / 2, h / 2 + 20);
    ctx.fillText("Use os botões abaixo só para testar a navegação", w / 2, h / 2 + 60);
  }
  desenharPlaceholder();

  // botões temporários pra testar o fluxo de fim de duelo
  const testeDiv = document.createElement("div");
  testeDiv.style.cssText = "position:absolute;bottom:5rem;left:50%;transform:translateX(-50%);display:flex;gap:0.8rem;z-index:2";
  testeDiv.innerHTML = `
    <a class="botao botao--principal" href="fim-duelo.html?vencedor=${encodeURIComponent(NOME_CASA[p1] || p1)}&p1=${p1}&p2=${p2}">P1 vence</a>
    <a class="botao botao--fantasma" href="fim-duelo.html?vencedor=${encodeURIComponent(NOME_CASA[p2] || p2)}&p1=${p1}&p2=${p2}" style="margin-top:0">P2 vence</a>
  `;
  document.querySelector(".pagina-jogo").appendChild(testeDiv);
})();