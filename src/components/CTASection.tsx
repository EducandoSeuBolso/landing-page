import { ArrowRight, MessageCircle, Calendar, Check, Sparkles, Stethoscope } from "lucide-react";
import { Link } from "react-router-dom";

const highlights = [
  "Planejamento financeiro personalizado",
  "Acompanhamento contínuo de resultados",
  "Suporte via WhatsApp durante todo o processo",
];

const CTASection = () => {
  return (
    <section id="contato" className="py-16 md:py-24 relative overflow-hidden">
      {/* Ambient glow behind the card */}
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl opacity-40" />

      <div className="container mx-auto px-4">
        <div className="relative rounded-3xl overflow-hidden">

          {/* ── Deep blue gradient — from bolsito-frontend lead-capture ── */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-[#0a6a9e] to-[#064e72]" />

          {/* Decorative orbs */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-accent/30 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-3xl" />

          {/* Grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage:
                "linear-gradient(white 1px,transparent 1px),linear-gradient(to right,white 1px,transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />

          {/* ── Content ── */}
          <div className="relative z-10 p-8 md:p-12 lg:p-16 flex flex-col lg:flex-row lg:items-center gap-10 lg:gap-16">

            {/* Left — text */}
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 backdrop-blur-sm text-white text-sm font-medium mb-6">
                <Sparkles className="h-4 w-4 text-accent" />
                Comece sua transformação hoje
              </div>

              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight mb-4">
                Pronto para conquistar sua{" "}
                <span className="text-accent">liberdade financeira?</span>
              </h2>

              <p className="text-white/70 text-lg leading-relaxed mb-8 max-w-lg">
                Agende uma conversa gratuita e descubra como podemos ajudar você
                a alcançar seus objetivos com um plano personalizado.
              </p>

              <ul className="space-y-3">
                {highlights.map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-white/80">
                    <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-accent" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Right — glass CTA card */}
            <div className="lg:w-96 shrink-0">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center mb-6 shadow-lg shadow-accent/30">
                  <Calendar className="w-7 h-7 text-white" />
                </div>

                <h3 className="text-xl font-bold text-white mb-2">Agende sua consultoria</h3>
                <p className="text-white/60 text-sm mb-6">
                  Primeira conversa gratuita. Sem compromisso.
                </p>

                <a
                  href="https://minhaagendavirtual.com.br/educandoseubolso"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-white text-primary font-semibold shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300"
                >
                  <Calendar className="h-4 w-4" />
                  Agendar Consultoria
                  <ArrowRight className="h-4 w-4" />
                </a>

                <a
                  href="http://wa.me/5531999189537"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3.5 mt-3 rounded-xl bg-white/10 border border-white/20 text-white text-sm font-medium hover:bg-white/15 transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                  Falar no WhatsApp
                </a>

                <Link
                  to="/diagnostico"
                  className="flex items-center justify-center gap-2 w-full py-3.5 mt-3 rounded-xl bg-white/10 border border-white/20 text-white text-sm font-medium hover:bg-white/15 transition-colors"
                >
                  <Stethoscope className="h-4 w-4" />
                  Ainda em dúvida? Faça o diagnóstico gratuito
                </Link>

                <p className="text-white/40 text-xs text-center mt-4">
                  Atendimento 100% online. Resposta em até 24h.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default CTASection;
