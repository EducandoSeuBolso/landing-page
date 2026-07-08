import { useEffect, useRef, useState } from "react";
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

  // Fire the submission once when the result phase is entered.
  // Guard with an answers-signature ref so StrictMode double-invoke is safe.
  const answersSignature = JSON.stringify(d.answers);
  useEffect(() => {
    if (d.phase !== "result") return;
    if (savedForAnswers.current === answersSignature) return;
    savedForAnswers.current = answersSignature;

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
          // Best-effort: nao bloqueia a UX se a API falhar.
        },
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [d.phase, answersSignature]);

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
