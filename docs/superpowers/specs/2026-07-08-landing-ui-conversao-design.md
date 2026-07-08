# Landing Page — UI, Responsividade e Conversão

**Data:** 2026-07-08
**Escopo:** `landing-page/` (Vite + React 19 + Tailwind 4, SPA)

## Objetivo

Aumentar a extração de leads da landing page com quatro frentes: navegação funcional entre rotas, paridade visual estrita com o bolsito-frontend, fluxo de diagnóstico 100% responsivo e hierarquia de CTAs orientada ao funil frio/quente.

## Decisões de produto (validadas com o usuário)

- **Tráfego principal:** orgânico/SEO + links do site principal e redes sociais.
- **Lead em funil:** o diagnóstico captura o contato frio (email/telefone); o agendamento de consulta (minhaagendavirtual → WhatsApp) converte o lead quente.
- **Estrutura:** híbrida — home permanece single-page com seções ancoradas; `/diagnostico` permanece rota dedicada. **Não** transformar seções em páginas: sem SSR/prerender uma SPA Vite não ganha SEO com rotas extras, e páginas separadas adicionam cliques ao funil. (SEO hardening — prerender, meta por rota, sitemap — fica registrado como possível fase futura, fora deste escopo.)
- **Estilo:** paridade estrita com bolsito-frontend (CTA laranja sólido `#FF8A00`, gradiente de texto só azul).
- **Barra de CTA fixa no mobile:** aprovada para a home.

## 1. Navegação

**Problema:** os links da navbar (`Header.tsx`) usam âncoras relativas (`#inicio`, `#servicos`…). A partir de `/diagnostico` essas âncoras não existem na página, então o usuário não consegue voltar para a home.

**Solução:**

- Trocar todos os `href` de âncora por âncoras absolutas: `/#inicio`, `/#servicos`, `/#sobre`, `/#contato`. Logo idem (`/#inicio`).
- Novo componente `ScrollToHash` (montado dentro do `BrowserRouter` em `App.tsx`): a cada mudança de location, se houver hash, faz `scrollIntoView({ behavior: "smooth" })` no elemento alvo (aguardando o mount da home); sem hash, rola para o topo.
- "Diagnóstico" continua `<Link to="/diagnostico">`.

**Critério de aceite:** de `/diagnostico`, clicar em qualquer item da navbar leva à home e rola até a seção correta, em desktop e mobile.

## 2. Paridade de estilo com bolsito-frontend

Os tokens OKLCH em `src/index.css` já são idênticos aos de `bolsito-frontend/app/globals.css`. As divergências restantes:

| Item | Landing (hoje) | Alvo (= bolsito-frontend) |
|---|---|---|
| `.gradient-text-blue-orange` | azul→laranja | só azul: `#064e72 → #0e87c6 → #2ea3d9` |
| `.gradient-bg-blue-orange` | gradiente azul→laranja | laranja sólido `#FF8A00` |
| CTAs do Header (desktop e mobile) | `style` inline com gradiente | classe `gradient-bg-blue-orange` |

- Grep por `linear-gradient` inline em todos os componentes (Hero, CTA, Footer, diagnóstico) e migrar para as utilities.
- Adicionar `.gradient-text-orange-blue` se algum componente precisar (existe no frontend).
- **Critério de aceite:** validação visual no browser lado a lado com educandoseubolso.blog.br — botões, títulos gradientes, cartões e sombras indistinguíveis do site principal.

## 3. Diagnóstico 100% responsivo

**Método:** auditoria com Playwright em 360px, 768px, 1024px e 1440px cobrindo o fluxo completo: intro → perguntas → resultado → formulário de lead. Cada problema encontrado vira correção; screenshots antes/depois.

**Correções já previstas:**

- **Desktop subaproveitado:** o cartão único trava em `max-w-3xl` (`pages/diagnostico.tsx`). A tela de resultado passa a 2 colunas em `lg:` (score geral + visualização à esquerda; dimensões + CTA à direita) com container até `max-w-5xl`. Intro e perguntas podem crescer para `max-w-4xl` se a auditoria confirmar folga.
- **Mobile estourando:** paddings escalonados (`p-4 sm:p-6 md:p-10`), botões `w-full` abaixo de `sm`, chips e scores com `flex-wrap`, tipografia com degraus menores abaixo de `sm`.
- **Formulário de lead:** dialog permanece no desktop; no mobile, garantir que o teclado não cubra campos e alvos de toque ≥ 44px.

**Critério de aceite:** nenhum overflow horizontal em 360px; sem faixa morta excessiva em 1440px; fluxo completável com teclado aberto no mobile.

## 4. Otimização de conversão (funil frio/quente)

- **Hero:** CTA primário "Fazer diagnóstico gratuito" → `/diagnostico` (frio, baixo atrito); CTA secundário "Agendar consulta" → minhaagendavirtual (quente).
- **CTASection / Footer:** diagnóstico como primeiro passo natural; agendamento como atalho para quem já decidiu.
- **Resultado do diagnóstico:** mantém o fluxo existente (formulário de lead → WhatsApp).
- **Barra fixa mobile (home):** barra no rodapé em `<md` com CTA "Diagnóstico gratuito" → `/diagnostico`; some quando a CTASection/Footer está visível para não duplicar CTA na mesma viewport.

**Critério de aceite:** em qualquer ponto da home, mobile ou desktop, há exatamente um caminho primário visível para `/diagnostico` e um secundário para agendamento.

## Fora de escopo

- SEO hardening (prerender, meta por rota, sitemap) — fase futura.
- Alterações em `bolsito-frontend` ou nos demais serviços.
- Mudanças de conteúdo/copy além dos rótulos de CTA citados.

## Testes e verificação

- Auditoria Playwright (breakpoints acima) com screenshots antes/depois.
- `pnpm lint` e `pnpm build` limpos.
- Verificação manual do fluxo de navegação (navbar de `/diagnostico` → home → seções).

## Adendo (2026-07-08, mid-execução — aprovado pelo usuário)

1. **Navbar maior:** o usuário reportou a navbar pequena demais; escala tipográfica e de espaçamento sobe um degrau (barra, links, logo, CTA). Estilo glass e comportamento inalterados.
2. **Seção-teaser do diagnóstico na home:** nova seção `#diagnostico` entre Serviços e Sobre — eyebrow, título com gradiente, "3 minutos · gratuito", chips dos 5 pilares avaliados e CTA laranja → `/diagnostico`. Decisão: NÃO embutir o fluxo inline na home (página longa demais, funil imensurável); `/diagnostico` segue página dedicada.
