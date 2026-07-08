# Diagnóstico de Saúde Financeira — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Portar o mockup `diagnostico-saude-financeira.html` para uma rota React na landing page (tema claro da marca) e persistir resultados + leads na `bolsito-api`.

**Architecture:** Duas partes em repos separados. **Backend** (`bolsito-api`, NestJS/Prisma): novo módulo `diagnostico` com 1 model Prisma e dois endpoints públicos — `POST /diagnostico/submissions` (salva o resultado calculado no client, **sem recalcular**) e `PATCH /diagnostico/submissions/:id/lead` (anexa contato). **Frontend** (`landing-page`, Vite/React 19): rota `/diagnostico` com máquina de estados intro → perguntas → resultado, lógica de score portada 1:1 do HTML, e captura de lead no CTA que redireciona pro WhatsApp.

**Tech Stack:** NestJS 11, Prisma 7 (Postgres, migrations SQL manuais), Jest · React 19, Vite 7, React Router 7, Tailwind 4, shadcn/ui, TanStack Query, react-hook-form, zod.

## Global Constraints

- **Package manager:** `pnpm` em ambos os repos.
- **Backend caminho de trabalho:** `/Users/lorenzogreiribeiro/Documents/repos/educando-seu-bolso/bolsito-api`.
- **Frontend caminho de trabalho:** `/Users/lorenzogreiribeiro/Documents/repos/educando-seu-bolso/landing-page` (branch `feat/diagnostico-saude-financeira`).
- **ValidationPipe global** na API usa `whitelist: true` + `forbidNonWhitelisted: true` — o corpo enviado pelo client NÃO pode conter propriedades fora do DTO, senão retorna 400.
- **Migrations:** SQL manual idempotente em `bolsito-api/prisma/migrations/manual/NNNN_*.sql` (padrão `0001_create_tracking_event.sql`). NÃO usar `prisma migrate`. Após editar o schema, rodar `pnpm prisma generate`.
- **Endpoints públicos:** decorar com `@Public()` (de `../common`) para pular o `JwtAuthGuard` global.
- **Cálculo do score:** permanece no frontend (portado do HTML). O servidor apenas persiste os valores recebidos.
- **Não** rodar `git push`, force-push nem migrations destrutivas.
- **WhatsApp de contato:** `5531999189537` (já usado na landing).
- **Zonas/tiers:** `verde` (total ≤ 10), `amarelo` (total ≤ 20), `vermelho` (> 20). `DIM_MAX = { urgencia: 29, vulnerabilidade: 16, bemestar: 16 }`, `TOTAL_MAX = 65`.

---

## FASE 1 — Backend (`bolsito-api`)

### Task 1: Model Prisma + migration SQL

**Files:**
- Modify: `bolsito-api/prisma/schema.prisma` (append no fim do arquivo)
- Create: `bolsito-api/prisma/migrations/manual/0002_create_diagnostico_submission.sql`

**Interfaces:**
- Produces: model Prisma `DiagnosticoSubmission` → gera o accessor `prisma.diagnosticoSubmission` usado pelo service na Task 3. Colunas: `id, createdAt, updatedAt, name, answers, dimUrgencia, dimVulnerabilidade, dimBemestar, totalScore, tier, contactReason, email, phone, consent, leadCapturedAt, source`.

- [ ] **Step 1: Adicionar o model ao schema**

Append ao final de `bolsito-api/prisma/schema.prisma`:

```prisma
/// Resultados do Diagnóstico de Saúde Financeira (landing page) + leads.
model DiagnosticoSubmission {
  id                 String    @id @default(uuid()) @db.Uuid
  createdAt          DateTime  @default(now()) @db.Timestamptz(6) @map("created_at")
  updatedAt          DateTime  @updatedAt @db.Timestamptz(6) @map("updated_at")
  name               String?   @db.VarChar(120)
  answers            Json
  dimUrgencia        Int       @map("dim_urgencia")
  dimVulnerabilidade Int       @map("dim_vulnerabilidade")
  dimBemestar        Int       @map("dim_bemestar")
  totalScore         Int       @map("total_score")
  tier               String    @db.VarChar(16)
  contactReason      String?   @db.VarChar(64) @map("contact_reason")
  email              String?   @db.VarChar(255)
  phone              String?   @db.VarChar(32)
  consent            Boolean   @default(false)
  leadCapturedAt     DateTime? @db.Timestamptz(6) @map("lead_captured_at")
  source             String    @default("landing-page") @db.VarChar(32)

  @@index([createdAt])
  @@index([tier, createdAt])
  @@index([leadCapturedAt])
  @@map("diagnostico_submission")
}
```

- [ ] **Step 2: Escrever a migration SQL manual**

Create `bolsito-api/prisma/migrations/manual/0002_create_diagnostico_submission.sql`:

```sql
-- Resultados do Diagnóstico de Saúde Financeira (landing page) + leads.
-- Apply against the target database before deploying the DiagnosticoModule.
-- Idempotent: safe to re-run.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS diagnostico_submission (
  id                  UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at          TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ  NOT NULL DEFAULT now(),
  name                VARCHAR(120),
  answers             JSONB        NOT NULL,
  dim_urgencia        INTEGER      NOT NULL,
  dim_vulnerabilidade INTEGER      NOT NULL,
  dim_bemestar        INTEGER      NOT NULL,
  total_score         INTEGER      NOT NULL,
  tier                VARCHAR(16)  NOT NULL,
  contact_reason      VARCHAR(64),
  email               VARCHAR(255),
  phone               VARCHAR(32),
  consent             BOOLEAN      NOT NULL DEFAULT false,
  lead_captured_at    TIMESTAMPTZ,
  source              VARCHAR(32)  NOT NULL DEFAULT 'landing-page'
);

CREATE INDEX IF NOT EXISTS idx_diagnostico_created      ON diagnostico_submission (created_at);
CREATE INDEX IF NOT EXISTS idx_diagnostico_tier_created ON diagnostico_submission (tier, created_at);
CREATE INDEX IF NOT EXISTS idx_diagnostico_lead         ON diagnostico_submission (lead_captured_at);
```

- [ ] **Step 3: Regenerar o Prisma Client**

Run: `cd bolsito-api && pnpm prisma generate`
Expected: `Generated Prisma Client` sem erros; o accessor `diagnosticoSubmission` passa a existir nos tipos.

- [ ] **Step 4: Validar o schema**

Run: `cd bolsito-api && pnpm prisma validate`
Expected: `The schema at prisma/schema.prisma is valid 🚀`

- [ ] **Step 5: Commit**

```bash
cd bolsito-api
git add prisma/schema.prisma prisma/migrations/manual/0002_create_diagnostico_submission.sql
git commit -m "feat(diagnostico): add DiagnosticoSubmission model + manual migration"
```

---

### Task 2: DTOs

**Files:**
- Create: `bolsito-api/src/diagnostico/dto/create-submission.dto.ts`
- Create: `bolsito-api/src/diagnostico/dto/attach-lead.dto.ts`
- Create: `bolsito-api/src/diagnostico/dto/index.ts`

**Interfaces:**
- Produces:
  - `DimScoresDto { urgencia: number; vulnerabilidade: number; bemestar: number }`
  - `CreateSubmissionDto { name?: string; answers: Record<string, unknown>; dimScores: DimScoresDto; total: number; tier: 'verde'|'amarelo'|'vermelho'; contactReason?: string }`
  - `AttachLeadDto { email?: string; phone?: string; consent?: boolean }`
  - `DIAGNOSTICO_TIERS = ['verde','amarelo','vermelho'] as const`
- Consumes: `class-validator`, `class-transformer`, `@nestjs/swagger` (já instalados).

- [ ] **Step 1: Criar `create-submission.dto.ts`**

```ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export const DIAGNOSTICO_TIERS = ['verde', 'amarelo', 'vermelho'] as const;
export type DiagnosticoTier = (typeof DIAGNOSTICO_TIERS)[number];

export class DimScoresDto {
  @ApiProperty()
  @IsInt()
  @Min(0)
  @Max(200)
  urgencia: number;

  @ApiProperty()
  @IsInt()
  @Min(0)
  @Max(200)
  vulnerabilidade: number;

  @ApiProperty()
  @IsInt()
  @Min(0)
  @Max(200)
  bemestar: number;
}

/** Resultado calculado no frontend. O servidor apenas persiste. */
export class CreateSubmissionDto {
  @ApiPropertyOptional({ description: 'Primeiro nome informado na intro.' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @ApiProperty({ description: 'Mapa cru de respostas (id -> valor).' })
  @IsObject()
  answers: Record<string, unknown>;

  @ApiProperty({ type: DimScoresDto })
  @ValidateNested()
  @Type(() => DimScoresDto)
  dimScores: DimScoresDto;

  @ApiProperty({ description: 'Score total somado no frontend.' })
  @IsInt()
  @Min(0)
  @Max(500)
  total: number;

  @ApiProperty({ enum: DIAGNOSTICO_TIERS })
  @IsIn(DIAGNOSTICO_TIERS)
  tier: DiagnosticoTier;

  @ApiPropertyOptional({ description: 'Motivo da busca por orientação (q8).' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  contactReason?: string;
}
```

- [ ] **Step 2: Criar `attach-lead.dto.ts`**

```ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

/** Contato do lead, capturado no CTA pós-resultado. Todos opcionais no
 *  servidor — o frontend é quem exige e-mail/telefone via zod. */
export class AttachLeadDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @ApiPropertyOptional({ description: 'WhatsApp/telefone em texto livre.' })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  consent?: boolean;
}
```

- [ ] **Step 3: Criar barrel `dto/index.ts`**

```ts
export * from './create-submission.dto';
export * from './attach-lead.dto';
```

- [ ] **Step 4: Verificar compilação de tipos**

Run: `cd bolsito-api && pnpm exec tsc --noEmit -p tsconfig.json`
Expected: sem erros relacionados aos DTOs.

- [ ] **Step 5: Commit**

```bash
cd bolsito-api
git add src/diagnostico/dto
git commit -m "feat(diagnostico): add submission and lead DTOs"
```

---

### Task 3: Service + testes unitários

**Files:**
- Create: `bolsito-api/src/diagnostico/diagnostico.service.ts`
- Test: `bolsito-api/src/diagnostico/diagnostico.service.spec.ts`

**Interfaces:**
- Consumes: `PrismaService` de `../core/database`; `CreateSubmissionDto`, `AttachLeadDto` de `./dto`.
- Produces:
  - `DiagnosticoService.createSubmission(dto: CreateSubmissionDto): Promise<{ id: string }>`
  - `DiagnosticoService.attachLead(id: string, dto: AttachLeadDto): Promise<void>` — lança `NotFoundException` se o id não existir.

- [ ] **Step 1: Escrever o teste que falha**

Create `bolsito-api/src/diagnostico/diagnostico.service.spec.ts`:

```ts
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../core/database';
import { DiagnosticoService } from './diagnostico.service';
import { CreateSubmissionDto } from './dto';

describe('DiagnosticoService', () => {
  let service: DiagnosticoService;
  const prisma = {
    diagnosticoSubmission: {
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  const baseDto: CreateSubmissionDto = {
    name: 'João',
    answers: { u1: 4, u2: 2 },
    dimScores: { urgencia: 12, vulnerabilidade: 6, bemestar: 3 },
    total: 21,
    tier: 'vermelho',
    contactReason: 'dividas',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DiagnosticoService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get(DiagnosticoService);
  });

  afterEach(() => jest.clearAllMocks());

  it('maps dimScores to columns and returns the new id', async () => {
    prisma.diagnosticoSubmission.create.mockResolvedValue({ id: 'abc-123' });

    const result = await service.createSubmission(baseDto);

    expect(result).toEqual({ id: 'abc-123' });
    expect(prisma.diagnosticoSubmission.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        name: 'João',
        answers: { u1: 4, u2: 2 },
        dimUrgencia: 12,
        dimVulnerabilidade: 6,
        dimBemestar: 3,
        totalScore: 21,
        tier: 'vermelho',
        contactReason: 'dividas',
      }),
      select: { id: true },
    });
  });

  it('attachLead updates contact fields and sets leadCapturedAt', async () => {
    prisma.diagnosticoSubmission.update.mockResolvedValue({ id: 'abc-123' });

    await service.attachLead('abc-123', {
      email: 'joao@example.com',
      phone: '5531999999999',
      consent: true,
    });

    const call = prisma.diagnosticoSubmission.update.mock.calls[0][0];
    expect(call.where).toEqual({ id: 'abc-123' });
    expect(call.data).toEqual(
      expect.objectContaining({
        email: 'joao@example.com',
        phone: '5531999999999',
        consent: true,
      }),
    );
    expect(call.data.leadCapturedAt).toBeInstanceOf(Date);
  });

  it('attachLead throws NotFoundException when the id is unknown', async () => {
    const prismaErr = Object.assign(new Error('not found'), { code: 'P2025' });
    prisma.diagnosticoSubmission.update.mockRejectedValue(prismaErr);

    await expect(
      service.attachLead('missing', { email: 'x@y.com' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
```

- [ ] **Step 2: Rodar o teste e confirmar que falha**

Run: `cd bolsito-api && pnpm test -- diagnostico.service`
Expected: FAIL — `Cannot find module './diagnostico.service'`.

- [ ] **Step 3: Implementar o service**

Create `bolsito-api/src/diagnostico/diagnostico.service.ts`:

```ts
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../core/database';
import { AttachLeadDto, CreateSubmissionDto } from './dto';

@Injectable()
export class DiagnosticoService {
  private readonly logger = new Logger(DiagnosticoService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Persiste o resultado calculado no frontend. Não recalcula nada. */
  async createSubmission(dto: CreateSubmissionDto): Promise<{ id: string }> {
    const created = await this.prisma.diagnosticoSubmission.create({
      data: {
        name: dto.name ?? null,
        answers: dto.answers as Prisma.InputJsonValue,
        dimUrgencia: dto.dimScores.urgencia,
        dimVulnerabilidade: dto.dimScores.vulnerabilidade,
        dimBemestar: dto.dimScores.bemestar,
        totalScore: dto.total,
        tier: dto.tier,
        contactReason: dto.contactReason ?? null,
      },
      select: { id: true },
    });
    return { id: created.id };
  }

  /** Anexa o contato do lead à submissão existente. */
  async attachLead(id: string, dto: AttachLeadDto): Promise<void> {
    try {
      await this.prisma.diagnosticoSubmission.update({
        where: { id },
        data: {
          email: dto.email ?? null,
          phone: dto.phone ?? null,
          consent: dto.consent ?? false,
          leadCapturedAt: new Date(),
        },
      });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2025'
      ) {
        throw new NotFoundException('Submission not found');
      }
      // O teste usa um erro simples com code P2025; cobrimos ambos os formatos.
      if ((err as { code?: string }).code === 'P2025') {
        throw new NotFoundException('Submission not found');
      }
      this.logger.error(`Failed to attach lead to ${id}: ${String(err)}`);
      throw err;
    }
  }
}
```

- [ ] **Step 4: Rodar o teste e confirmar que passa**

Run: `cd bolsito-api && pnpm test -- diagnostico.service`
Expected: PASS (3 testes verdes).

- [ ] **Step 5: Commit**

```bash
cd bolsito-api
git add src/diagnostico/diagnostico.service.ts src/diagnostico/diagnostico.service.spec.ts
git commit -m "feat(diagnostico): add service with unit tests"
```

---

