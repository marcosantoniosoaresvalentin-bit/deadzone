# Histórico de versões

## 3.19.1 — armas diferentes entre si
- Cada arma tem dano, cadência, alcance e tempo de recarga próprios (ex.: Micro UZI atira muito rápido e
  fraco; SCAR-H forte e mais lenta; AA-12 escopeta automática; M82 derruba com um tiro).
- Recarga: a mão esquerda vai até a boca do carregador de cada modelo, com o carregador novo na mão.

## 3.19.0 — tela do jogo, vegetação, mapas novos dos modos e asfalto
- **Tela do jogo** no estilo battle royale: bússola com graus, Vivos/Abates em quadrinhos, relógio da zona
  (fora da zona mostra a distância em vermelho), armas com foto 3D nos espaços, ícones de capacete e colete,
  painel de veículo (velocidade, combustível, estado). Sem instruções longas e sem emoji nas mensagens.
- **Vegetação**: bosques de árvores e pinheiros, arbustos e pedras nos campos (otimizado: some de longe).
- **Mapas novos dos modos**: **Duelo** no **Pátio de Containers** e **Mata-mata em Equipe** nos
  **Armazéns do Porto** (cada um numa ilhazinha própria, com muro em volta).
- **Telas de carregamento e abertura** com imagens do próprio jogo, logo, dica e barra fina; menu de mapa e
  modo com fotos.
- **Asfalto**: estradas chegam até a primeira rua das cidades (sem pedaço de grama no meio); estrada do
  porto sobe em diagonal até Cerro Azul; sem toco de estrada na praia; bem menos faixas de pedestre.
- **Nomes**: locais com nomes realistas (Base Militar, Escola, Porto, Galpões, Posto de Gasolina, Fazenda,
  Pedreira, Praia, Usina, Nova Esperança, Cerro Azul, Monte Alto, Vila Rubra, Zênite).

## 3.18.2 — luneta 2x e amigos
- **Luneta 2x**: a cruz da mira era desenhada na tela inteira e as pontinhas passavam da lente. Agora a
  retícula fica desenhada dentro da própria lente.
- **Amigos** (estilo battle royale): abas **Amigos** (lista com 🟢 Online / ⚪ Offline e convite para a
  equipe), **Adicionar** (busca por ID ou nome) e **Pedidos** (com contador). Depois de aceitar, o amigo
  aparece na lista na hora (antes continuava "Você ainda não adicionou amigos"). Na busca, quem já é amigo
  aparece como "✓ Amigo" e pedido já enviado como "Enviado". O cartão de convite fica 20 s na tela.

## 3.18.1 — multiplayer corrigido, convites na tela e correções
- **Multiplayer**: no chão cada jogador (e cada bot) era desenhado na altura 0 no aparelho do outro, ou
  seja, dentro da terra — por isso um não via o outro e quem foi convidado só ouvia os tiros dos bots.
  Agora todos aparecem em cima do chão, os tiros acertam onde o personagem está, e o **paraquedas do
  parceiro aparece** durante a descida (testado com 2 jogadores e 97 bots visíveis para o convidado).
- **Convites**: chegou convite de equipe ou pedido de amizade, aparece um cartão na tela com
  **Aceitar** e **Recusar** (continua também na cartinha). Acabou a caixa "A página em ... diz:" —
  as mensagens agora aparecem no estilo do jogo.
- **Planador**: ao sair, as armas e os botões voltam certinho (antes os espaços das armas sumiam).
- **Luneta 2x**: a imagem ampliada ficava de lado; agora fica certa.
- **Editor de botões**: Granada, Gel e Fumaça saíram (ficam só no menu rápido).

## 3.18.0 — planador, mochila e menus estilo battle royale, equipe junta
- **Planador (motoplanador)**: modelo baixado "UNDERPOLY: Free Sailplane Glider" (CC-BY 4.0), diferente do
  planador do PUBG, com motor e hélice nas costas da cabine. 3 no mapa, parados em retas de estrada.
  Botões **Acelerar** e **Frear**; analógico para cima sobe, para baixo desce, para os lados vira.
  Decola com ~50 km/h; sem velocidade perde sustentação; nivela sozinho perto do chão para pousar fácil.
  Sair no ar = salto de paraquedas. Painel com velocidade, altura, motor, combustível e estado.
