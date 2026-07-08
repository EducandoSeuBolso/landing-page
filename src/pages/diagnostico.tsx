import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import Header from "@/components/Header";
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
    <>
      <Header />
      <main className="relative min-h-screen overflow-hidden bg-background px-4 pb-20 pt-28 md:pt-32">
        {/* ── Marketing chrome — matches HeroSection / bolsito-frontend ── */}
        <div className="pointer-events-none absolute inset-0 mesh-gradient" />
        <div
          className="pointer-events-none absolute left-1/4 top-0 h-[420px] w-[520px] -translate-x-1/2 rounded-full opacity-50 blur-[140px]"
          style={{ background: "rgba(14,135,198,0.20)" }}
        />
        <div
          className="pointer-events-none absolute bottom-10 right-1/4 h-[360px] w-[440px] rounded-full opacity-50 blur-[130px]"
          style={{ background: "rgba(255,138,0,0.18)" }}
        />

        <div
          className={`relative z-10 mx-auto w-full ${
            d.phase === "question" ? "max-w-3xl" : "max-w-5xl"
          }`}
        >
          <div className="rounded-3xl border border-border/70 bg-card/95 p-4 shadow-card backdrop-blur-sm sm:p-6 md:p-10 animate-fade-up">
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
    </>
  );
}
