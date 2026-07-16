# ⚡ Legacy of Magic

Um jogo de ação e sobrevivência inspirado no universo de Harry Potter, desenvolvido com **HTML5 Canvas, CSS e JavaScript puro** (sem bibliotecas externas).

O treinamento dos bruxos começou. Forças das trevas desafiam os estudantes em batalhas mágicas pelos céus de Hogwarts. Sobreviva às fases e proteja a escola — ou desafie um amigo em um duelo direto!

## 🎮 Modos de jogo

### Individual (1 Jogador)
Escolha sua casa em Hogwarts e sobreviva às fases de ataque das forças das trevas, derrotando o chefe de cada fase para proteger o castelo.

### Duelo (2 Jogadores)
Enfrente um amigo no mesmo teclado. Escolha uma casa para cada jogador e reduza a vida do oponente a zero antes que o tempo acabe.

## 🏠 Casas disponíveis

| Casa | Personagem |
|---|---|
| 🦁 Grifinória | Julia |
| 🐍 Sonserina | Luiza |
| 🦡 Lufa-Lufa | Evelin |

## 🎹 Controles

**Jogador 1**
| Tecla | Ação |
|---|---|
| `W A S D` | Mover |
| `Espaço` | Atirar (modo Individual) |
| `1` | Stupefy (Duelo) |
| `2` | Protego — Escudo (Duelo) |
| `3` | Bombarda — Especial (Duelo) |

**Jogador 2 (Duelo)**
| Tecla | Ação |
|---|---|
| `↑ ↓ ← →` | Mover |
| `J` | Stupefy |
| `K` | Protego — Escudo |
| `L` | Bombarda — Especial |

**Geral**
| Tecla | Ação |
|---|---|
| `Esc` | Pausar / Continuar / Voltar ao Menu |

## 🪄 Feitiços

- **Stupefy** — feitiço básico de ataque à distância, sem custo de energia.
- **Protego** — escudo temporário que bloqueia os próximos ataques recebidos.
- **Bombarda** — feitiço especial de alto impacto (disponível no modo Duelo).

## 📂 Estrutura do projeto

```
LegacyOfMagic/
├── index.html          # Menu principal
├── html/                # Demais telas (jogo, duelo, manual, sobre, vitória/derrota...)
├── css/
│   └── style.css
├── img/                 # Sprites e artes usadas pelo jogo
└── js/
    ├── jogo.js           # Motor do modo Individual
    ├── inimigo.js         # Lógica dos inimigos
    ├── dueloJogo.js       # Motor do modo Duelo
    ├── selecaoDuelo.js    # Tela de escolha de casas no Duelo
    ├── jogador.js          # Tela de escolha de casa no modo Individual
    └── pausa.js            # Lógica do menu de pausa
```

## ▶️ Como jogar

Como o jogo usa apenas HTML, CSS e JavaScript puro, basta abrir o arquivo `index.html` em um navegador — ou servir a pasta com um servidor local simples, por exemplo:

```bash
# Python
python3 -m http.server 8000

# ou com a extensão Live Server do VS Code
```

Depois acesse `http://localhost:8000` no navegador.

## 👩‍💻 Equipe de desenvolvimento

Projeto desenvolvido por três alunas do curso Técnico em Desenvolvimento de Sistemas do SESI/SENAI:

- **Evelin Piva** — representante da Lufa-Lufa, responsável pela estruturação dos feitiços e da lógica que move o jogo.
- **Luíza Michielin** — Scrum Master, responsável por organizar o fluxo de trabalho da equipe com metodologias ágeis, em parceria com o Product Owner, Professor Carlos.
- **Julia Monteiro** — desenvolvedora Front-end, responsável pela estilização em CSS: layout, cores, animações e identidade visual da interface.

## 🛠️ Tecnologias

- HTML5 (Canvas)
- CSS3
- JavaScript git add README.md