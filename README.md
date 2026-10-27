# Orfeu Áudio — site institucional

Site de um ateliê fictício de áudio valvulado (marca, endereço, números e depoimentos fictícios).
Ele foi feito com Vite, TypeScript, Three.js, GSAP ScrollTrigger e Lenis.

## Rodar localmente

```bash
npm install
npm run dev          # http://localhost:5173
```

Requer Node 20 ou mais recente.

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Gera o PDF da ficha técnica e o site final em `dist/` |
| `npm run preview` | Serve o `dist/` para conferir o build |
| `npm run typecheck` | Checa os tipos do TypeScript |
| `npm run assets` | Regenera as imagens estáticas a partir do modelo 3D (veja abaixo) |
| `npm run shots` | Tira screenshots de QA em 1440 px e 390 px em `screenshots/` |

## Onde editar o conteúdo

**Tudo** fica em `src/content.ts`: textos, números, produtos, especificações, endereço, WhatsApp, e-mail e depoimentos.

- Uma palavra entre `*asteriscos*` num título vira itálico.
- O WhatsApp é montado a partir de `contact.whatsappNumber` (só dígitos, com DDI e DDD) e de `contact.whatsappMessage`.
- O PDF `public/downloads/orfeu-i300-ficha-tecnica.pdf` é gerado a partir de `specs`. Rode `npm run pdf` depois de editar, ou deixe o `npm run build` fazer isso.
- Em dev, salve o `content.ts` e a página recarrega sozinha.

O HTML é **pré-renderizado no build** (`src/render/page.ts`). Buscadores e quem navega sem JavaScript recebem o site completo; o JS só acrescenta o 3D e as animações.

## Estrutura

```
src/
  content.ts            ← todo o conteúdo
  main.ts               ← inicialização: detecta modo 3D/estático, Lenis, cena
  render/page.ts        ← HTML semântico gerado a partir do content.ts
  render/art.ts         ← ilustrações em traço (cards e sala de audição)
  scene/
    buildAmp.ts         ← amplificador modelado proceduralmente (chassi, 2× 300B, 2× 6SN7,
                          3 transformadores, capacitores, placa ponto a ponto, knobs, bornes)
    materials.ts        ← shader "raio-x" (fresnel + contornos) e brilho âmbar das válvulas
    steps.ts            ← câmera e estado de cada etapa da desmontagem (edite aqui o enquadramento)
    particles.ts        ← poeira de luz
    AmpScene.ts         ← renderer, bloom, pausa fora da tela, qualidade adaptativa
  scroll/
    smooth.ts           ← Lenis ligado ao relógio do GSAP
    disassembly.ts      ← timeline única: 3D + textos + navegação de etapas
    effects.ts          ← barra de progresso, revelar com blur, contadores, linha do tempo
  styles/               ← tokens.css (paleta), base, layout, sections
scripts/                ← PDF, imagens estáticas e screenshots (Playwright)
public/
  fallback/             ← quadros do 3D (sem WebGL / prefers-reduced-motion)
  media/                ← close das válvulas (seção do ateliê)
  downloads/            ← ficha técnica em PDF
  og.jpg                ← imagem de compartilhamento
```

### Como o 3D e a rolagem se sincronizam

O Lenis suaviza a rolagem e é dirigido pelo `gsap.ticker`.

Uma única timeline do ScrollTrigger (com `pin` + `scrub`) anima um objeto de estado simples (`S` em `scene/steps.ts`): explosão, câmera, foco, brilho e rotação. A cena Three.js só **lê** esse objeto a cada quadro.

Por isso a rolagem funciona antes mesmo do Three.js terminar de carregar (ele vem num arquivo separado), e textos e 3D nunca saem de sincronia.

## Modos e acessibilidade

- **Desktop**: 3D completo com bloom leve, DPR até 2 e callouts nas peças.
- **Mobile**: menos peças, sem pós-processamento e DPR até 1,5; o objeto fica em cima e os textos embaixo.
- **`prefers-reduced-motion`** (ou `?static` na URL): sem pin nem animação. As 6 etapas aparecem em sequência, com imagens estáticas.
- **Sem WebGL** (ou `?nogl`): mesmas imagens estáticas.
- **Desempenho**:
  - o render pausa quando o 3D sai da tela ou a aba fica oculta;
  - se um quadro passar de ~24 ms, o bloom é desligado e depois o DPR cai para 1;
  - as geometrias são fundidas por material (~120 draw calls).
- **Acessibilidade**:
  - HTML semântico, link "pular para o conteúdo" e foco visível;
  - o menu mobile tem `aria-expanded` e fecha com Esc;
  - os botões de etapa funcionam pelo teclado;
  - as cores de texto respeitam contraste AA (`--muted` só é usado em elementos decorativos).

## Imagens e assets

Não há assets externos: o amplificador é modelado em código. Também não havia ferramenta de geração de imagem conectada, então:

- `public/fallback/*` e `public/media/atelie-valvulas.webp` são renders do próprio modelo 3D;
- a sala de audição é uma ilustração vetorial em traço (`render/art.ts`), pensada como placeholder elegante.

Para trocá-los por fotos reais, substitua os arquivos em `public/media/`, ou o SVG de `roomArt`, mantendo nomes e proporções.

Para regenerar os renders depois de mudar o modelo:

```bash
npm i -D playwright && npx playwright install chromium
npm run assets
```

## Publicar

> Abrir o `index.html` direto (duplo clique) mostra uma página em branco: o conteúdo é gerado pelo Vite.
> Use `npm run dev` para ver localmente, ou publique o build.

### GitHub Pages (para validação)

1. Suba o projeto para um repositório no GitHub (branch `main`).
2. No repositório, vá em **Settings → Pages** e, em **Source**, escolha **GitHub Actions**.
3. O workflow `.github/workflows/deploy.yml` roda a cada push e publica em `https://<usuario>.github.io/<repositorio>/`.

Os caminhos do site são relativos (`base: './'` no `vite.config.ts`), então ele funciona tanto nesse subcaminho quanto num domínio próprio depois.

### Vercel

1. Suba a pasta para um repositório no GitHub.
2. Em vercel.com, clique em **Add New → Project** e importe o repositório.
3. O preset **Vite** é detectado: build `npm run build`, saída `dist`. Clique em **Deploy**.

Pela linha de comando: `npx vercel` e depois `npx vercel --prod`.

### Netlify

1. Suba o repositório e, em app.netlify.com, use **Add new site → Import an existing project**.
2. O `netlify.toml` já define o build `npm run build` e a pasta `dist`.

Sem Git, também dá para rodar `npm run build` e arrastar a pasta `dist/` para app.netlify.com/drop.

Depois de publicar, troque `site.url` em `src/content.ts` pelo domínio real (é usado no canonical e no Open Graph).

## Fontes e licenças

Fraunces, Inter e JetBrains Mono (SIL Open Font License) vêm via `@fontsource`.

`scripts/fonts/` guarda instâncias estáticas delas, usadas só para gerar o PDF.