- **Mochila estilo battle royale**: três colunas — Chão | Mochila | Equipamento — com a foto 3D de cada item,
  armas com acessórios, capacete, colete e mochila; **descartar com quantidade**.
- **Munição por calibre**: 5.56, 7.62, 9 mm, calibre 12 e .50; cada arma usa a sua e a munição que nasce
  ao lado de uma arma é do calibre dela.
- **Menus rápidos** ao lado das armas: **cura** (bandagem, kit) à esquerda e **arremessáveis** (granada,
  fumaça, gelo, faca) à direita, com lista vertical e ícones desenhados (sem emoji).
- **Equipe**: lista no lado esquerdo com o nome e a vida de cada um; nome do parceiro em cima da cabeça;
  no avião, botão **Seguir** (pula junto com o parceiro, cai do lado dele e abre o paraquedas junto).
- **Estradas**: o asfalto volta a ligar a ponte às estradas nas duas pontas (não fica mais pedaço solto).

## 3.17.2 — ilha Zênite pelo céu, dupla na mesma partida e nome do parceiro
- **Parede invisível no céu**: em queda livre/paraquedas não dava para atravessar o mar até a Ilha
  Zênite. Agora alto no céu passa por cima do mar; só bem perto da água é que não deixa cair no mar.
- **Dupla na mesma partida**: quem foi convidado e estava com Arena/Confronto selecionado ia para outro
  modo. Agora todos entram no Clássico, na mesma partida do líder (testado com 2 aparelhos).
- **Nome do parceiro** aparece em azul em cima da cabeça dele durante a partida.
- **App sempre com a versão nova**: o aplicativo não usa mais arquivos antigos guardados em cache.

## 3.17.1 — correção da câmera travada e dos bots presos no céu
- **Câmera travada / personagem longe / bots parados de paraquedas no céu**: um erro na navegação dos
  bots (porta inexistente em muros e guaritas) travava o quadro inteiro. Corrigido, e agora um bot com
  problema nunca mais trava a câmera nem os outros bots.
- **Mira holográfica nova**: vidro limpo (dá para ver através), armação fina e ponto vermelho no centro;
  antes havia uma placa escura tampando a mira.
- **Configurações** no estilo battle royale (abas Básico · Gráficos · Controles, opções lado a lado);
  sempre 100 jogadores na partida; distância de visão automática (diminui sozinha se o FPS cair).
- **Modos renomeados**: Arena e Confronto.
- **Tela de abertura** do Deadzone com barra de carregamento; tela de carregamento ao entrar em todos os modos.
- **Granada de fumaça**: a nuvem agora aparece no chão certo (antes nascia embaixo do terreno), bem maior,
  macia e dura mais; linha da trajetória com pontos e círculo onde vai cair.
- **Animação de bandagem** (mãos juntas enrolando no braço) e **kit médico** (agachado aplicando).

## 3.17.0 — armas reais, sons reais de tiro, zona mais lenta e mapa corrigido
- **Armas reais 3D**: 20 modelos baixados (licença livre) no lugar das armas feitas no código:
  8 fuzis/submetralhadoras (M4A1, AK-12, SCAR-H, Galil ACE, MPX, PP-19, Micro UZI, MP9),
  4 escopetas (M870, Serrada, Saiga-12, AA-12), 4 pistolas (Makarov, P320, CZ 75, M9) e
  4 snipers (M110, SVD, M82, KSVK). Tamanho real na mão, no chão e nas costas; cada uma tem
  empunhadura, mão de apoio e mira medidas no próprio modelo. Bots também usam modelos variados.
- **Arma nas costas** encostada no corpo, deitada de lado e na diagonal (não flutua mais).
- **Sacar a arma 2x mais rápido** (0,3 s).
- **Sons reais de tiro** (gravações de armas de verdade, licença CC0): um som por arma, mais
  abafado de longe, com direção; silenciador abafa o tiro.