### Task 4: Controller, Module e wiring (app.module + CORS)

**Files:**
- Create: `bolsito-api/src/diagnostico/diagnostico.controller.ts`
- Create: `bolsito-api/src/diagnostico/diagnostico.module.ts`
- Create: `bolsito-api/src/diagnostico/index.ts`
- Test: `bolsito-api/src/diagnostico/diagnostico.controller.spec.ts`
- Modify: `bolsito-api/src/app.module.ts`
- Modify: `bolsito-api/src/core/config/env.schema.ts:25-27` (default de `CORS_ORIGINS`)

**Interfaces:**
- Consumes: `DiagnosticoService` (Task 3), DTOs (Task 2), `Public` de `../common`, `ThrottlerGuard`/`Throttle` de `@nestjs/throttler`.
- Produces: rotas `POST /diagnostico/submissions` → `{ id: string }` e `PATCH /diagnostico/submissions/:id/lead` → `204 No Content`.

- [ ] **Step 1: Escrever o teste que falha (controller com service mockado)**

Create `bolsito-api/src/diagnostico/diagnostico.controller.spec.ts`:

```ts
import { Test, TestingModule } from '@nestjs/testing';
import { DiagnosticoController } from './diagnostico.controller';
import { DiagnosticoService } from './diagnostico.service';
import { CreateSubmissionDto } from './dto';

describe('DiagnosticoController', () => {
  let controller: DiagnosticoController;
  const service = {
    createSubmission: jest.fn(),
    attachLead: jest.fn(),
  };

  const dto: CreateSubmissionDto = {
    answers: { u1: 0 },
    dimScores: { urgencia: 0, vulnerabilidade: 0, bemestar: 0 },
    total: 0,
    tier: 'verde',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DiagnosticoController],
      providers: [{ provide: DiagnosticoService, useValue: service }],
    }).compile();
    controller = module.get(DiagnosticoController);
  });

  afterEach(() => jest.clearAllMocks());

  it('create delegates to the service and returns the id', async () => {
    service.createSubmission.mockResolvedValue({ id: 'id-1' });
    await expect(controller.create(dto)).resolves.toEqual({ id: 'id-1' });
    expect(service.createSubmission).toHaveBeenCalledWith(dto);
  });

  it('attachLead delegates to the service', async () => {
    service.attachLead.mockResolvedValue(undefined);
    await controller.attachLead('id-1', { email: 'a@b.com', consent: true });
    expect(service.attachLead).toHaveBeenCalledWith('id-1', {
      email: 'a@b.com',
      consent: true,
    });
  });
});
```

- [ ] **Step 2: Rodar e confirmar falha**

Run: `cd bolsito-api && pnpm test -- diagnostico.controller`
Expected: FAIL — `Cannot find module './diagnostico.controller'`.

- [ ] **Step 3: Implementar o controller**

Create `bolsito-api/src/diagnostico/diagnostico.controller.ts`:

```ts
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { Public } from '../common';
import { DiagnosticoService } from './diagnostico.service';
import { AttachLeadDto, CreateSubmissionDto } from './dto';

@ApiTags('Diagnóstico de Saúde Financeira')
@Controller('diagnostico/submissions')
export class DiagnosticoController {
  constructor(private readonly diagnostico: DiagnosticoService) {}

  @Post()
  @Public()
  @Throttle({ simulators: { ttl: 60000, limit: 60 } })
  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Salva o resultado do diagnóstico (público).' })
  create(@Body() dto: CreateSubmissionDto): Promise<{ id: string }> {
    return this.diagnostico.createSubmission(dto);
  }

  @Patch(':id/lead')
  @Public()
  @Throttle({ simulators: { ttl: 60000, limit: 60 } })
  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Anexa o contato do lead à submissão (público).' })
  async attachLead(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: AttachLeadDto,
  ): Promise<void> {
    await this.diagnostico.attachLead(id, dto);
  }
}
```

- [ ] **Step 4: Implementar o module e o barrel**

Create `bolsito-api/src/diagnostico/diagnostico.module.ts`:

```ts
import { Module } from '@nestjs/common';
import { DiagnosticoController } from './diagnostico.controller';
import { DiagnosticoService } from './diagnostico.service';

@Module({
  controllers: [DiagnosticoController],
  providers: [DiagnosticoService],
})
export class DiagnosticoModule {}
```

Create `bolsito-api/src/diagnostico/index.ts`:

```ts
export * from './diagnostico.module';
```

- [ ] **Step 5: Registrar o módulo no `app.module.ts`**

Em `bolsito-api/src/app.module.ts`, adicionar o import junto aos demais (após `TrackingModule`):

```ts
import { TrackingModule } from './tracking';
import { DiagnosticoModule } from './diagnostico';
```

E adicionar `DiagnosticoModule` ao array `imports` (logo após `TrackingModule`):

```ts
    TrackingModule,
    DiagnosticoModule,
```

- [ ] **Step 6: Liberar o origin da landing no CORS (dev)**

Em `bolsito-api/src/core/config/env.schema.ts`, atualizar o default de `CORS_ORIGINS` (linhas ~25-27) para incluir o dev server do Vite:

```ts
  CORS_ORIGINS: z
    .string()
    .default(
      'http://localhost:3000,http://localhost:5173,https://educandoseubolso.blog.br',
    ),
```

> Nota de deploy: em produção, o `CORS_ORIGINS` é definido por variável de ambiente — o origin real da landing page deve ser **acrescentado** a esse valor no ambiente de produção.

- [ ] **Step 7: Rodar os testes do controller e a suíte do módulo**

Run: `cd bolsito-api && pnpm test -- diagnostico`
Expected: PASS (service + controller specs, todos verdes).

- [ ] **Step 8: Build para garantir o wiring**

Run: `cd bolsito-api && pnpm build`
Expected: build sem erros de tipo/DI.

- [ ] **Step 9: Commit**

```bash
cd bolsito-api
git add src/diagnostico src/app.module.ts src/core/config/env.schema.ts
git commit -m "feat(diagnostico): add controller, module wiring and CORS origin"
```

---

## FASE 2 — Frontend (`landing-page`)

> Sem test runner no repo (só `dev/build/lint/preview`). O ciclo de verificação de cada task frontend é: `pnpm lint` + `pnpm build` + verificação no browser (`pnpm dev`).

### Task 5: Portar dados e tipos do questionário

**Files:**
- Create: `landing-page/src/components/diagnostico/diagnostico-data.ts`

**Interfaces:**
- Produces (todos exportados):
  - Tipos: `Dimension`, `QuestionType`, `Option`, `Question`, `Tier`, `TierContent`.
  - Dados: `questions: Question[]`, `scaleOptions: Option[]`, `scaleInvOptions: Option[]`, `DIM_MAX`, `TOTAL_MAX`, `dimLabels`, `tierContent: Record<Tier, TierContent>`.
  - Nota: `tierContent` recebe uma função `title(name: string)` em vez de string pré-montada, para injetar o nome no React.

- [ ] **Step 1: Criar o arquivo de dados (port 1:1 do HTML)**

Create `landing-page/src/components/diagnostico/diagnostico-data.ts`:

