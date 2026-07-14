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
    grifinoria: '/img/sprite_subindo1_julia.png',
    sonserina: '/img/sprite_subindo1_luiza.png',
    lufalufa: '/img/sprite_subindo1_evelin.png'
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
        w: 90, 
        h: 66, 
        cor: corCasa,
        img: null,
        imgCarregada: false
    };

    // Pré-carregamento da imagem do Jogador
    const caminhoSprite = SPRITES_CASA[casa];
    if (caminhoSprite) {
        const imgObj = new Image();
        imgObj.src = caminhoSprite;
        imgObj.onload = () => {
            jogador.img = imgObj;
            jogador.imgCarregada = true;
        };
        imgObj.onerror = () => {
            console.warn(`Imagem ${caminhoSprite} não encontrada. Usando modo de compatibilidade gráfico (bola).`);
        };
    }

    let projeteis = [];
    let inimigos = [];
    let spawnTimer = 0;

    const teclas = {};
    window.addEventListener("keydown", (e) => {
        teclas[e.key.toLowerCase()] = true;
        if (e.key === " ") { 
            projeteis.push(new Projetil(jogador.x + jogador.w, jogador.y + jogador.h/2, 1, 'jogador', corCasa));
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
        const vel = 8;
        if (teclas["w"] && jogador.y > 50) jogador.y -= vel;
        if (teclas["s"] && jogador.y < canvas.height - jogador.h - 50) jogador.y += vel;
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
                atualizarHUD();
                if (vida <= 0) {
                    window.location.href = `/html/derrota.html?casa=${casa}&pontos=${pontos}`;
                }
            }
        });

        inimigos = inimigos.filter(i => i.ativo && i.x > -50);

        // Renderização
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Fundo escuro
        ctx.fillStyle = "#05060f";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Desenhar Jogador (Imagem ou Círculo)
        if (jogador.imgCarregada && jogador.img) {
            ctx.drawImage(jogador.img, jogador.x, jogador.y, jogador.w, jogador.h);
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