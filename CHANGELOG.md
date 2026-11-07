# Histórico de versões

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
