# Histórico de versões

## 3.10.2 — todas as construções com porta e interior
- **Todas as construções da cidade dá para entrar** (26 prédios): as construções baixadas da internet
  que eram só "casca" (sem porta, e o personagem ficava preso em volta delas) foram removidas.
- **Estilos novos, feitos pelo jogo**: reboco colorido, **tijolo aparente**, **concreto**
  e **loja** (vitrine grande no térreo, toldo colorido e letreiro), com cornijas entre os andares.
  Por dentro as paredes são de reboco claro.
- **Animação de pular muro/janela refeita**: o personagem **apoia as mãos em cima** do obstáculo,
  inclina o corpo, passa de lado com as pernas encolhidas e desce do outro lado.
- **Portas dos andares de cima**: o botão de porta pegava a porta de outro andar (bem em cima ou
  embaixo); agora só usa as portas do andar onde o personagem está.
- **Terraço**: a proteção do buraco da escada era uma parede invisível de um lado e uma chapa
  escura do outro; agora é **grade de metal** dos dois lados.
- **Buggies** que nasciam dentro das casas ou na frente das portas foram tirados; ficam 3
  estacionados nas ruas.

## 3.10.1 — pular obstáculos com animação e ajustes da cidade
- **Pular janela e mureta com animação**: perto de um obstáculo baixo (janela, mureta, parapeito,
  sofá), o botão de pulo faz o personagem **apoiar as mãos, encolher as pernas e passar por cima**;
  na janela o vidro **quebra com barulho**. O pulo normal ficou mais baixo (~0,6 m) e não passa
  mais por cima de muro nem de janela.
- Muretas um pouco mais altas (1,1 m).
- Asfalto: as faixas (borda branca e tracejado amarelo) **param antes das esquinas**; faixas de
  pedestre nos cruzamentos; tiradas as pontas de rua que saíam da cidade para a grama.
- Carros destruídos removidos.
- Portas: folha ocupa o vão inteiro (sem fresta), **porta de madeira com almofadas** e maçaneta.
- Janelas sem a grade do meio; as **paredes internas não caem mais em cima das janelas**.
- **Grade de metal com corrimão inclinado** em todas as escadas.

## 3.10.0 — cidade "Porto Velho"
- **Cidade nova** no norte da ilha (~210 x 130 m): ruas de **asfalto** com faixa tracejada e
  cruzamentos, **calçadas** com meio-fio, **postes de luz**, 7 quarteirões e um quarteirão com o
  **heliponto**.
- **Lotes variados**: prédios com interior de 1 a 4 andares (terraço, telhado de telha ou
  varandas, cores diferentes), construções de modelo pronto (prédio de tijolo, torre, loja de
  conveniência, sobrado, escritório, casa, delegacia) e praças de concreto.
- **Muretas** de tijolo/concreto (0,9 m) em volta dos lotes e nas praças: **dá para pular por cima**
  e usar de cobertura. **Carros destruídos** nas ruas como cobertura.
- **Móveis** dentro dos prédios (sofá, mesa, cama, escrivaninha, cadeira).
- Prédios: a porta da frente ficava "subida" com parede embaixo (uma janela caía em cima dela) —
  corrigido; batentes em todas as portas (sem fresta em cima); **portas internas** com folha.
- **Pular pela janela**: o personagem passa pelo vão e **o vidro quebra**.
- **Paraquedas ao pular de lugar alto** (terraço/prédio): o botão de pulo vira "Abrir" durante a queda.

## 3.9.1 — mais construções e câmera dentro dos prédios
- Vila com **6 construções com interior**: 2 prédios (3 e 4 andares), sobrados com
  **telhado de telha** e casas/prédio com **varandas** (dá para sair nelas pelo andar).
- **Câmera dentro das construções**: não atravessa mais o teto (não dá para ver o andar de
  cima), não entra nos degraus da escada e não sai pelas paredes; na escada ela se aproxima
  do personagem.

## 3.9.0 — prédios com interior (dá para entrar em todos os andares)
- As casas antigas (só tinham o lado de fora) saíram. No lugar, **3 construções com interior
  completo**, feitas por código: um **prédio de 3 andares + terraço** e **2 sobrados**.
