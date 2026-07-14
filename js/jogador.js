// ─── Bruxo do Jogador (equivalente ao "Carro" do template) ──────────────────

// mapeia cada casa pro personagem correspondente (nome usado nos arquivos)
const PERSONAGEM_CASA = {
    grifinoria: 'julia',
    sonserina: 'luiza',
    lufalufa: 'evelin',
    // corvinal ainda não tem sprite -> cai no retângulo colorido (des_quad)
}

// tabela de sprites por casa. Montada na mão (não por template de nome)
// porque os arquivos não seguem um padrão 100% consistente entre personagens
// (ex: Evelin usa "evelin_sofreN_evelin.png", Luiza só tem 1 frame de feitiço)
const SPRITES_JOGADOR = {
    grifinoria: {
        subindo: ['sprite_subindo1_julia.png', 'sprite_subindo2_julia.png', 'sprite_subindo3_julia.png'],
        desc: ['sprite_desc1_julia.png', 'sprite_desc2_julia.png', 'sprite_desc3_julia.png'],
        feit: ['sprite_feit1_julia.png', 'sprite_feit2_julia.png'],
        sofre: ['sprite_sofre1_julia.png', 'sprite_sofre2_julia.png'],
        derrot: 'sprite_derrot_julia.png',
        vitoria: 'sprite_vitoria_julia.png',
    },
    sonserina: {
        subindo: ['sprite_subindo1_luiza.png', 'sprite_subindo2_luiza.png', 'sprite_subindo3_luiza.png'],
        desc: ['sprite_desc1_luiza.png', 'sprite_desc2_luiza.png', 'sprite_desc3_luiza.png'],
        feit: ['sprite_feit_luiza.png'], // só existe 1 frame pra essa personagem
        sofre: ['sprite_sofre1_luiza.png', 'sprite_sofre2_luiza.png'],
        derrot: 'sprite_derrot_luiza.png',
        vitoria: 'sprite_vitoria_luiza.png',
    },
    lufalufa: {
        subindo: ['sprite_subindo1_evelin.png', 'sprite_subindo2_evelin.png', 'sprite_subindo3_evelin.png'],
        desc: ['sprite_desc1_evelin.png', 'sprite_desc2_evelin.png', 'sprite_desc3_evelin.png'],
        feit: ['sprite_feit1_evelin.png', 'sprite_feit2_evelin.png'],
        sofre: ['evelin_sofre1_evelin.png', 'evelin_sofre2_evelin.png'], // nome de arquivo foge do padrão
        derrot: 'sprite_derrot_evelin.png',
        vitoria: 'sprite_vitoria_evelin.png',
    },
}

class Jogador extends Obj {
    dirX = 0
    dirY = 0
    vida = 3
    pontos = 0

    // controle da animação principal (voando pra cima/baixo)
    frame = 0
    tempo = 0

    // estado temporário (feitiço ou dano), que sobrepõe a animação de voo por um tempo
    estadoTemp = null      // 'feit' | 'sofre' | null
    frameTemp = 0
    tempoEstadoTemp = 0

    // efeito visual de balanço ao trocar de direção
    _aniTick = 0
    _bounce = 0
    _lastDir = 0

    constructor(x, y, casa = 'grifinoria') {
        super(x, y, 90, 66, null)
        this.casa = casa
        this.personagem = PERSONAGEM_CASA[casa] || null
        this.sprites = SPRITES_JOGADOR[casa] || null

        this.velocidade = 6.4 // px por frame (~60fps)
        this.feiticoAtual = 'expelliarmus' // troca com as teclas 1 a 5
        this.cooldownTiro = 0
        this.invulneravel = 0
        this.tempoTiroForte = 0

        // se a casa tiver sprites cadastrados, começa com o 1º frame de "subindo"
        // (default combinado: quando reto/parado, usa subindo1)
        this.a = this.sprites
            ? "./img/" + this.sprites.subindo[0]
            : CORES_CASA[casa].principal
    }

    mov_car(input) {
        this.dirX = (input.direita ? 1 : 0) - (input.esquerda ? 1 : 0)
        this.dirY = (input.baixo ? 1 : 0) - (input.cima ? 1 : 0)

        if (this.dirX !== 0 || this.dirY !== 0) {
            const tam = Math.hypot(this.dirX, this.dirY)
            this.x += (this.dirX / tam) * this.velocidade
            this.y += (this.dirY / tam) * this.velocidade
        }

        if (this.y < 30) this.y = 30
        if (this.y > 1080 - this.h - 30) this.y = 1080 - this.h - 30
        if (this.x < 10) this.x = 10
        if (this.x > 1920 - this.w - 10) this.x = 1920 - this.w - 10

        if (this.cooldownTiro > 0) this.cooldownTiro -= 1 / 60
        if (this.invulneravel > 0) this.invulneravel -= 1 / 60
        if (this.tempoTiroForte > 0) this.tempoTiroForte -= 1 / 60

        // conta regressiva do estado temporário (feitiço/dano); ao zerar, volta pro voo normal
        if (this.tempoEstadoTemp > 0) {
            this.tempoEstadoTemp -= 1 / 60
            if (this.tempoEstadoTemp <= 0) this.estadoTemp = null
        }

        if (this.sprites) this.anim()
    }

