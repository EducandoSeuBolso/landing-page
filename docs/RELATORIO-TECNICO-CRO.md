# Diagnóstico Arquitetural e CRO — Landing Page Consultoria

> **Projeto:** `landing-consultoria/landing-page` (Ecossistema Educando Seu Bolso)  
> **Data:** 20/11/2026  
> **Objetivo:** Documento técnico e de conversão (CRO) para embasar a sessão de redesign da landing page.

---

## 1. Stack e Arquitetura

| Camada | Tecnologia / Ferramenta | Detalhes & Configuração |
|---|---|---|
| **Framework / Core** | React 19.2.0 + Vite 7.2.4 | Single Page Application (SPA) pura client-side (CSR), TypeScript 5.9 strict via `@vitejs/plugin-react-swc`. |
| **Roteamento** | `react-router-dom` 7.13.0 | `BrowserRouter` com utilitário customizado `ScrollToHash` para navegação entre âncoras na mesma e entre páginas. |
| **Estilização / UI** | Tailwind CSS v4 (`@tailwindcss/vite` 4.1.18) | Arquitetura CSS com tokens em espaço OKLCH definidos em `@layer base` (`src/index.css`), utilitários de animação via `tw-animate-css`. |
| **Componentes de UI** | Radix UI + shadcn/ui | 57 componentes primitivos em `src/components/ui/` (a grande maioria sem uso). |
| **Ícones & Notificações** | `lucide-react` (0.563.0) + `sonner` (2.0.7) | Ícones SVG em linha e sistema de toast (duplicado no `App.tsx`). |
| **Formulários & Validação** | `react-hook-form` (7.71.1) + `zod` (4.3.6) | Validação tipada via `@hookform/resolvers` aplicada no modal de captura de lead. |
| **Data Fetching / Estado** | `@tanstack/react-query` (5.90.20) | Utilizado pontualmente para mutações assíncronas no funil do diagnóstico (`useMutation`). |
| **Gerenciador de Pacotes** | Inconsistente / Misto | Presença simultânea de `pnpm-lock.yaml` e `bun.lock` no repositório, enquanto o `Dockerfile` executa `npm install`. |
| **Build & Deploy** | `tsc -b && vite build` ➔ Docker | Imagem única `node:25-alpine` que roda `npm install -g serve` e expõe a porta 6060 via `serve -s dist -l 6060` (sem Nginx, sem multi-stage, sem CDN estático). |
| **Variáveis de Ambiente** | `VITE_API_URL` | Fallback para `https://backend.educandoseubolso.blog.br` em `src/lib/diagnostico-api.ts`. |
| **Analytics & Pixel** | Inexistente | Sem Google Tag Manager (GTM), Google Analytics 4, Meta Pixel ou mensuração de conversões/eventos. |

---

## 2. Estrutura de Pastas e Rotas

### Árvore de Arquivos (`src/`)

```text
src/
├── assets/
│   └── bolsito.png               # Logo da marca (66 KB)
├── components/
│   ├── diagnostico/               # Módulo do Funil de Saúde Financeira
│   │   ├── DiagnosticoIntro.tsx   # Etapa 0: Boas-vindas e input de nome
│   │   ├── DiagnosticoQuestion.tsx# Etapa 1: Questões com escala/opções e barra de progresso
│   │   ├── DiagnosticoResult.tsx  # Etapa 2: Resultado por zona (Verde, Amarela, Vermelha)
│   │   ├── DiagnosticoLeadForm.tsx# Etapa 3: Modal de captura de lead e redirect WhatsApp
│   │   ├── diagnostico-data.ts    # Base de perguntas, regras condicionais e tiers
│   │   └── useDiagnostico.ts      # Hook com máquina de estados e cálculo de score
│   ├── ui/                        # Biblioteca shadcn (57 arquivos; apenas ~6 utilizados)
│   ├── AboutSection.tsx           # Seção "Sobre nós" / Por que nos escolher
│   ├── CTASection.tsx             # Seção de contato e conversão pré-rodapé
│   ├── DiagnosticoTeaser.tsx      # Bloco intermediário na home chamando para o quiz
│   ├── Footer.tsx                 # Rodapé institucional com links e redes
│   ├── Header.tsx                 # Barra de navegação fixa (desktop e mobile)
│   ├── HeroSection.tsx            # Seção principal com H1 e CTAs de entrada
│   ├── MobileCtaBar.tsx           # Barra flutuante sticky inferior exclusiva para mobile
│   ├── NavLink.tsx                # [ÓRFÃO] Componente de link não referenciado
│   ├── ScrollToHash.tsx           # Utilitário que lida com âncoras /#secao na SPA
│   ├── ServicesSection.tsx        # Grid com 6 cards de serviços
│   └── TestimonialsSection.tsx    # [ÓRFÃO] Seção pronta de depoimentos esquecida fora da Home
├── hooks/
│   ├── use-mobile.ts              # Detecção de viewport mobile
│   └── use-toast.ts               # Hook de toast não referenciado
├── lib/
│   ├── diagnostico-api.ts         # Integração REST com bolsito-api
│   └── utils.ts                   # Utilitário de classes CSS (cn)
├── pages/
│   ├── index.tsx                  # Home da Landing Page
│   ├── diagnostico.tsx            # Página do Quiz/Funil
│   └── notFound.tsx               # Página 404
├── App.css                        # [ÓRFÃO] CSS residual do template padrão do Vite
├── App.tsx                        # Provedores globais e mapeamento de rotas
├── index.css                      # Tailwind, import de fonte e paleta OKLCH
└── main.tsx                       # Inicialização React DOM
```

