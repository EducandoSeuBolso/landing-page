# Diagnóstico de Saúde Financeira — Design

**Data:** 2026-07-08
**Repos afetados:** `landing-page` (React/Vite) e `bolsito-api` (NestJS/Prisma)
**Status:** Aprovado

## Objetivo

Portar o mockup standalone `landing-page/diagnostico-saude-financeira.html` (HTML/JS vanilla, tema
dark verde+dourado) para uma rota React dentro da landing page, reestilizada com o **tema claro da
marca** (tokens creme/azul/laranja de `src/index.css`). Persistir os resultados do questionário e os
leads que o preencherem na `bolsito-api`.

Referências visuais fornecidas pelo cliente:
- **Image #1** — nova tela inicial (intro) do diagnóstico.
- **Image #2** — telas de resultado por zona (vermelha / amarela / verde).

## Decisões (confirmadas com o cliente)

1. **Tema visual:** adaptar ao **tema claro** da landing (não manter o dark do mockup). As cores
   semânticas vermelho/amarelo/verde das zonas permanecem como acento sobre superfície clara.
2. **Captura de lead:** apenas o primeiro nome na intro; e-mail/WhatsApp capturados **no CTA final**
   (pós-resultado), ao clicar em "Agendar minha consultoria".
3. **Persistência:** novo módulo na `bolsito-api` + **1 model Prisma** que guarda respostas, score,
   zona e dados do lead na mesma linha.
4. **CTA:** redireciona para o **WhatsApp já usado na landing** (`5531999189537`) com mensagem
   pré-preenchida (nome + zona).
5. **Cálculo do score:** permanece **no frontend**, exatamente como no arquivo atual. **O servidor
   apenas salva** o resultado recebido — não recalcula nada.
6. **Visual da intro:** montar com ícones/cards estilizados (mais sóbrio), sem depender de asset
   externo do baú; refinar iterativamente durante a implementação.

## Frontend (`landing-page`)

Nova rota `/diagnostico` em `src/App.tsx` → `src/pages/diagnostico.tsx`.

Componentes em `src/components/diagnostico/`:

- **`diagnostico-data.ts`** — dados puros portados do HTML: `questions`, `scaleOptions`,
  `scaleInvOptions`, `DIM_MAX`, `TOTAL_MAX`, `tierContent`, `dimLabels`. Fonte única do questionário.
- **`useDiagnostico.ts`** — hook com a máquina de estados (intro → perguntas → resultado), `answers`,
  `visibleQuestions()` (perguntas condicionais como `q7b`), `computeResults()` (mesma lógica atual:
  soma total, totais por dimensão, tier por faixa `<=10 verde`, `<=20 amarelo`, senão `vermelho`).
- **`DiagnosticoIntro.tsx`** — layout da Image #1 no tema claro: eyebrow, headline, subcopy, faixa de
  features (Rápido / Personalizado / Seguro / Prático), input de nome (opcional), botão "Começar
  diagnóstico". Visual lateral montado com cards/ícones lucide sobre gradiente da marca.
- **`DiagnosticoQuestion.tsx`** — barra de progresso, rótulo de dimensão, texto, opções selecionáveis,
  botões Voltar/Próxima (última pergunta → "Ver resultado").
- **`DiagnosticoResult.tsx`** — card da **zona do usuário** (uma só, conforme o tier), estilo Image #2
  adaptado ao claro: badge da zona, título "Você está em *[zona]* financeira", ícone
  (sirene/alerta/check), descrição, barra "Seu diagnóstico" (100%), submensagem, botão "Agendar minha
  consultoria". Inclui breakdown por dimensão e link "Refazer o diagnóstico".
- **`DiagnosticoLeadForm.tsx`** — acionado pelo CTA: nome (pré-preenchido), e-mail, WhatsApp,
  consentimento. `react-hook-form` + `zod` (já nas deps). No submit: envia lead à API e redireciona ao
  WhatsApp.
- **`src/lib/diagnostico-api.ts`** — client `fetch` + mutations TanStack Query. Base URL via
  `import.meta.env.VITE_API_URL` com fallback para a API de produção.

Componentes shadcn/ui e tokens existentes (`Button`, `Input`, `Progress`, etc.).

### Fluxo de persistência

1. **Ao renderizar o resultado:** `POST /diagnostico/submissions` com
   `{ name, answers, dimScores: { urgencia, vulnerabilidade, bemestar }, total, tier, contactReason }`
   → retorna `{ id }`. Salva o resultado mesmo que o usuário não vire lead.
2. **No submit do lead (CTA):** `PATCH /diagnostico/submissions/:id/lead` com
   `{ email, phone, consent }` → enriquece a mesma linha (`leadCapturedAt`). Em seguida abre o
   WhatsApp com mensagem pré-preenchida.

Falha de rede na etapa 1/2 não deve travar a UX: o usuário ainda vê o resultado e consegue ir ao
WhatsApp; o erro é logado silenciosamente.

## Backend (`bolsito-api`)

Novo módulo `src/diagnostico/` seguindo o padrão feature-per-module dos simulators
(`controller` + `service` + `module` + `dto/`).

### Endpoints

- `POST /diagnostico/submissions` — `@Public()` + `@Throttle`. Valida o corpo via DTO e **salva o
  resultado recebido do client como está** (sem recálculo). Retorna `{ id }`.
- `PATCH /diagnostico/submissions/:id/lead` — `@Public()` + `@Throttle`. Anexa contato do lead
  (`email`, `phone`, `consent`) e seta `leadCapturedAt`.

Registrar `DiagnosticoModule` em `src/app.module.ts`. Garantir que o origin da landing page esteja em
`configService.corsOrigins`.

### Model Prisma (`DiagnosticoSubmission`) — 1 model novo

| Campo | Tipo | Notas |
|---|---|---|
| `id` | String @id (uuid) | |
| `createdAt` | DateTime @default(now()) | |
| `updatedAt` | DateTime @updatedAt | |
| `name` | String? | primeiro nome informado na intro |
| `answers` | Json | mapa de respostas cru |
| `dimUrgencia` | Int | total da dimensão |
| `dimVulnerabilidade` | Int | total da dimensão |
| `dimBemestar` | Int | total da dimensão |
| `totalScore` | Int | soma calculada no frontend |
| `tier` | String | `verde` \| `amarelo` \| `vermelho` |
| `contactReason` | String? | motivo (q8) |
| `email` | String? | preenchido no CTA |
| `phone` | String? | preenchido no CTA |
| `consent` | Boolean @default(false) | |
| `leadCapturedAt` | DateTime? | setado quando vira lead |
| `source` | String @default("landing-page") | |

Migration via `prisma migrate`. Observação: expande o schema em 1 model — dentro da cautela do
CLAUDE.md por ser feature nova e necessária, com apenas um model.

## Testes

- **Backend:** Jest unit no serviço (persistência + patch de lead) e e2e nos 2 endpoints (`pnpm test`).
- **Frontend:** subir `pnpm dev` e exercitar intro → perguntas → resultado → lead → WhatsApp no
  browser antes de dar como concluído (regra do CLAUDE.md para mudanças de UI).

## Fora de escopo (agora)

- Dashboard admin para visualizar submissões.
- Automação de e-mail/Mautic ao criar lead (pode plugar no `MauticModule` depois).
- Ilustração final da intro (asset do baú) — placeholder estilizado por ora.