- **Todos os andares acessíveis**: escada em "vai e volta" no fundo do prédio, patamares,
  guarda-corpo e buraco na laje; dá para subir até o **terraço** com mureta.
- Porta de entrada que abre, **portas internas**, cômodos separados, janelas de vidro que
  **quebram com tiro**, rodapé e luz em cada andar.
- Paredes e lajes com colisão **por andar** (a parede de cima não bloqueia quem está embaixo);
  o personagem desce escadas sem "pular".
- APK mais leve: os modelos baixados das casas antigas foram removidos.

## 3.8.1 — construções estilo battle royale
- A casa de madeira saiu. No lugar, uma **vilinha** no campo ao norte da ilha:
  2 **casas de tijolo** ("Countryside brick house", CC-BY 4.0) e um **prédio abandonado de
  concreto com pichação** ("Old Building | Lowpoly", CC-BY 4.0).
- Modelos escalados para o tamanho real e alinhados automaticamente; paredes sólidas em toda a
  altura (bloqueiam passagem e tiros).

## 3.8.0 — primeira construção
- **Casa de madeira** ("Old house", modelo pronto CC-BY 4.0) no campo ao norte da ilha
  (texturas reduzidas: 105 MB → 1,6 MB). Terreno nivelado embaixo dela.
- **Porta de verdade**: a folha da porta é recortada do modelo e gira na dobradiça
  (abre/fecha com o botão de porta).
- **Paredes sólidas**: a colisão é gerada "escaneando" o modelo na altura das pernas; janelas e
  porta aberta deixam passar. Vale para as próximas construções.
- **Piso de madeira** por dentro; grama não nasce dentro; câmera não atravessa as paredes.

## 3.7.7
- **Personagem não sai mais do carro quando ele cai de lado**: o ajuste da altura do quadril era
  feito "para baixo no mundo"; com o carro de lado isso empurrava o personagem pela lateral.
  Agora é feito no espaço do carro, e ele fica no banco em qualquer inclinação.
- **Sem dano ao cair nas rodas**: raspar o para-choque ao pousar não conta mais como batida;
  só bater de lado ou de teto (inclinado mais de 45°) com força causa dano.

## 3.7.6
- **Personagem fixo no banco**: ao entrar no carro, zera agachar/deitar (antes, quem entrava
  agachado ou deitado continuava com o corpo inclinado/deitado atravessando o carro) e corta na
  hora a mistura com as animações de andar/parado (que levantavam quadril e pernas para fora).
- **Qualidade melhor**: mais resolução (Baixa 0,9 · Média 1,3 · Alta 1,6), suavização de bordas
  de volta na Média; a resolução automática só reduz abaixo de ~30 fps e no máximo até 75%.

## 3.7.5
- **Personagem não "sai" mais do carro bugado**: se o jogador morre dentro do veículo (batida
  forte, carro explodindo), o corpo é colocado ao lado do carro antes da animação de morte;
  com o carro explodindo, o motorista é jogado para fora.
- **Menos travamento**:
  - qualidade padrão **Média no celular** (Alta continua no PC e para quem escolheu Alta);
  - suavização de bordas (MSAA) só na qualidade Alta;
  - **resolução automática**: se o jogo cair abaixo de ~40 fps, a resolução baixa aos poucos
    (até 60%) e volta a subir quando sobra desempenho;
  - grama ao redor recalculada com menos frequência e em raio menor na Média.
- Corrigida a imagem de fundo da tela de fim de partida (caminho errado no APK).

## 3.7.4
- **Tela de carregamento** desde o primeiro instante: não aparece mais o lobby antigo nem os
  botões antigos com texto enquanto o jogo carrega.
- **Desempenho (menos travamento)**:
  - interior dos carros montado em 3 peças em vez de ~14, e só desenhado de perto (40 m);
  - peças das rodas de mesmo material juntas;
  - carros só fazem sombra até 80 m (antes, todos os buggies do mapa faziam sombra);
  - peças pequenas dos buggies (faróis, molas, antena) somem a mais de 60 m.

## 3.7.3
- **Rodas da frente retas e girando certo**: no modelo do buggy as rodas dianteiras vinham
  esterçadas e inclinadas. Agora o eixo real de cada pneu é calculado pela forma dele e a roda
  é endireitada; ela gira em volta do próprio eixo, sem balançar.
