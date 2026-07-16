class Obj {
    constructor(x, y, w, h, a) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.a = a;
        this.ativo = true;
    }
}

class Projetil extends Obj {
    constructor(x, y, dir, dono, cor, img) {
        super(x, y, 16, 16, cor);
        this.dir = dir;
        this.dono = dono;
        this.vel = 12;
        this.img = img;
    }
    mov() { this.x += this.vel * this.dir; }
    des(ctx) {
        if (this.img && this.img.complete) {
            const tam = this.w * 5;
            ctx.drawImage(this.img, this.x + this.w/2 - tam/2, this.y + this.h/2 - tam/2, tam, tam);
        } else {
            ctx.fillStyle = this.a;
            ctx.beginPath();
            ctx.arc(this.x + this.w/2, this.y + this.h/2, this.w/2, 0, Math.PI*2);
            ctx.fill();
        }
    }
}

const CORES_CASA = {
    grifinoria: { principal: '#740001' },
    sonserina: { principal: '#1a472a' },
    lufalufa: { principal: '#ecb939' }
};

const SPRITES_CASA = {
    grifinoria: {
        subindo: ['../img/sprite_subindo1_julia.png', '../img/sprite_subindo2_julia.png', '../img/sprite_subindo3_julia.png'],
        desc: ['../img/sprite_desc1_julia.png', '../img/sprite_desc2_julia.png', '../img/sprite_desc3_julia.png'],
        feit: ['../img/sprite_feit1_julia.png', '../img/sprite_feit2_julia.png'],
        sofre: ['../img/sprite_sofre1_julia.png', '../img/sprite_sofre2_julia.png']
    },
    sonserina: {
        subindo: ['../img/sprite_subindo1_luiza.png', '../img/sprite_subindo2_luiza.png', '../img/sprite_subindo3_luiza.png'],
        desc: ['../img/sprite_desc1_luiza.png', '../img/sprite_desc2_luiza.png', '../img/sprite_desc3_luiza.png'],
        feit: ['../img/sprite_feit_luiza.png'],
        sofre: ['../img/sprite_sofre1_luiza.png', '../img/sprite_sofre2_luiza.png']
    },
    lufalufa: {
        subindo: ['../img/sprite_subindo1_evelin.png', '../img/sprite_subindo2_evelin.png', '../img/sprite_subindo3_evelin.png'],
        desc: ['../img/sprite_desc1_evelin.png', '../img/sprite_desc2_evelin.png', '../img/sprite_desc3_evelin.png'],
        feit: ['../img/sprite_feit1_evelin.png', '../img/sprite_feit2_evelin.png'],
        sofre: ['../img/evelin_sofre1_evelin.png', '../img/evelin_sofre2_evelin.png']
    }
};

const SPRITES_VILAO = {
    voando: ['../img/vilaovoando1.png'],
    atirando: ['../img/vilaoatirando1.png'],
    derrotado: ['../img/vilaoderrotado1.png']
};

