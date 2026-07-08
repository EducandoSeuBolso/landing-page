import { Link } from "react-router-dom";
import {
  ArrowRight,
  ClipboardList,
  PiggyBank,
  Stethoscope,
  Target,
  TrendingUp,
  Wallet,
} from "lucide-react";

const pillars = [
  { icon: ClipboardList, label: "Organização Financeira" },
  { icon: Wallet, label: "Controle de Gastos" },
  { icon: TrendingUp, label: "Dívidas e Compromissos" },
  { icon: PiggyBank, label: "Reservas e Segurança" },
  { icon: Target, label: "Metas e Planejamento" },
];

const DiagnosticoTeaser = () => {
  return (
    <section id="diagnostico" className="relative overflow-hidden py-16 md:py-24">
      <div className="pointer-events-none absolute inset-0 mesh-gradient opacity-60" />

      <div className="container relative z-10 mx-auto px-4">
        <div className="mx-auto max-w-4xl rounded-3xl border border-border/70 bg-card/90 p-8 text-center shadow-card backdrop-blur-sm md:p-12">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-accent shadow-sm">
            <Stethoscope className="h-4 w-4" />
            Diagnóstico de Saúde Financeira
          </div>

          <h2 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
            Como está sua{" "}
            <span className="gradient-text-blue-orange">saúde financeira</span>?
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Responda perguntas rápidas e receba uma análise clara dos 5 pilares
            das suas finanças — em menos de 3 minutos, gratuito.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-2.5">
            {pillars.map((p) => (
              <span
                key={p.label}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium shadow-sm"
              >
                <p.icon className="h-4 w-4 text-accent" />
                {p.label}
              </span>
            ))}
          </div>

          <div className="mt-9">
            <Link
              to="/diagnostico"
              className="gradient-bg-blue-orange inline-flex h-14 items-center justify-center gap-2 rounded-xl px-8 text-base font-semibold text-white shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
            >
              Fazer diagnóstico gratuito
              <ArrowRight className="h-5 w-5" />
            </Link>
            <p className="mt-4 text-xs text-muted-foreground">
              ⏱️ 3 minutos · 🔒 seus dados protegidos · sem compromisso
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DiagnosticoTeaser;
