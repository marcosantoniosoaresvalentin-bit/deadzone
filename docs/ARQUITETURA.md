# Arquitetura do Deadzone

## Visão geral

O jogo é uma página web (`index.html`) que carrega, **em ordem**, scripts clássicos
(`<script src>`). Todos compartilham o mesmo escopo global: uma variável declarada em
`core/engine.js` (por exemplo `sc`, a cena) pode ser usada por qualquer arquivo carregado
depois. Por isso **a ordem no `index.html` importa**.

```
three.js → GLTFLoader → SkeletonUtils → graphics/realism.js → mqtt.js
→ núcleo do jogo (core → world → vehicles → player → combat → … → player/animations)
→ sistemas do lobby e telas (features/*)
```

O laço principal (`core/main-loop.js`) só começa depois que todos os arquivos foram
carregados (`DOMContentLoaded`).

## Ordem de carregamento

| # | Arquivo (`src/js/`) | Função |
|---|---|---|
| 1 | `graphics/realism.js` | Realismo: personagens 3D, vegetação, relevo, janelas quebráveis, ilha e iluminação. |
| 2 | `core/engine.js` | Renderizador, cena, câmera, luzes, céu e utilitários de geometria/colisão. |
| 3 | `world/map.js` | Mapa em branco: ilha plana (MAPH), mar, heliportos e dados vazios do mapa (CITIES, LK...). |
| 3b | `world/terrain.js` | Terreno: relevo, litoral, solos, mar; TERH (altura), TERG (grama), TERMAP (imagem do mapa). |
| 6 | `vehicles/cars.js` | Modelos e posicionamento dos carros. |
| 7 | `vehicles/helicopters.js` | Helicópteros: modelo, heliportos e física de voo. |
| 8 | `player/character.js` | Esqueleto procedural do personagem (base das animações). |
| 9 | `combat/weapons.js` | Modelos 3D das armas, atributos e IK das mãos. |
| 10 | `player/input.js` | Movimento, colisão, joystick, toque, teclado e estado global da partida. |
| 11 | `ui/hud.js` | HUD: slots de arma, mochila rápida, recarga e coleta de itens. |
| 12 | `core/audio.js` | Sons sintetizados e indicadores de direção. |
| 13 | `ui/minimap.js` | Minimapa, luzes internas e portas. |
| 14 | `bots/navigation.js` | Navegação dos bots e linha de visão (paredes, relevo, janelas). |
| 15 | `world/airplane-parachute.js` | Avião de lançamento, paraquedas e traçante. |
| 16 | `bots/bots.js` | Criação, animação e comportamento de saque dos bots. |
| 17 | `combat/loot.js` | Itens no chão (armas, kits, munição, equipamentos). |
| 18 | `game/match.js` | Início da partida e rótulos dos botões. |
| 19 | `ui/settings.js` | Configurações e editor de posição dos botões. |
| 20 | `ui/world-map.js` | Mapa grande com marcadores. |
| 21 | `ui/skins.js` | Roupas, paraquedas e pinturas de veículo. |
| 22 | `player/actions.js` | Salto do avião, paraquedas, pouso, pulo, agachar e deitar. |
| 23 | `combat/shooting.js` | Dano, tiros, explosões, granadas e ataque corpo a corpo. |
| 24 | `vehicles/driving.js` | Direção, entrada/saída e colisão de veículos. |
| 25 | `ui/backpack.js` | Inventário completo e acessórios das armas. |
| 26 | `game/zone.js` | Zona que fecha (círculo vermelho). |
| 27 | `combat/throwables.js` | Granada (cozinhar) e gel de gelo. |
| 28 | `network/rooms.js` | Conexão online (MQTT) e salas. |
| 29 | `ui/mode-select.js` | Seleção de modo e mapa. |
| 30 | `network/gladiator.js` | Modo Gladiador 1v1 online. |
| 31 | `core/main-loop.js` | Laço principal do jogo (atualização e câmera a cada quadro). |
| 32 | `network/matchmaking.js` | Pareamento, PVP, Contra Squad e Clássico online. |
| 33 | `combat/bow.js` | Arco e flecha. |
| 34 | `game/modes.js` | Mapa único, cidade aleatória, spawns e MVP. |
| 35 | `game/progression.js` | Progressão, armadura, kill feed, fumaça, espectador e qualidade gráfica. |
| 36 | `game/killfeed-spectator.js` | Abates em todos os modos, fumaça sincronizada e espectador. |
| 37 | `ui/lobby-scene.js` | Cenário 3D do lobby. |
| 38 | `combat/shotgun.js` | Espalhamento e dano da escopeta. |
| 39 | `fx/effects.js` | Partículas, poeira, explosões e pose de morte. |
| 40 | `player/animations.js` | Animações extras (arremesso, cura, itens na mão). |
| 41 | `features/account.js` | Conta local do jogador (cadastro/entrada). |
| 42 | `features/team.js` | Equipe e convites. |
| 43 | `features/lobby-social.js` | Amigos e convites no lobby. |
| 44 | `features/lobby-invite.js` | Botões de convite e ID do jogador. |
| 45 | `features/lobby-layout.js` | Ajustes de layout do lobby. |
| 46 | `features/map-menu.js` | Menu de mapa/modo e pareamento automático. |
| 47 | `features/mode-fix.js` | Correções de modo de jogo. |
| 48 | `features/matchmaking-fixes.js` | Correções do pareamento. |
| 49 | `features/lobby-team-confirm.js` | Confirmação de equipe no lobby. |
| 50 | `features/gladiators-duo-nametags.js` | Gladiadores em dupla e nomes dos aliados. |
| 51 | `features/lobby-menus.js` | Conquistas, ranking, missões e loja. |
| 52 | `features/autopair.js` | Opção de autopareamento. |
| 53 | `features/inventory-info.js` | Detalhes dos itens do inventário. |
| 54 | `features/outfit-slots.js` | Peças de roupa por parte do corpo. |
| 55 | `features/end-screen.js` | Tela de fim de partida. |
| 56 | `features/party-queue.js` | Fila de pareamento do grupo. |
| 57 | `features/loading-screen.js` | Tela de carregamento. |
| 58 | `features/victory-screen.js` | Tela de vitória. |
| 60 | `features/party.js` | Grupo (party) no lobby. |
| 61 | `features/lobby-split.js` | Divisão do painel social. |

