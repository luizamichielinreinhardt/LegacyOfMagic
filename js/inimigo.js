// inimigo chefe
const CORES_INIMIGO = {
    estudante: '#8e3b3b',
    aranha: '#2b2b2b',
    bruxo: '#3b1f4d',
    chefe: '#111111'
}

class Inimigo extends Obj {
    vel = 2
    tempoOnda = 0
    atordoado = 0 // tempo restante parado (Stupefy/Petrificus)

    constructor(x, y, tipo, vel) {
        const tam = tipo === 'chefe' ? { w: 120, h: 100 } : { w: 50, h: 42 }
        super(x, y, tam.w, tam.h, CORES_INIMIGO[tipo] || '#555')
        this.tipo = tipo // 'estudante' | 'aranha' | 'bruxo' | 'chefe'
        this.vel = vel
        this.vidaMax = tipo === 'chefe' ? 40 : 1
        this.vida = this.vidaMax
        this.tempoCooldownTiro = tipo === 'chefe' ? 0.9 : 2.2
        this.cooldownTiro = Math.random() * this.tempoCooldownTiro
        this.tempoOnda = Math.random() * Math.PI * 2
    }

    recomeca() {
        this.x = 1980
        this.y = Math.floor(Math.random() * (980 - 100) + 100)
    }

    mov_car() {
        if (this.atordoado > 0) {
            this.atordoado -= 1 / 60
            return
        }
        this.x -= this.vel
        this.tempoOnda += 2 / 60
        if (this.tipo !== 'estudante') this.y += Math.sin(this.tempoOnda) * (40 / 60)
        this.cooldownTiro -= 1 / 60
        if (this.x + this.w < -60) this.ativo = false
    }

    atordoar(segundos) {
        this.atordoado = Math.max(this.atordoado, segundos)
    }

    podeAtirar() {
        return this.atordoado <= 0 && this.cooldownTiro <= 0
    }

    registrarTiro() {
        this.cooldownTiro = this.tempoCooldownTiro
    }

    receberDano(dano = 1) {
        this.vida -= dano
        if (this.vida <= 0) this.ativo = false
    }

    des_quad(ctx) {
        desenharInimigoPixel(ctx || des, this)
    }
}