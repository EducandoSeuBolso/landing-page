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
        <Button
          onClick={onScheduleClick}
          className="gradient-bg-blue-orange h-12 w-full rounded-xl border-0 px-6 font-semibold text-white shadow-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl sm:w-auto"
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
  );
}
