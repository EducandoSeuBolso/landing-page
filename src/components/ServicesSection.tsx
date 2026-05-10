import { Wallet, PiggyBank, TrendingUp, LineChart, Users, BookOpen } from "lucide-react";

const services = [
  {
    icon: Wallet,
    title: "Planejamento Financeiro",
    description:
      "Organize suas finanças com um plano personalizado para alcançar seus objetivos de curto, médio e longo prazo.",
    accent: false,
  },
  {
    icon: PiggyBank,
    title: "Controle de Gastos",
    description:
      "Aprenda a gerenciar seu orçamento de forma inteligente e elimine desperdícios sem abrir mão da qualidade de vida.",
    accent: false,
  },
  {
    icon: TrendingUp,
    title: "Investimentos",
    description:
      "Descubra as melhores estratégias de investimento adequadas ao seu perfil e objetivos financeiros.",
    accent: true, // featured card — Gestalt figure-ground
  },
  {
    icon: LineChart,
    title: "Análise de Dívidas",
    description:
      "Estratégias eficientes para sair das dívidas e recuperar sua saúde financeira de forma sustentável.",
    accent: false,
  },
  {
    icon: Users,
    title: "Finanças para Casais",
    description:
      "Alinhe os objetivos financeiros do casal e construam juntos um futuro financeiro sólido.",
    accent: false,
  },
  {
    icon: BookOpen,
    title: "Educação Financeira",
    description:
      "Desenvolva conhecimentos e hábitos que transformarão sua relação com o dinheiro para sempre.",
    accent: false,
  },
];

const ServicesSection = () => {
  return (
    <section id="servicos" className="py-24 bg-secondary/50 overflow-hidden">
      <div className="container mx-auto px-4">

        {/* ── Section header — Visual Hierarchy: label → H2 → sub ── */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          {/* Label badge — Gestalt continuity: consistent with Hero badge */}
          <span className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-semibold mb-4">
            <span className="w-1.5 h-1.5 bg-primary rounded-full" />
            O que oferecemos
          </span>

          {/* H2 — dominant heading of section */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-foreground mb-4 leading-tight">
            Nossos{" "}
            <span className="gradient-text-blue-orange">Serviços</span>
          </h2>

          {/* Supporting copy — reduced weight, muted color */}
          <p className="text-lg text-muted-foreground leading-relaxed">
            Consultoria personalizada para cada momento da sua jornada financeira,
            do planejamento básico aos investimentos mais sofisticados.
          </p>
        </div>

        {/* ── Services grid — Gestalt similarity: uniform card structure ── */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((service, index) => (
            <div
              key={index}
              className={`group relative rounded-3xl p-8 border transition-all duration-300 hover:-translate-y-2 ${
                service.accent
                  ? // Featured card uses primary gradient — Gestalt figure-ground
                    "bg-gradient-card text-white border-transparent shadow-hero"
                  : "bg-card border-border shadow-card hover:shadow-hero hover:border-primary/20"
              }`}
            >
              {/* Top accent line — Gestalt continuity leading the eye */}
              {!service.accent && (
                <div className="absolute top-0 left-8 right-8 h-[2px] rounded-full bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              )}

              {/* Icon container — Gestalt proximity: icon + title grouped */}
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-200 ${
                  service.accent
                    ? "bg-white/15"
                    : "bg-secondary"
                }`}
              >
                <service.icon
                  className={`w-7 h-7 ${service.accent ? "text-white" : "text-primary"}`}
                />
              </div>

              <h3
                className={`text-xl font-bold mb-3 ${
                  service.accent ? "text-white" : "text-foreground"
                }`}
              >
                {service.title}
              </h3>

              <p
                className={`text-sm leading-relaxed ${
                  service.accent ? "text-white/80" : "text-muted-foreground"
                }`}
              >
                {service.description}
              </p>

              {/* Hover cue — Gestalt common fate: icon appears on hover together */}
              {!service.accent && (
                <div className="mt-6 flex items-center gap-1.5 text-primary text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-200 -translate-x-1 group-hover:translate-x-0">
                  <span>Saiba mais</span>
                  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
