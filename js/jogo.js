// jogo.js — placeholder da engine do modo individual.
// Quando a engine real existir, basta implementar aqui window.iniciarJogoIndividual(casa)
// e chamar telasApp-like navegação (window.location) para vitoria.html / derrota.html.
(function () {
  "use strict";

  const NOME_CASA = {
    grifinoria: "Grifinória",
    sonserina: "Sonserina",
    corvinal: "Corvinal",
    lufalufa: "Lufa-Lufa",
  };

  const params = new URLSearchParams(window.location.search);
  const casa = params.get("casa") || "grifinoria";

  document.getElementById("hud-fase").textContent = `Fase 1 · ${NOME_CASA[casa] || casa}`;

  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  function desenharPlaceholder() {
    const largura = canvas.width;
    const altura = canvas.height;
    ctx.fillStyle = "#05060f";
    ctx.fillRect(0, 0, largura, altura);

    ctx.fillStyle = "#ecdfba";
    ctx.textAlign = "center";
    ctx.font = "600 42px Cinzel, serif";
    ctx.fillText("Motor do jogo ainda não conectado", largura / 2, altura / 2 - 30);

    ctx.font = "28px 'EB Garamond', serif";
    ctx.fillStyle = "#b9ad8c";
    ctx.fillText(`Casa selecionada: ${NOME_CASA[casa] || casa}`, largura / 2, altura / 2 + 20);
    ctx.fillText("Use os botões abaixo só para testar a navegação", largura / 2, altura / 2 + 60);
  }
  desenharPlaceholder();
  window.addEventListener("resize", () => {
    // canvas mantém resolução interna fixa (1920x1080), CSS cuida do redimensionamento
  });

  // Botões de teste temporários para validar o fluxo vitória/derrota
  // (remova quando a engine real existir e chamar a navegação sozinha)
  const testeDiv = document.createElement("div");
  testeDiv.style.position = "absolute";
  testeDiv.style.bottom = "1.5rem";
  testeDiv.style.left = "50%";
  testeDiv.style.transform = "translateX(-50%)";
  testeDiv.style.display = "flex";
  testeDiv.style.gap = "0.8rem";
  testeDiv.style.zIndex = "2";
  testeDiv.innerHTML = `
    <a class="botao botao--principal" href="vitoria.html?casa=${casa}&pontos=1000">Testar Vitória</a>
    <a class="botao botao--fantasma" href="derrota.html?casa=${casa}&pontos=250" style="margin-top:0">Testar Derrota</a>
  `;
  document.querySelector(".pagina-jogo").appendChild(testeDiv);
})();