- Só giram as peças redondas (pneu, aro, cubo); a manga/suspensão acompanha a direção sem girar.

## 3.7.2
- **Pneu gira e vira junto com a roda** (antes só o aro de dentro girava/virava; o pneu ficava
  preso na carroceria).
- **Corrigido o erro "Cannot read properties of undefined (reading 'n')"** ao entrar numa
  partida: o online sorteava uma entre 5 cidades, mas o mapa novo tem só um ponto de referência.

## 3.7.1
- **Rodas do buggy certas**: antes giravam pedaços do chassi. Agora o modelo é dividido em
  peças soltas e as rodas são achadas pela forma (pneus redondos encostando no chão); pneu, aro
  e cubo giram juntos no eixo de verdade, e as rodas da frente viram quando você esterça.
- **Analógico só esterça**: acelerar, frear e ré são só pelos pedais (no PC: W/S ou setas e espaço).
- Física com as medidas reais do buggy (bitola mais larga e entre-eixos certo).

## 3.7.0
- **Rodas girando**: as rodas do buggy (pneu, aro e cubo) foram separadas da carroceria e
  giram conforme a velocidade (distância / raio); no ar continuam girando e vão perdendo giro.
  As rodas da frente viram para o lado quando você esterça.
- **Só o buggy**: sedã, SUV e picape removidos do jogo (modelos apagados). Todos os carros do
  mapa e do lobby agora são buggies. O buggy aparece sempre com o modelo 3D real (sem a versão
  simplificada de longe).

## 3.6.0 — física de verdade nos carros
- **Física nova (corpo rígido)**: 4 rodas com suspensão (mola + amortecedor medindo a
  velocidade em relação ao chão) e 8 quinas da carroceria que batem no chão; gravidade,
  inércia e força da curva. Nada puxa o carro de volta: passou do ponto, ele tomba.
  - Não quica mais nos morrinhos (a 60 km/h não sai do chão).
  - Não "salta" mais ao entrar no carro (nasce apoiado no relevo).
  - Salta de verdade no topo dos morros, voa com o bico acompanhando a queda e aterrissa nas rodas.
  - Capota de lado/de teto; capotado e parado por 3 s, desvira sozinho.
  - Pousar nas rodas não dá dano; só a carroceria batendo forte.
- **Interior nos carros**: bancos com encosto e apoio de cabeça, banco de trás, painel, console,
  assoalho e volante. O lado de dentro da lataria agora aparece pelo vidro.
- **Personagem sentado no lugar certo** (banco medido em cada modelo) e **mãos presas no aro
  do volante**, que gira de verdade nas curvas.

## 3.5.0
- **Botões novos, só com ícone** (sem texto e sem cor): vidro escuro, borda clara e anel com
  quatro marcas (identidade Deadzone). Todos os botões do personagem trocados por ícones
  (atirar/socar/lançar, mirar, recarregar, pular, agachar, deitar, mochila, granada, gel,
  fumaça, porta, entrar/sair do carro, abastecer, saltar do avião, abrir paraquedas, subir/descer).
  Armas vazias na barra viram silhuetas de fuzil e pistola.
- **Pedais do carro**: acelerar, frear e ré. Andando para frente, a ré freia até quase parar e
  então começa a andar para trás. No PC, espaço = freio.
- **Câmera livre 360°** nos veículos: arrastar a tela gira a câmera em volta do carro/helicóptero;
  sem tocar por 2,5 s e andando, ela volta devagar para trás do veículo.
- **Física de capotar**: o carro é uma caixa que tomba de verdade (fica de lado ou de teto) e
  inclina nas curvas rápidas. Capotado e parado por 3 s, ele se desvira sozinho.
  Sem tração de lado/de teto.
- **Pousar em pé depois de um salto não dá mais dano** (só pancada forte de lado ou de teto).
- **Mar em volta da ilha sem o "quadrado"** visto do avião (fundo do mar segue o litoral).
- **Paraquedas inclina bem menos** ao mergulhar, e o personagem **puxa as cordas** do lado
  da curva (braço desce, tronco inclina).

## 3.4.1
- **Dá para ver a ilha de dentro do avião**: a neblina do chão (que voltava ao sair do lobby)
  escondia tudo lá de cima; agora no ar a neblina fica sempre longe. A parede da zona também
  quase some quando a câmera está no alto.
