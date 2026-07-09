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
      if (v === undefined) return;
      // `value` é identidade da opção; a pontuação vem de `score` quando as
      // duas divergem (ex.: q5 tem opções distintas que valem 0 pontos).
      const opt = q.options?.find((o) => o.value === v);
      const score = opt?.score ?? (typeof v === "number" ? v : undefined);
      if (score === undefined) return;
      total += score;
      if (q.dim in dimScores) {
        dimScores[q.dim as keyof typeof dimScores] += score;
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
