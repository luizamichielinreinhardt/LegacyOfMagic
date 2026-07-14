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
    constructor(x, y, dir, dono, cor, feitiço) {
        super(x, y, 16, 16, cor);
        this.dir = dir; // 1 = Direita, -1 = Esquerda
        this.dono = dono; 
        this.vel = feitiço.vel || 12;
        this.dano = feitiço.dano;
        this.atordoa = feitiço.atordoa || 0;
        this.nome = feitiço.nome;
    }

    mov() {
        this.x += this.vel * this.dir;
    }

    des(ctx) {
        ctx.fillStyle = this.a;
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.a;
        ctx.beginPath();
        ctx.arc(this.x + this.w / 2, this.y + this.h / 2, this.w / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0; 
    }
}

// Configuração dos feitiços
const FEITICOS = {
    1: { nome: "Stupefy", cor: "#ff4a4a", dano: 10, cooldown: 30, vel: 14, atordoa: 0.5 },
    2: { nome: "Protego", cor: "#4ade80", dano: 0, cooldown: 60, escudo: true },
    3: { nome: "Bombarda", cor: "#fb923c", dano: 25, cooldown: 100, vel: 8 }
};

const CORES_CASA = {
    grifinoria: '#740001',
    sonserina: '#1a472a',
    lufalufa: '#ecb939',
    corvinal: '#0e1a40'
};

const SPRITES_CASA = {
    grifinoria: '/img/sprite_subindo1_julia.png',
    sonserina: '/img/sprite_subindo1_luiza.png',
    lufalufa: '/img/sprite_subindo1_evelin.png'
};