    // decide qual conjunto de sprites usar e cicla os frames
    anim() {
        this.tempo += 1
        if (this.tempo <= 6) return
        this.tempo = 0

        if (this.estadoTemp) {
            // animação de feitiço ou dano tem prioridade sobre a de voo
            const frames = this.sprites[this.estadoTemp]
            this.frameTemp = (this.frameTemp + 1) % frames.length
            this.a = "./img/" + frames[this.frameTemp]
            return
        }

        // voo normal: sobe se dirY < 0, desce se dirY > 0, ou repete "subindo1" se parado
        const estado = this.dirY < 0 ? 'subindo' : this.dirY > 0 ? 'desc' : null
        const frames = estado ? this.sprites[estado] : [this.sprites.subindo[0]]

        this.frame = (this.frame + 1) % frames.length
        this.a = "./img/" + frames[this.frame]
    }

    des_carro(ctx) {
        const c = ctx || des

        if (this.invulneravel > 0 && Math.floor(this.invulneravel * 10) % 2 === 0) return

        this._aniTick++
        if (this._lastDir !== this.dirY) {
            this._bounce = 5
            this._lastDir = this.dirY
        }
        if (this._bounce > 0) this._bounce -= 0.8
        const bounceY = this._bounce * Math.sin(this._aniTick * 0.5)
        const tilt = this.dirY !== 0 ? (this.dirY > 0 ? 0.06 : -0.06) : 0

        const cx = this.x + this.w / 2
        const cy = this.y + this.h / 2
        c.save()
        c.translate(cx, cy + bounceY)
        c.rotate(tilt)

        if (this.sprites) {
            const img = carregarImagem(this.a)
            c.drawImage(img, -this.w / 2, -this.h / 2, this.w, this.h)
        } else {
            c.fillStyle = this.a
            c.fillRect(-this.w / 2, -this.h / 2, this.w, this.h)
        }

        c.fillStyle = CORES_FEITICO[this.feiticoAtual] || '#fff'
        c.fillRect(this.w / 2 - 6, -2, 16, 3)

        c.restore()
    }

    colid(objeto) {
        const mx = 16
        const my = 10
        return (
            this.x + mx < objeto.x + objeto.w - mx &&
            this.x + this.w - mx > objeto.x + mx &&
            this.y + my < objeto.y + objeto.h - my &&
            this.y + this.h - my > objeto.y + my
        )
    }

    point(objeto) {
        return objeto.x + objeto.w <= -20
    }

    podeAtirar() {
        return this.cooldownTiro <= 0
    }

    atirar(listaProjeteis) {
        if (!this.podeAtirar()) return false
        const def = SPELLS_JOGADOR[this.feiticoAtual]
        const forte = this.tempoTiroForte > 0
        const p = new Projetil(this.x + this.w, this.y + this.h / 2 - 4, 1, 'jogador', def.cor)
        p.dano = def.dano * (forte ? 2 : 1)
        p.raioAoe = def.raioAoe || 0
        p.atordoa = def.atordoa || 0
        listaProjeteis.push(p)
        this.cooldownTiro = def.cooldown

        // dispara a animação de "lançar feitiço" por um instante
        if (this.sprites) {
            this.estadoTemp = 'feit'
            this.frameTemp = -1 // começa em -1 pra já mostrar o frame 0 no próximo anim()
            this.tempoEstadoTemp = 0.25
        }

        return forte ? 'forte' : true
    }

    trocarFeitico(tecla) {
        for (const nome in SPELLS_JOGADOR) {
            if (SPELLS_JOGADOR[nome].tecla === tecla) {
                this.feiticoAtual = nome
                return
            }
        }
    }

    ativarTiroForte(segundos) {
        this.tempoTiroForte = segundos
    }

    receberDano(qtd = 1) {
        if (this.invulneravel > 0) return false
        this.vida -= qtd
        this.invulneravel = 1.4

        // dispara a animação de "sofrendo dano" por um instante
        if (this.sprites) {
            this.estadoTemp = 'sofre'
            this.frameTemp = -1
            this.tempoEstadoTemp = 0.4
        }

        return true
    }

    curar(qtd = 1) {
        this.vida = Math.min(this.vida + qtd, VIDA_MAX)
    }
}