```ts
export type Dimension =
  | 'urgencia'
  | 'vulnerabilidade'
  | 'bemestar'
  | 'modulador'
  | 'contexto';
export type QuestionType = 'scale' | 'scaleInv' | 'choice';
export type Tier = 'verde' | 'amarelo' | 'vermelho';

export interface Option {
  label: string;
  value: number | string;
  tag?: string;
}

export interface Question {
  id: string;
  dim: Dimension;
  type: QuestionType;
  text: string;
  options?: Option[];
  conditionOn?: { id: string; value: number };
  unscored?: boolean;
}

export const questions: Question[] = [
  { id: 'u1', dim: 'urgencia', type: 'scale', text: 'Eu pago apenas o valor mínimo (ou parcial) da fatura do cartão de crédito.' },
  { id: 'u2', dim: 'urgencia', type: 'scale', text: 'Eu faço novas dívidas (ou uso novos cartões) para conseguir pagar dívidas e faturas antigas.' },
  { id: 'u3', dim: 'urgencia', type: 'scale', text: 'Nos últimos 6 meses, tive dificuldade para pagar contas básicas essenciais (água, luz, aluguel, alimentação).' },
  { id: 'u4', dim: 'urgencia', type: 'scale', text: 'Eu utilizo o cartão de crédito para fazer saques em dinheiro para pagar outras contas.' },
  { id: 'u5', dim: 'urgencia', type: 'scale', text: 'Recebo cobranças de credores ou possuo restrições no meu nome (SPC/Serasa) por não conseguir quitar meus compromissos.' },
  { id: 'v1', dim: 'vulnerabilidade', type: 'scale', text: 'Dependo do cartão de crédito para pagar gastos essenciais do dia a dia (supermercado, farmácia) por falta de dinheiro na conta.' },
  { id: 'v2', dim: 'vulnerabilidade', type: 'scale', text: 'Se surgisse hoje uma emergência equivalente a um mês da minha renda, eu não teria como pagar.' },
  { id: 'v3', dim: 'vulnerabilidade', type: 'scale', text: 'Meu dinheiro costuma acabar antes do fim do mês, mesmo sem contas em atraso.' },
  { id: 'v4', dim: 'vulnerabilidade', type: 'scale', text: 'O assunto "dinheiro" e "contas a pagar" me causa estresse ou ansiedade frequentes.' },
  { id: 'b1', dim: 'bemestar', type: 'scaleInv', text: 'No geral, considerando bens, dívidas e poupança, quão satisfeito(a) você está com sua situação financeira atual?' },
  { id: 'b2', dim: 'bemestar', type: 'scaleInv', text: 'Qual seu nível de satisfação com o valor atual das suas dívidas (caso possua alguma)?' },
  { id: 'b3', dim: 'bemestar', type: 'scaleInv', text: 'Quão satisfeito(a) você está com sua capacidade atual de poupar e construir seu futuro financeiro?' },
  {
    id: 'q4', dim: 'urgencia', type: 'choice',
    text: 'Nos últimos 12 meses, com que frequência você precisou de novos empréstimos (incluindo cheque especial) só para pagar contas ou dívidas antigas?',
    options: [
      { label: 'Nunca precisei', value: 0 },
      { label: 'Raramente (1 ou 2 vezes no ano)', value: 1 },
      { label: 'Algumas vezes (entre 2 e 5 vezes no ano)', value: 2 },
      { label: 'Frequentemente (mais de 6 vezes no ano)', value: 3 },
      { label: 'Tentei fazer isso, mas tive o crédito negado', value: 4 },
    ],
  },
  {
    id: 'q5', dim: 'modulador', type: 'choice',
    text: 'Você sente que precisa de ajuda externa para sua vida financeira hoje? Se sim, qual o principal motivo?',
    options: [
      { label: 'Não sinto necessidade de ajuda no momento', value: 0, tag: 'nenhuma' },
      { label: 'Sim, para aprender a investir e multiplicar patrimônio', value: 0, tag: 'investir' },
      { label: 'Sim, para organização financeira e planejamento', value: 2, tag: 'organizar' },
      { label: 'Sim, para sair de dívidas e renegociações urgentes', value: 4, tag: 'dividas' },
    ],
  },
  {
    id: 'q6', dim: 'bemestar', type: 'choice',
    text: 'Quando você pensa em dinheiro, qual frase mais reflete seu estado?',
    options: [
      { label: 'Me sinto confiante e em paz com minhas finanças', value: 0 },
      { label: 'Lido bem na maior parte do tempo', value: 1 },
      { label: 'Fico tenso(a) às vezes, mas consigo me acalmar', value: 2 },
      { label: 'Frequentemente fico estressado(a) com o assunto', value: 3 },
      { label: 'Sinto ansiedade ou medo constantes', value: 4 },
    ],
  },
  {
    id: 'q7a', dim: 'urgencia', type: 'choice',
    text: 'Atualmente, você tem contas básicas, faturas ou prestações em atraso?',
    options: [
      { label: 'Não, tudo em dia', value: 0 },
      { label: 'Sim, tenho contas em atraso', value: 1 },
    ],
  },
  {
    id: 'q7b', dim: 'urgencia', type: 'choice',
    text: 'Qual o tamanho aproximado dessas contas atrasadas em relação à sua renda mensal?',
    conditionOn: { id: 'q7a', value: 1 },
    options: [
      { label: 'Menor que a renda de 1 mês', value: 1 },
      { label: 'Entre 1 e 3 meses de renda', value: 2 },
      { label: 'Entre 3 e 6 meses de renda', value: 3 },
      { label: 'Maior que 6 meses de renda', value: 4 },
    ],
  },
  {
    id: 'q8', dim: 'contexto', type: 'choice', unscored: true,
    text: 'Qual é o principal motivo de você buscar orientação financeira hoje?',
    options: [
      { label: 'Sair de dívidas', value: 'dividas' },
      { label: 'Organização financeira', value: 'organizar' },
      { label: 'Aprender a investir', value: 'investir' },
      { label: 'Não sei ao certo, só quero entender minha situação', value: 'entender' },
    ],
  },
];

export const scaleOptions: Option[] = [
  { label: 'Nada', value: 0 },
  { label: 'Pouco', value: 1 },
  { label: 'Mais ou menos', value: 2 },
  { label: 'Muito', value: 3 },
  { label: 'Totalmente', value: 4 },
];

export const scaleInvOptions: Option[] = [
  { label: 'Totalmente satisfeito(a)', value: 0 },
  { label: 'Muito satisfeito(a)', value: 1 },
  { label: 'Mais ou menos', value: 2 },
  { label: 'Pouco satisfeito(a)', value: 3 },
  { label: 'Nada satisfeito(a)', value: 4 },
];

export const DIM_MAX = { urgencia: 29, vulnerabilidade: 16, bemestar: 16 } as const;
export const TOTAL_MAX = 65;

export const dimLabels: Record<Dimension, string> = {
  urgencia: 'Urgência',
  vulnerabilidade: 'Vulnerabilidade',
  bemestar: 'Bem-estar',
  modulador: 'Contexto',
  contexto: 'Contexto',
};

export interface TierContent {
  flagLabel: string;
  zoneWord: string;
  title: (name: string) => string;
  text: string;
  cta: string;
}

export const tierContent: Record<Tier, TierContent> = {
  verde: {
    flagLabel: 'Zona Verde · Bem-estar',
    zoneWord: 'bem-estar',
    title: (name) =>
      name ? `${name}, sua base financeira está sólida.` : 'Sua base financeira está sólida.',
    text: 'Você não demonstra sinais de risco iminente. O momento agora é de proteger o que foi construído e fazer o dinheiro trabalhar por você — organização de investimentos, metas de longo prazo e blindagem patrimonial tendem a trazer mais retorno do que qualquer ajuste emergencial.',
    cta: 'Uma consultoria neste momento serve para otimizar decisões e acelerar seus objetivos — não para apagar incêndio. Vale a conversa.',
  },
  amarelo: {
    flagLabel: 'Zona Amarela · Atenção',
    zoneWord: 'vulnerabilidade',
    title: (name) =>
      name ? `${name}, suas finanças estão no limite do orçamento.` : 'Suas finanças estão no limite do orçamento.',
    text: 'Você ainda não está em colapso, mas vive perto da margem: pequenos imprevistos podem desorganizar tudo rapidamente. Esse é o momento ideal para agir — antes que vire uma emergência. Organização de orçamento, priorização de dívidas e um colchão de segurança são os próximos passos.',
    cta: 'Essa é exatamente a fase em que uma consultoria financeira evita que a situação piore. Vamos conversar sobre um plano de organização?',
  },
  vermelho: {
    flagLabel: 'Zona Vermelha · Urgência',
    zoneWord: 'urgência',
    title: (name) =>
      name ? `${name}, sua situação pede atenção prioritária.` : 'Sua situação pede atenção prioritária.',
    text: 'Os sinais indicam um momento de aperto real — dívidas em aberto, uso recorrente de crédito para cobrir crédito, ou desconforto financeiro constante. Isso não é falta de força de vontade, é uma questão técnica que tem solução: renegociação estratégica e um plano de estancamento de dívidas.',
    cta: 'Quanto antes você buscar orientação, menor o custo (financeiro e emocional) de resolver isso. Vamos conversar ainda essa semana?',
  },
};
```