## Sistemas principais

### Personagens (`graphics/realism.js`)
O jogo anima um **esqueleto procedural** invisível (quadril, tronco, cabeça, braços e pernas).
A cada quadro, o módulo de realismo copia essa pose para o esqueleto do modelo
`assets/models/soldier.glb`. Por cima disso:
- **Captura de movimento**: parado/andar/correr vêm das animações do modelo, com fase
  sincronizada à velocidade real (os pés não patinam). Com arma na mão, só as pernas usam o
  mocap e o tronco continua mirando.
- **IK de duas juntas** nas mãos, para segurar a arma exatamente onde ela está.
- **LOD**: longe da câmera volta para o modelo simples (30/50/70 m conforme a qualidade).

Para o jogo, basta definir `rig.loco = { w, sp, arm, fw }` (peso, velocidade, armado, direção).

### Relevo
`DZR.terrain()` gera uma grade de alturas de 12 m (ruído em várias escalas + montanhas nas
bordas), achatada perto de cidades, estradas, construções, lagos e heliportos por uma
transformada de distância. A função global `TERH(x, z)` devolve a altura com a **mesma
triangulação da malha do chão**, então tudo encosta exatamente no terreno. `GY()` (altura do
piso, incluindo telhados e a ilha) parte de `TERH`.

### Janelas quebráveis (`window.DZW`)
Cada prédio registra suas vidraças numa grade espacial de 32 m. `DZW.shoot()` testa o raio do
tiro contra as vidraças próximas, `DZW.blast()` quebra as que estão no raio de explosões.
Vidros quebrados abrem um "buraco" consultado por `blocked()` (linha de visão), então dá para
atirar e ver através deles.

### Online (`network/`)
Usa MQTT sobre WebSocket (`wss://broker.emqx.io`). Salas, pareamento e partidas trocam
mensagens JSON em tópicos `dz3d/v1/...`. O broker é público: serve para jogar com amigos,
mas não impede trapaça. O próximo passo para um online "de produção" é um servidor próprio
(autoritativo) que valide tiros, dano e loot.

## Build

`tools/build.mjs` (Node, sem dependências):
1. confere a sintaxe de todos os scripts;
2. `dist/web/`: cópia do site (GitHub Pages e APK);
3. `dist/Deadzone.html`: tudo embutido em um arquivo (modelos e texturas em base64);
4. `--android`: copia `dist/web` para `android/app/src/main/assets/www`.

O app Android é uma `WebView` em tela cheia que serve o jogo por
`https://appassets.androidplatform.net` (`WebViewAssetLoader`), um contexto seguro onde
login, armazenamento e online funcionam como no navegador.
