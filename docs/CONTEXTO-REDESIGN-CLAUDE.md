# Landing Consultoria: contexto técnico para o redesign

> Escopo: `landing-consultoria/landing-page`. Levantamento de 2026-11-20.
> Caminhos relativos a `landing-consultoria/landing-page/`.

## 1. Stack e arquitetura

| Item | Valor |
|---|---|
| Framework | **Vite 7 + React 19 SPA** (CSR puro, sem SSR/SSG), TypeScript 5.9 strict |
| Roteamento | `react-router-dom` 7 (`BrowserRouter`) |
| UI / estilo | **Tailwind CSS v4** (`@tailwindcss/vite`, sem `tailwind.config`; tokens OKLCH em `src/index.css`) + **shadcn/ui** (estilo new-york, Radix) + `tw-animate-css` + `lucide-react` |
| Fonte | Plus Jakarta Sans via `@import` do Google Fonts em `src/index.css:1` |
| Estado / dados | TanStack Query (só `useMutation`), `react-hook-form` + `zod` (só no lead form) |
| Package manager | **Indefinido**: tem `pnpm-lock.yaml` **e** `bun.lock`, mas o Dockerfile roda `npm install` (sem `package-lock`) |
| Build | `tsc -b && vite build` → `dist/` |
| Deploy | `Dockerfile`: imagem única `node:25-alpine`, `npm install`, build, `serve -s dist -l 6060`. Sem nginx, sem multi-stage |
| Env | `VITE_API_URL` (fallback `https://backend.educandoseubolso.blog.br`) em `src/lib/diagnostico-api.ts:3-5` |
| Analytics | **Nenhum**: sem GA/GTM/Meta Pixel/UTM |

## 2. Estrutura e rotas

```
src/
├── main.tsx                 # createRoot
├── App.tsx                  # providers + rotas
├── App.css                  # morto (template Vite, não importado)
├── index.css                # Tailwind v4, tokens, utilitários (mesh-gradient, gradient-*, glass)
├── assets/bolsito.png       # logo 500×500, 66 KB (duplicado em public/)
├── pages/
│   ├── index.tsx            # Home
│   ├── diagnostico.tsx      # Quiz + captura de lead
│   └── notFound.tsx         # 404 (texto em inglês)
├── components/
│   ├── Header.tsx  HeroSection.tsx  ServicesSection.tsx  DiagnosticoTeaser.tsx
│   ├── AboutSection.tsx  CTASection.tsx  Footer.tsx  MobileCtaBar.tsx
│   ├── ScrollToHash.tsx     # resolve âncoras /#secao entre rotas
│   ├── TestimonialsSection.tsx   # NÃO usado (depoimentos fictícios)
│   ├── NavLink.tsx               # NÃO usado
│   ├── diagnostico/
│   │   ├── diagnostico-data.ts   # perguntas, scoring, textos por tier
│   │   ├── useDiagnostico.ts     # máquina de estados intro → question → result
│   │   ├── DiagnosticoIntro.tsx  DiagnosticoQuestion.tsx
│   │   ├── DiagnosticoResult.tsx DiagnosticoLeadForm.tsx
│   └── ui/                  # 55 componentes shadcn; só 6 usados
├── hooks/                   # use-toast (não usado), use-mobile (só sidebar)
└── lib/
    ├── diagnostico-api.ts   # POST/PATCH para a bolsito-api
    └── utils.ts             # cn()
```

**Rotas** (`src/App.tsx:20-24`):

| Rota | Página | Seções / âncoras |
|---|---|---|
| `/` | `pages/index.tsx` | `#inicio` Hero → `#servicos` → `#diagnostico` teaser → `#sobre` → `#contato` CTA → Footer + MobileCtaBar |
| `/diagnostico` | `pages/diagnostico.tsx` | intro → perguntas → resultado → modal de lead |
| `*` | `pages/notFound.tsx` | 404 |

## 3. Fluxos de conversão

### Destinos externos (todos hardcoded, sem constante central)

- **Agenda:** `https://minhaagendavirtual.com.br/educandoseubolso`
- **WhatsApp:** `5531999189537`, repetido em 6 lugares e às vezes com `http://` em vez de `https://`

### Inventário de CTAs

