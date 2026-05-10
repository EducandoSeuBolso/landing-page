import { CheckCircle2, Award, MessageCircle, Calendar, Star, Sparkle } from "lucide-react";
import { Button } from "@/components/ui/button";
import bolsitoLogo from "@/assets/bolsito.png";

const benefits = [
  "Metodologia desenvolvida por profissionais da área",
  "Atendimento 100% online e personalizado",
  "Acompanhamento contínuo dos seus resultados",
  "Material exclusivo de educação financeira",
  "Plano de ação claro e objetivo",
  "Suporte via WhatsApp durante todo o processo",
];

const stats = [
  { icon: Award, value: "10+", label: "Anos de Experiência" },
  { icon: Sparkle, value: "100%", label: "Processo Humanizado" },
  { icon: Star,  value: "5★",  label: "Avaliação Clientes" },
];

const AboutSection = () => {
  return (
    <section id="sobre" className="py-24 bg-background overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* ── Left ── */}
          <div>
            <span className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-semibold mb-5">
              <span className="w-1.5 h-1.5 bg-primary rounded-full" />
              Por que nos escolher
            </span>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-foreground mb-6 leading-tight">
              Transformamos vidas através da{" "}
              <span className="gradient-text-blue-orange">educação financeira</span>
            </h2>

            <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-lg">
              O Educando Seu Bolso nasceu com a missão de democratizar o acesso à educação financeira
              de qualidade. Acreditamos que todos podem alcançar a liberdade financeira com o
              conhecimento certo.
            </p>

            <ul className="space-y-3.5 mb-10">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/12 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className="text-foreground text-sm leading-snug">{benefit}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                size="lg"
                asChild
                className="gradient-bg-blue-orange rounded-xl px-7 h-12 font-semibold text-white shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300 border-0"
              >
                <a
                  href="https://minhaagendavirtual.com.br/educandoseubolso"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Calendar className="mr-2 w-4 h-4" />
                  Agendar Consultoria
                </a>
              </Button>

              <Button
                variant="outline"
                size="lg"
                asChild
                className="rounded-xl px-7 h-12 font-semibold border-2 border-border hover:bg-card hover:border-primary/30 hover:-translate-y-0.5 transition-all duration-300"
              >
                <a href="http://wa.me/5531999189537" target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="mr-2 w-4 h-4 text-accent" />
                  Falar no WhatsApp
                </a>
              </Button>
            </div>
          </div>

          {/* ── Right: single self-contained card ── */}
          <div className="relative">
            <div className="rounded-[32px] overflow-hidden shadow-hero">

              {/* Gradient area — deep blue, matching lead-capture / CTA section */}
              <div className="relative flex flex-col items-center justify-center px-10 pt-14 pb-0" style={{ background: "linear-gradient(to bottom right, var(--color-primary), #0a6a9e, #064e72)" }}>

                {/* Subtle orbs inside the card */}
                <div className="absolute top-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-[60px]" />
                <div className="absolute bottom-0 right-0 w-40 h-40 bg-black/10 rounded-full blur-[50px]" />

                {/* Decorative rings */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-72 h-72 rounded-full border border-white/10" />
                  <div className="absolute w-52 h-52 rounded-full border border-white/12" />
                </div>

                {/* Logo + text */}
                <div className="relative z-10 text-center text-white pb-10">
                  <div className="w-20 h-20 bg-white/15 backdrop-blur-sm rounded-full mx-auto mb-5 flex items-center justify-center border border-white/20">
                    <img src={bolsitoLogo} alt="Bolsito" className="w-13 h-13 object-contain" />
                  </div>
                  <h3 className="text-2xl font-bold mb-1.5 tracking-tight">Educando Seu Bolso</h3>
                  <p className="text-white/70 text-sm">Sua jornada para a liberdade financeira</p>
                </div>
              </div>

              {/* Stats bar — flush inside the card, on white bg */}
              <div className="bg-card border-t border-border/40 grid grid-cols-3 divide-x divide-border/40">
                {stats.map((stat, index) => (
                  <div key={index} className="flex flex-col items-center justify-center py-5 px-4 gap-1.5">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mb-1">
                      <stat.icon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="text-xl font-extrabold text-foreground leading-none">{stat.value}</div>
                    <div className="text-xs text-muted-foreground text-center leading-snug">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ambient glow behind the card */}
            <div className="absolute -inset-4 rounded-[40px] blur-2xl opacity-20 -z-10" style={{ background: "linear-gradient(to bottom right, var(--color-primary), #064e72)" }} />
          </div>

        </div>
      </div>
    </section>
  );
};

export default AboutSection;