// Motor Principal 1 Player
(function () {
    "use strict";

    const params = new URLSearchParams(window.location.search);
    const casa = params.get("casa") || "grifinoria";
    const corCasa = CORES_CASA[casa]?.principal || '#ffffff';

    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    let jogoPausado = false;
    let vida = 5;
    let pontos = 0;
    let fase = 1;

    const jogador = { 
        x: 150, 
        y: 500, 
        w: 200, 
        h: 146, 
        cor: corCasa,
        imgs: {},
        imgCarregada: false,
        estadoAtual: 'subindo',
        frameAtual: 0,
        frameTick: 0,
        estadoTempTimer: 0
    };

    // Pré-carregamento da imagem do Jogador
    const animacoes = SPRITES_CASA[casa];
    if (animacoes) {
        let totalImgs = 0;
        let carregadas = 0;
        for (let estado in animacoes) {
            jogador.imgs[estado] = [];
            animacoes[estado].forEach(caminho => {
                totalImgs++;
                const imgObj = new Image();
                imgObj.src = caminho;
                imgObj.onload = () => {
                    carregadas++;
                    if (carregadas === totalImgs) jogador.imgCarregada = true;
                };
                jogador.imgs[estado].push(imgObj);
            });
        }
    }

    // Fundo de cada fase
    const FUNDOS_FASE = {
        1: '../imagens/img_quadribol.png',
        2: '../imagens/img_floresta.png',
        3: '../imagens/img_castelo.png'
    };
    const imgsFundo = {};
    for (let f in FUNDOS_FASE) {
        const imgFundo = new Image();
        imgFundo.src = FUNDOS_FASE[f];
        imgsFundo[f] = imgFundo;
    }

    let projeteis = [];

    const vidaMaxVilao = 15;
    const vilaoCentroY = canvas.height / 2 - 73;
    const vilao = {
        x: canvas.width - 320,
        y: vilaoCentroY,
        w: 200,
        h: 146,
        vida: vidaMaxVilao,
        cooldownTiro: 190,
        tempoOnda: 0,
        imgs: {},
        imgCarregada: false,
        estadoAtual: 'voando',
        estadoTempTimer: 0
    };
    let vitoriaEmAndamento = false;

    // Pré-carregamento da imagem do Vilão
    {
        let totalImgsVilao = 0;
        let carregadasVilao = 0;
        for (let estado in SPRITES_VILAO) {
            vilao.imgs[estado] = [];
            SPRITES_VILAO[estado].forEach(caminho => {
                totalImgsVilao++;
                const imgObj = new Image();
                imgObj.src = caminho;
                imgObj.onload = () => {
                    carregadasVilao++;
                    if (carregadasVilao === totalImgsVilao) vilao.imgCarregada = true;
                };
                vilao.imgs[estado].push(imgObj);
            });
        }
    }
    const imgTiroVilao = new Image();
    imgTiroVilao.src = '../img/tirovilao1.png';

    const teclas = {};
    window.addEventListener("keydown", (e) => {
        teclas[e.key.toLowerCase()] = true;
        if (e.key === " ") { 
            projeteis.push(new Projetil(jogador.x + jogador.w, jogador.y + jogador.h/2, 1, 'jogador', corCasa));
            jogador.estadoAtual = 'feit';
            jogador.estadoTempTimer = 15;
            jogador.frameAtual = 0;
            jogador.frameTick = 0;
        }
    });
    window.addEventListener("keyup", (e) => teclas[e.key.toLowerCase()] = false);

    function atualizarHUD() {
        document.getElementById("hud-vidas").textContent = "❤".repeat(vida);
        document.getElementById("hud-pontos").textContent = `${pontos} pts`;
        document.getElementById("hud-fase").textContent = `Fase ${fase}`;
    }

    function loop() {
        if (jogoPausado) {
            requestAnimationFrame(loop);
            return;
        }

        // Movimentação
        let novoEstado = 'subindo';
        const vel = 8;
        if (teclas["w"] && jogador.y > 50) { jogador.y -= vel; novoEstado = 'subindo'; }
        if (teclas["s"] && jogador.y < canvas.height - jogador.h - 50) { jogador.y += vel; novoEstado = 'desc'; }
        if (teclas["a"] && jogador.x > 50) jogador.x -= vel;
        if (teclas["d"] && jogador.x < canvas.width / 2) jogador.x += vel;

        // Movimento do vilão (percorre a tela toda na vertical, mais rápido a cada fase)
        const margemVilao = 85;
        const topoVilao = margemVilao;
        const baseVilao = canvas.height - vilao.h - margemVilao;
        vilao.tempoOnda += 0.01 + fase * 0.005;
        vilao.y = topoVilao + (baseVilao - topoVilao) * (0.5 + 0.5 * Math.sin(vilao.tempoOnda));

        // Tiro automático do vilão
        vilao.cooldownTiro--;
        if (vilao.cooldownTiro <= 0) {
            projeteis.push(new Projetil(vilao.x, vilao.y + vilao.h / 2, -1, 'vilao', '#ff3b3b', imgTiroVilao));
            vilao.cooldownTiro = 220 - fase * 30;
            vilao.estadoAtual = 'atirando';
            vilao.estadoTempTimer = 15;
        }

        // Voltar o vilão para o estado 'voando' depois do tiro
        if (vilao.estadoTempTimer > 0) {
            vilao.estadoTempTimer--;
        } else if (vilao.estadoAtual === 'atirando') {
            vilao.estadoAtual = 'voando';
        }

        // Mover Projéteis
        projeteis.forEach(p => p.mov());

        // Colisão dos projéteis do jogador com o vilão
        projeteis.forEach(proj => {
            if (proj.dono === 'jogador' &&
                proj.x < vilao.x + vilao.w && proj.x + proj.w > vilao.x &&
                proj.y < vilao.y + vilao.h && proj.y + proj.h > vilao.y) {
                proj.ativo = false;
                vilao.vida--;
                pontos += 100;

                if (vilao.vida <= 5) fase = 3;
                else if (vilao.vida <= 10) fase = 2;

                atualizarHUD();

                if (vilao.vida <= 0 && !vitoriaEmAndamento) {
                    vitoriaEmAndamento = true;
                    vilao.estadoAtual = 'derrotado';
                    setTimeout(() => {
                        window.location.href = `./vitoria.html?casa=${casa}&pontos=${pontos}`;
                    }, 600);
                }
            }

            // Colisão dos projéteis do vilão com o jogador
            if (proj.dono === 'vilao' &&
                proj.x < jogador.x + jogador.w && proj.x + proj.w > jogador.x &&
                proj.y < jogador.y + jogador.h && proj.y + proj.h > jogador.y) {
                proj.ativo = false;
                vida--;
                jogador.estadoAtual = 'sofre';
                jogador.estadoTempTimer = 30;
                jogador.frameAtual = 0;
                jogador.frameTick = 0;
                atualizarHUD();
                if (vida <= 0) {
                    window.location.href = `./derrota.html?casa=${casa}&pontos=${pontos}`;
                }
            }
        });

        projeteis = projeteis.filter(p => p.ativo && p.x > -20 && p.x < canvas.width + 20);

        // Atualizar Animação
        if (jogador.estadoTempTimer > 0) {
            jogador.estadoTempTimer--;
        } else {
            if (jogador.estadoAtual !== novoEstado) {
                jogador.estadoAtual = novoEstado;
                jogador.frameAtual = 0;
                jogador.frameTick = 0;
            }
        }

        jogador.frameTick++;
        if (jogador.frameTick >= 8) {
            jogador.frameTick = 0;
            jogador.frameAtual++;
        }
        
        let framesArray = jogador.imgs[jogador.estadoAtual] || jogador.imgs['subindo'];
        if (jogador.frameAtual >= framesArray?.length) {
            jogador.frameAtual = 0;
        }

        // Renderização
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Fundo da fase atual
        const fundoAtual = imgsFundo[fase];
        if (fundoAtual && fundoAtual.complete) {
            ctx.drawImage(fundoAtual, 0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "rgba(5, 6, 15, 0.35)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else {
            ctx.fillStyle = "#05060f";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Desenhar Jogador (Imagem ou Círculo)
        if (jogador.imgCarregada && framesArray && framesArray[jogador.frameAtual]) {
            let imgAtual = framesArray[jogador.frameAtual];
            let drawW = jogador.w;
            let drawH = jogador.h;
            let offsetX = 0;
            let offsetY = 0;

            // --- AJUSTE DE TAMANHO DOS SPRITES ---
            // Você pode alterar o número (ex: 1.75) para aumentar ou diminuir o sprite quando atira
            if (jogador.estadoAtual === 'feit') {
                const escalaFeit = 1.75; // ← Mude isso se quiser o tiro maior ou menor
                drawW = jogador.w * escalaFeit;
                drawH = jogador.h * escalaFeit;
                offsetX = -(drawW - jogador.w) / 2;
                offsetY = -(drawH - jogador.h) / 2;
            }

            ctx.drawImage(imgAtual, jogador.x + offsetX, jogador.y + offsetY, drawW, drawH);
        } else {
            ctx.fillStyle = jogador.cor;
            ctx.shadowBlur = 15;
            ctx.shadowColor = jogador.cor;
            ctx.beginPath();
            ctx.arc(jogador.x + jogador.w/2, jogador.y + jogador.h/2, jogador.w/2, 0, Math.PI * 2);
            ctx.fill();
        }

        // Desenhar Vilão
        if (vilao.imgCarregada) {
            const framesVilao = vilao.imgs[vilao.estadoAtual] || vilao.imgs['voando'];
            const escalaVilao = 2.2; // ← Mude isso se quiser o vilão maior ou menor
            const drawWVilao = vilao.w * escalaVilao;
            const drawHVilao = vilao.h * escalaVilao;
            const offsetXVilao = -(drawWVilao - vilao.w) / 2;
            const offsetYVilao = -(drawHVilao - vilao.h) / 2;

            ctx.save();
            ctx.translate(vilao.x + offsetXVilao + drawWVilao, vilao.y + offsetYVilao);
            ctx.scale(-1, 1); // inverte o sprite do vilão no eixo horizontal
            ctx.drawImage(framesVilao[0], 0, 0, drawWVilao, drawHVilao);
            ctx.restore();
        } else {
            ctx.fillStyle = "#3b1f4d";
            ctx.shadowBlur = 15;
            ctx.shadowColor = "#3b1f4d";
            ctx.fillRect(vilao.x, vilao.y, vilao.w, vilao.h);
            ctx.shadowBlur = 0;
        }

        // Barra de vida do vilão
        const barraW = 300;
        const barraX = canvas.width - barraW - 220;
        ctx.fillStyle = "#222";
        ctx.fillRect(barraX, 40, barraW, 18);
        ctx.fillStyle = "#ff3b3b";
        ctx.fillRect(barraX, 40, barraW * (vilao.vida / vidaMaxVilao), 18);

        // Desenhar Projéteis
        projeteis.forEach(p => p.des(ctx));
        ctx.shadowBlur = 0;

        requestAnimationFrame(loop);
    }

    window.pausarJogo = () => jogoPausado = true;
    window.retomarJogo = () => jogoPausado = false;

    loop();
})();