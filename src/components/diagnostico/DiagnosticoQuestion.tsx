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