| Arquivo:linha | Texto | Destino |
|---|---|---|
| `components/Header.tsx:67-75` | "Agendar Consulta" (desktop) | Agenda ⚠️ ícone `MessageCircle` sugere WhatsApp |
| `components/Header.tsx:115-123` | "Agendar Consulta" (menu mobile) | Agenda |
| `components/Header.tsx:11` | nav "Diagnóstico" (destaque laranja) | `/diagnostico` |
| `components/HeroSection.tsx:71-74` | **"Fazer diagnóstico gratuito"** (primário) | `/diagnostico` |
| `components/HeroSection.tsx:83-90` | "Agendar consulta" (secundário) | Agenda |
| `components/DiagnosticoTeaser.tsx:53-59` | "Fazer diagnóstico gratuito" | `/diagnostico` |
| `components/AboutSection.tsx:61-68` | "Agendar Consultoria" | Agenda |
| `components/AboutSection.tsx:77` | "Falar no WhatsApp" | `http://wa.me/...` ⚠️ http |
| `components/CTASection.tsx:80-89` | "Agendar Consultoria" (primário) | Agenda |
| `components/CTASection.tsx:91-99` | "Falar no WhatsApp" | `http://wa.me/...` ⚠️ http |
| `components/CTASection.tsx:101-107` | "Ainda em dúvida? Faça o diagnóstico" | `/diagnostico` |
| `components/MobileCtaBar.tsx:25-31` | barra fixa mobile "Fazer diagnóstico gratuito" (some quando `#contato` está visível) | `/diagnostico` |
| `components/Footer.tsx:21, 98` | telefone / "WhatsApp" | `wa.me` |
| `components/Footer.tsx:76` | "Consultoria" | Agenda |
| `components/Footer.tsx:30` | endereço | Google Maps |
| `components/Footer.tsx:99-103` | Instagram, YouTube, Facebook, LinkedIn, Blog | redes sociais |
| `components/Footer.tsx:129` | "Privacidade" | `href="#"` ⚠️ quebrado |
| `components/ServicesSection.tsx:121-127` | "Saiba mais" (aparece no hover) | ⚠️ **nenhum**: não é link |

> Na home convivem três objetivos de conversão: diagnóstico, agenda e WhatsApp. O Hero e a barra mobile priorizam o diagnóstico. Header, About e CTA priorizam a agenda.

### Funil do diagnóstico (o único formulário com integração)

1. `components/diagnostico/DiagnosticoIntro.tsx:65-78`: input de primeiro nome (opcional) + "Começar diagnóstico".
2. `components/diagnostico/DiagnosticoQuestion.tsx`: cerca de 15 perguntas com perguntas condicionais e barra de progresso.
3. Ao entrar no resultado, `pages/diagnostico.tsx:26-50` faz o **POST** `/diagnostico/submissions` (`lib/diagnostico-api.ts:25`) com respostas, scores e tier, e guarda o `id`. É best-effort: se falhar, o erro é engolido.
4. `components/diagnostico/DiagnosticoResult.tsx:75-80` mostra "Agendar minha consultoria" e abre um modal. ⚠️ O botão diz "Agendar", mas o destino é o WhatsApp, não a agenda.
5. `components/diagnostico/DiagnosticoLeadForm.tsx:25-32` valida com zod nome, e-mail, WhatsApp (`min(8)`, sem máscara) e consentimento LGPD.
6. No submit (`DiagnosticoLeadForm.tsx:73-77`, `pages/diagnostico.tsx:52-70`) roda o **PATCH** `/diagnostico/submissions/:id/lead` e em seguida `window.open(wa.me?text=...)` com mensagem pré-preenchida com nome e zona (`DiagnosticoLeadForm.tsx:18-23`).

**Backend:** `blog-ecossistema/bolsito-api/src/diagnostico/diagnostico.controller.ts`, com throttle de 60 req/min e PATCH sem autenticação.

### Integração com o `appconsultoria`

**Não existe.** Não há chamada, link nem webhook para `app-financas-consultoria`. O lead vai para a `bolsito-api` (ecossistema do blog). Hoje a ligação com a consultoria é manual: o lead chega pelo WhatsApp ou pela agenda. Se o redesign quiser lead direto no app, isso é trabalho novo de backend.

## 4. Estático vs. dinâmico

- **Hardcoded:** todo o conteúdo (copy, serviços, benefícios, stats "10+ anos / 5★", links, telefone, endereço). Não há CMS, i18n nem fetch de conteúdo.
- **Dinâmico:** só os 2 endpoints do diagnóstico (POST e PATCH). O scoring roda inteiro no cliente (`diagnostico-data.ts`, `useDiagnostico.ts`).
- O ecossistema já tem CMS (WordPress/`bolsito-wordpress` e `bolsito-admin`), mas a landing não consome nenhum dos dois.

## 5. Débitos técnicos rápidos

### SEO técnico (maior impacto)

