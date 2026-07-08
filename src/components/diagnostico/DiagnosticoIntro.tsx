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
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-accent shadow-sm">
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
                <f.icon className="h-4 w-4" />
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
            <Button
              onClick={onStart}
              className="gradient-bg-blue-orange h-11 shrink-0 rounded-xl border-0 px-6 font-semibold text-white shadow-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl"
            >
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
