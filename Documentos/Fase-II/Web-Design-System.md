# NextBid — Design System Visual

---

## 1. Paleta de Cores

### 1.1 Cor Primária

O dourado é a **cor de marca** e deve ser reservado para: logotipo, CTAs principais, preços, valores numéricos em destaque, estados ativos e elementos interativos no hover.

| Token | Hex / RGBA | Preview | Uso |
|---|---|---|---|
| `--gold` | `#D4AF37` | ![#D4AF37](https://placehold.co/60x20/D4AF37/D4AF37.png) | Base — botões primários, texto de preço, logo |
| `--gold-hover` | `#E5C158` | ![#E5C158](https://placehold.co/60x20/E5C158/E5C158.png) | Hover sobre elementos dourados |
| `--gold-soft` | `rgba(212, 175, 55, 0.20)` | — | Borders de destaque, fundos de badge |
| `--gold-border` | `rgba(212, 175, 55, 0.30)` | — | Borders de inputs, botões ghost |
| `--gold-faint` | `rgba(212, 175, 55, 0.10)` | — | Fundos hover, separadores |

### 1.2 Fundos (Dark Theme)

Quatro tons de azul-escuro quase-preto compõem a base da interface. Quanto mais alto o elemento está na hierarquia visual, mais claro o fundo.

| Token | Hex | Preview | Função |
|---|---|---|---|
| `--bg-base` | `#0A0E1A` | ![#0A0E1A](https://placehold.co/60x20/0A0E1A/0A0E1A.png) | Fundo da página (camada 0) |
| `--bg-deep` | `#0F1419` | ![#0F1419](https://placehold.co/60x20/0F1419/0F1419.png) | Secções escuras, headers |
| `--bg-card` | `#151B2B` | ![#151B2B](https://placehold.co/60x20/151B2B/151B2B.png) | Cards, modais (camada 1) |
| `--bg-panel` | `#1A1F35` | ![#1A1F35](https://placehold.co/60x20/1A1F35/1A1F35.png) | Painéis elevados (camada 2) |

### 1.3 Texto

Em vez de criar múltiplos tons cinza, usa-se **branco com diferentes alfas**. Isto garante consistência em qualquer fundo e comunica hierarquia de forma imediata.

| Token | Valor | Opacidade | Uso |
|---|---|---|---|
| `--text-white` | `#FFFFFF` | 100 % | Títulos, valores principais, botões primários |
| `--text-soft` | `rgba(255,255,255,0.8)` | 80 % | Texto corrido, labels de formulário |
| `--text-muted` | `rgba(255,255,255,0.6)` | 60 % | Descrições, metadados, timers |
| `--text-faint` | `rgba(255,255,255,0.4)` | 40 % | Texto auxiliar, placeholders |

### 1.4 Cores Semânticas

| Token | Hex | Preview | Significado |
|---|---|---|---|
| `--success` | `#2ECC71` | ![#2ECC71](https://placehold.co/60x20/2ECC71/2ECC71.png) | Leilão LIVE, vendido, saldo positivo |
| `--danger` | `#E74C3C` | ![#E74C3C](https://placehold.co/60x20/E74C3C/E74C3C.png) | Erros, remover, leilão não vendido |

## 2. Tipografia

### 2.1 Família

**Cinzel** — serifada romana inspirada em inscrições capitais clássicas. Importada do Google Fonts:

```css
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700;800;900&display=swap');
font-family: 'Cinzel', serif;
```

### 2.2 Pesos Disponíveis

| Peso | Valor | Uso recomendado |
|---|---|---|
| Regular | 400 | Texto corrido, descrições |
| Medium | 500 | Labels de botão, subtítulos |
| Semibold | 600 | Botões primários, valores de stats, tabs ativas |
| Bold | 700 | Títulos de secção, preços, logo |
| Extrabold / Black | 800 / 900 | Reservado para uso pontual no hero |

### 2.3 Escala Tipográfica

| Token | Tamanho | Peso | Line-height | Uso |
|---|---|---|---|---|
| `display` | `clamp(2.5rem, 5vw, 4.5rem)` | 700 | 1.1 | Hero title (responsivo) |
| `h1` | `2.5rem` (40 px) | 700 | 1.1 | Cabeçalho de página |
| `h2` | `2rem` (32 px) | 700 | 1.15 | Título de secção, stats value |
| `h3` | `1.8rem` (28.8 px) | 600 | 1.2 | Stat cards, totais |
| `h4` | `1.35rem` (21.6 px) | 600 | 1.3 | Título de modal |
| `lg` | `1.2rem` (19.2 px) | 700 | 1.35 | Preço em card de leilão |
| `md` | `1.05rem` (16.8 px) | 500 | 1.4 | Botões grandes, títulos de card |
| `base` | `0.95rem` (15.2 px) | 400 | 1.5 | **Texto padrão** |
| `sm` | `0.85rem` (13.6 px) | 400 | 1.5 | Labels, metadados |
| `xs` | `0.75rem` (12 px) | 600 | 1.4 | Badges de categoria |
| `xxs` | `0.72rem` (11.5 px) | 600 | 1.3 | Badges LIVE, pills de estado |

### 2.4 Letter-Spacing (tracking)

A Cinzel beneficia de tracking generoso para respirar:

| Contexto | Valor |
|---|---|
| Títulos grandes | `0.02em` |
| Logo / brand | `0.12em` |
| Botões primários | `0.02em` – `0.08em` |
| Labels UPPERCASE | `0.05em` – `0.10em` |
| Texto corrido | normal (0) |

---

## 3. Espaçamento

Escala baseada numa **unidade de 4 px**, com preferência por múltiplos de 4 e 8 (grid de 8 px para layouts principais).

| Token | Valor | Uso típico |
|---|---|---|
| `space-1` | `4 px` | Gap interno mínimo |
| `space-2` | `8 px` | Gap entre ícone e texto |
| `space-3` | `12 px` | Padding de pills |
| `space-4` | `16 px` | Padding padrão, gap de grid |
| `space-5` | `20 px` | Padding de card body |
| `space-6` | `24 px` | Padding de secção compacta, gap grande |
| `space-8` | `32 px` | Margem entre secções |
| `space-10` | `40 px` | Gap da navbar |
| `space-12` | `48 px` | Padding vertical de secção |

**Container principal:** `max-width: 1400 px`, centrado, com padding lateral de `24 px` (desktop) ou `16 px` (mobile).

**Breakpoint responsivo único:** `900 px` — abaixo disso a navbar colapsa e os paddings reduzem.

---

## 4. Border Radius

Curvatura consistente cria coesão visual. A tabela mostra a escala e quando usar cada valor.

| Token | Valor | Preview | Uso |
|---|---|---|---|
| `--radius-sm` | `6 px` | ▢ | Inputs pequenos, chips discretos |
| `--radius-md` | `10 px` | ▢ | Botões, cards médios |
| `--radius-lg` | `12 px` | ▢ | Dropdowns, filter bar |
| `--radius-xl` | `16 px` | ▢ | Cards de leilão, modais |
| `--radius-full` | `999 px` | ⬭ | Badges, pills, avatares, FABs |

**Regra:** elementos "tocáveis" pequenos usam `md`; contentores de conteúdo usam `xl`; identificadores e estados usam `full`.

---

## 5. Sombras & Elevação

Três níveis de sombra sugerem profundidade. Todas são escuras (compatíveis com o tema dark) e difusas.

| Token | Valor | Uso |
|---|---|---|
| `--shadow-sm` | `0 2px 8px rgba(0,0,0,0.20)` | Elementos hover discretos |
| `--shadow-md` | `0 6px 24px rgba(0,0,0,0.35)` | FABs, cards em hover |
| `--shadow-lg` | `0 12px 48px rgba(0,0,0,0.50)` | Modais, dropdowns em foco |

---

## 6. Gradientes

Os gradientes substituem cores planas em áreas elevadas e trazem textura sem poluir.

| Uso | Gradient |
|---|---|
| Secções horizontais (stats, ticker) | `linear-gradient(90deg, var(--bg-panel), var(--bg-deep))` |
| Cards diagonais | `linear-gradient(135deg, var(--bg-panel), var(--bg-card))` |
| Overlay do hero | `linear-gradient(180deg, rgba(10,14,26,0.95) 0%, rgba(10,14,26,0.3) 60%, var(--bg-base) 100%)` |
| Placeholder de imagem | `linear-gradient(135deg, #242A3A, #1C2030)` |
| User card | `linear-gradient(135deg, var(--bg-panel), var(--bg-card))` |

**Ticker (variante triplete):** `linear-gradient(90deg, panel → deep → panel)` para criar efeito de "fading" nas pontas.

---

## 7. Efeitos Visuais

# Glassmorphism (desfoque de fundo)

Aplicado em elementos sobrepostos ao conteúdo para criar sensação de vidro fosco:

| Elemento | Valor |
|---|---|
| Navbar | `background: rgba(10,14,26,0.95); backdrop-filter: blur(12px);` |
| Modal overlay | `background: rgba(10,14,26,0.85); backdrop-filter: blur(6px);` |
| Badges sobre imagens | `background: rgba(0,0,0,0.5); backdrop-filter: blur(4px);` |

---

## 8. Iconografia

| Atributo | Regra |
|---|---|
| Estilo | **Line icons** (stroke), **não** preenchidos |
| Stroke width | `2 px` |
| Remates | `stroke-linecap: round; stroke-linejoin: round` |
| Tamanho padrão | `22 × 22 px` (navbar), `16 × 16 px` (inline) |
| Cor | Herda via `stroke="currentColor"` — acompanha a cor do texto |
| Formato | **SVG inline** — sem biblioteca externa |

---

## 9. Imagem & Media

| Contexto | Regra |
|---|---|
| Fotos de leilão | `aspect-ratio: 4 / 3`, `object-fit: cover`, `border-radius: var(--radius-xl)` |
| Avatares | Circulares (`border-radius: 999px`), tamanho `40 px` (user card) ou `72 px` (perfil) |
| Logo | Quadrado `56 × 56 px` na navbar, `72 × 72 px` nas páginas de autenticação |
| Placeholder de loading | Gradient `#242A3A → #1C2030` com spinner dourado |
| Hero | Imagem full-bleed cobrindo `80vh` com overlay gradient vertical |

**Tom fotográfico:** imagens com iluminação baixa/cinematográfica combinam melhor com o tema dark. Evitar fundos brancos puros que quebrem a paleta.

---

## 10. Movimento & Animação

### 10.1 Durações Canônicas

| Token | Valor | Quando usar |
|---|---|---|
| `--t-fast` | `150 ms ease` | Feedback imediato (hover de botão, toggle) |
| `--t-base` | `250 ms ease` | Transições padrão (dropdowns, tabs) |
| `--t-slow` | `400 ms ease` | Mudanças intencionais (abertura de modal, card hover) |

### 10.2 Curvas de Easing

- **Padrão:** `ease` (browser default) — suficiente para 90 % dos casos.
- **Entrada de elementos:** `ease-out` para desacelerar no fim.
- **Saída:** `ease-in` para acelerar no fim.

### 10.3 Padrões de Hover

| Elemento | Efeito |
|---|---|
| Botões | `translateY(-1px)` + troca de cor de fundo |
| Cards de leilão | `translateY(-6px)` + border passa a dourado + `shadow-md` |
| Imagem dentro de card | `scale(1.08)` com 500 ms |
| Links da navbar | cor passa a dourada + `translateY(-1px)` |
| FAB | `scale(1.08)` no hover, `scale(0.96)` no active |


---

## 11. Acessibilidade Visual

| Critério | Estado no design |
|---|---|
| Contraste texto branco vs. `--bg-base` | `18.6 : 1` — excede WCAG AAA |
| Contraste dourado vs. `--bg-base` | `10.2 : 1` — excede WCAG AAA |
| Contraste texto-muted (alfa 60 %) vs. `--bg-base` | `9.1 : 1` — excede AA em texto grande |
| Foco visível | Border dourado sólido em inputs e outline dourado em botões |
| Estado disabled | `opacity: 0.5` + `cursor: not-allowed` |
| Tamanho mínimo de toque | `40 × 40 px` (botões, FABs `58 × 58 px`) |
| Dependência de cor | Nunca usar apenas cor — estados "LIVE" têm ícone pulsante; badges têm label textual |

---

Web Design System 
https://www.figma.com/make/Yujn2szXgjPFQCKFMCMj8V/Dark-Luxury-Web-Design-System?t=oLSweMesTIeu6g4y-1