- [ ] **Step 2: Lint + type-check**

Run: `cd landing-page && pnpm lint && pnpm exec tsc -b --noEmit`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
cd landing-page
git add src/components/diagnostico/diagnostico-data.ts
git commit -m "feat(diagnostico): port questionnaire data and tier content"
```

---

### Task 6: API client + env

**Files:**
- Create: `landing-page/src/lib/diagnostico-api.ts`
- Create: `landing-page/.env.example`

**Interfaces:**
- Consumes: `Tier` de `../components/diagnostico/diagnostico-data`.
- Produces:
  - `interface CreateSubmissionPayload { name?: string; answers: Record<string, number | string>; dimScores: { urgencia: number; vulnerabilidade: number; bemestar: number }; total: number; tier: Tier; contactReason?: string }`
  - `interface AttachLeadPayload { email?: string; phone?: string; consent?: boolean }`
  - `createSubmission(payload: CreateSubmissionPayload): Promise<{ id: string }>`
  - `attachLead(id: string, payload: AttachLeadPayload): Promise<void>`

- [ ] **Step 1: Criar o client**

Create `landing-page/src/lib/diagnostico-api.ts`:

```ts
import type { Tier } from "@/components/diagnostico/diagnostico-data";

const API_BASE =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ??
  "https://api.educandoseubolso.blog.br";

export interface CreateSubmissionPayload {
  name?: string;
  answers: Record<string, number | string>;
  dimScores: { urgencia: number; vulnerabilidade: number; bemestar: number };
  total: number;
  tier: Tier;
  contactReason?: string;
}

export interface AttachLeadPayload {
  email?: string;
  phone?: string;
  consent?: boolean;
}