// Motor Principal do Duelo
(function () {
    "use strict";

    const params = new URLSearchParams(window.location.search);
    const p1Casa = params.get("p1") || "grifinoria";
    const p2Casa = params.get("p2") || "sonserina";

    const NOME_CASA = { grifinoria: "Grifinória", sonserina: "Sonserina", lufalufa: "Lufa-Lufa", corvinal: "Corvinal" };

    document.getElementById("duelo-nome-p1").textContent = `P1 · ${NOME_CASA[p1Casa]}`;
    document.getElementById("duelo-nome-p2").textContent = `P2 · ${NOME_CASA[p2Casa]}`;

    const canvas = document.getElementById("canvas-duelo");
    const ctx = canvas.getContext("2d");

    // Jogadores
    const p1 = {
        x: 150, y: 500, w: 90, h: 66, casa: p1Casa, cor: CORES_CASA[p1Casa],
        vida: 100, energia: 100, atordoado: 0, escudo: 0, cd: { 1: 0, 2: 0, 3: 0 },
        img: null, imgCarregada: false
    };

    const p2 = {
        x: 1680, y: 500, w: 90, h: 66, casa: p2Casa, cor: CORES_CASA[p2Casa],
        vida: 100, energia: 100, atordoado: 0, escudo: 0, cd: { 1: 0, 2: 0, 3: 0 },
        img: null, imgCarregada: false
    };

    // Carregamento de imagem P1
    if (SPRITES_CASA[p1.casa]) {
        const imgP1 = new Image();
        imgP1.src = SPRITES_CASA[p1.casa];
        imgP1.onload = () => {
            p1.img = imgP1;
            p1.imgCarregada = true;
        };
    }

    // Carregamento de imagem P2
    if (SPRITES_CASA[p2.casa]) {
        const imgP2 = new Image();
        imgP2.src = SPRITES_CASA[p2.casa];
        imgP2.onload = () => {
            p2.img = imgP2;
            p2.imgCarregada = true;
        };
    }

    let projeteis = [];
    let tempoRestante = 60;
    let jogoPausado = false;

    const teclas = {};
    window.addEventListener("keydown", (e) => {
        teclas[e.key.toLowerCase()] = true;
        if (["1", "2", "3"].includes(e.key)) conjurarFeitico(p1, e.key, 1, 'p1');

        if (e.key.toLowerCase() === "j") conjurarFeitico(p2, "1", -1, 'p2');
        if (e.key.toLowerCase() === "k") conjurarFeitico(p2, "2", -1, 'p2');
        if (e.key.toLowerCase() === "l") conjurarFeitico(p2, "3", -1, 'p2');
    });
    window.addEventListener("keyup", (e) => teclas[e.key.toLowerCase()] = false);

    const timerInterval = setInterval(() => {
        if (!jogoPausado) {
            tempoRestante--;
            document.getElementById("duelo-timer").textContent = tempoRestante;
            if (tempoRestante <= 0) finalizarDuelo();
        }
    }, 1000);

    function conjurarFeitico(atleta, slot, dir, dono) {
        if (atleta.atordoado > 0 || atleta.vida <= 0 || jogoPausado) return;
        if (atleta.cd[slot] > 0) return; 

        const spell = FEITICOS[slot];

        if (spell.escudo) {
            atleta.escudo = 120; 
        } else {
            const spawnX = dir === 1 ? atleta.x + atleta.w : atleta.x - 20;
            projeteis.push(new Projetil(spawnX, atleta.y + atleta.h / 2 - 8, dir, dono, spell.cor, spell));
        }

        atleta.cd[slot] = spell.cooldown;
    }

    function atualizarHUD() {
        document.getElementById("duelo-vida-p1").style.width = `${Math.max(0, p1.vida)}%`;
        document.getElementById("duelo-vida-p2").style.width = `${Math.max(0, p2.vida)}%`;
        document.getElementById("duelo-energia-p1").style.width = `${p1.energia}%`;
        document.getElementById("duelo-energia-p2").style.width = `${p2.energia}%`;
    }

    function finalizarDuelo(vencedorForcado) {
        clearInterval(timerInterval);
        let vencedor = "Empate";
        if (vencedorForcado) {
            vencedor = vencedorForcado;
        } else if (p1.vida > p2.vida) {
            vencedor = NOME_CASA[p1.casa];
        } else if (p2.vida > p1.vida) {
            vencedor = NOME_CASA[p2.casa];
        }
        window.location.href = `/html/fimDuelo.html?vencedor=${encodeURIComponent(vencedor)}&p1=${p1.casa}&p2=${p2.casa}`;
    }

    function loop() {
        if (jogoPausado) {
            requestAnimationFrame(loop);
            return;
        }

        const vel = 8;
        // Movimento P1 (W, S, A, D)
        if (p1.atordoado <= 0) {
            if (teclas["w"] && p1.y > 100) p1.y -= vel;
            if (teclas["s"] && p1.y < canvas.height - p1.h - 100) p1.y += vel;
            if (teclas["a"] && p1.x > 50) p1.x -= vel;
            if (teclas["d"] && p1.x < 800) p1.x += vel;
        } else { p1.atordoado--; }

        // Movimento P2 (Setas)
        if (p2.atordoado <= 0) {
            if (teclas["arrowup"] && p2.y > 100) p2.y -= vel;
            if (teclas["arrowdown"] && p2.y < canvas.height - p2.h - 100) p2.y += vel;
            if (teclas["arrowleft"] && p2.x > 1000) p2.x -= vel;
            if (teclas["arrowright"] && p2.x < canvas.width - p2.w - 50) p2.x += vel;
        } else { p2.atordoado--; }

        [p1, p2].forEach(p => {
            if (p.escudo > 0) p.escudo--;
            for (let k in p.cd) { if (p.cd[k] > 0) p.cd[k]--; }
        });

        projeteis = projeteis.filter(p => {
            p.mov();
            const alvo = p.dono === 'p1' ? p2 : p1;

            if (p.x < alvo.x + alvo.w && p.x + p.w > alvo.x &&
                p.y < alvo.y + alvo.h && p.y + p.h > alvo.y) {
                
                if (alvo.escudo <= 0) {
                    alvo.vida -= p.dano;
                    if (p.atordoa > 0) alvo.atordoado = p.atordoa * 60;
                }
                atualizarHUD();

                if (p1.vida <= 0) finalizarDuelo(NOME_CASA[p2.casa]);
                if (p2.vida <= 0) finalizarDuelo(NOME_CASA[p1.casa]);

                return false;
            }
            return p.x > 0 && p.x < canvas.width;
        });

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Fundo estrelado
        ctx.fillStyle = "#05060f";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Desenhar Jogadores
        [p1, p2].forEach(p => {
            ctx.save();
            ctx.fillStyle = p.cor;
            ctx.shadowBlur = p.escudo > 0 ? 30 : 10;
            ctx.shadowColor = p.escudo > 0 ? "#4ade80" : p.cor;

            if (p.imgCarregada && p.img) {
                // Se for o Player 2, espelha a imagem para ele olhar para a esquerda
                if (p === p2) {
                    ctx.translate(p.x + p.w, p.y);
                    ctx.scale(-1, 1);
                    ctx.drawImage(p.img, 0, 0, p.w, p.h);
                } else {
                    ctx.drawImage(p.img, p.x, p.y, p.w, p.h);
                }
            } else {
                ctx.beginPath();
                ctx.arc(p.x + p.w/2, p.y + p.h/2, p.w/2, 0, Math.PI * 2);
                ctx.fill();
            }

            // Aura de Atordoado
            if (p.atordoado > 0) {
                ctx.strokeStyle = "#ecdfba";
                ctx.lineWidth = 4;
                ctx.stroke();
            }

            // Escudo Ativo
            if (p.escudo > 0) {
                ctx.strokeStyle = "#4ade80";
                ctx.lineWidth = 6;
                ctx.beginPath();
                ctx.arc(p.x + p.w/2, p.y + p.h/2, p.w/2 + 15, 0, Math.PI * 2);
                ctx.stroke();
            }

            ctx.restore();
        });

        projeteis.forEach(p => p.des(ctx));

        requestAnimationFrame(loop);
    }

    window.pausarJogo = () => jogoPausado = true;
    window.retomarJogo = () => jogoPausado = false;

    loop();
})();