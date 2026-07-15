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
    constructor(x, y, dir, dono, cor) {
        super(x, y, 16, 16, cor);
        this.dir = dir;
        this.vel = 12;
    }
    mov() { this.x += this.vel * this.dir; }
    des(ctx) {
        ctx.fillStyle = this.a;
        ctx.beginPath();
        ctx.arc(this.x + this.w/2, this.y + this.h/2, this.w/2, 0, Math.PI*2);
        ctx.fill();
    }
}

const CORES_CASA = {
    grifinoria: { principal: '#740001' },
    sonserina: { principal: '#1a472a' },
    lufalufa: { principal: '#ecb939' }
};

const SPRITES_CASA = {
    grifinoria: {
        subindo: ['/img/sprite_subindo1_julia.png', '/img/sprite_subindo2_julia.png', '/img/sprite_subindo3_julia.png'],
        desc: ['/img/sprite_desc1_julia.png', '/img/sprite_desc2_julia.png', '/img/sprite_desc3_julia.png'],
        feit: ['/img/sprite_feit1_julia.png', '/img/sprite_feit2_julia.png'],
        sofre: ['/img/sprite_sofre1_julia.png', '/img/sprite_sofre2_julia.png']
    },
    sonserina: {
        subindo: ['/img/sprite_subindo1_luiza.png', '/img/sprite_subindo2_luiza.png', '/img/sprite_subindo3_luiza.png'],
        desc: ['/img/sprite_desc1_luiza.png', '/img/sprite_desc2_luiza.png', '/img/sprite_desc3_luiza.png'],
        feit: ['/img/sprite_feit_luiza.png'],
        sofre: ['/img/sprite_sofre1_luiza.png', '/img/sprite_sofre2_luiza.png']
    },
    lufalufa: {
        subindo: ['/img/sprite_subindo1_evelin.png', '/img/sprite_subindo2_evelin.png', '/img/sprite_subindo3_evelin.png'],
        desc: ['/img/sprite_desc1_evelin.png', '/img/sprite_desc2_evelin.png', '/img/sprite_desc3_evelin.png'],
        feit: ['/img/sprite_feit1_evelin.png', '/img/sprite_feit2_evelin.png'],
        sofre: ['/img/evelin_sofre1_evelin.png', '/img/evelin_sofre2_evelin.png']
    }
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
    let vida = 3;
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

    let projeteis = [];
    let inimigos = [];
    let spawnTimer = 0;

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

        // Spawn de inimigos
        spawnTimer++;
        if (spawnTimer > 90) {
            spawnTimer = 0;
            inimigos.push({
                x: canvas.width + 50,
                y: Math.random() * (canvas.height - 200) + 100,
                w: 50, h: 50, vel: 5 + fase, ativo: true
            });
        }

        // Mover Projéteis
        projeteis = projeteis.filter(p => {
            p.mov();
            return p.x < canvas.width;
        });

        // Mover Inimigos
        inimigos.forEach(inimigo => {
            inimigo.x -= inimigo.vel;

            // Colisão do projétil com inimigo
            projeteis.forEach(proj => {
                if (proj.x < inimigo.x + inimigo.w && proj.x + proj.w > inimigo.x &&
                    proj.y < inimigo.y + inimigo.h && proj.y + proj.h > inimigo.y) {
                    inimigo.ativo = false;
                    pontos += 100;
                    atualizarHUD();

                    if (pontos >= 1000) {
                        window.location.href = `/html/vitoria.html?casa=${casa}&pontos=${pontos}`;
                    }
                }
            });

            // Colisão do inimigo com jogador
            if (inimigo.x < jogador.x + jogador.w && inimigo.x + inimigo.w > jogador.x &&
                inimigo.y < jogador.y + jogador.h && inimigo.y + inimigo.h > jogador.y) {
                inimigo.ativo = false;
                vida--;
                jogador.estadoAtual = 'sofre';
                jogador.estadoTempTimer = 30;
                jogador.frameAtual = 0;
                jogador.frameTick = 0;
                atualizarHUD();
                if (vida <= 0) {
                    window.location.href = `/html/derrota.html?casa=${casa}&pontos=${pontos}`;
                }
            }
        });

        inimigos = inimigos.filter(i => i.ativo && i.x > -50);

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

        // Fundo escuro
        ctx.fillStyle = "#05060f";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

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

        // Desenhar Inimigos
        ctx.fillStyle = "#8e3b3b";
        ctx.shadowColor = "#8e3b3b";
        inimigos.forEach(i => {
            ctx.fillRect(i.x, i.y, i.w, i.h);
        });

        // Desenhar Projéteis
        projeteis.forEach(p => p.des(ctx));
        ctx.shadowBlur = 0;

        requestAnimationFrame(loop);
    }

    window.pausarJogo = () => jogoPausado = true;
    window.retomarJogo = () => jogoPausado = false;

    loop();
})();