export async function createSubmission(
  payload: CreateSubmissionPayload,
): Promise<{ id: string }> {
  const res = await fetch(`${API_BASE}/diagnostico/submissions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`createSubmission failed: ${res.status}`);
  return res.json() as Promise<{ id: string }>;
}

export async function attachLead(
  id: string,
  payload: AttachLeadPayload,
): Promise<void> {
  const res = await fetch(
    `${API_BASE}/diagnostico/submissions/${id}/lead`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );
  if (!res.ok) throw new Error(`attachLead failed: ${res.status}`);
}
```

- [ ] **Step 2: Criar `.env.example`**

Create `landing-page/.env.example`:

```
# Base URL da bolsito-api. Local: http://localhost:3030
VITE_API_URL=http://localhost:3030
```

- [ ] **Step 3: Lint + type-check**

Run: `cd landing-page && pnpm lint && pnpm exec tsc -b --noEmit`
Expected: sem erros.

- [ ] **Step 4: Commit**

```bash
cd landing-page
git add src/lib/diagnostico-api.ts .env.example
git commit -m "feat(diagnostico): add API client and env example"
```

---

### Task 7: Hook `useDiagnostico` (máquina de estados + score)

**Files:**
- Create: `landing-page/src/components/diagnostico/useDiagnostico.ts`

**Interfaces:**
- Consumes: dados da Task 5.
- Produces: hook `useDiagnostico()` retornando:
  - `step: number` (-1 = intro), `name: string`, `setName(v: string)`, `answers: Record<string, number | string>`
  - `visible: Question[]` (perguntas visíveis considerando `conditionOn`)
  - `phase: 'intro' | 'question' | 'result'`
  - `current: Question | undefined` (pergunta atual)
  - `start()`, `back()`, `select(q: Question, value: number | string)`, `restart()`
  - `canAdvance(q: Question): boolean`, `goNext()`
  - `results: { total: number; dimScores: { urgencia: number; vulnerabilidade: number; bemestar: number }; tier: Tier }`
  - `contactReason: string | undefined` (valor de `q8`, se respondido)

- [ ] **Step 1: Implementar o hook (lógica portada do HTML)**

Create `landing-page/src/components/diagnostico/useDiagnostico.ts`:

```ts
import { useMemo, useState } from "react";
import {
  questions,
  type Question,
  type Tier,
} from "./diagnostico-data";

type AnswerMap = Record<string, number | string>;

export interface DiagnosticoResults {
  total: number;
  dimScores: { urgencia: number; vulnerabilidade: number; bemestar: number };
  tier: Tier;
}

export function useDiagnostico() {
  const [step, setStep] = useState(-1); // -1 = intro
  const [name, setName] = useState("");
  const [answers, setAnswers] = useState<AnswerMap>({});

  const visible = useMemo<Question[]>(
    () =>
      questions.filter((q) => {
        if (!q.conditionOn) return true;
        return answers[q.conditionOn.id] === q.conditionOn.value;
      }),
    [answers],
  );

  const phase: "intro" | "question" | "result" =
    step === -1 ? "intro" : step >= visible.length ? "result" : "question";

  const current = phase === "question" ? visible[step] : undefined;

  function start() {
    setStep(0);
  }
  function back() {
    setStep((s) => Math.max(0, s - 1));
  }
  function restart() {
    setAnswers({});
    setName("");
    setStep(-1);
  }

  function select(q: Question, value: number | string) {
    setAnswers((prev) => {
      const next = { ...prev, [q.id]: value };
      if (q.id === "q7a" && value !== 1) delete next["q7b"];
      return next;
    });
  }

  function canAdvance(q: Question) {
    return answers[q.id] !== undefined;
  }

  function goNext() {
    setStep((s) => s + 1);
  }

  const results = useMemo<DiagnosticoResults>(() => {
    let total = 0;
    const dimScores = { urgencia: 0, vulnerabilidade: 0, bemestar: 0 };
    questions.forEach((q) => {
      if (q.unscored) return;
      if (q.conditionOn && answers[q.conditionOn.id] !== q.conditionOn.value)
        return;
      const v = answers[q.id];
      if (typeof v !== "number") return;
      total += v;
      if (q.dim in dimScores) {
        dimScores[q.dim as keyof typeof dimScores] += v;
      }
    });
    const tier: Tier = total <= 10 ? "verde" : total <= 20 ? "amarelo" : "vermelho";
    return { total, dimScores, tier };
  }, [answers]);

  const contactReason =
    typeof answers["q8"] === "string" ? (answers["q8"] as string) : undefined;

  return {
    step,
    name,
    setName,
    answers,
    visible,
    phase,
    current,
    start,
    back,
    restart,
    select,
    canAdvance,
    goNext,
    results,
    contactReason,
  };
}
```

- [ ] **Step 2: Lint + type-check**

Run: `cd landing-page && pnpm lint && pnpm exec tsc -b --noEmit`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
cd landing-page
git add src/components/diagnostico/useDiagnostico.ts
git commit -m "feat(diagnostico): add state machine + scoring hook"
```

---

### Task 8: Componente `DiagnosticoIntro`

**Files:**
- Create: `landing-page/src/components/diagnostico/DiagnosticoIntro.tsx`

**Interfaces:**
- Consumes: shadcn `Button` (`@/components/ui/button`), `Input` (`@/components/ui/input`), ícones `lucide-react`.
- Produces: `DiagnosticoIntro({ name, onNameChange, onStart }: { name: string; onNameChange: (v: string) => void; onStart: () => void })`.

- [ ] **Step 1: Implementar a intro (layout Image #1 no tema claro)**

Create `landing-page/src/components/diagnostico/DiagnosticoIntro.tsx`:

```tsx
import { ArrowRight, Clock, Compass, ShieldCheck, Sparkles, Target, PiggyBank, Wallet, TrendingUp, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const features = [
  { icon: Clock, title: "Rápido", desc: "Leva apenas 3 minutos" },
  { icon: Compass, title: "Personalizado", desc: "Análise baseada na sua realidade" },
  { icon: ShieldCheck, title: "Seguro", desc: "Seus dados protegidos" },
  { icon: Target, title: "Prático", desc: "Resultados claros e com caminho" },
];

const pillars = [
  { icon: ClipboardList, label: "Organização Financeira" },
  { icon: Wallet, label: "Controle de Gastos" },
  { icon: TrendingUp, label: "Dívidas e Compromissos" },
  { icon: PiggyBank, label: "Reservas e Segurança" },
  { icon: Target, label: "Metas e Planejamento" },
];

interface Props {
  name: string;
  onNameChange: (v: string) => void;
  onStart: () => void;
}

export function DiagnosticoIntro({ name, onNameChange, onStart }: Props) {
  return (
    <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
      {/* Texto */}
      <div>
        <div className="mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent">
          <Sparkles className="h-4 w-4" />
          Educando Seu Bolso · Consultoria Financeira
        </div>
        <h1 className="text-3xl font-bold leading-tight tracking-tight md:text-4xl lg:text-5xl">
          Descubra onde você{" "}
          <span className="gradient-text-blue-orange">está e para onde pode chegar.</span>
        </h1>
        <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground">
          Em menos de 3 minutos, você terá um diagnóstico claro da sua saúde
          financeira e saberá os próximos passos para organizar suas finanças
          com segurança e tranquilidade.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5">
          {features.map((f) => (
            <div key={f.title} className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/12 text-accent">
                <f.icon className="h-4.5 w-4.5" />
              </div>
              <div>
                <p className="text-sm font-semibold">{f.title}</p>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-9 rounded-2xl border border-border bg-card p-5 shadow-card">
          <p className="text-sm font-semibold">Vamos começar?</p>
          <p className="mb-3 text-xs text-muted-foreground">
            Para personalizar seu diagnóstico, me conta:
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Seu primeiro nome"
              onKeyDown={(e) => e.key === "Enter" && onStart()}
              aria-label="Seu primeiro nome"
            />
            <Button onClick={onStart} className="shrink-0">
              Começar diagnóstico
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">
            🔒 Seus dados estão protegidos e não serão compartilhados.
          </p>
        </div>
      </div>

      {/* Visual — pilares */}
      <div className="relative hidden lg:block">
        <div className="mesh-gradient absolute inset-0 rounded-3xl opacity-70" />
        <div className="relative grid gap-3 rounded-3xl border border-border bg-card/60 p-6 backdrop-blur-sm">
          {pillars.map((p, i) => (
            <div
              key={p.label}
              className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-soft"
              style={{ marginLeft: `${(i % 3) * 12}px` }}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-accent text-white">
                <p.icon className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium">{p.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Lint + type-check**

Run: `cd landing-page && pnpm lint && pnpm exec tsc -b --noEmit`
Expected: sem erros. (Se `h-4.5`/`w-4.5` não existir no Tailwind, troque por `h-4 w-4`.)

- [ ] **Step 3: Commit**

```bash
cd landing-page
git add src/components/diagnostico/DiagnosticoIntro.tsx
git commit -m "feat(diagnostico): add intro screen"
```

---

### Task 9: Componente `DiagnosticoQuestion`

**Files:**
- Create: `landing-page/src/components/diagnostico/DiagnosticoQuestion.tsx`

**Interfaces:**
- Consumes: `Question`, `scaleOptions`, `scaleInvOptions`, `dimLabels` da Task 5; shadcn `Button`, `Progress` (`@/components/ui/progress`).
- Produces: `DiagnosticoQuestion({ question, index, total, selected, onSelect, onBack, onNext, isLast }: Props)`.

- [ ] **Step 1: Implementar a tela de pergunta**

Create `landing-page/src/components/diagnostico/DiagnosticoQuestion.tsx`:

```tsx
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  dimLabels,
  scaleInvOptions,
  scaleOptions,
  type Option,
  type Question,
} from "./diagnostico-data";

interface Props {
  question: Question;
  index: number;
  total: number;
  selected: number | string | undefined;
  onSelect: (value: number | string) => void;
  onBack: () => void;
  onNext: () => void;
  isLast: boolean;
}

export function DiagnosticoQuestion({
  question,
  index,
  total,
  selected,
  onSelect,
  onBack,
  onNext,
  isLast,
}: Props) {
  const opts: Option[] =
    question.type === "scale"
      ? scaleOptions
      : question.type === "scaleInv"
        ? scaleInvOptions
        : (question.options ?? []);
  const pct = Math.round((index / total) * 100);

  return (
    <div>
      <div className="mb-7">
        <Progress value={pct} className="h-1.5" />
        <p className="mt-2 text-xs tracking-wide text-muted-foreground">
          Pergunta {index + 1} de {total}
        </p>
      </div>

      <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-accent">
        {dimLabels[question.dim]}
      </p>
      <h2 className="mb-6 text-xl font-semibold leading-snug md:text-2xl">
        {question.text}
      </h2>

      <div className="flex flex-col gap-2.5">
        {opts.map((o) => {
          const isSel = selected === o.value;
          return (
            <button
              key={String(o.value) + o.label}
              type="button"
              onClick={() => onSelect(o.value)}
              className={`flex items-center gap-3.5 rounded-xl border px-4 py-3.5 text-left transition ${
                isSel
                  ? "border-accent bg-accent/10"
                  : "border-border bg-card hover:border-accent/60 hover:bg-accent/5"
              }`}
            >
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                  isSel ? "border-accent bg-accent text-white" : "border-muted-foreground/40"
                }`}
              >
                {isSel && <Check className="h-3 w-3" />}
              </span>
              <span className="text-sm">{o.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-7 flex items-center justify-between gap-3">
        <Button
          variant="ghost"
          onClick={onBack}
          className={index === 0 ? "invisible" : ""}
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <Button onClick={onNext} disabled={selected === undefined}>
          {isLast ? "Ver resultado" : "Próxima"}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Lint + type-check**

Run: `cd landing-page && pnpm lint && pnpm exec tsc -b --noEmit`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
cd landing-page
git add src/components/diagnostico/DiagnosticoQuestion.tsx
git commit -m "feat(diagnostico): add question screen"
```

---

### Task 10: Componente `DiagnosticoResult`

**Files:**
- Create: `landing-page/src/components/diagnostico/DiagnosticoResult.tsx`

**Interfaces:**
- Consumes: `tierContent`, `DIM_MAX`, `type Tier`, `type DiagnosticoResults` (da Task 7); shadcn `Button`; ícones lucide.
- Produces: `DiagnosticoResult({ name, results, onScheduleClick, onRestart }: Props)` — `onScheduleClick` abre o formulário de lead (Task 11).

- [ ] **Step 1: Implementar a tela de resultado (layout Image #2 no tema claro, uma zona)**

Create `landing-page/src/components/diagnostico/DiagnosticoResult.tsx`:

```tsx
import { AlertTriangle, CheckCircle2, Siren } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DIM_MAX, tierContent, type Tier } from "./diagnostico-data";
import type { DiagnosticoResults } from "./useDiagnostico";

const tierTheme: Record<
  Tier,
  { icon: typeof Siren; color: string; badge: string; bar: string; box: string }
> = {
  vermelho: {
    icon: Siren,
    color: "text-[#C1543F]",
    badge: "border-[#C1543F]/40 text-[#C1543F] bg-[#C1543F]/8",
    bar: "bg-[#C1543F]",
    box: "border-[#C1543F]/25 bg-[#C1543F]/5",
  },
  amarelo: {
    icon: AlertTriangle,
    color: "text-[#C79A3A]",
    badge: "border-[#C79A3A]/40 text-[#B0842B] bg-[#C79A3A]/10",
    bar: "bg-[#D9A63B]",
    box: "border-[#C79A3A]/25 bg-[#C79A3A]/8",
  },
  verde: {
    icon: CheckCircle2,
    color: "text-[#3E8B5B]",
    badge: "border-[#4C9A6A]/40 text-[#3E8B5B] bg-[#4C9A6A]/10",
    bar: "bg-[#4C9A6A]",
    box: "border-[#4C9A6A]/25 bg-[#4C9A6A]/8",
  },
};

const dimList = [
  { key: "urgencia", label: "Urgência financeira" },
  { key: "vulnerabilidade", label: "Vulnerabilidade" },
  { key: "bemestar", label: "Bem-estar financeiro" },
] as const;

interface Props {
  name: string;
  results: DiagnosticoResults;
  onScheduleClick: () => void;
  onRestart: () => void;
}

export function DiagnosticoResult({
  name,
  results,
  onScheduleClick,
  onRestart,
}: Props) {
  const { tier, dimScores } = results;
  const content = tierContent[tier];
  const theme = tierTheme[tier];
  const Icon = theme.icon;

  return (
    <div>
      <span
        className={`inline-flex items-center rounded-full border px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide ${theme.badge}`}
      >
        {content.flagLabel}
      </span>

      <h1 className="mt-4 text-3xl font-bold leading-tight md:text-4xl">
        {content.title(name)}
      </h1>

      <div className="my-7 flex justify-center">
        <Icon className={`h-20 w-20 ${theme.color}`} strokeWidth={1.5} />
      </div>

      <p className="text-base leading-relaxed text-muted-foreground">
        {content.text}
      </p>

      <div className="mt-8">
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

      <div className={`mt-7 rounded-2xl border p-6 ${theme.box}`}>
        <p className="mb-4 text-sm leading-relaxed">{content.cta}</p>
        <Button onClick={onScheduleClick} className="w-full sm:w-auto">
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
  );
}
```

- [ ] **Step 2: Lint + type-check**

Run: `cd landing-page && pnpm lint && pnpm exec tsc -b --noEmit`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
cd landing-page
git add src/components/diagnostico/DiagnosticoResult.tsx
git commit -m "feat(diagnostico): add result screen"
```

---

### Task 11: Formulário de lead + redirect WhatsApp

**Files:**
- Create: `landing-page/src/components/diagnostico/DiagnosticoLeadForm.tsx`

**Interfaces:**
- Consumes: `react-hook-form`, `zod`, `@hookform/resolvers/zod`, shadcn `Button`/`Input`/`Dialog` (`@/components/ui/dialog`), `type Tier`, `tierContent`.
- Produces: `DiagnosticoLeadForm({ open, onOpenChange, defaultName, tier, onSubmitLead }: Props)` onde `onSubmitLead(data: { name: string; email: string; phone: string; consent: boolean }) => Promise<void> | void`.
- Constante exportada: `WHATSAPP_NUMBER = "5531999189537"`.
- Helper exportado: `buildWhatsappUrl(name: string, tier: Tier): string`.

- [ ] **Step 1: Implementar o formulário de lead**

Create `landing-page/src/components/diagnostico/DiagnosticoLeadForm.tsx`:

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { tierContent, type Tier } from "./diagnostico-data";

export const WHATSAPP_NUMBER = "5531999189537";

export function buildWhatsappUrl(name: string, tier: Tier): string {
  const zone = tierContent[tier].zoneWord;
  const greeting = name ? `Olá, meu nome é ${name}. ` : "Olá! ";
  const msg = `${greeting}Acabei de fazer o diagnóstico de saúde financeira e fiquei na zona de ${zone}. Gostaria de agendar minha consultoria.`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
}

const schema = z.object({
  name: z.string().min(1, "Informe seu nome"),
  email: z.string().email("E-mail inválido"),
  phone: z.string().min(8, "Informe um WhatsApp válido"),
  consent: z.literal(true, {
    errorMap: () => ({ message: "É necessário aceitar para continuar" }),
  }),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultName: string;
  tier: Tier;
  onSubmitLead: (data: {
    name: string;
    email: string;
    phone: string;
    consent: boolean;
  }) => Promise<void> | void;
}

export function DiagnosticoLeadForm({
  open,
  onOpenChange,
  defaultName,
  tier,
  onSubmitLead,
}: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: defaultName, email: "", phone: "", consent: false },
  });

  async function submit(values: FormValues) {
    await onSubmitLead(values);
    window.open(buildWhatsappUrl(values.name, tier), "_blank", "noopener");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agende sua consultoria</DialogTitle>
          <DialogDescription>
            Deixe seu contato e você será direcionado ao WhatsApp para falar com
            nossa equipe.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4">
          <div>
            <Input placeholder="Seu nome" {...register("name")} />
            {errors.name && (
              <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div>
            <Input type="email" placeholder="Seu melhor e-mail" {...register("email")} />
            {errors.email && (
              <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div>
            <Input placeholder="WhatsApp (com DDD)" {...register("phone")} />
            {errors.phone && (
              <p className="mt-1 text-xs text-destructive">{errors.phone.message}</p>
            )}
          </div>
          <label className="flex items-start gap-2 text-xs text-muted-foreground">
            <input type="checkbox" className="mt-0.5" {...register("consent")} />
            <span>
              Autorizo o contato da Educando Seu Bolso e concordo com o uso dos
              meus dados para essa finalidade.
            </span>
          </label>
          {errors.consent && (
            <p className="-mt-2 text-xs text-destructive">{errors.consent.message}</p>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Enviando..." : "Ir para o WhatsApp"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 2: Confirmar que o componente `dialog` existe**

Run: `ls landing-page/src/components/ui/dialog.tsx`
Expected: arquivo existe (confirmado no repo). Se ausente, adicionar via `pnpm dlx shadcn@latest add dialog`.

- [ ] **Step 3: Lint + type-check**

Run: `cd landing-page && pnpm lint && pnpm exec tsc -b --noEmit`
Expected: sem erros.

- [ ] **Step 4: Commit**

```bash
cd landing-page
git add src/components/diagnostico/DiagnosticoLeadForm.tsx
git commit -m "feat(diagnostico): add lead capture form with WhatsApp redirect"
```

---

### Task 12: Página, orquestração e rota

**Files:**
- Create: `landing-page/src/pages/diagnostico.tsx`
- Modify: `landing-page/src/App.tsx` (adicionar rota `/diagnostico`)

**Interfaces:**
- Consumes: `useDiagnostico` (Task 7), os 4 componentes (Tasks 8-11), `createSubmission`/`attachLead` (Task 6), TanStack Query (`useMutation`).
- Produces: default export `Diagnostico` (componente de página) e a rota `/diagnostico`.

- [ ] **Step 1: Implementar a página que orquestra as fases**

Create `landing-page/src/pages/diagnostico.tsx`:

```tsx
import { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { DiagnosticoIntro } from "@/components/diagnostico/DiagnosticoIntro";
import { DiagnosticoQuestion } from "@/components/diagnostico/DiagnosticoQuestion";
import { DiagnosticoResult } from "@/components/diagnostico/DiagnosticoResult";
import { DiagnosticoLeadForm } from "@/components/diagnostico/DiagnosticoLeadForm";
import { useDiagnostico } from "@/components/diagnostico/useDiagnostico";
import { attachLead, createSubmission } from "@/lib/diagnostico-api";

export default function Diagnostico() {
  const d = useDiagnostico();
  const [leadOpen, setLeadOpen] = useState(false);
  const submissionId = useRef<string | null>(null);
  const savedForAnswers = useRef<string>("");

  const createMutation = useMutation({ mutationFn: createSubmission });
  const leadMutation = useMutation({
    mutationFn: (vars: { id: string; email: string; phone: string; consent: boolean }) =>
      attachLead(vars.id, { email: vars.email, phone: vars.phone, consent: vars.consent }),
  });

  // Salva o resultado uma vez ao entrar na fase de resultado.
  if (d.phase === "result") {
    const signature = JSON.stringify(d.answers);
    if (savedForAnswers.current !== signature) {
      savedForAnswers.current = signature;
      createMutation.mutate(
        {
          name: d.name || undefined,
          answers: d.answers,
          dimScores: d.results.dimScores,
          total: d.results.total,
          tier: d.results.tier,
          contactReason: d.contactReason,
        },
        {
          onSuccess: (res) => {
            submissionId.current = res.id;
          },
          onError: () => {
            // Best-effort: não bloqueia a UX se a API falhar.
          },
        },
      );
    }
  }

  async function handleLead(data: {
    name: string;
    email: string;
    phone: string;
    consent: boolean;
  }) {
    if (submissionId.current) {
      try {
        await leadMutation.mutateAsync({
          id: submissionId.current,
          email: data.email,
          phone: data.phone,
          consent: data.consent,
        });
      } catch {
        // Best-effort: segue para o WhatsApp mesmo se o PATCH falhar.
      }
    }
  }

  return (
    <main className="min-h-screen bg-background px-4 py-10 md:py-16">
      <div className="mx-auto w-full max-w-3xl">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-card md:p-10">
          {d.phase === "intro" && (
            <DiagnosticoIntro name={d.name} onNameChange={d.setName} onStart={d.start} />
          )}

          {d.phase === "question" && d.current && (
            <DiagnosticoQuestion
              question={d.current}
              index={d.step}
              total={d.visible.length}
              selected={d.answers[d.current.id]}
              onSelect={(v) => d.select(d.current!, v)}
              onBack={d.back}
              onNext={d.goNext}
              isLast={d.step === d.visible.length - 1}
            />
          )}

          {d.phase === "result" && (
            <DiagnosticoResult
              name={d.name}
              results={d.results}
              onScheduleClick={() => setLeadOpen(true)}
              onRestart={d.restart}
            />
          )}
        </div>
      </div>

      <DiagnosticoLeadForm
        open={leadOpen}
        onOpenChange={setLeadOpen}
        defaultName={d.name}
        tier={d.results.tier}
        onSubmitLead={handleLead}
      />
    </main>
  );
}
```

- [ ] **Step 2: Registrar a rota em `App.tsx`**

Em `landing-page/src/App.tsx`, adicionar o import e a rota:

```tsx
import Index from "@/pages/index";
import Diagnostico from "@/pages/diagnostico";
import NotFound from "@/pages/notFound";
```

E dentro de `<Routes>`, antes da rota `*`:

```tsx
          <Route path="/" element={<Index />} />
          <Route path="/diagnostico" element={<Diagnostico />} />
          <Route path="*" element={<NotFound />} />
```

- [ ] **Step 3: Lint + build**

Run: `cd landing-page && pnpm lint && pnpm build`
Expected: build sem erros.

- [ ] **Step 4: Commit**

```bash
cd landing-page
git add src/pages/diagnostico.tsx src/App.tsx
git commit -m "feat(diagnostico): wire page orchestration and route"
```

---

### Task 13: Verificação end-to-end no browser

**Files:** nenhum (verificação manual). Ajustes pontuais se algo quebrar.

- [ ] **Step 1: Subir a API**

Run: `cd bolsito-api && pnpm start:dev`
Expected: `ESB API running on http://localhost:3030`. (Requer `DATABASE_URL` válido e a migration `0002` aplicada no banco: `psql "$DATABASE_URL" -f prisma/migrations/manual/0002_create_diagnostico_submission.sql`.)

- [ ] **Step 2: Subir a landing com a env apontando pra API local**

Run: `cd landing-page && VITE_API_URL=http://localhost:3030 pnpm dev`
Expected: Vite em `http://localhost:5173`.

- [ ] **Step 3: Exercitar o fluxo no browser**

Abrir `http://localhost:5173/diagnostico` e validar:
  - Intro renderiza no tema claro (headline, features, input de nome, pilares).
  - Preencher nome → "Começar diagnóstico" avança.
  - Responder todas as perguntas; `q7b` só aparece se `q7a` = "Sim, tenho contas em atraso"; barra de progresso e Voltar/Próxima funcionam.
  - Tela de resultado mostra a zona correta (testar respostas que caiam em verde ≤10, amarelo ≤20, vermelho >20), breakdown por dimensão e textos.
  - Confirmar no Network que `POST /diagnostico/submissions` retornou `201` com `{ id }`.
  - "Agendar minha consultoria" abre o dialog; validação exige e-mail/WhatsApp/consentimento.
  - Submeter → confirmar `PATCH /diagnostico/submissions/:id/lead` `204` e abertura do `wa.me/5531999189537` com a mensagem pré-preenchida (nome + zona).
  - Conferir no banco: `psql "$DATABASE_URL" -c "select id, tier, total_score, email, phone, lead_captured_at from diagnostico_submission order by created_at desc limit 3;"` — linha com o resultado e, após o lead, com contato preenchido.

- [ ] **Step 4: Rodar a suíte de testes do backend uma última vez**

Run: `cd bolsito-api && pnpm test -- diagnostico && pnpm lint`
Expected: testes verdes e lint limpo.

- [ ] **Step 5: Commit de eventuais ajustes**

```bash
# apenas se houver ajustes
cd landing-page && git add -A && git commit -m "fix(diagnostico): adjustments from browser verification"
```

---

## Self-Review (autor)

**Spec coverage:**
- Intro tema claro (Image #1) → Task 8. ✅
- Wizard de perguntas + condicional q7b → Tasks 7, 9. ✅
- Resultado por zona (Image #2) → Task 10. ✅
- Cálculo no frontend, servidor só salva → Task 7 (score) + Task 3 (persistência sem recálculo). ✅
- Captura de lead no CTA + WhatsApp `5531999189537` → Tasks 11, 12. ✅
- 1 model Prisma + módulo + 2 endpoints públicos → Tasks 1-4. ✅
- CORS para a landing → Task 4 Step 6. ✅
- Testes backend + verificação browser → Tasks 3, 4, 13. ✅

**Placeholders:** nenhum "TBD/TODO"; todo passo com código tem o código completo. ✅

**Type consistency:** `dimScores {urgencia,vulnerabilidade,bemestar}` consistente entre hook, API client, DTO e service; `Tier` idêntico em data/api/dtos; `createSubmission`/`attachLead` com as mesmas assinaturas onde consumidos. ✅

## Notas de risco / decisões

- **CORS em produção:** o valor real do origin da landing precisa ser adicionado à env `CORS_ORIGINS` no ambiente de prod (Task 4 Step 6 só cobre dev). 
- **`VITE_API_URL` fallback** aponta para `https://api.educandoseubolso.blog.br` — confirmar se é o host correto da bolsito-api em produção antes do deploy (ajustar em `src/lib/diagnostico-api.ts` se necessário).
- **Aplicação da migration:** como o projeto usa SQL manual (não `prisma migrate`), a migration `0002` precisa ser aplicada manualmente no banco antes de subir a API.
- **Persistência best-effort:** falhas de rede no POST/PATCH não bloqueiam a UX (usuário vê resultado e vai ao WhatsApp); erros são silenciosos por design.