- **Zona mais lenta**: primeiro fechamento só depois de ~4,5 min e círculo maior (não fecha mais a
  cidade toda); partida de ~16 min de zona; contador em minutos e segundos.
- **Mapa**: carro não explode mais na ponte (parede invisível removida); estradas sem rampas
  absurdas (máx. 8% de subida) e sem asfalto enterrado na base; escada da torre de vigia nova
  (reta, de aço, toda visível); menos carros (12).
- **Online**: amigo aparece no lobby mesmo com relógio do celular diferente; convidado carrega
  junto e cai na mesma partida do líder.

## 3.16.0 — desempenho, configurações gráficas, bots e jogar com amigos
- **Configurações → Gráficos**: Qualidade (**Baixa / Média / Alta / Ultra**), **Distância de
  renderização** (Curta 190 m / Média 300 m / Longa 450 m / Máxima 650 m), Sombras ligadas/desligadas,
  **Limite de FPS** (30 ou 60), **Mostrar FPS** na tela e **Bots na partida** (15 / 30 / 50).
  No celular começa em Média, distância Média e 30 FPS (não esquenta e não trava).
- **Otimização**: prédios, ruas e muros ficam "congelados" (o celular não recalcula a posição deles a
  cada quadro); o que passa da distância de renderização some; interior dos prédios, vidros, buggies,
  loot e bots caindo longe também somem de longe; cada arma no chão virou 1 peça só (antes até 8).
  No centro da Ilha Zênite: de ~900 para ~250 desenhos por quadro.
- **Loot de volta**: um ponto por andar nos prédios, barracões, hangares, garagens, praia e usina
  (~340 pontos). **Ilha Zênite e o arranha-céu têm loot forte** (rifles, snipers, colete, capacete,
  mochila grande, mira 8x).
- **Bots ligados**: completam a partida quando não há jogadores reais suficientes; caem sempre em
  terra perto do loot. No squad, com **Autopareamento** marcado, bots completam a equipe.
- **Amigos e convites** (testado com 2 aparelhos ao mesmo tempo): pedido de amizade chega e pode ser
  aceito (antes o aceitar não funcionava: o ID de quem mandou era apagado); convite para equipe,
  amigo aparece no lobby ao lado (antes ficava fora da tela); quem foi convidado aperta **PRONTO**,
  o líder aperta **Iniciar** e os dois entram juntos na mesma partida, com os bots da equipe
  aparecendo como aliados para os dois.
- Corrigido: partida podia começar com 100 bots em vez do número escolhido; prédios do mapa
  apareciam atrás do lobby.

## 3.15.1 — corda do arranha-céu e estradas sem terra por cima
- **Corda**: o personagem fica **de frente para a corda**, com as duas mãos nela na frente do
  corpo (antes ficava de costas, com as mãos para trás).
- **Poço aberto até o topo**: sem teto no saguão nem laje no caminho — a corda vai inteira do
  térreo até a casinha do topo e **a câmera acompanha a subida** por dentro do poço (paredes de
  concreto com luzes a cada andar). Em cima, uma grade de metal cobre o poço (dá para pisar).
- Chão do poço na cor do saguão (sem o piso amarelo).
- **Estradas**: medição em 29 mil pontos das pistas — antes 10,7% tinham terra acima do asfalto
  (até 1,75 m); agora **0%**. Personagem e buggy pisam na superfície do asfalto.

## 3.15.0 — Ilha Zênite, arranha-céu com cordas e nova capa
- **Nova capa do Deadzone** como ícone do aplicativo (e do site).
- **Nomes novos, inventados**, em todo o mapa: Zonária (cidade principal), Vila Rubra, Cerraluz,
  Altamorra, Forte Cinzento, Colégio Nébula, Cais Névoa, Galpões Vértice, Posto Z-1, Fazenda
  Corvina, Pedreira Cinza, Praia Ermo, Usina Volta e **Zênite** (ilha nova).
