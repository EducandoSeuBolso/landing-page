# Landing UI, Responsividade e Conversão — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Corrigir a navegação entre rotas, igualar o estilo ao bolsito-frontend, tornar o fluxo de diagnóstico 100% responsivo e reordenar CTAs para o funil frio/quente.

**Architecture:** SPA Vite + React 19 + react-router 7. Home single-page com seções ancoradas (`#inicio`, `#servicos`, `#sobre`, `#contato`) + rota `/diagnostico`. Navegação por âncora vira `Link to="/#secao"` resolvido por um componente `ScrollToHash`. Estilo compartilha os tokens OKLCH do bolsito-frontend; a paridade é fechada nas utilities de gradiente.

**Tech Stack:** Vite 7, React 19, react-router-dom 7, Tailwind 4, shadcn/ui, lucide-react.

**Spec:** `docs/superpowers/specs/2026-07-08-landing-ui-conversao-design.md`

## Global Constraints

- `nvm use 22` antes de qualquer comando pnpm (Node 20 padrão quebra o pnpm).
- Sem infra de teste unitário no projeto: cada tarefa verifica com `pnpm lint`, `pnpm build` e browser (Playwright MCP, dev server `pnpm dev` em http://localhost:5173).
- Paridade estrita com bolsito-frontend: CTA laranja sólido `#FF8A00`; gradiente de texto azul `#064e72 → #0e87c6 → #2ea3d9`. Nenhum `linear-gradient` inline em CTAs.
- Gradientes decorativos (grids de fundo, orbs, painel do AboutSection) são intencionais e ficam como estão.
- Copy dos CTAs: "Fazer diagnóstico gratuito" (frio, primário) e "Agendar consulta" (quente, secundário).
- Commits frequentes, um por tarefa no mínimo. Não fazer `git push`.

---

### Task 1: Paridade de estilo com bolsito-frontend

**Files:**
- Modify: `src/index.css:135-150` (utilities de gradiente)
- Modify: `src/components/Header.tsx:68-77,117-126` (CTAs com gradiente inline)

**Interfaces:**
- Produces: `.gradient-bg-blue-orange` passa a ser laranja sólido `#FF8A00`; `.gradient-text-blue-orange` passa a ser só azul. Todos os componentes que já usam essas classes (HeroSection, DiagnosticoIntro, DiagnosticoResult, DiagnosticoLeadForm, Footer) herdam o novo visual sem mudança própria.

- [ ] **Step 1: Alinhar utilities em `src/index.css`**

Substituir o bloco `.gradient-text-blue-orange` (linhas ~135-141) e `.gradient-bg-blue-orange` (linhas ~148-150) por (valores copiados de `bolsito-frontend/app/globals.css`):

```css
  /* Gradiente de texto: azul (135deg) — paridade bolsito-frontend */
  .gradient-text-blue-orange {
    background: linear-gradient(135deg, #064e72 0%, #0e87c6 45%, #2ea3d9 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .gradient-text-orange-blue {
    background: linear-gradient(135deg, #064e72 0%, #0e87c6 50%, #2ea3d9 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  /* Fundo sólido laranja para botões — paridade bolsito-frontend */
  .gradient-bg-blue-orange {
    background: #FF8A00;
  }
```

- [ ] **Step 2: Trocar os CTAs inline do Header**

Em `src/components/Header.tsx`, nos dois anchors "Agendar Consulta" (desktop ~linha 68 e mobile ~linha 117): remover `style={{ background: "linear-gradient(135deg,#0E87C6,#FF8A00)" }}` e adicionar `gradient-bg-blue-orange` à `className`. Desktop fica:

```tsx
            <a
              href="https://minhaagendavirtual.com.br/educandoseubolso"
              target="_blank"
              rel="noopener noreferrer"
              className="gradient-bg-blue-orange hidden md:flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg font-semibold text-white hover:opacity-90 transition-opacity"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              Agendar Consulta
            </a>
```

Mobile (dentro do dropdown) fica:

```tsx
            <a
              href="https://minhaagendavirtual.com.br/educandoseubolso"
              target="_blank"
              rel="noopener noreferrer"
              className="gradient-bg-blue-orange mt-1 px-3 py-2.5 text-sm rounded-lg font-semibold text-white flex items-center gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              Agendar Consulta
            </a>
```

- [ ] **Step 3: Verificar lint e build**

Run: `nvm use 22 && pnpm lint && pnpm build`
Expected: zero erros.

- [ ] **Step 4: Verificação visual lado a lado**

Com `pnpm dev` rodando, abrir http://localhost:5173 e https://educandoseubolso.blog.br no Playwright. Conferir: botão navbar laranja sólido; título do hero ("dinheiro") em gradiente azul, sem laranja; botões do diagnóstico (`/diagnostico`) laranja sólido.

- [ ] **Step 5: Commit**

```bash
git add src/index.css src/components/Header.tsx
git commit -m "style: paridade estrita de gradientes com bolsito-frontend"
```

---

### Task 2: Navegação — âncoras absolutas + ScrollToHash

**Files:**
- Create: `src/components/ScrollToHash.tsx`
- Modify: `src/App.tsx`
- Modify: `src/components/Header.tsx` (navLinks e logo)
- Modify: `src/components/Footer.tsx` (âncoras internas)

**Interfaces:**
- Consumes: rotas `/` e `/diagnostico` de `App.tsx`; ids de seção `inicio`, `servicos`, `sobre`, `contato` já existentes na home.
- Produces: componente `ScrollToHash` (default export, sem props, retorna `null`); convenção de link interno `<Link to="/#secao">` usada também na Task 3 (MobileCtaBar e CTASection).

- [ ] **Step 1: Criar `src/components/ScrollToHash.tsx`**

```tsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Resolve âncoras absolutas (/#secao) após navegação de rota: a home pode
// ainda não ter montado quando o effect roda, então tenta por alguns frames.
export default function ScrollToHash() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0 });
      return;
    }
    let attempts = 0;
    let frame = 0;
    const tryScroll = () => {
      const el = document.getElementById(hash.slice(1));
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      } else if (attempts < 20) {
        attempts += 1;
        frame = requestAnimationFrame(tryScroll);
      }
    };
    tryScroll();
    return () => cancelAnimationFrame(frame);
  }, [pathname, hash]);

  return null;
}
```

- [ ] **Step 2: Montar no `src/App.tsx`**

```tsx
import ScrollToHash from "@/components/ScrollToHash";
```

e dentro do `<BrowserRouter>`, antes de `<Routes>`:

```tsx
      <BrowserRouter>
        <ScrollToHash />
        <Routes>
```

- [ ] **Step 3: Converter navLinks do Header para rotas**

Em `src/components/Header.tsx`, substituir o array e a renderização. Novo modelo de dados:

```tsx
// Âncoras absolutas (/#secao) funcionam de qualquer rota via ScrollToHash.
const navLinks = [
  { label: "Início",      to: "/#inicio" },
  { label: "Serviços",    to: "/#servicos" },
  { label: "Sobre",       to: "/#sobre" },
  { label: "Diagnóstico", to: "/diagnostico", highlight: true },
  { label: "Contato",     to: "/#contato" },
];
```

Renderização desktop (substitui o ternário `link.to ? ... : ...`):

```tsx
            {navLinks.map((link) =>
              link.highlight ? (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`${navLinkClass} inline-flex items-center gap-1.5 text-accent hover:text-accent`}
                >
                  <Stethoscope className="h-3.5 w-3.5" />
                  {link.label}
                </Link>
              ) : (
                <Link key={link.to} to={link.to} className={navLinkClass}>
                  {link.label}
                </Link>
              ),
            )}
```

Renderização mobile (dentro do dropdown, substitui o ternário atual):

```tsx
            {navLinks.map((link) =>
              link.highlight ? (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-2.5 text-sm rounded-lg font-medium text-accent hover:bg-secondary transition-all inline-flex items-center gap-2"
                >
                  <Stethoscope className="h-4 w-4" />
                  {link.label}
                </Link>
              ) : (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-2.5 text-sm rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
                >
                  {link.label}
                </Link>
              ),
            )}
```

Logo vira:

```tsx
          <Link
            to="/#inicio"
            className="flex items-center gap-2.5 shrink-0 group"
            aria-label="Ir para início"
          >
```

(fechando com `</Link>`; import de `Link` já existe no arquivo).

- [ ] **Step 4: Converter âncoras internas do Footer**

Em `src/components/Footer.tsx`: adicionar `import { Link } from "react-router-dom";` e trocar os `<a href="#servicos">`, `<a href="#sobre">` (2×) e `<a href="#contato">` por `<Link to="/#servicos">` etc. (mesmas classes). Links externos ficam como `<a>`.

- [ ] **Step 5: Verificar lint e build**

Run: `nvm use 22 && pnpm lint && pnpm build`
Expected: zero erros.

- [ ] **Step 6: Verificar navegação no browser**

Playwright em http://localhost:5173/diagnostico: clicar "Serviços" → deve navegar para a home e rolar até a seção; repetir com "Início" e "Contato"; testar também no viewport 375px via menu mobile; na home, cliques na navbar continuam rolando suavemente sem reload (sem flash de página).

- [ ] **Step 7: Commit**

```bash
git add src/components/ScrollToHash.tsx src/App.tsx src/components/Header.tsx src/components/Footer.tsx
git commit -m "fix(nav): âncoras absolutas + ScrollToHash para navegação entre rotas"
```

---

### Task 3: Hierarquia de CTAs — funil frio/quente + barra fixa mobile

**Files:**
- Modify: `src/components/HeroSection.tsx:60-95` (CTAs)
- Create: `src/components/MobileCtaBar.tsx`
- Modify: `src/pages/index.tsx`
- Modify: `src/components/CTASection.tsx:79-98` (card de ação)
- Modify: `src/components/Footer.tsx` (link Diagnóstico na lista Empresa)

**Interfaces:**
- Consumes: rota `/diagnostico`; utility `gradient-bg-blue-orange` (Task 1); convenção `Link to="/#secao"` (Task 2).
- Produces: componente `MobileCtaBar` (default export, sem props) montado apenas na home; some quando `#contato` entra na viewport.

- [ ] **Step 1: Reordenar CTAs do HeroSection**

Em `src/components/HeroSection.tsx`, adicionar `import { Link } from "react-router-dom";` e trocar `MessageCircle` por `Calendar` no import do lucide. Substituir o bloco de CTAs (div `flex flex-col sm:flex-row ...`) por:

```tsx
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up"
          style={{ animationDelay: "300ms" }}
        >
          <Button
            size="lg"
            asChild
            className="gradient-bg-blue-orange rounded-xl px-8 h-14 text-base font-semibold text-white shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border-0"
          >
            <Link to="/diagnostico">
              Fazer diagnóstico gratuito
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>

          <Button
            variant="outline"
            size="lg"
            asChild
            className="rounded-xl px-8 h-14 text-base font-semibold border-2 border-border hover:bg-card hover:border-primary/30 hover:-translate-y-1 transition-all duration-300"
          >
            <a
              href="https://minhaagendavirtual.com.br/educandoseubolso"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Calendar className="mr-2 h-4 w-4 text-accent" />
              Agendar consulta
            </a>
          </Button>
        </div>
```

- [ ] **Step 2: Criar `src/components/MobileCtaBar.tsx`**

```tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Stethoscope } from "lucide-react";

// CTA fixo no rodapé mobile da home; some quando a CTASection (#contato)
// está visível para não duplicar chamadas na mesma viewport.
export default function MobileCtaBar() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const target = document.getElementById("contato");
    if (!target) return;
    const observer = new IntersectionObserver(
      ([entry]) => setHidden(entry.isIntersecting),
      { threshold: 0.15 },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  if (hidden) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 p-3 md:hidden">
      <Link
        to="/diagnostico"
        className="gradient-bg-blue-orange pointer-events-auto flex h-12 w-full items-center justify-center gap-2 rounded-xl font-semibold text-white shadow-xl"
      >
        <Stethoscope className="h-4 w-4" />
        Fazer diagnóstico gratuito
      </Link>
    </div>
  );
}
```

- [ ] **Step 3: Montar a barra na home**

Em `src/pages/index.tsx`:

```tsx
import MobileCtaBar from "@/components/MobileCtaBar";
```

e no JSX, após `<Footer />`:

```tsx
      <Footer />
      <MobileCtaBar />
```

- [ ] **Step 4: Diagnóstico como primeiro passo na CTASection**

Em `src/components/CTASection.tsx`, adicionar `import { Link } from "react-router-dom";` e `Stethoscope` ao import do lucide. No card glass (após o `<a>` "Falar no WhatsApp", antes do `<p>` "Atendimento 100% online"):

```tsx
                <Link
                  to="/diagnostico"
                  className="flex items-center justify-center gap-2 w-full py-3.5 mt-3 rounded-xl bg-white/10 border border-white/20 text-white text-sm font-medium hover:bg-white/15 transition-colors"
                >
                  <Stethoscope className="h-4 w-4" />
                  Ainda em dúvida? Faça o diagnóstico gratuito
                </Link>
```

- [ ] **Step 5: Link Diagnóstico no Footer**

Em `src/components/Footer.tsx`, na lista "Empresa", adicionar como primeiro `<li>`:

```tsx
              <li>
                <Link to="/diagnostico" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  Diagnóstico financeiro
                </Link>
              </li>
```

- [ ] **Step 6: Verificar lint e build**

Run: `nvm use 22 && pnpm lint && pnpm build`
Expected: zero erros.

- [ ] **Step 7: Verificar no browser**

Playwright, viewport 375×812 na home: barra fixa visível ao rolar o meio da página; barra some quando a CTASection entra na tela; clique leva a `/diagnostico` (sem barra lá). Viewport 1440: hero mostra "Fazer diagnóstico gratuito" (laranja) + "Agendar consulta" (outline); sem barra fixa.

- [ ] **Step 8: Commit**

```bash
git add src/components/HeroSection.tsx src/components/MobileCtaBar.tsx src/pages/index.tsx src/components/CTASection.tsx src/components/Footer.tsx
git commit -m "feat(leads): hierarquia de CTAs frio/quente + barra fixa mobile"
```

---

### Task 4: Diagnóstico 100% responsivo

**Files:**
- Modify: `src/pages/diagnostico.tsx:87-88` (largura do container e padding do cartão)
- Modify: `src/components/diagnostico/DiagnosticoResult.tsx` (layout 2 colunas em `lg:`)
- Modify: `src/components/diagnostico/DiagnosticoIntro.tsx` e `DiagnosticoQuestion.tsx` (só se a auditoria do Step 1 apontar problemas)
- Modify: `src/components/diagnostico/DiagnosticoLeadForm.tsx` (só se a auditoria apontar problemas)

**Interfaces:**
- Consumes: `d.phase` (`"intro" | "question" | "result"`) do hook `useDiagnostico`, já disponível em `pages/diagnostico.tsx`.
- Produces: nenhum contrato novo — mudanças são de classe/layout.

- [ ] **Step 1: Auditoria Playwright (antes)**

Com `pnpm dev` rodando, para cada viewport 360×740, 768×1024, 1024×768 e 1440×900: percorrer intro → responder as perguntas → resultado → abrir formulário de lead. Capturar screenshot de cada fase/viewport (`.playwright-mcp/audit-<fase>-<largura>.png`). Registrar: overflow horizontal (`document.documentElement.scrollWidth > innerWidth`), elementos cortados, alvos de toque < 44px, teclado cobrindo campos do form (emular foco no input).

- [ ] **Step 2: Larguras por fase + padding escalonado**

Em `src/pages/diagnostico.tsx`, substituir as duas linhas do container/cartão:

```tsx
        <div
          className={`relative z-10 mx-auto w-full ${
            d.phase === "question" ? "max-w-3xl" : "max-w-5xl"
          }`}
        >
          <div className="rounded-3xl border border-border/70 bg-card/95 p-4 shadow-card backdrop-blur-sm sm:p-6 md:p-10 animate-fade-up">
```

(intro e resultado aproveitam telas grandes; perguntas continuam estreitas para foco).

- [ ] **Step 3: Resultado em 2 colunas no desktop**

Em `src/components/diagnostico/DiagnosticoResult.tsx`, reorganizar o JSX do `return` para (conteúdo interno dos blocos permanece o atual):

```tsx
  return (
    <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-12">
      {/* Coluna 1 — veredicto */}
      <div>
        <span
          className={`inline-flex items-center rounded-full border px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide ${theme.badge}`}
        >
          {content.flagLabel}
        </span>

        <h1 className="mt-4 text-2xl font-bold leading-tight sm:text-3xl md:text-4xl">
          {content.title(name)}
        </h1>

        <div className="my-7 flex justify-center lg:justify-start">
          <Icon className={`h-16 w-16 sm:h-20 sm:w-20 ${theme.color}`} strokeWidth={1.5} />
        </div>

        <p className="text-base leading-relaxed text-muted-foreground">
          {content.text}
        </p>
      </div>

      {/* Coluna 2 — dimensões + ação */}
      <div>
        <div className="mt-8 lg:mt-0">
          <h3 className="mb-4 text-base font-semibold">Seu diagnóstico por dimensão</h3>
          {dimList.map((d) => {
            const pct = Math.round((dimScores[d.key] / DIM_MAX[d.key]) * 100);
            return (
              <div key={d.key} className="mb-3.5">
                <div className="mb-1.5 flex justify-between text-sm text-muted-foreground">
                  <span>{d.label}</span>
                  <span>{pct}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className={`h-full rounded-full ${theme.bar}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>

        <div className={`mt-7 rounded-2xl border p-5 sm:p-6 ${theme.box}`}>
          <p className="mb-4 text-sm leading-relaxed">{content.cta}</p>
          <Button
            onClick={onScheduleClick}
            className="gradient-bg-blue-orange h-12 w-full rounded-xl border-0 px-6 font-semibold text-white shadow-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl"
          >
            Agendar minha consultoria
          </Button>
        </div>

        <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
          Este diagnóstico é uma ferramenta de autoavaliação baseada em pesquisa
          acadêmica e não substitui uma análise financeira personalizada.
        </p>
        <button
          type="button"
          onClick={onRestart}
          className="mt-3 text-sm text-muted-foreground underline hover:text-accent"
        >
          Refazer o diagnóstico
        </button>
      </div>
    </div>
  );