### Rotas Ativas (`src/App.tsx#L20-L24`)
* `/` ➔ `Index` (`src/pages/index.tsx`): Página principal de captura e vendas.
* `/diagnostico` ➔ `Diagnostico` (`src/pages/diagnostico.tsx`): Funil interativo em 5 pilares com geração de lead qualificado.
* `*` ➔ `NotFound` (`src/pages/notFound.tsx`): Tela de erro 404.

---

## 3. Mapeamento de Fluxos de Conversão, Formulários e CTAs

### A. Agenda Virtual Externa (`https://minhaagendavirtual.com.br/educandoseubolso`)
* [`Header.tsx:68`](landing-consultoria/landing-page/src/components/Header.tsx#L68) — CTA desktop no header ("Agendar Consulta").
* [`Header.tsx:116`](landing-consultoria/landing-page/src/components/Header.tsx#L116) — CTA dentro do drawer de menu mobile ("Agendar Consulta").
* [`HeroSection.tsx:84`](landing-consultoria/landing-page/src/components/HeroSection.tsx#L84) — CTA secundário no Hero ("Agendar consulta").
* [`AboutSection.tsx:62`](landing-consultoria/landing-page/src/components/AboutSection.tsx#L62) — CTA principal da seção Sobre ("Agendar Consultoria").
* [`CTASection.tsx:81`](landing-consultoria/landing-page/src/components/CTASection.tsx#L81) — CTA primário do card final ("Agendar Consultoria").
* [`Footer.tsx:76`](landing-consultoria/landing-page/src/components/Footer.tsx#L76) — Link textual na coluna Empresa ("Consultoria").

### B. Contato Direto via WhatsApp (`(31) 99918-9537`)
* [`AboutSection.tsx:77`](landing-consultoria/landing-page/src/components/AboutSection.tsx#L77) — Botão "Falar no WhatsApp" (*Atenção: protocolo inseguro `http://wa.me/`*).
* [`CTASection.tsx:92`](landing-consultoria/landing-page/src/components/CTASection.tsx#L92) — Botão "Falar no WhatsApp" (*Atenção: protocolo inseguro `http://wa.me/`*).
* [`Footer.tsx:21`](landing-consultoria/landing-page/src/components/Footer.tsx#L21) — Telefone com link para WhatsApp no rodapé.
* [`Footer.tsx:98`](landing-consultoria/landing-page/src/components/Footer.tsx#L98) — Link de WhatsApp na listagem de canais do rodapé.
* [`DiagnosticoLeadForm.tsx:18-23 e 75`](landing-consultoria/landing-page/src/components/diagnostico/DiagnosticoLeadForm.tsx#L18-L23) — Redirecionamento dinâmico após preenchimento do lead com mensagem personalizada:
  > *"Olá, meu nome é [Nome]. Acabei de fazer o diagnóstico de saúde financeira e fiquei na zona de [urgência/vulnerabilidade/bem-estar]. Gostaria de agendar minha consultoria."*

### C. Direcionamento Interno para `/diagnostico`
* [`HeroSection.tsx:71`](landing-consultoria/landing-page/src/components/HeroSection.tsx#L71) — CTA primário no Hero ("Fazer diagnóstico gratuito").
* [`DiagnosticoTeaser.tsx:53`](landing-consultoria/landing-page/src/components/DiagnosticoTeaser.tsx#L53) — CTA no teaser central da Home ("Fazer diagnóstico gratuito").
* [`CTASection.tsx:101`](landing-consultoria/landing-page/src/components/CTASection.tsx#L101) — CTA de quebra de objeção no card final ("Ainda em dúvida? Faça o diagnóstico gratuito").
* [`MobileCtaBar.tsx:25`](landing-consultoria/landing-page/src/components/MobileCtaBar.tsx#L25) — Barra fixa flutuante no rodapé mobile, com `IntersectionObserver` que a oculta quando a seção `#contato` entra na tela.
* [`Header.tsx:11`](landing-consultoria/landing-page/src/components/Header.tsx#L11) e [`Footer.tsx:65`](landing-consultoria/landing-page/src/components/Footer.tsx#L65) — Links de menu e rodapé.

### D. Formulários e Coleta de Dados
1. **Entrada do Quiz:** [`DiagnosticoIntro.tsx:65-79`](landing-consultoria/landing-page/src/components/diagnostico/DiagnosticoIntro.tsx#L65-L79) — Campo de texto para primeiro nome com disparo via botão ou tecla `Enter`.
2. **Seleção de Respostas:** [`DiagnosticoQuestion.tsx:58-82`](landing-consultoria/landing-page/src/components/diagnostico/DiagnosticoQuestion.tsx#L58-L82) — Botões com estado de seleção e navegação avançar/voltar.
3. **Captura do Lead:** [`DiagnosticoLeadForm.tsx:90-126`](landing-consultoria/landing-page/src/components/diagnostico/DiagnosticoLeadForm.tsx#L90-L126) — Modal com validação Zod contendo:
   * `name` (string não vazia)
   * `email` (formato de e-mail válido)
   * `phone` (mínimo de 8 caracteres com DDD)
   * `consent` (checkbox obrigatório de LGPD)

### E. Integrações com APIs Externas
* **Base URL:** `VITE_API_URL` com fallback para `https://backend.educandoseubolso.blog.br` ([`diagnostico-api.ts:3-5`](landing-consultoria/landing-page/src/lib/diagnostico-api.ts#L3-L5)). Corresponde ao serviço `bolsito-api` do ecossistema de marketing.
* **Criação de Submissão:** `POST /diagnostico/submissions` ([`diagnostico-api.ts:25`](landing-consultoria/landing-page/src/lib/diagnostico-api.ts#L25)) — Acionado automaticamente em [`diagnostico.tsx:31-48`](landing-consultoria/landing-page/src/pages/diagnostico.tsx#L31-L48) quando o usuário atinge a tela de resultado para salvar o score e obter o `submissionId`.
* **Anexação de Lead:** `PATCH /diagnostico/submissions/:id/lead` ([`diagnostico-api.ts:39`](landing-consultoria/landing-page/src/lib/diagnostico-api.ts#L39)) — Acionado em [`diagnostico.tsx:58-70`](landing-consultoria/landing-page/src/pages/diagnostico.tsx#L58-L70) quando o formulário modal é submetido.

### F. Relação com o `appconsultoria` (`app-financas-consultoria`)
* **INEXISTENTE:** Não existe compartilhamento de sessão, token JWT, link para área logada ou passagem de parâmetros para o aplicativo da consultoria (`consultoria-app-front` ou `consultoria-app-api`).

---

## 4. O que é Estático vs. Dinâmico

* **Conteúdo 100% Estático (Hardcoded no Bundle):**
  * Toda a cópia da Home: títulos, proposta de valor, estatísticas, cards de serviço ([`ServicesSection.tsx`](landing-consultoria/landing-page/src/components/ServicesSection.tsx)) e seção Sobre ([`AboutSection.tsx`](landing-consultoria/landing-page/src/components/AboutSection.tsx)).
  * A totalidade do questionário de diagnóstico: 12 perguntas, regras de ramificação, cálculo de pontuação e matriz de diagnósticos Verde/Amarelo/Vermelho ([`diagnostico-data.ts`](landing-consultoria/landing-page/src/components/diagnostico/diagnostico-data.ts)).
  * Depoimentos de clientes ([`TestimonialsSection.tsx`](landing-consultoria/landing-page/src/components/TestimonialsSection.tsx)).
  * **Sem CMS:** Não consome Headless CMS nem endpoints de conteúdo.
* **Conteúdo Dinâmico:**
  * Exclusivamente a transmissão de respostas e dados de contato para a `bolsito-api` (`POST` e `PATCH` de submissão).

---

## 5. Débitos Técnicos Rápidos e Oportunidades de CRO

### A. CRO & Experiência do Usuário (Quick Wins de Conversão)
1. **Recuperação de Prova Social Oculta:** O componente [`TestimonialsSection.tsx`](landing-consultoria/landing-page/src/components/TestimonialsSection.tsx) está pronto e estilizado com 3 depoimentos, notas de avaliação e layout em cards, mas **não foi incluído na Home** ([`index.tsx`](landing-consultoria/landing-page/src/pages/index.tsx)). Sua reinserção traz ganho imediato de autoridade.
2. **Eliminação de Falso CTA:** Em [`ServicesSection.tsx:123`](landing-consultoria/landing-page/src/components/ServicesSection.tsx#L123), o elemento "Saiba mais" é apenas visual (uma `<div>` estilizada sem link). Deve ser transformado em âncora para a agenda ou para o diagnóstico.
3. **Instrumentação de Analytics e Tags:** Inexistência de eventos de conversão no Google Analytics ou GTM ao clicar nos botões da agenda externa e do WhatsApp, gerando cegueira analítica sobre a taxa de conversão real da página.

### B. SEO Técnico e Conformidade
1. **Atributo `lang` Incorreto:** [`index.html:2`](landing-consultoria/landing-page/index.html#L2) possui `<html lang="en">`. Deve ser corrigido para `lang="pt-BR"`.
2. **Ausência Crítica de Metadados:** Falta de `<meta name="description">`, Open Graph (`og:title`, `og:image`, `og:description`), Twitter Card e tag `canonical` no [`index.html`](landing-consultoria/landing-page/index.html), prejudicando o ranqueamento orgânico e o preview ao compartilhar o link em redes e mensageiros.
3. **Página 404 em Inglês e Reload Completo:** [`notFound.tsx:15-17`](landing-consultoria/landing-page/src/pages/notFound.tsx#L15-L17) com mensagens em inglês (*"Oops! Page not found"*, *"Return to Home"*) e utilizando tag `<a href="/">` que quebra o ciclo da SPA, em vez de `<Link to="/">`.
4. **Link Quebrado no Rodapé:** [`Footer.tsx:129`](landing-consultoria/landing-page/src/components/Footer.tsx#L129) contém `<a href="#">Privacidade</a>` sem destino real.

### C. Performance e Código
1. **Bloqueio de Renderização por Fonte Externa:** [`index.css:1`](landing-consultoria/landing-page/src/index.css#L1) carrega Plus Jakarta Sans via `@import url(...)`, o que bloqueia o parsing do CSS. Recomenda-se pré-carregar via `<link rel="preload">` no HTML ou empacotar via pacote npm `@fontsource`.
2. **Bundle Bloat (Inchaço de Dependências):** Pacotes como `recharts`, `cmdk`, `vaul`, `input-otp`, `embla-carousel-react`, `react-day-picker` e `react-resizable-panels` estão instalados mas não são importados em nenhum componente ativo da landing page.
3. **Limpeza de Componentes Radix Mortos:** A pasta `src/components/ui/` contém 57 arquivos gerados por CLI, dos quais mais de 50 são código morto.
4. **Duplicação de Toasters:** [`App.tsx:16-17`](landing-consultoria/landing-page/src/App.tsx#L16-L17) renderiza `<Toaster />` e `<Sonner />` em duplicidade na raiz da aplicação.
5. **Protocolo Inseguro em Links Externos:** Os links de WhatsApp em [`AboutSection.tsx:77`](landing-consultoria/landing-page/src/components/AboutSection.tsx#L77) e [`CTASection.tsx:92`](landing-consultoria/landing-page/src/components/CTASection.tsx#L92) usam `http://wa.me/` em vez de `https://wa.me/`, o que pode disparar alertas de conexão mista no navegador.
6. **Otimização do Container Docker:** O [`Dockerfile`](landing-consultoria/landing-page/Dockerfile) roda `node:25-alpine` com `serve -s dist` em estágio único (~400MB). Uma migração para Multi-Stage Build com `nginx:alpine` reduz a imagem para ~25MB e melhora a compressão gzip/brotli dos assets estáticos.