- **Hélices do avião certas**: giram retas, no eixo de cada motor (antes giravam em volta do
  centro da "caixa" da peça e ficavam tortas e fora do lugar).
- Fundo do mar escurece com a profundidade (sem o "quadrado" claro em volta da ilha visto do alto).

## 3.4.0
- **Carros saltam**: agora têm velocidade vertical e gravidade. Em alta velocidade no topo de
  um morro o carro decola, voa (direção quase sem efeito no ar), inclina o bico conforme a queda
  e aterrissa com tranco na suspensão (queda muito forte causa dano).
- **Sem viatura de polícia e sem táxi** (modelos removidos do jogo).
- **Vidros de volta em todos os veículos**, só que claros e transparentes (dá para ver o motorista).
- **Posição sentada refeita**: quadril no banco, costas um pouco para trás, pernas dobradas.
- **Mãos no volante com animação**: as mãos seguram o volante e giram junto com ele para os lados
  nas curvas; a cabeça acompanha a curva. No helicóptero, mãos no manche e no coletivo.
- Paraquedas: se o visual novo não funcionar no aparelho, o jogo volta sozinho para o modelo simples.

## 3.3.0 — personagem dentro dos veículos
- **O personagem aparece dentro do veículo**, sentado no banco do motorista, com as mãos
  no volante (que gira um pouco nas curvas). Banco ajustado em cada modelo: sedã, SUV, picape,
  táxi, viatura, buggy e helicóptero.
- **Carros sem vidro**, para ver quem está dentro (inclusive a picape, cujo vidro era pintado
  na textura).
- **Helicóptero com vidro da cabine claro e transparente**, para ver o piloto.

## 3.2.0 — paraquedas novo
- **Paraquedas retangular** (velame tipo asa, com linhas de verdade) no lugar da cúpula redonda.
  Modelo pronto: parapente da SwissAirfields (CC0), usando só o velame e as linhas.
- **Movimento realista e flexível**: abre amassado e infla com um tranco; o tecido ondula
  com o vento (mais no bordo de fuga); nas curvas o velame inclina e o lado de dentro abaixa
  (freio); a inclinação e a direção seguem o jogador com mola, com leve balanço.
- As cores seguem a skin de paraquedas escolhida na loja.
- A câmera se afasta um pouco com o paraquedas aberto para mostrar o velame inteiro.

## 3.1.2
- **Céu novo e mais realista**: degradê do horizonte ao azul do alto, brilho do sol e nuvens
  macias que andam devagar, com sombra embaixo e borda iluminada.
  Corrige as nuvens "em degraus" (o céu era cortado pelo limite de visão da câmera).
- **Heliponto**: o "H" não aparece mais através da montanha.
- **Bots desativados** (não removidos): `BOTS_ON` em `src/js/game/match.js`. Vale para os bots
  da partida e para os companheiros de equipe. Para religar, troque para `true`.

## 3.1.1
- **Zona nova**: parede azul transparente (dá para ver através), mais forte perto do chão,
  com faixas subindo devagar; some com a distância, sem os "pedaços cortados" de antes.
- **Minimapa mais perto**: mostra ~140 m em volta do jogador (antes ~300 m).
- **Mapa grande em tela cheia**, com a ilha ocupando toda a altura da tela, grade de 100 m
  e imagem do terreno em resolução maior.

## 3.1.0 — terreno
- **Relevo de verdade na ilha** (`src/js/world/terrain.js`): montanha rochosa a noroeste,
  morros, colinas suaves e um vale raso atravessando a ilha.
- **Litoral irregular** com baías e pontas, praia de areia, areia molhada e espuma na beira,
  água rasa na borda e mar fundo depois.
- **Solos misturados**: grama, manchas de terra, rocha nas encostas íngremes e areia na praia.
  A grama alta só nasce onde há grama.
- Heliportos em áreas planas; carros e helicópteros apoiados no relevo.
- Minimapa e mapa grande mostram o terreno de verdade (relevo sombreado, praia e mar).
- O jogador não entra no mar fundo (só na água rasa).

## 3.0.1
- Helicóptero: some o disco escuro em cima das hélices (efeito antigo de "hélice girando"
  que ficava como uma mancha com o modelo 3D novo).