```

(o CTA vira `w-full` sempre — em coluna estreita `sm:w-auto` ficava desproporcional).

- [ ] **Step 4: Corrigir achados da auditoria em Intro/Question/LeadForm**

Aplicar correções pontuais para cada problema registrado no Step 1, seguindo os padrões: paddings `p-4 sm:p-6 md:p-10`; botões `w-full sm:w-auto` abaixo de `sm`; chips/linhas com `flex-wrap`; tipografia com degrau menor abaixo de `sm` (`text-2xl sm:text-3xl md:text-4xl`); alvos de toque ≥ 44px (`h-11`+ em inputs/botões, checkbox do consentimento com `h-4 w-4`). Se o teclado cobrir campos do LeadForm no mobile, adicionar `max-h-[85dvh] overflow-y-auto` ao `DialogContent`. Se a auditoria não achar nada numa tela, não mexer nela.

- [ ] **Step 5: Auditoria Playwright (depois)**

Repetir o Step 1 nos mesmos viewports/fases. Critérios de aceite: `scrollWidth === innerWidth` em 360px em todas as fases; resultado em 2 colunas em ≥1024px; fluxo completável com teclado aberto no mobile. Screenshots `audit-<fase>-<largura>-depois.png`.

- [ ] **Step 6: Verificar lint e build**

Run: `nvm use 22 && pnpm lint && pnpm build`
Expected: zero erros.

- [ ] **Step 7: Commit**

```bash
git add src/pages/diagnostico.tsx src/components/diagnostico/
git commit -m "fix(diagnostico): responsividade completa 360-1440px + resultado em 2 colunas"
```

---

### Task 5: Verificação final de ponta a ponta

**Files:**
- Nenhum arquivo novo — só verificação e correções residuais.

**Interfaces:**
- Consumes: tudo das Tasks 1-4.

- [ ] **Step 1: Fluxo completo no browser (desktop 1440 e mobile 375)**

1. Home → navbar → cada seção rola suavemente.
2. Hero "Fazer diagnóstico gratuito" → `/diagnostico` → completar diagnóstico → resultado → "Agendar minha consultoria" → formulário → validações aparecem com campos vazios.
3. De `/diagnostico`, navbar "Início" → volta para a home no topo (bug original resolvido).
4. Mobile: menu hambúrguer navega e fecha; barra fixa aparece/some corretamente.

- [ ] **Step 2: Comparação visual final com o site principal**

Lado a lado com https://educandoseubolso.blog.br: cores de CTA, gradiente de título, cartões e sombras equivalentes. Registrar screenshot final.

- [ ] **Step 3: Lint + build finais**

Run: `nvm use 22 && pnpm lint && pnpm build`
Expected: zero erros.

- [ ] **Step 4: Commit final (se houver correções residuais)**

```bash
git add -A && git commit -m "chore: ajustes finais de verificação e2e da landing"
```