- **Sem placas** com o nome dos lugares: o nome aparece só no mapa.
- **Ilha Zênite** (oeste, ao lado da montanha da pedreira), com metade do lado da ilha principal,
  ligada por uma **ponte** de 135 m (tabuleiro com asfalto, muretas, postes e pilares no mar —
  dá para atravessar a pé ou de buggy). Cidade com 8 quarteirões em volta da praça central.
- **Torre Zênite (arranha-céu de 78 m)** no centro da ilha: só o **saguão** é aberto (fachada de
  vidro que quebra, entradas a leste e oeste, colunas, balcão). Dois poços de elevador com uma
  **corda** cada: perto dela o botão vira **Subir**/**Descer** e o personagem é puxado segurando a
  corda (≈7 s). No topo: **heliponto com o único helicóptero do mapa** e **2 casinhas** onde as
  cordas chegam, mureta com faixa vermelha e antena.
- Helicópteros: só o do arranha-céu. Na base militar ficou um **helicóptero explodido**
  (queimado, tombado, com destroços) e o estádio ficou sem helicóptero.
- Mapa maior (ilha principal + Ilha Zênite): zona, rota do avião e mapa grande cobrem as duas
  ilhas; a zona final cai sempre em terra, perto de uma cidade ou local.
- Buggies passam a reconhecer pisos (ponte e calçadas).

## 3.14.0 — pente fino: estradas, interiores, torre, posto e mais lugares
- **Ilha de volta ao formato quadrado** (o formato redondo foi desfeito).
- **Estradas sem terra atravessando o asfalto**: pista com seção plana, terreno totalmente plano a
  10 m do eixo, altura presa no chão das cidades/locais e nos cruzamentos (sem degraus nas
  junções); o terreno das cidades e locais não é mais coberto pela estrada.
- **Interiores revisados**: a divisória entre os cômodos ficava em cima de porta/janela — agora fica
  sempre ao lado da porta do corredor e longe da porta da frente; prédio estreito tem 1 cômodo só.
  **Verificação automática: 567 portas e 1246 janelas sem nada na frente.**
- **Prédios afastados dos muros**: 2 lotes por fileira (ou 1 lote inteiro), quintal dos lados e
  atrás; nenhum prédio a menos de 1,2 m de muro.
- **Torre de vigia: escada de metal em zigue-zague** (2 lances com degraus vazados, patamar no meio,
  corrimão e guarda-corpo), entrando pela lateral da cabine.
- **Posto Rota 1 refeito**: cobertura grossa com faixa vermelha e luzes, ilhas com meio-fio e
  faixas amarelas, bombas com visor e mangueira, totem com preço, pátio ligado à estrada.
- **Placas** legíveis dos dois lados (antes apareciam espelhadas por trás).
- **Lugares novos**: **Alto da Serra** (vila no pé do morro), **Pedreira** (montes de pedra,
  britador com esteira, barracões, escritório), **Praia Dourada** (quiosques de palha, guarda-sóis,
  cadeiras, posto de salva-vidas) e **Usina Leste** (torres de resfriamento, chaminé,
  transformadores, torre de transmissão, sala de controle) — todos ligados por estrada.

## 3.13.1 — ilha com forma natural e rede do gol
- **A ilha não é mais quadrada**: litoral arredondado e irregular, com **península a nordeste**,
  pontas e **baías** (o Cais do Sul fica dentro de uma baía, com os píeres entrando no mar).
  Área do mapa um pouco maior (580 x 580 m) para caber tudo em terra.
- **Rede dos gols** do estádio: era um bloco preto; agora é uma **malha branca vazada** (fundo,
  teto e laterais) com travessões de apoio.

## 3.13.0 — estradas, base maior, posto e fazenda
- **Estradas de asfalto** ligando tudo: Porto Velho ⇄ escola ⇄ base ⇄ galpões ⇄ Vila Serena ⇄
  porto ⇄ Monte Verde ⇄ Porto Velho, e ramal para a fazenda. Curvas suaves, bordas brancas e
  tracejado amarelo; o terreno fica plano embaixo da pista.
- **Torre de vigia nova** (aço): pilares com contraventamento em X, cabine fechada até a cintura
  com janelas, telhado com beiral e holofote, **escada maciça de concreto com corrimão** dos dois lados.
- **Base Sentinela maior**: 2 hangares, 2 barracões, 3 alojamentos + comando (com interior),
  **casamatas (bunkers)** com seteira, **antena de rádio** de 22 m, pátio de viaturas com buggies,
  tanques de combustível, mais contêineres e sacos de areia.
- **Posto Rota 1**: cobertura das bombas com faixa vermelha, 2 ilhas de bombas, loja de
  conveniência com interior e placa alta.
- **Fazenda Boa Vista**: celeiro vermelho, 2 silos, casa da fazenda com varanda, cerca de madeira
  baixa (dá para pular), porteira, terreiro e fardos de feno.
- Mais buggies espalhados (base, posto, fazenda e beira das estradas).

## 3.12.0 — mapa novo com várias cidades e locais especiais
- **3 cidades** bem afastadas: **Porto Velho** (norte, com o estádio), **Vila Serena** (sudoeste)
  e **Monte Verde** (sudeste) — todas com ruas, calçadas, muros e prédios com interior.
- **Base Sentinela** (base militar): alambrado com arame farpado, portão com **2 guaritas** e
  cancela, **4 torres de vigia** (dá para subir a escada), **hangar** em arco, barracão,
  alojamentos e prédio de comando com interior, contêineres empilhados, sacos de areia e o
  **heliponto com helicóptero**.
- **Escola Estadual**: prédio de 2 andares com varandas + anexo, muro com portão e placa, pátio,
  mastro com bandeira e **quadra poliesportiva** com alambrado e traves.
- **Cais do Sul** (porto): cais de concreto com cabeços, **2 píeres de madeira** sobre o mar,
  **guindaste de pórtico** amarelo, armazém, pilhas de contêineres coloridos e capitania.
- **Galpões do Oeste**: 3 **barracões de chapa** (portão grande aberto, porta nos fundos,
  caixotes dentro), tanques de combustível, contêineres e alambrado.
- **Nomes de todos os lugares no mapa grande** (como no mapa antigo).
- Estádio: **sem o "H"** no gramado — só o helicóptero no meio do campo.
- Todas as mecânicas valem nos lugares novos: pular janela/mureta/sacos de areia com animação,
  portas, vidros que quebram, escadas e paraquedas ao cair de lugar alto.

## 3.11.0 — cidade maior e mais cheia + estádio de futebol
- **Cidade mais cheia**: mais uma fileira de quarteirões e **lotes estreitos lado a lado**
  (prédios com uma passagem de ~1,2 m entre eles, muros contínuos na frente) — **45 construções**,
  todas com porta e interior, incluindo **11 casas com garagem** (buggy dentro) e prédios largos.
- **Estádio de futebol** no lugar do heliponto (ocupa dois quarteirões): arquibancadas coloridas
  em 4 lados (dá para subir os degraus), entradas com túnel, mureta na frente da arquibancada,
  gramado listrado com linhas, área, círculo central e **gols com rede**, torres de iluminação e
  letreiro. **O helicóptero fica no meio do campo.**
- Garagem: porta de enrolar refeita (rolo liso e chapa ondulada, sem os "dentes").

## 3.10.3 — casas com garagem e janelas sem "pisca-pisca"
- **Casas com garagem aberta** (estilo battle royale) no lugar das praças de muros soltos: sobrado de
  2 andares + garagem de 3 paredes com laje, porta de enrolar levantada e **um buggy dentro**,
  entrada de carro e caminho até a porta.
- **Móveis removidos** de todas as casas.
- **Janelas e portas piscando** (moldura/batente no mesmo plano da parede, brigando na tela):
  molduras, batentes, barra de tijolo e cornijas agora ficam um pouco para fora da parede.
- A barra de tijolo da base fica só do lado de fora.

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