## 3.0.0 — mapa em branco
- Parte da 2.1.2 (a 2.2.0 foi descartada).
- **Mapa original removido**: cidades, casas, estradas, relevo, árvores, lagos e a ilha flutuante.
- **Mapa novo, pequeno e vazio**: ilha plana de 500 x 500 m cercada de mar (`src/js/world/map.js`),
  base para construir tudo do zero.
- Nada de armas ou itens no chão (o código de armas continua no projeto).
- Carros e helicópteros mantidos (dois heliportos na ilha).
- **Avião de lançamento novo**: modelo 3D pronto de um C-130 (CC-BY 4.0), com hélices girando.
- Zona, rota do avião, minimapa e mapa grande ajustados ao tamanho novo.

## 2.1.2
- APK **release** (não é mais de depuração) assinado com os esquemas v1 + v2 + v3:
  corrige o erro "pacote inválido" em celulares Xiaomi.
- Chave de assinatura fixa, criada e guardada no cache do GitHub (fora do código).

## 2.1.1
- O GitHub Actions reaproveita a mesma chave de assinatura entre as compilações:
  as próximas versões do APK instalam por cima (evita o erro "pacote inválido").

## 2.1.0
- **Veículos com modelos 3D realistas** (não mais feitos por código): sedã, SUV, picape,
  táxi, viatura de polícia e buggy off-road, sorteados pelo mapa; helicóptero de ataque
  com rotor principal e de cauda girando. Modelos otimizados (4 MB no total) e trocados
  pelo modelo leve quando estão longe da câmera.
- O avião de lançamento continua o modelo próprio (não há modelo de avião de transporte
  com licença livre disponível).

## 2.0.0
- **Personagem humano realista** (rosto, barba, cabelo, pele) no lugar do soldado de armadura,
  com animações de captura de movimento traduzidas para o novo esqueleto.
- **15 skins** com estampas de tecido (camuflados woodland, deserto, urbano, digital, tigre,
  flecktarn, neve, liso, jeans...) na camisa, calça e sapatos. Aliados usam a sua skin;
  bots têm roupas, tons de pele e barba variados.
- **Equipamentos visíveis no corpo**: capacete, colete e mochila aparecem quando equipados.
- **Armas recriadas do zero**: fuzil estilo M4, rifle de precisão com bipé, espingarda de bomba,
  pistola; lunetas holográfica, 2x e 8x; silenciador.
- **Itens novos**: colete, capacete, mochilas, kit médico, bandagem, caixa de munição, granadas,
  galão, faca, acessórios.
- **Muito mais loot** (cerca de 4x): mais pontos por construção, arma sempre com munição perto.
- **Veículos novos**: carro com carroceria de verdade e rodas de liga, helicóptero com fuselagem
  arredondada, avião metálico com janelas.
- **Câmera estilo PUBG**: mais perto, sobre o ombro, sem atravessar paredes.
- **Rastejar corrigido** (sem "nadar" nem bater as pernas).
- **Estabilidade**: um erro nunca congela a tela; analógico não fica preso ao tocar no painel
  de loot; erros aparecem discretamente na tela.

## 1.1.0
- Antisserrilhado (bordas suaves) nas qualidades Média e Alta.
- Vento: grama, folhas e pinheiros balançam.
- Clarão do tiro iluminando os arredores (jogador e bots).
- Impacto das balas: poeira no chão, lascas e faíscas nas paredes, sangue nos inimigos.
- Bots viram suavemente e reagem quando levam tiro.
- O tronco do jogador acompanha a mira para cima e para baixo.
- Sombras cobrindo uma área maior na qualidade Alta.

## 1.0.0
- Projeto organizado: código dividido por sistemas (`src/js/*`), estilos (`src/css/*`),
  modelos e texturas em `assets/`, build sem dependências e app Android.
- Personagens 3D realistas com captura de movimento e IK nas mãos.
- Mapa com relevo (morros e montanhas), construções detalhadas e janelas quebráveis.
- Vegetação realista (pinheiros, árvores, arbustos, grama densa), água com ondas,
  reflexos do céu e sombras suaves.
- Ilha flutuante de rocha com árvore gigante, cachoeiras e lago.
- GitHub Actions: build web, APK, GitHub Pages e lançamentos com APK.