1. **SPA sem pré-render.** O HTML servido é `<div id="root"></div>` vazio. Corrigir com prerender (`vite-plugin-prerender`/`vite-react-ssg`) ou migrar para Next/Astro (o ecossistema já usa Next).
2. **`index.html`:** `lang="en"` (deveria ser `pt-BR`). Faltam `meta description`, canonical, Open Graph e Twitter card. Há um só `<title>` para todas as rotas, então `/diagnostico` não tem título próprio. Sugestão: `react-helmet-async` ou o `<title>` nativo do React 19.
3. **Sem `robots.txt`, `sitemap.xml` e JSON-LD.** Endereço e telefone já existem, então cabe um `LocalBusiness`/`FinancialService` no schema.
4. **404 responde HTTP 200** (`serve -s`) e o texto está em inglês (`pages/notFound.tsx`).
5. **Semântica:** o Footer usa `<h4>` sem `h2`/`h3` acima. Os cards de serviço são `<div>` com "Saiba mais" falso. "Privacidade" leva a `#`, o que é ruim também para LGPD, já que o form pede consentimento.

### Performance

1. **Fonte via `@import` no CSS** (`index.css:1`): cria cadeia bloqueante. Trocar por `<link rel="preconnect">` + `<link>` no `index.html`, ou self-host com `@fontsource-variable/plus-jakarta-sans`.
2. **Logo PNG 500×500 de 66 KB** exibido a 28–80 px, em dois lugares (`public/` e `src/assets/`). Trocar por SVG ou WebP redimensionado, com `width`/`height` explícitos.
3. **Orbs com `blur-[120–150px]` animados** (`animate-glow-pulse`) + `backdrop-blur` no header e nos cards: custo alto de GPU no mobile. Trocar por radial-gradient estático e respeitar `prefers-reduced-motion`.
4. **`/diagnostico` não é lazy:** RHF, zod, Dialog e os dados do quiz entram no bundle da home. Usar `React.lazy` na rota.
5. **`Toaster` renderizado duas vezes** (`App.tsx:1-2, 16-17`, os dois do `sonner`) e sem uso. `TooltipProvider` também sem uso.

### Componentização / manutenção

1. **Constantes de contato espalhadas:** criar `src/config/contact.ts` (`AGENDA_URL`, `WHATSAPP_NUMBER`, `whatsappUrl(msg)`) e padronizar `https://`.
2. **Botões CTA duplicados:** as classes `gradient-bg-blue-orange ... shadow-xl hover:-translate-y-*` se repetem em uns 8 lugares com alturas diferentes (`h-12`, `h-14`, `py-4`). Criar variantes `cta`/`cta-outline` no `button.tsx` via cva.
3. **Pilares do diagnóstico duplicados** em `DiagnosticoTeaser.tsx:11-17` e `DiagnosticoIntro.tsx:12-18`.
4. **Código morto:** 49 dos 55 componentes `ui/`, `App.css`, `NavLink.tsx`, `TestimonialsSection.tsx`, `hooks/use-toast.ts`, README do template. Deps sem uso real: `recharts`, `date-fns`, `embla`, `cmdk`, `vaul`, `input-otp`, `react-day-picker`, `react-resizable-panels`, `@base-ui/react`, `next-themes`.
5. **Cores hardcoded** fora dos tokens (`#0a6a9e`, `#064e72`, `rgba(14,135,198,…)`, cores dos tiers em `DiagnosticoResult.tsx:9-27`). Levar para `@theme` no `index.css`.
6. **Build/deploy:** escolher um único package manager (pnpm, como o resto do ecossistema), apagar o lockfile que sobrar, fazer multi-stage e servir estático com nginx/caddy (que também resolve cache headers e o 404 real).

### Riscos de conversão (CRO)

- **`window.open` depois de `await`** (`DiagnosticoLeadForm.tsx:74-75`): o navegador pode bloquear como popup, sobretudo no iOS Safari. O usuário preenche o form e o WhatsApp não abre. Abrir a janela de forma síncrona antes do await, ou usar `location.href`.
- **Lead perdido em silêncio:** se o POST da etapa 3 falhar, o PATCH nunca roda e só o WhatsApp registra o contato. O ideal é enviar submission e lead num POST só.
- **Sem tracking de eventos:** não dá para medir clique em CTA, abandono por pergunta do quiz nem a taxa resultado → lead → WhatsApp.
- **CORS:** o `.env.example` da `bolsito-api` lista só `educandoseubolso.blog.br` e `localhost:3000`. É preciso confirmar se o domínio de produção da landing está em `CORS_ORIGINS`.
- **Telefone sem máscara/normalização** (`min(8)`), o que gera dado sujo no lead.
