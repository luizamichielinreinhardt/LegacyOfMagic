// Bruxo do Jogador
class Jogador extends Obj {
    // direção - setas
    dirX = 0
    dirY = 0

    vida = 3          
    pontos = 0  

    // controle da animação de voo (troca de frame da sprite-sheet [uma única img com vários frames])
    frame = 1
    tempo = 0

    // pra dar mais efeito visual
    _aniTick = 0
    _bounce = 0
    _lastDir = 0

    constructor(x, y, casa = 'grifinoria') {
        super(x, y, 90, 66, null) // tamanho do sprite
        this.casa = casa
        this.velocidade = 6.4 

        this.feiticoAtual = 'expelliarmus' // feitiço selecionado, troca com teclas 1-5
        this.cooldownTiro = 0    // tempo restante até poder atirar de novo
        this.invulneravel = 0    // tempo restante de invencibilidade após dano
        this.tempoTiroForte = 0  // tempo restante de power-up de tiro forte

        // se a casa tiver sprite-sheet cadastrada em CASA_IMG, usa imagem real;
        // senão usa a cor principal da casa (des_quad cai no retângulo colorido)
        this.a = CASA_IMG[casa] ? `./img/${CASA_IMG[casa]}1_bg.png` : CORES_CASA[casa].principal
    }

    // chamado a cada frame com o estado atual do teclado
    mov_car(input) {
        // converte as teclas pressionadas em direção (-1, 0, 1) por eixo
        this.dirX = (input.direita ? 1 : 0) - (input.esquerda ? 1 : 0)
        this.dirY = (input.baixo ? 1 : 0) - (input.cima ? 1 : 0)

        // controla a velocidade
        if (this.dirX !== 0 || this.dirY !== 0) {
            const tam = Math.hypot(this.dirX, this.dirY)
            this.x += (this.dirX / tam) * this.velocidade
            this.y += (this.dirY / tam) * this.velocidade
        }

        // trava o jogador dentro dos limites da tela
        if (this.y < 30) this.y = 30
        if (this.y > 1080 - this.h - 30) this.y = 1080 - this.h - 30
        if (this.x < 10) this.x = 10
        if (this.x > 1920 - this.w - 10) this.x = 1920 - this.w - 10

        // conta regressiva dos timers (cooldown de tiro, invencibilidade, tiro forte)
        if (this.cooldownTiro > 0) this.cooldownTiro -= 1 / 60
        if (this.invulneravel > 0) this.invulneravel -= 1 / 60
        if (this.tempoTiroForte > 0) this.tempoTiroForte -= 1 / 60

        // só anima se a casa tiver sprite-sheet própria
        if (CASA_IMG[this.casa]) this.anim(CASA_IMG[this.casa])
    }

   
    anim(nome) {
        this.tempo += 1
        if (this.tempo > 6) {
            this.tempo = 0
            this.frame += 1
        }
        if (this.frame > 3) this.frame = 1
        this.a = "./img/" + nome + this.frame + "_bg.png"
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

        if (CASA_IMG[this.casa]) {
            // tem sprite-sheet: desenha a imagem carregada
            const img = carregarImagem(this.a)
            c.drawImage(img, -this.w / 2, -this.h / 2, this.w, this.h)
        } else {
            // sem sprite: desenha um retângulo simples com a cor da casa
            c.fillStyle = this.a
            c.fillRect(-this.w / 2, -this.h / 2, this.w, this.h)
        }

        // desenha um pequeno brilho na ponta da varinha, na cor do feitiço atual
        c.fillStyle = CORES_FEITICO[this.feiticoAtual] || '#fff'
        c.fillRect(this.w / 2 - 6, -2, 16, 3)

        c.restore()
    }

    // checa colisão com outro objeto usando uma hitbox menor que o sprite
    // (margem mx/my), pra deixar a colisão mais "justa" e menos frustrante
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

        const def = SPELLS_JOGADOR[this.feiticoAtual] // pega os dados do feitiço atual
        const forte = this.tempoTiroForte > 0 // power-up ativo dobra o dano


        const p = new Projetil(this.x + this.w, this.y + this.h / 2 - 4, 1, 'jogador', def.cor)
        p.dano = def.dano * (forte ? 2 : 1)
        p.raioAoe = def.raioAoe || 0
        p.atordoa = def.atordoa || 0
        listaProjeteis.push(p)

        this.cooldownTiro = def.cooldown
        return forte ? 'forte' : true // avisa o Jogo.js se foi um tiro forte (pra tocar som diferente)
    }

    // procura nas SPELLS_JOGADOR qual feitiço está mapeado pra essa tecla e troca
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

    // aplica dano se o jogador não estiver invulnerável; retorna false se estava protegido
    receberDano(qtd = 1) {
        if (this.invulneravel > 0) return false
        this.vida -= qtd
        this.invulneravel = 1.4 // fica invencível por 1.4s após tomar dano
        return true
    }

    // recupera vida sem passar do maximo de vidas
    curar(qtd = 1) {
        this.vida = Math.min(this.vida + qtd, VIDA_MAX)
    }
}