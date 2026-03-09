# Design System — Acelerador de Audiência

> Este documento define o sistema de design completo utilizado no projeto Acelerador de Audiência. Pode ser usado para construir qualquer tipo de aplicação, não apenas páginas web.

---

## Índice

1. [Fundamentos Visuais](#1-fundamentos-visuais)
2. [Sistema de Cores](#2-sistema-de-cores)
3. [Tipografia](#3-tipografia)
4. [Espaçamento e Layout](#4-espaçamento-e-layout)
5. [Componentes UI](#5-componentes-ui)
6. [Efeitos e Animações](#6-efeitos-e-animações)
7. [Design Responsivo](#7-design-responsivo)
8. [Ícones e SVGs](#8-ícones-e-svgs)
9. [Padrões de Código](#9-padrões-de-código)
10. [Implementação](#10-implementação)

---

## 1. Fundamentos Visuais

### 1.1 Filosofia do Design

O design do Acelerador de Audiência transmite **autoridade, exclusividade e sofisticação**. A estética é inspirada em marcas premium de luxo, utilizando:

- **Fundos escuros** que criam profundidade e elegância
- **Acentos dourados** que comunicam valor e prestígio
- **Tipografia serifada** para títulos, evocando tradição e credibilidade
- **Tipografia sans-serif** para corpo, garantindo legibilidade
- **Espaçamentos generosos** que transmitem calma e organização

### 1.2 Princípios

| Princípio | Aplicação |
|-----------|-----------|
| **Hierarquia Clara** | Títulos grandes em Cormorant Garamond, corpo em DM Sans |
| **Contraste Controlado** | Texto claro em fundo escuro com variações de opacidade |
| **Consistência** | Mesmos padrões de bordas, sombras e transições em toda aplicação |
| **Performance** | Uso de CSS puro para animações, carregamento otimizado de fontes |
| **Acessibilidade** | Contraste mínimo de 4.5:1 para texto, estados de foco visíveis |

---

## 2. Sistema de Cores

### 2.1 Paleta Principal (Empire)

A paleta é definida via Tailwind CSS e CSS Variables:

```javascript
// Tailwind Config
colors: {
  empire: {
    bg: '#0a0a0b',        // Fundo principal
    surface: '#111113',   // Superfície elevada
    card: '#18181b',      // Cards e containers
    border: '#27272a',    // Bordas e divisores
    text: '#fafafa',      // Texto principal
    gold: '#c9a962',      // Dourado principal
    goldLight: '#e4d4a5', // Dourado claro
    goldDark: '#9a7b3c',  // Dourado escuro
  }
}
```

### 2.2 Variáveis CSS

```css
:root {
  --gold-gradient: linear-gradient(135deg, #c9a962 0%, #e4d4a5 50%, #c9a962 100%);
  --gold-text: #c9a962;
  --green-gradient: linear-gradient(135deg, #16a34a 0%, #22c55e 50%, #16a34a 100%);
}
```

### 2.3 Cores Semânticas

| Uso | Cor | Hex | Classe Tailwind |
|-----|-----|-----|-----------------|
| Fundo principal | Empire BG | `#0a0a0b` | `bg-empire-bg` |
| Fundo secundário | Empire Surface | `#111113` | `bg-empire-surface` |
| Cards/Painéis | Empire Card | `#18181b` | `bg-empire-card` |
| Bordas | Empire Border | `#27272a` | `border-empire-border` |
| Texto principal | Empire Text | `#fafafa` | `text-empire-text` |
| Acento primário | Empire Gold | `#c9a962` | `text-empire-gold` |
| Acento claro | Empire Gold Light | `#e4d4a5` | `text-empire-goldLight` |
| Acento escuro | Empire Gold Dark | `#9a7b3c` | `text-empire-goldDark` |

### 2.4 Cores de Estado

| Estado | Cor | Hex | Uso |
|--------|-----|-----|-----|
| Sucesso | Emerald 400 | `#34d399` | Confirmações, checkmarks |
| Sucesso (bg) | Emerald 900/10 | `rgba(6, 78, 59, 0.1)` | Fundos de sucesso |
| Erro | Red 400 | `#f87171` | Erros, alertas negativos |
| Erro (bg) | Red 900/10 | `rgba(127, 29, 29, 0.1)` | Fundos de erro |

### 2.5 Variações de Opacidade

```css
/* Texto com opacidade */
text-empire-text/90   /* rgba(250, 250, 250, 0.9) */
text-empire-text/80   /* rgba(250, 250, 250, 0.8) */
text-empire-text/70   /* rgba(250, 250, 250, 0.7) */
text-empire-text/60   /* rgba(250, 250, 250, 0.6) */
text-empire-text/50   /* rgba(250, 250, 250, 0.5) */

/* Gold com opacidade */
text-empire-gold/30   /* rgba(201, 169, 98, 0.3) */
bg-empire-gold/5      /* rgba(201, 169, 98, 0.05) */
bg-empire-gold/10     /* rgba(201, 169, 98, 0.1) */
border-empire-gold/20 /* rgba(201, 169, 98, 0.2) */
border-empire-gold/30 /* rgba(201, 169, 98, 0.3) */
border-empire-gold/40 /* rgba(201, 169, 98, 0.4) */
```

### 6.6 Gradientes

#### Gradiente Dourado (Texto)
```css
.text-gold-gradient {
  background: linear-gradient(135deg, #c9a962 0%, #e4d4a5 50%, #c9a962 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

#### Gradiente Dourado (Borda)
```css
.border-gold-gradient {
  border: 1px solid transparent;
  background: linear-gradient(#18181b, #18181b) padding-box,
              linear-gradient(135deg, #c9a962, #e4d4a5, #c9a962) border-box;
}
```

#### Gradiente Verde (Botões CTA)
```css
.btn-premium {
  background: linear-gradient(135deg, #16a34a 0%, #22c55e 50%, #16a34a 100%);
}
```

#### Gradientes de Fundo
```css
/* Gradiente dourado do canto */
bg-gradient-to-br from-empire-gold/5 to-transparent

/* Gradiente dourado do topo */
bg-gradient-to-l from-empire-gold/5 to-transparent

/* Gradiente linear vertical (hero) */
background: linear-gradient(180deg, rgba(10,10,11,0.3) 0%, rgba(10,10,11,0.9) 70%, rgba(10,10,11,1) 100%);
```

---

## 3. Tipografia

### 3.1 Famílias Tipográficas

#### Display (Títulos)
```css
font-family: 'Cormorant Garamond', serif;
```
- **Uso**: Títulos principais, headlines, números destacados
- **Pesos disponíveis**: 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold)
- **Estilos**: Normal e Itálico

#### Body (Corpo)
```css
font-family: 'DM Sans', sans-serif;
```
- **Uso**: Texto de corpo, navegação, botões, labels
- **Pesos disponíveis**: 300 (Light), 400 (Regular), 500 (Medium), 600 (SemiBold)
- **Estilos**: Normal e Itálico

### 3.2 Carregamento de Fontes

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap" rel="stylesheet">
```

### 3.3 Escala Tipográfica

| Elemento | Tamanho Mobile | Tamanho Desktop | Fonte | Peso | Classe |
|----------|----------------|-----------------|-------|------|--------|
| H1 Hero | `text-3xl` (1.875rem) | `lg:text-6xl` (3.75rem) | Display | 600 | `font-display text-3xl lg:text-6xl font-semibold` |
| H2 Seção | `text-3xl` (1.875rem) | `lg:text-5xl` (3rem) | Display | 400 | `font-display text-3xl lg:text-5xl` |
| H3 Card | `text-xl` (1.25rem) | - | Body | 500 | `text-xl font-medium` |
| H4 Subtítulo | `text-lg` (1.125rem) | - | Body | 500 | `text-lg font-medium` |
| Body Large | `text-xl` (1.25rem) | - | Body | 300 | `text-xl font-light` |
| Body | `text-base` (1rem) | - | Body | 400 | `text-base` |
| Body Small | `text-sm` (0.875rem) | - | Body | 400 | `text-sm` |
| Caption | `text-xs` (0.75rem) | - | Body | 400 | `text-xs` |
| Label/Uppercase | `text-sm` (0.875rem) | - | Body | 400 | `text-sm tracking-widest uppercase` |

### 3.4 Line Height

| Uso | Valor | Classe |
|-----|-------|--------|
| Títulos | 1.25 | `leading-tight` |
| Corpo | 1.5 | `leading-normal` |
| Texto longo | 1.625 | `leading-relaxed` |
| Hero título | 1.2 | `leading-tight` |

### 3.5 Letter Spacing

| Uso | Valor | Classe |
|-----|-------|--------|
| Labels/Uppercase | 0.1em | `tracking-widest` |
| Botões | 0.03em | `tracking-wide` |
| Títulos | -0.025em | `tracking-tight` |
| Normal | 0 | default |

### 3.6 Exemplos de Uso

```html
<!-- Título Hero -->
<h1 class="font-display text-3xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-tight">
  <span class="text-gold-gradient">Texto Dourado</span>
  <span class="text-empire-text">Texto Normal</span>
</h1>

<!-- Subtítulo -->
<p class="text-xl md:text-2xl text-empire-text/90 font-light">
  Subtítulo com peso leve
</p>

<!-- Label -->
<p class="text-empire-gold text-sm tracking-widest uppercase mb-4">
  Seção
</p>

<!-- Body -->
<p class="text-empire-text/80 text-lg leading-relaxed">
  Texto de corpo com opacidade
</p>
```

---

## 4. Espaçamento e Layout

### 4.1 Container Principal

```html
<div class="max-w-6xl mx-auto px-6 lg:px-8">
  <!-- Conteúdo -->
</div>
```

| Propriedade | Valor | Descrição |
|-------------|-------|-----------|
| Largura máxima | `max-w-6xl` | 1152px |
| Largura máxima (nav) | `max-w-7xl` | 1280px |
| Padding horizontal | `px-6` | 24px mobile |
| Padding horizontal (lg) | `lg:px-8` | 32px desktop |
| Margem | `mx-auto` | Centralizado |

### 4.2 Espaçamento Vertical (Seções)

| Elemento | Padding Mobile | Padding Desktop |
|----------|----------------|-----------------|
| Seção padrão | `py-24` (96px) | `md:py-32` (128px) |
| Header/Nav | `h-20` (80px) | - |

### 4.3 Grid System

#### Grid de Cards
```html
<!-- Grid 3 colunas -->
<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
  <!-- Cards -->
</div>

<!-- Grid 2 colunas -->
<div class="grid md:grid-cols-2 gap-6">
  <!-- Cards -->
</div>

<!-- Grid 12 colunas (layout complexo) -->
<div class="grid lg:grid-cols-12 gap-8 lg:gap-12">
  <div class="lg:col-span-7">...</div>
  <div class="lg:col-span-5">...</div>
</div>
```

#### Grid de Imagens
```html
<!-- Grid de logos -->
<div class="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-6 gap-6 md:gap-8">
  <!-- Logos -->
</div>

<!-- Grid de clientes -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
  <!-- Cards de cliente -->
</div>
```

### 4.4 Gap Values

| Classe | Valor | Uso |
|--------|-------|-----|
| `gap-3` | 12px | Elementos internos |
| `gap-4` | 16px | Lists, grupos pequenos |
| `gap-5` | 20px | Cards de cliente |
| `gap-6` | 24px | Cards padrão |
| `gap-8` | 32px | Seções internas |
| `gap-10` | 40px | Elementos hero |
| `gap-12` | 48px | Layout principal |

### 4.5 Padding de Cards

| Tipo | Padding | Classe |
|------|---------|--------|
| Card padrão | 32px | `p-8` |
| Card pequeno | 24px | `p-6` |
| Card interno | 20px | `p-5` |
| Card compacto | 16px | `p-4` |

---

## 5. Componentes UI

### 5.1 Botões

#### Botão Primário (CTA)
```html
<a href="#" class="btn-premium inline-flex items-center gap-3 text-lg tracking-wide">
  APLICAR AGORA
  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
  </svg>
</a>
```

```css
.btn-premium {
  background: linear-gradient(135deg, #16a34a 0%, #22c55e 50%, #16a34a 100%);
  color: #ffffff;
  font-weight: 700;
  padding: 1rem 2.5rem;
  border-radius: 2px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(34, 197, 94, 0.35);
  letter-spacing: 0.03em;
}

.btn-premium::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
  transition: left 0.5s ease;
}

.btn-premium:hover::before {
  left: 100%;
}

.btn-premium:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 40px rgba(34, 197, 94, 0.5);
}
```

#### Botão Secundário
```html
<a href="#" class="btn-secondary text-sm tracking-wide">
  APLICAR AGORA
</a>
```

```css
.btn-secondary {
  background: transparent;
  border: 1px solid #c9a962;
  color: #c9a962;
  padding: 1rem 2.5rem;
  border-radius: 2px;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: rgba(201, 169, 98, 0.1);
  transform: translateY(-2px);
}
```

### 5.2 Cards

#### Card Padrão
```html
<div class="card-hover bg-empire-card p-8 border border-empire-border hover:border-empire-gold/30">
  <div class="w-12 h-12 rounded-lg bg-empire-gold/10 flex items-center justify-center mb-6">
    <!-- Ícone -->
  </div>
  <h3 class="text-xl font-medium mb-3 text-empire-text">Título</h3>
  <p class="text-empire-text/70 mb-4">Descrição do card.</p>
  <p class="text-empire-gold text-sm italic">"Citação ou destaque"</p>
</div>
```

```css
.card-hover {
  transition: all 0.4s ease;
}

.card-hover:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 60px rgba(0,0,0,0.4);
}
```

#### Card com Borda Dourada
```html
<div class="border-gold-gradient bg-empire-card p-8">
  <!-- Conteúdo -->
</div>
```

#### Card de Cliente
```html
<div class="client-card group relative overflow-hidden rounded-lg border border-empire-border bg-empire-card cursor-default">
  <div class="relative overflow-hidden">
    <img src="..." alt="..." class="w-full h-auto block transition-transform duration-700 group-hover:scale-105" loading="lazy">
    <div class="absolute inset-0 bg-gradient-to-t from-empire-card via-transparent to-transparent opacity-0 group-hover:opacity-60 transition-opacity duration-500"></div>
  </div>
  <div class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-empire-goldDark via-empire-gold to-empire-goldLight transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
</div>
```

```css
.client-card {
  transition: all 0.4s ease;
}

.client-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.3);
}
```

#### Card de Fase (Metodologia)
```html
<div class="bg-gradient-to-br from-empire-gold/5 to-transparent border border-empire-gold/20 p-8 rounded-lg fade-in-up">
  <div class="flex items-center gap-4 mb-6">
    <div class="w-12 h-12 rounded-lg bg-empire-gold/10 flex items-center justify-center flex-shrink-0">
      <span class="text-2xl font-display text-gold-gradient">01</span>
    </div>
    <div>
      <h3 class="text-xl font-medium text-empire-text">Fase 1 — Título</h3>
      <p class="text-empire-text/70 text-sm">Subtítulo da fase</p>
    </div>
  </div>
  <!-- Conteúdo -->
</div>
```

### 5.3 Badges e Tags

#### Badge de Status
```html
<div class="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-empire-gold/30 bg-empire-gold/5 mb-8">
  <span class="w-2 h-2 bg-empire-gold rounded-full animate-pulse"></span>
  <span class="text-empire-gold text-sm tracking-widest uppercase">Vagas Limitadas</span>
</div>
```

#### Badge de Programa
```html
<span class="text-empire-gold text-xs tracking-widest uppercase font-medium px-4 py-2 border border-empire-gold/30 rounded-full bg-empire-gold/5">
  Programa 1 — Entrada
</span>
```

### 5.4 Navegação

#### Navbar Desktop
```html
<nav class="fixed top-0 left-0 right-0 z-50 bg-empire-bg/80 backdrop-blur-md border-b border-empire-border">
  <div class="max-w-7xl mx-auto px-6 lg:px-8">
    <div class="flex items-center justify-between h-20">
      <a href="#" class="flex items-center">
        <img src="logo.webp" alt="Logo" class="h-10 w-auto">
      </a>
      <div class="hidden md:flex items-center space-x-8">
        <a href="#" class="text-empire-text/70 hover:text-empire-gold transition-colors text-sm tracking-wide">Link</a>
        <!-- Mais links -->
      </div>
      <div class="hidden md:block">
        <a href="#" class="btn-secondary text-sm tracking-wide">CTA</a>
      </div>
      <!-- Mobile menu button -->
    </div>
  </div>
</nav>
```

#### Menu Mobile
```html
<div id="mobile-menu" class="mobile-menu fixed inset-y-0 right-0 w-72 bg-empire-surface border-l border-empire-border md:hidden">
  <div class="p-6">
    <button id="close-menu-btn" class="absolute top-6 right-6 text-empire-text/70">
      <!-- Ícone X -->
    </button>
    <div class="mt-12 flex flex-col space-y-6">
      <a href="#" class="text-empire-text hover:text-empire-gold transition-colors">Link</a>
      <!-- Mais links -->
      <div class="pt-6 border-t border-empire-border">
        <a href="#" class="btn-premium block text-center text-sm">CTA</a>
      </div>
    </div>
  </div>
</div>
```

```css
.mobile-menu {
  transform: translateX(100%);
  transition: transform 0.3s ease;
}

.mobile-menu.active {
  transform: translateX(0);
}
```

### 5.5 FAQ Accordion

```html
<div class="faq-item border-empire-border">
  <div class="faq-question flex items-center justify-between py-6" onclick="toggleFaq(this)">
    <h3 class="text-lg font-medium pr-4 text-empire-text">Pergunta?</h3>
    <span class="faq-icon text-empire-gold text-2xl flex-shrink-0">+</span>
  </div>
  <div class="faq-answer text-empire-text/80">
    <p>Resposta da pergunta...</p>
  </div>
</div>
```

```css
.faq-item {
  border-bottom: 1px solid rgba(201, 169, 98, 0.1);
}

.faq-question {
  cursor: pointer;
  transition: color 0.3s ease;
}

.faq-question:hover {
  color: #c9a962;
}

.faq-answer {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.4s ease, padding 0.4s ease;
}

.faq-item.active .faq-answer {
  max-height: 500px;
  padding-bottom: 1.5rem;
}

.faq-item.active .faq-icon {
  transform: rotate(45deg);
}

.faq-icon {
  transition: transform 0.3s ease;
}
```

### 5.6 Tabelas

```html
<div class="overflow-x-auto">
  <table class="w-full border-collapse">
    <thead>
      <tr>
        <th class="text-left p-4 border-b border-empire-border text-empire-text/60 font-normal text-sm">Coluna 1</th>
        <th class="text-left p-4 border-b border-empire-border text-empire-gold font-medium">Coluna 2</th>
      </tr>
    </thead>
    <tbody class="text-empire-text">
      <tr class="border-b border-empire-border/50">
        <td class="p-4 text-empire-text/60">Valor 1</td>
        <td class="p-4"><span class="text-empire-gold">Valor 2</span></td>
      </tr>
    </tbody>
  </table>
</div>
```

### 5.7 Footer

```html
<footer class="py-12 bg-empire-bg border-t border-empire-border">
  <div class="max-w-6xl mx-auto px-6 lg:px-8">
    <div class="flex flex-col md:flex-row items-center justify-between gap-6">
      <div class="flex items-center gap-4">
        <img src="logo.webp" alt="Logo" class="h-8 w-auto" loading="lazy">
      </div>
      <div class="flex items-center gap-6 text-empire-text/70 text-sm">
        <a href="#" class="hover:text-empire-gold transition-colors">Link</a>
        <span class="text-empire-border">|</span>
        <a href="#" class="hover:text-empire-gold transition-colors">Link</a>
      </div>
      <p class="text-empire-text/70 text-sm">© 2026 Empresa. Todos os direitos reservados.</p>
    </div>
  </div>
</footer>
```

### 5.8 Cards de Estatísticas

```html
<div class="grid grid-cols-1 md:grid-cols-3 gap-8">
  <div class="text-center p-8 border-gold-gradient">
    <p class="text-4xl md:text-5xl font-display text-gold-gradient mb-2">+30M</p>
    <p class="text-empire-text/70 text-sm tracking-wide uppercase">pessoas alcançadas</p>
  </div>
  <!-- Mais estatísticas -->
</div>
```

---

## 6. Efeitos e Animações

### 6.1 Fade In Up (Scroll Animation)

```html
<div class="fade-in-up">
  <!-- Conteúdo que aparece ao scroll -->
</div>
```

```css
.fade-in-up {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.8s ease, transform 0.8s ease;
}

.fade-in-up.visible {
  opacity: 1;
  transform: translateY(0);
}
```

### 6.2 Stagger Children (Animação em Cascata)

```html
<div class="stagger-children">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

```css
.stagger-children > * {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.stagger-children.visible > *:nth-child(1) { transition-delay: 0.1s; }
.stagger-children.visible > *:nth-child(2) { transition-delay: 0.2s; }
.stagger-children.visible > *:nth-child(3) { transition-delay: 0.3s; }
.stagger-children.visible > *:nth-child(4) { transition-delay: 0.4s; }
.stagger-children.visible > *:nth-child(5) { transition-delay: 0.5s; }
.stagger-children.visible > *:nth-child(6) { transition-delay: 0.6s; }

.stagger-children.visible > * {
  opacity: 1;
  transform: translateY(0);
}
```

### 6.3 Hover Effects

#### Scale em Imagens
```css
/* Imagem com zoom no hover */
img {
  transition-transform duration-700 group-hover:scale-105;
}
```

#### Card Hover
```css
.card-hover {
  transition: all 0.4s ease;
}

.card-hover:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 60px rgba(0,0,0,0.4);
}
```

#### Logo Hover
```css
.logo-item {
  filter: grayscale(50%) brightness(0.9);
  opacity: 0.85;
  transition: all 0.3s ease;
}

.logo-item:hover {
  filter: grayscale(0%) brightness(1);
  opacity: 1;
  transform: scale(1.05);
}
```

### 6.4 Animações Contínuas

#### Pulse (Indicador)
```html
<span class="w-2 h-2 bg-empire-gold rounded-full animate-pulse"></span>
```

#### Bounce (Seta)
```html
<svg class="w-6 h-6 text-empire-gold animate-bounce">...</svg>
```

### 6.5 Transições Padrão

| Tipo | Duração | Easing | Uso |
|------|---------|--------|-----|
| Rápida | 0.3s | ease | Hover states, cores |
| Média | 0.4s | ease | Cards, accordions |
| Lenta | 0.5s-0.8s | ease | Fade in, scroll animations |

### 6.6 Background Patterns

#### Grid Pattern
```css
.grid-pattern {
  background-image: 
    linear-gradient(rgba(201, 169, 98, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(201, 169, 98, 0.03) 1px, transparent 1px);
  background-size: 60px 60px;
}
```

#### Hero Background
```css
.hero-bg {
  position: absolute;
  inset: 0;
  background-image: url('images/hero-bg.webp');
  background-size: cover;
  background-position: center;
  opacity: 0.4;
  z-index: 0;
}

.hero-bg::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(10,10,11,0.3) 0%, rgba(10,10,11,0.9) 70%, rgba(10,10,11,1) 100%);
}
```

### 6.7 Scrollbar Customizada

```css
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #0a0a0b;
}

::-webkit-scrollbar-thumb {
  background: #27272a;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #c9a962;
}
```

---

## 7. Design Responsivo

### 7.1 Breakpoints

| Breakpoint | Largura | Prefixo Tailwind |
|------------|---------|------------------|
| Mobile | < 640px | default |
| SM | ≥ 640px | `sm:` |
| MD | ≥ 768px | `md:` |
| LG | ≥ 1024px | `lg:` |
| XL | ≥ 1280px | `xl:` |
| 2XL | ≥ 1536px | `2xl:` |

### 7.2 Padrões de Responsividade

#### Tipografia Responsiva
```html
<!-- Títulos -->
<h1 class="text-3xl md:text-5xl lg:text-6xl">
<h2 class="text-3xl md:text-4xl lg:text-5xl">

<!-- Body -->
<p class="text-lg md:text-xl">
<p class="text-sm md:text-base">
```

#### Espaçamento Responsivo
```html
<!-- Padding de seção -->
<section class="py-24 md:py-32">

<!-- Gap -->
<div class="gap-6 md:gap-10">

<!-- Padding horizontal -->
<div class="px-6 lg:px-8">
```

#### Grid Responsivo
```html
<!-- 1 → 2 → 3 colunas -->
<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

<!-- 1 → 2 → 4 colunas -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">

<!-- 2 → 5 → 6 colunas -->
<div class="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-6 gap-6 md:gap-8">
```

#### Navegação Responsiva
```html
<!-- Esconde em mobile -->
<div class="hidden md:flex items-center space-x-8">

<!-- Mostra em mobile -->
<button class="md:hidden text-empire-text p-2">
```

### 7.3 Mobile First

Todos os estilos são escritos para mobile primeiro, com adições para telas maiores:

```css
/* Mobile: padrão */
.element {
  padding: 1rem;
  font-size: 1rem;
}

/* Tablet e acima */
@media (min-width: 768px) {
  .element {
    padding: 2rem;
    font-size: 1.25rem;
  }
}

/* Desktop e acima */
@media (min-width: 1024px) {
  .element {
    padding: 3rem;
    font-size: 1.5rem;
  }
}
```

---

## 8. Ícones e SVGs

### 8.1 Biblioteca de Ícones

O projeto usa ícones SVG inline do Heroicons (outline style):

#### Checkmark (Sucesso)
```html
<svg class="w-5 h-5 text-empire-gold" fill="currentColor" viewBox="0 0 20 20">
  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
</svg>
```

#### Check Circle
```html
<svg class="w-5 h-5 text-empire-gold" fill="currentColor" viewBox="0 0 20 20">
  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
</svg>
```

#### Arrow Right
```html
<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
</svg>
```

#### Chevron Right
```html
<svg class="w-4 h-4 text-empire-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
</svg>
```

#### Menu (Hamburger)
```html
<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 6h16M4 12h16M4 18h16"/>
</svg>
```

#### Close (X)
```html
<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12"/>
</svg>
```

#### Arrow Down
```html
<svg class="w-6 h-6 text-empire-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
</svg>
```

#### Eye (Visibilidade)
```html
<svg class="w-6 h-6 text-empire-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
</svg>
```

#### Lightning Bolt
```html
<svg class="w-5 h-5 text-empire-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 10V3L4 14h7v7l9-11h-7z"/>
</svg>
```

#### Warning
```html
<svg class="w-5 h-5 text-empire-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
</svg>
```

#### Info
```html
<svg class="w-5 h-5 text-empire-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
</svg>
```

#### Clock
```html
<svg class="w-4 h-4 text-empire-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
</svg>
```

#### User
```html
<svg class="w-7 h-7 text-empire-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
</svg>
```

### 8.2 Tamanhos de Ícones

| Uso | Tamanho | Classe |
|-----|---------|--------|
| Inline com texto | 16px | `w-4 h-4` |
| Padrão | 20px | `w-5 h-5` |
| Médio | 24px | `w-6 h-6` |
| Grande | 28px | `w-7 h-7` |

### 8.3 Cores de Ícones

| Uso | Cor | Classe |
|-----|-----|--------|
| Padrão | Gold | `text-empire-gold` |
| Sucesso | Emerald 400 | `text-emerald-400` |
| Erro | Red 400 | `text-red-400` |
| Secundário | Text/70 | `text-empire-text/70` |

---

## 9. Padrões de Código

### 9.1 Estrutura de Seção

```html
<section id="secao" class="py-24 md:py-32 relative">
  <!-- Background opcional -->
  <div class="grid-pattern absolute inset-0 opacity-30"></div>
  
  <div class="max-w-6xl mx-auto px-6 lg:px-8 relative">
    <!-- Header da seção -->
    <div class="text-center mb-16 fade-in-up">
      <p class="text-empire-gold text-sm tracking-widest uppercase mb-4">Label</p>
      <h2 class="font-display text-3xl md:text-4xl lg:text-5xl">Título</h2>
    </div>
    
    <!-- Conteúdo -->
    <div class="fade-in-up">
      <!-- ... -->
    </div>
  </div>
</section>
```

### 9.2 Estrutura de Card com Ícone

```html
<div class="card-hover bg-empire-card p-8 border border-empire-border hover:border-empire-gold/30">
  <!-- Ícone -->
  <div class="w-12 h-12 rounded-lg bg-empire-gold/10 flex items-center justify-center mb-6">
    <svg class="w-6 h-6 text-empire-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <!-- SVG path -->
    </svg>
  </div>
  
  <!-- Título -->
  <h3 class="text-xl font-medium mb-3 text-empire-text">Título do Card</h3>
  
  <!-- Descrição -->
  <p class="text-empire-text/70 mb-4">Descrição principal do card.</p>
  
  <!-- Citação/Destaque opcional -->
  <p class="text-empire-gold text-sm italic">"Citação ou destaque"</p>
</div>
```

### 9.3 Padrão de Lista com Ícones

```html
<ul class="text-empire-text/70 text-sm space-y-3">
  <li class="flex items-start gap-3">
    <svg class="w-4 h-4 text-empire-gold flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
    </svg>
    <span>Item da lista com <strong class="text-empire-text">destaque</strong></span>
  </li>
</ul>
```

### 9.4 JavaScript para Animações

```javascript
// Intersection Observer para fade-in
const observerOptions = {
  root: null,
  rootMargin: '0px',
  threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, observerOptions);

document.querySelectorAll('.fade-in-up, .stagger-children').forEach(el => {
  observer.observe(el);
});
```

### 9.5 Smooth Scroll

```javascript
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      const headerOffset = 80;
      const elementPosition = target.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  });
});
```

---

## 10. Implementação

### 10.1 Setup Tailwind CSS

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        empire: {
          bg: '#0a0a0b',
          surface: '#111113',
          card: '#18181b',
          border: '#27272a',
          text: '#fafafa',
          gold: '#c9a962',
          goldLight: '#e4d4a5',
          goldDark: '#9a7b3c',
        }
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'serif'],
        body: ['DM Sans', 'sans-serif'],
      },
    }
  }
}
```

### 10.2 CSS Global

```css
/* styles.css */
:root {
  --gold-gradient: linear-gradient(135deg, #c9a962 0%, #e4d4a5 50%, #c9a962 100%);
  --gold-text: #c9a962;
  --green-gradient: linear-gradient(135deg, #16a34a 0%, #22c55e 50%, #16a34a 100%);
}

html {
  scroll-behavior: smooth;
}

body {
  font-family: 'DM Sans', sans-serif;
  background-color: #0a0a0b;
  color: #fafafa;
}

.font-display {
  font-family: 'Cormorant Garamond', serif;
}

/* Classes utilitárias */
.text-gold-gradient {
  background: var(--gold-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.border-gold-gradient {
  border: 1px solid transparent;
  background: linear-gradient(#18181b, #18181b) padding-box,
              linear-gradient(135deg, #c9a962, #e4d4a5, #c9a962) border-box;
}

/* Componentes */
.btn-premium { /* ... */ }
.btn-secondary { /* ... */ }
.card-hover { /* ... */ }

/* Animações */
.fade-in-up { /* ... */ }
.stagger-children { /* ... */ }

/* Backgrounds */
.grid-pattern { /* ... */ }
.hero-bg { /* ... */ }

/* Scrollbar */
::-webkit-scrollbar { /* ... */ }
```

### 10.3 HTML Base Template

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="theme-color" content="#0a0a0b">
  
  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap" rel="stylesheet">
  
  <!-- Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            empire: {
              bg: '#0a0a0b',
              surface: '#111113',
              card: '#18181b',
              border: '#27272a',
              text: '#fafafa',
              gold: '#c9a962',
              goldLight: '#e4d4a5',
              goldDark: '#9a7b3c',
            }
          },
          fontFamily: {
            display: ['Cormorant Garamond', 'serif'],
            body: ['DM Sans', 'sans-serif'],
          },
        }
      }
    }
  </script>
  
  <!-- Custom Styles -->
  <style>
    /* CSS customizado aqui */
  </style>
</head>
<body class="bg-empire-bg text-empire-text antialiased">
  <!-- Conteúdo -->
  
  <script>
    // JavaScript aqui
  </script>
</body>
</html>
```

---

## Apêndice: Referência Rápida

### Classes Mais Usadas

```
// Cores
bg-empire-bg | bg-empire-surface | bg-empire-card
text-empire-text | text-empire-gold | text-empire-text/70
border-empire-border | border-empire-gold/30

// Tipografia
font-display | font-body
text-3xl md:text-5xl | text-sm | text-lg
font-medium | font-semibold | font-light
tracking-widest uppercase

// Espaçamento
py-24 md:py-32 | px-6 lg:px-8
gap-6 | space-y-6 | mb-16

// Layout
max-w-6xl mx-auto
grid md:grid-cols-2 lg:grid-cols-3
flex items-center justify-between

// Efeitos
fade-in-up | stagger-children
card-hover | transition-all duration-300
hover:border-empire-gold/30

// Componentes
btn-premium | btn-secondary
border-gold-gradient | text-gold-gradient
```

---

*Documento criado para garantir consistência e escalabilidade do design do Acelerador de Audiência.*
