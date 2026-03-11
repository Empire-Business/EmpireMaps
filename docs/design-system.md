# DS1 — Silver Empire · Design System
**Version:** 2.0
**Classification:** Editorial Cold — Institutional Power
**Stack:** React 18 · TypeScript · Vite · Tailwind CSS v3 · shadcn/ui · Lucide React

> *"Um sistema de design construído para instituições que não precisam gritar. O poder está no espaço em branco. A autoridade está na tipografia."*

---

## Índice

1. [Filosofia & Princípios](#1-filosofia--princípios)
2. [Sistema de Cores](#2-sistema-de-cores)
3. [Tipografia](#3-tipografia)
4. [Espaçamento](#4-espaçamento)
5. [Elevação & Sombras](#5-elevação--sombras)
6. [Border Radius](#6-border-radius)
7. [Motion & Animações](#7-motion--animações)
8. [Grid & Layout](#8-grid--layout)
9. [Componentes](#9-componentes)
10. [Texturas & Efeitos Visuais](#10-texturas--efeitos-visuais)
11. [Regras Dark Mode](#11-regras-dark-mode)
12. [Padrões & Anti-Padrões](#12-padrões--anti-padrões)
13. [Tokens CSS Completos](#13-tokens-css-completos)
14. [Mapeamento Tailwind](#14-mapeamento-tailwind)

---

## 1. Filosofia & Princípios

### Nome do Sistema
**DS1 — Silver Empire**
Subtítulo: *The Architecture of Authority*

### DNA Visual
Silver Empire é um sistema editorial frio e institucional. Seu poder vem da contenção — grandes quantidades de espaço negativo, hierarquia tipográfica disciplinada, e ouro usado tão raramente que comanda atenção justamente por ser escasso.

### Referências Estéticas

| Referência | O que emprestamos |
|------------|-------------------|
| Bloomberg Terminal | Densidade de dados, labels mono, contraste stark |
| FT Weekend | Cormorant Garamond editorial, fundo ivory |
| McKinsey Reports | Autoridade via white space, hierarquia estruturada |
| Vercel | Painéis dark navy, texto platinum, minimalismo cirúrgico |
| Linear | Precisão de motion, bordas ghost, fundos mist |

### Três Princípios Fundamentais

**1. Poder pelo Vazio**
Espaço negativo não é ausência — é presença. Cada pixel de respiro reforça a gravidade do conteúdo. Layouts premium são 70%+ vazios. Resista ao impulso de preencher.

**2. Tipografia como Estrutura**
A hierarquia tipográfica dita a narrativa antes do usuário ler uma palavra. A fonte é a arquitetura. Cormorant Garamond carrega drama; DM Sans carrega significado; IBM Plex Mono carrega precisão. Nunca use-as de forma intercambiável.

**3. Ouro com Parcimônia**
O acento dourado aparece onde o olho deve pousar. Nunca decorativo. Sempre intencional. Ouro é usado para: labels eyebrow, linhas separadoras de seção, sobrescritos de métricas, dots de badges e gradientes de borda de painel. Nada mais.

---

## 2. Sistema de Cores

### Paleta Raw

| Token | Hex | RGB | Função |
|-------|-----|-----|--------|
| `--void` | `#070C14` | 7, 12, 20 | Escuro absoluto — seções mais profundas, base de sombra |
| `--empire` | `#0D1829` | 13, 24, 41 | Navy escuro — painéis, cards, nav bg dark, button bg primário |
| `--steel` | `#243B55` | 36, 59, 85 | Azul médio — nav links, subtexto, texto secundário |
| `--platinum` | `#BFC5CC` | 191, 197, 204 | Cinza quente — texto body em dark mode, labels sutis |
| `--gold` | `#C9A240` | 201, 162, 64 | Âmbar dourado — a única cor de acento do sistema |
| `--bone` | `#F2EFE8` | 242, 239, 232 | Off-white quente — fundo primário |
| `--ink` | `#1A1F2E` | 26, 31, 46 | Quase-preto — texto primário em fundos claros |
| `--ghost` | `#E4E2DC` | 228, 226, 220 | Cinza claro quente — bordas, divisores, bg sutil |
| `--mist` | `#F7F6F2` | 247, 246, 242 | Quase-branco — bg de seção alternativa, input bg, hover |
| `--white` | `#FFFFFF` | 255, 255, 255 | Branco puro — fundo de cards, input focus |
| `--danger` | `#8B2E2E` | 139, 46, 46 | Carmesim — erros, ações destrutivas |

### Aliases Semânticos

| Alias | Resolve Para | Uso |
|-------|-------------|-----|
| `--bg-primary` | `--bone` | Fundo padrão de página |
| `--bg-inverse` | `--empire` | Fundo de seção/painel escuro |
| `--text-primary` | `--ink` | Texto principal legível |
| `--text-inverse` | `--platinum` | Texto em fundos escuros |
| `--border` | `--ghost` | Borda/divisor padrão |
| `--accent` | `--gold` | Acento dourado — todo uso de acento |

### Pareamentos Light

| Camada | Fundo | Texto | Borda |
|--------|-------|-------|-------|
| Página | `--bone` `#F2EFE8` | `--ink` `#1A1F2E` | `--ghost` `#E4E2DC` |
| Card | `--white` `#FFFFFF` | `--ink` `#1A1F2E` | `--ghost` `#E4E2DC` |
| Input/campo | `--mist` `#F7F6F2` | `--ink` `#1A1F2E` | `--ghost` `#E4E2DC` |
| Seção variante | `--mist` `#F7F6F2` | `--ink` `#1A1F2E` | `--ghost` `#E4E2DC` |
| Subtexto | — | `--steel` `#243B55` | — |
| Labels | — | `--gold` `#C9A240` | — |

### Pareamentos Dark

| Camada | Fundo | Texto | Borda |
|--------|-------|-------|-------|
| Escuro profundo | `--void` `#070C14` | `--platinum` `#BFC5CC` | `rgba(191,197,204,0.1)` |
| Painel dark | `--empire` `#0D1829` | `--white` `#FFFFFF` | `rgba(191,197,204,0.08)` |
| Card dark | `rgba(255,255,255,0.04)` | `--white` | `rgba(191,197,204,0.1)` |
| Input dark | `rgba(255,255,255,0.06)` | `--platinum` | `rgba(191,197,204,0.15)` |
| Acento gold | sempre `--gold` `#C9A240` | — | — |

### Faça / Não Faça

| ✅ Faça | ❌ Não Faça |
|---------|-----------|
| Use `--bone` como fundo padrão | Use `--gold` como preenchimento de fundo |
| Use `--ink` para texto primário em fundos claros | Use `--mist` ou `--ghost` para texto |
| Use `--gold` para labels, linhas, sufixos de métricas | Use gold para fill de botão (exceto `.btn-gold`) |
| Use `rgba(7,12,20,…)` para todas as cores de sombra | Use preto `#000` para sombras — é frio demais |
| Platinum em dark, ink em light | Troque ink/platinum entre contextos |

---

## 3. Tipografia

### Stack de Fontes

| Função | Família | Fallback | Google Fonts |
|--------|---------|----------|-------------|
| Display | Cormorant Garamond | Georgia, serif | `family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400;1,600` |
| Body | DM Sans | system-ui, sans-serif | `family=DM+Sans:wght@300;400;500;600` |
| Mono | IBM Plex Mono | 'Courier New', monospace | `family=IBM+Plex+Mono:wght@400;500` |

### Import URL do Google Fonts

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400;1,600&family=DM+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
```

### Escala Tipográfica

| Token | px | rem | Função |
|-------|----|-----|--------|
| `--text-11` | 11px | 0.6875rem | Labels eyebrow, mono caps, badge, headers de tabela |
| `--text-13` | 13px | 0.8125rem | Nav links, captions, body secundário, mono code |
| `--text-16` | 16px | 1rem | Texto body base, inputs |
| `--text-20` | 20px | 1.25rem | Lead text, manifesto, sub-headlines |
| `--text-28` | 28px | 1.75rem | Títulos de card, headings de grupo |
| `--text-40` | 40px | 2.5rem | Subtítulos de seção, headings médios |
| `--text-56` | 56px | 3.5rem | Títulos de seção (h2) |
| `--text-80` | 80px | 5rem | Números de métricas em cards |
| `--text-120` | 120px | 7.5rem | Número de métrica hero |

### Guia de Pesos

**Cormorant Garamond** (somente display — nunca parágrafos de body)

| Peso | Estilo | Uso |
|------|--------|-----|
| 300 | normal | Headings sutis, variante light |
| 300 | italic | Hero título light, voz editorial |
| 400 | normal | Display specimen |
| 400 | italic | Citações editoriais |
| 600 | normal | Títulos de seção, títulos de card |
| 700 | normal | Hero título bold, números de métricas |

**DM Sans** (body, UI, captions — nunca headings display)

| Peso | Uso |
|------|-----|
| 300 | Texto manifesto, body longo |
| 400 | Body padrão, células de tabela |
| 500 | Nav links, labels, form labels |
| 600 | Botões, nav CTA, texto UI strong |

**IBM Plex Mono** (labels, tokens, metadata — nunca body)

| Peso | Uso |
|------|-----|
| 400 | Amostras de código mono, display de tokens |
| 500 | Labels de seção, headers de tabela, texto de badge |

### Letter-Spacing

| Contexto | Valor | Exemplo |
|----------|-------|---------|
| Display headings (Cormorant bold) | `-0.03em` | Hero título bold |
| Display headings (Cormorant light) | `-0.02em` | Hero título light |
| Display grande (120px+) | `-0.04em` | Ghost word, números de métricas |
| Títulos de seção | `-0.02em` | h2 section title |
| Nav logo | `+0.22em` | EMPIRE logotype |
| Mono eyebrow labels | `+0.18em` a `+0.20em` | Labels de seção |
| Mono badge/headers tabela | `+0.12em` a `+0.16em` | Badge text, th |
| Body text (DM Sans) | `0` (default) | Parágrafos |
| Nav links | `+0.06em` | Navegação |

### Line-Height

| Contexto | Valor |
|----------|-------|
| Display headings | `1.0` |
| Títulos de card | `1.2` |
| Subtítulos de seção | `1.6` |
| Parágrafos body | `1.6` a `1.7` |
| Manifesto/lead text | `1.7` |
| Métricas / números | `1.0` |
| Mono labels | inherited |

### Padrões de Uso

**Label eyebrow:**
```css
font-family: var(--font-mono);
font-size: var(--text-11);
letter-spacing: 0.18em;
text-transform: uppercase;
color: var(--gold);
/* Sempre precedido por uma linha gold horizontal de 24px (::before) */
```

**Título de seção (h2):**
```css
font-family: var(--font-display);
font-size: var(--text-56);
font-weight: 700;
letter-spacing: -0.02em;
line-height: 1.05;
color: var(--ink);
```

**Hero título — split dramático:**
```css
/* Metade light italic */
font-family: var(--font-display);
font-size: clamp(64px, 7.5vw, 110px);
font-weight: 300;
font-style: italic;
color: var(--steel);
letter-spacing: -0.02em;

/* Metade bold */
font-family: var(--font-display);
font-size: clamp(64px, 7.5vw, 110px);
font-weight: 700;
color: var(--ink);
letter-spacing: -0.03em;
```

**Parágrafo body:**
```css
font-family: var(--font-body);
font-size: var(--text-16);
font-weight: 300; /* ou 400 */
color: var(--steel);
line-height: 1.6;
```

**Número de métrica:**
```css
font-family: var(--font-display);
font-size: var(--text-80);
font-weight: 700;
letter-spacing: -0.04em;
line-height: 1;
color: var(--ink); /* ou --white em painéis dark */
/* Sufixo da unidade: font-size: 0.3em; font-weight: 300; color: var(--gold); font-style: italic; vertical-align: super; */
```

---

## 4. Espaçamento

Base-4 scale. Não use valores arbitrários fora dessa escala.

### Escala

| Token | px | rem | Uso Típico |
|-------|----|-----|------------|
| `--s4` | 4px | 0.25rem | Micro gap, margem de dot |
| `--s8` | 8px | 0.5rem | Gap de ícone, stack apertado, gap de badge |
| `--s16` | 16px | 1rem | Gap padrão, espaço de grupo de form |
| `--s24` | 24px | 1.5rem | Sub-seções de card, margem de label |
| `--s32` | 32px | 2rem | Padding de card, espaçamento de grupo |
| `--s48` | 48px | 3rem | Padding lateral de container, gap vertical grande |
| `--s64` | 64px | 4rem | Margin-bottom de header de seção, altura do nav |
| `--s96` | 96px | 6rem | Padding vertical de seção (top + bottom) |
| `--s128` | 128px | 8rem | Reservado para layouts oversized |

### Padding de Seção

Cada seção major usa:
```css
padding: var(--s96) 0;   /* 96px top and bottom */
```

### Padding Interno de Componentes

| Componente | Padding |
|------------|---------|
| Card (standard/dark/metric) | `var(--s32)` todos os lados (32px) |
| Manifesto card | `var(--s32)` todos os lados |
| Hero panel | `var(--s48)` todos os lados |
| Form showcase | `var(--s48)` todos os lados |
| Button SM | `7px 14px` |
| Button MD | `10px 20px` |
| Button LG | `14px 28px` |
| Button XL | `16px 36px` |
| Badge | `4px 10px` |
| Input | `10px 14px` |
| Nav CTA | `9px 20px` |
| Table `th` | `12px 24px` |
| Table `td` | `16px 24px` |

---

## 5. Elevação & Sombras

Cor de sombra sempre derivada de `--void` (`#070C14` = `rgba(7,12,20,…)`). Nunca use preto puro.

### Escala de Sombras

| Token | Valor CSS | Uso |
|-------|-----------|-----|
| `--shadow-sm` | `0 1px 3px rgba(7,12,20,0.08), 0 1px 2px rgba(7,12,20,0.04)` | Lift sutil — suplemento de borda padrão |
| `--shadow-md` | `0 4px 16px rgba(7,12,20,0.10), 0 2px 6px rgba(7,12,20,0.06)` | Button hover, toast, popover pequeno |
| `--shadow-lg` | `0 16px 48px rgba(7,12,20,0.14), 0 6px 16px rgba(7,12,20,0.08)` | Card hover, modais, dropdowns |
| `--shadow-xl` | `0 32px 80px rgba(7,12,20,0.20), 0 12px 32px rgba(7,12,20,0.12)` | Hero panel, card flagship |

### Regras de Uso

- **Estado default:** cards não têm sombra — apenas borda `1px` (`--ghost`). Sombra aparece no hover (`--shadow-lg`).
- **Button hover:** `--shadow-md`
- **Hero dark panel:** `--shadow-xl` (permanente)
- **Toast:** `--shadow-lg`
- **Gold glow (btn-gold only):** `0 8px 24px rgba(201,162,64,0.3)`

---

## 6. Border Radius

| Token | px | Uso |
|-------|----|-----|
| `--radius-sm` | 3px | Botões, badges, inputs, checkboxes |
| `--radius-md` | 6px | Cards pequenos, swatches, toast, motion dots |
| `--radius-lg` | 12px | Cards principais, painéis, wrappers de tabela |

### Regras

- Nunca use `--radius-lg` em elementos interativos pequenos
- Wrappers de tabela usam `--radius-lg` + `overflow: hidden`
- Toggles usam `12px` (metade da altura de 24px) para pill shape
- Radio inputs usam `border-radius: 50%`

---

## 7. Motion & Animações

### Filosofia
Todas as animações usam apenas `transform` e `opacity`. Nunca anime `width`, `height`, `top`, `left`, `margin`, ou `color` — causam layout thrashing.

### Curvas de Easing

| Token | Cubic Bezier | Sensação | Uso |
|-------|-------------|----------|-----|
| `--ease-out` | `cubic-bezier(0.0, 0.0, 0.2, 1.0)` | Desacelera sharp | Page reveals, entrada de elementos |
| `--ease-in-out` | `cubic-bezier(0.4, 0.0, 0.2, 1.0)` | Arco suave | Cross-fade, mudança de estado |
| `--ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1.0)` | Overshoot + settle | Button press, card hover, toggle |

### Durações

| Token | ms | Uso |
|-------|----|-----|
| `--duration-fast` | 150ms | Hover color/bg, micro-mudanças de opacity |
| `--duration-base` | 280ms | Transições UI padrão: card hover, button, nav |
| `--duration-slow` | 500ms | Transições de elementos grandes, reveal de painel |
| `--duration-slower` | 800ms | Scroll reveal (`.reveal`), entrada page-level |

### Keyframes

```css
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes scaleIn {
  from { transform: scale(0.6); }
  to   { transform: scale(1); }
}

@keyframes lineGrow {
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
  /* Sempre: transform-origin: left center; */
}
```

### Scroll Reveal

```css
.reveal {
  opacity: 0;
  transform: translateY(32px);
  transition: opacity var(--duration-slower) var(--ease-out),
              transform var(--duration-slower) var(--ease-out);
}
.reveal.visible {
  opacity: 1;
  transform: translateY(0);
}
.reveal-delay-1 { transition-delay: 80ms; }
.reveal-delay-2 { transition-delay: 160ms; }
.reveal-delay-3 { transition-delay: 240ms; }
.reveal-delay-4 { transition-delay: 320ms; }
.reveal-delay-5 { transition-delay: 400ms; }
```

---

## 8. Grid & Layout

### Container

```css
.container {
  max-width: 1320px;
  margin: 0 auto;
  padding: 0 var(--s48); /* 48px side padding */
}
```

### Grid de Colunas

- **12 colunas**, gutters de `16px`
- CSS Grid com `grid-template-columns: repeat(12, 1fr)` e `gap: var(--s16)`

### Padrões de Layout

| Padrão | CSS |
|--------|-----|
| Hero split (assimétrico) | `grid-template-columns: 1fr 440px` |
| 3 colunas manifesto | `grid-template-columns: repeat(3, 1fr); gap: var(--s48)` |
| 2 colunas form/compare | `grid-template-columns: 1fr 1fr; gap: var(--s48)` |
| 4 colunas motion/feature | `grid-template-columns: repeat(4, 1fr); gap: var(--s24)` |
| 3 colunas card showcase | `grid-template-columns: repeat(3, 1fr); gap: var(--s24)` |

### Arquitetura de Seção

- Nav fixo: `64px` altura, `position: fixed`, `z-index: 1000`
- Seções scrollam livremente atrás do nav
- Primeira seção: `padding-top: 64px` para limpar o nav
- Padding vertical de seção: sempre `var(--s96)` (96px)

---

## 9. Componentes

### Navegação

| Propriedade | Valor |
|-------------|-------|
| Altura | `64px` |
| Posição | `fixed`, `top: 0`, `z-index: 1000` |
| Background | `rgba(242,239,232,0.82)` — bone a 82% opacidade |
| Backdrop | `backdrop-filter: blur(20px)` |
| Border-bottom | `1px solid var(--ghost)` |

**Logo:** Cormorant Garamond, `20px`, peso `600`, letter-spacing `0.22em`, uppercase, cor `--ink`. Gold dot: `5px × 5px`, `background: var(--gold)`, `border-radius: 50%`

**Links:** DM Sans, `13px`, peso `500`, letter-spacing `0.06em`. Cor: `--steel` → `--ink` on hover

**Nav CTA:** DM Sans, `13px`, peso `600`, uppercase, letter-spacing `0.08em`. Padding: `9px 20px`. BG: `--ink`, color: `--bone`, radius: `--radius-sm`. Hover: bg `--empire`, `translateY(-1px)`

---

### Botões

Todos compartilham:
```css
display: inline-flex; align-items: center; justify-content: center;
font-family: var(--font-body); font-weight: 600; letter-spacing: 0.04em;
border-radius: var(--radius-sm); white-space: nowrap;
transition: all var(--duration-base) var(--ease-out);
```

#### Variantes

| Variante | BG Default | Texto | Borda | Hover |
|----------|-----------|-------|-------|-------|
| Primary | `--empire` | `--bone` | `1px --empire` | bg: `--ink`, `translateY(-1px)`, `shadow-md` |
| Secondary | transparent | `--empire` | `1.5px --empire` | bg: `--empire`, text: `--bone`, `translateY(-1px)` |
| Ghost | transparent | `--steel` | `1px transparent` | bg: `--mist`, border: `--ghost`, text: `--ink` |
| Danger | transparent | `--danger` | `1.5px --danger` | bg: `--danger`, text: `--white`, `translateY(-1px)` |
| Gold | `--gold` | `--empire` | `1px --gold` | bg: `#b8912e`, `translateY(-1px)`, gold glow |

Gold hover shadow: `0 8px 24px rgba(201,162,64,0.3)`

#### Tamanhos

| Size | Font Size | Padding | Extra |
|------|-----------|---------|-------|
| `.btn-sm` | 13px | `7px 14px` | — |
| `.btn-md` | 16px | `10px 20px` | — |
| `.btn-lg` | 20px | `14px 28px` | — |
| `.btn-xl` | 13px | `16px 36px` | `text-transform: uppercase; letter-spacing: 0.06em` |

---

### Cards

Todos: `border-radius: var(--radius-lg); overflow: hidden;`
Hover: `transform: translateY(-4px); box-shadow: var(--shadow-lg);`
Transição: `transform var(--duration-base) var(--ease-spring), box-shadow var(--duration-base) var(--ease-out)`

#### Standard Card
- BG: `--white`, border: `1px solid --ghost`, padding: `--s32`
- Top bar: `3px` de `--empire` (via `::before`)
- Tag: IBM Plex Mono 10px, `--gold`, uppercase
- Título: Cormorant 28px peso 600, `--ink`
- Body: DM Sans 16px, `--steel`, opacity 0.8

#### Dark Card
- BG: `--empire`, border: `1px solid rgba(191,197,204,0.08)`, padding: `--s32`
- Top gradient: `linear-gradient(90deg, var(--gold), transparent)`, height `2px`
- Tag: `--gold`; Título: Cormorant 28px, `--white`; Body: `--platinum`, opacity 0.7

#### Metric Card
- BG: `--white`, border: `1px solid --ghost`, padding: `--s32`
- Número: Cormorant 80px peso 700, `--ink`, letter-spacing `-0.04em`
- Sup: `0.3em`, peso 300, `--gold`, vertical-align super
- Label: DM Sans 13px, `--steel`, opacity 0.6
- Delta badge: IBM Plex Mono 13px, `#2D7D4A`, bg `rgba(45,125,74,0.1)`

---

### Badges

Base:
```css
display: inline-flex; align-items: center; gap: 5px;
font-family: var(--font-mono); font-size: 10px;
letter-spacing: 0.12em; text-transform: uppercase;
padding: 4px 10px; border-radius: 3px; font-weight: 500;
```

Badge dot: `5px × 5px`, `border-radius: 50%`

| Variante | Background | Texto | Dot |
|----------|------------|-------|-----|
| Success | `rgba(45,125,74,0.1)` | `#2D7D4A` | `#2D7D4A` |
| Warning | `rgba(201,162,64,0.12)` | `#8B6A1A` | `--gold` |
| Danger | `rgba(139,46,46,0.1)` | `#8B2E2E` | `#8B2E2E` |
| Neutral | `--ghost` | `--steel` | `--platinum` |
| Empire | `--empire` | `--platinum` | `--gold` |

---

### Forms

#### Input Base
```css
width: 100%; padding: 10px 14px;
font-family: var(--font-body); font-size: var(--text-16);
color: var(--ink); background: var(--mist);
border: 1.5px solid var(--ghost); border-radius: var(--radius-sm);
```
Placeholder: `color: var(--platinum)`

#### Estados

| Estado | Borda | Background | Box-shadow |
|--------|-------|------------|-----------|
| Default | `1.5px --ghost` | `--mist` | none |
| Focus | `1.5px --empire` | `--white` | `0 0 0 3px rgba(13,24,41,0.08)` |
| Error | `1.5px --danger` | `rgba(139,46,46,0.03)` | none |

#### Form Label
- Font: 13px, peso 500, cor `--ink`, letter-spacing `0.02em`
- Sub-label: IBM Plex Mono 11px, `--steel`, opacity 0.6

---

### Tabela

```css
.table-wrap {
  overflow: hidden;
  border-radius: var(--radius-lg);
  border: 1px solid var(--ghost);
}
```

- **thead:** bg `--mist`, border-bottom `1px solid --ghost`
- **th:** IBM Plex Mono 11px, letter-spacing `0.12em`, uppercase, `--steel` opacity 0.7
- **td:** padding `16px 24px`, border-bottom `1px solid --ghost`
- **Row hover:** bg `--mist`

---

### Section Label Pattern

Sempre o primeiro elemento de cada seção:

```css
.section-label {
  font-family: var(--font-mono);
  font-size: var(--text-11);
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--gold);
  display: flex;
  align-items: center;
  gap: var(--s8);
  margin-bottom: var(--s32);
}
.section-label::before {
  content: '';
  display: inline-block;
  width: 24px;
  height: 1px;
  background: var(--gold);
}
```

---

## 10. Texturas & Efeitos Visuais

### Film Grain Overlay

Textura de ruído sutil aplicada globalmente via `body::before`:

```css
body::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: none;
  opacity: 0.025; /* CRÍTICO: 0.025 — mais alto fica visível */
  background-image: url("data:image/svg+xml,..."); /* fractalNoise */
  background-repeat: repeat;
  background-size: 128px 128px;
}
```

### Borda Top de Seção (Gradiente Gold)

Para seções escuras:
```css
section::before {
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--gold) 30%, var(--gold) 70%, transparent);
}
```

### Borda Top de Dark Panel/Card

```css
::before {
  background: linear-gradient(90deg, var(--gold), transparent);
  height: 2px;
}
```

---

## 11. Regras Dark Mode

Silver Empire usa **seções escuras intencionais** em vez de toggle de dark mode. Seções light e dark coexistem na mesma página. O contraste entre `--bone` e `--void`/`--empire` **É** o design.

### Tokens Dark

| Light Token | Equivalente Dark |
|-------------|-----------------|
| `--bone` (bg) | `--void` ou `--empire` |
| `--white` (card bg) | `rgba(255,255,255,0.04)` |
| `--ink` (text) | `--white` |
| `--steel` (subtext) | `--platinum` a 70-80% opacity |
| `--ghost` (border) | `rgba(191,197,204,0.1)` |
| `--gold` (accent) | **inalterado** — sempre `#C9A240` |

### Badges em Dark (contrast-adjusted)

| Badge | Dark BG | Dark Text |
|-------|---------|-----------|
| Success | `rgba(45,125,74,0.2)` | `#5CD688` |
| Warning | `rgba(201,162,64,0.2)` | `#E8C26A` |
| Danger | `rgba(139,46,46,0.2)` | `#E07070` |

---

## 12. Padrões & Anti-Padrões

### ✅ Faça

| Padrão | Razão |
|--------|-------|
| Gold exclusivamente em labels, linhas separadoras, unidades, bordas de painel | Escassez faz o gold parecer precioso |
| Espaço negativo agressivo — seções premium são 70%+ vazias | Vazio sinaliza confiança |
| Cormorant italic 300 + bold 700 para contraste dramático | Tensão entre pesos carrega a hierarquia |
| Body copy em DM Sans 300–400 apenas | DM Sans mais pesado compete com Cormorant |
| IBM Plex Mono exclusivamente para labels/tokens/metadata | Mono é sinal de precisão |
| Section labels: mono 11px + gold + 24px gold line | Ritmo visual consistente |
| `--ease-spring` só para interações físicas | Spring é tátil, não decorativo |
| `--void` só para a seção mais escura | Escuro demais para conteúdo normal |

### ❌ Não Faça

| Anti-Padrão | Por Quê |
|-------------|---------|
| `--gold` como preenchimento de fundo | Gold como field é garish |
| Cormorant para parágrafos body | Hairlines de alto contraste cansam em leitura longa |
| Misturar escalas de sombra aleatoriamente | Elevação inconsistente quebra hierarquia espacial |
| Texto menor que 11px | IBM Plex Mono fica ilegível |
| Usar mustard gold `#e8c926` | Este sistema usa `#C9A240` — mais rico, menos neon |
| Animar `width`, `height`, `top`, `left`, `margin` | Causa layout reflow |
| Empilhar múltiplos elementos gold na mesma zona | Gold ao lado de gold = nenhum é especial |
| `--shadow-xl` em componentes pequenos | Sombra oversized em elementos pequenos fica errado |
| Cormorant com peso abaixo de 300 | Peso óptico fica frágil demais |
| Mais que 2 famílias de fonte por componente | Sistema de 3 fontes já é o limite |

---

## 13. Tokens CSS Completos

```css
:root {
  /* ─── COLOR SYSTEM ─── */
  --void:       #070C14;
  --empire:     #0D1829;
  --steel:      #243B55;
  --platinum:   #BFC5CC;
  --gold:       #C9A240;
  --bone:       #F2EFE8;
  --ink:        #1A1F2E;
  --ghost:      #E4E2DC;
  --white:      #FFFFFF;
  --mist:       #F7F6F2;
  --danger:     #8B2E2E;

  /* Semantic Aliases */
  --bg-primary:   var(--bone);
  --bg-inverse:   var(--empire);
  --text-primary: var(--ink);
  --text-inverse: var(--platinum);
  --border:       var(--ghost);
  --accent:       var(--gold);

  /* ─── TYPOGRAPHY ─── */
  --font-display: 'Cormorant Garamond', Georgia, serif;
  --font-body:    'DM Sans', system-ui, sans-serif;
  --font-mono:    'IBM Plex Mono', 'Courier New', monospace;

  --text-11:  0.6875rem;
  --text-13:  0.8125rem;
  --text-16:  1rem;
  --text-20:  1.25rem;
  --text-28:  1.75rem;
  --text-40:  2.5rem;
  --text-56:  3.5rem;
  --text-80:  5rem;
  --text-120: 7.5rem;

  /* ─── SPACING ─── */
  --s4:   0.25rem;
  --s8:   0.5rem;
  --s16:  1rem;
  --s24:  1.5rem;
  --s32:  2rem;
  --s48:  3rem;
  --s64:  4rem;
  --s96:  6rem;
  --s128: 8rem;

  /* ─── MOTION ─── */
  --ease-out:    cubic-bezier(0.0, 0.0, 0.2, 1.0);
  --ease-in-out: cubic-bezier(0.4, 0.0, 0.2, 1.0);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1.0);

  --duration-fast:   150ms;
  --duration-base:   280ms;
  --duration-slow:   500ms;
  --duration-slower: 800ms;

  /* ─── SHADOWS ─── */
  --shadow-sm: 0 1px 3px rgba(7,12,20,0.08), 0 1px 2px rgba(7,12,20,0.04);
  --shadow-md: 0 4px 16px rgba(7,12,20,0.10), 0 2px 6px rgba(7,12,20,0.06);
  --shadow-lg: 0 16px 48px rgba(7,12,20,0.14), 0 6px 16px rgba(7,12,20,0.08);
  --shadow-xl: 0 32px 80px rgba(7,12,20,0.20), 0 12px 32px rgba(7,12,20,0.12);

  /* ─── BORDER RADIUS ─── */
  --radius-sm: 3px;
  --radius-md: 6px;
  --radius-lg: 12px;
}
```

---

## 14. Mapeamento Tailwind

O tailwind.config.ts do projeto deve mapear os tokens DS1 da seguinte forma:

### Cores (tailwind.config.ts → theme.extend.colors.empire)

```typescript
empire: {
  void:     '#070C14',
  DEFAULT:  '#0D1829',  // --empire
  steel:    '#243B55',
  platinum: '#BFC5CC',
  gold:     '#C9A240',
  bone:     '#F2EFE8',
  ink:      '#1A1F2E',
  ghost:    '#E4E2DC',
  mist:     '#F7F6F2',
  danger:   '#8B2E2E',
}
```

### Fontes (theme.extend.fontFamily)

```typescript
fontFamily: {
  display: ['Cormorant Garamond', 'Georgia', 'serif'],
  body:    ['DM Sans', 'system-ui', 'sans-serif'],
  sans:    ['DM Sans', 'system-ui', 'sans-serif'],
  mono:    ['IBM Plex Mono', 'Courier New', 'monospace'],
}
```

### Classes Tailwind de Referência Rápida

```
/* Cores de fundo */
bg-empire-bone        /* fundo de página */
bg-white              /* cards */
bg-empire-mist        /* inputs, seção variante */
bg-empire-void        /* seção escura profunda */
bg-empire             /* painéis dark */

/* Cores de texto */
text-empire-ink       /* texto primário */
text-empire-steel     /* texto secundário */
text-empire-platinum  /* texto em dark */
text-empire-gold      /* acento, labels */

/* Bordas */
border-empire-ghost   /* borda padrão */

/* Tipografia */
font-display          /* Cormorant Garamond */
font-body             /* DM Sans */
font-mono             /* IBM Plex Mono */
```

---

*DS1 — Silver Empire · v2.0 · EMPIRE Design Studio*
*"Power through restraint. Authority through typography. Gold with parsimony."*
