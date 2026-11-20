import { ArrowRight, MessageCircle, Check, Sparkles, Stethoscope } from "lucide-react";
import { Link } from "react-router-dom";
import { DIAGNOSTICO_PATH, getWhatsAppUrl } from "@/config/contact";

const CTA_WHATSAPP_MESSAGE =
  "Olá! Quero entender como a consultoria financeira do Educando Seu Bolso pode me ajudar.";

const highlights = [
  "Planejamento financeiro personalizado",
  "Acompanhamento contínuo de resultados",
  "Suporte via WhatsApp durante todo o processo",
];

const CTASection = () => {
  return (
    <section id="contato" className="py-16 md:py-24 relative overflow-hidden">
      {/* Ambient glow behind the card */}
      <div className="pointer-events-none hidden md:block absolute top-1/4 right-0 w-96 h-96 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl opacity-40" />

      <div className="container mx-auto px-4">
        <div className="relative rounded-3xl overflow-hidden">

          {/* ── Deep blue gradient — from bolsito-frontend lead-capture ── */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-[#0a6a9e] to-[#064e72]" />

          {/* Decorative orbs */}
          <div className="pointer-events-none hidden md:block absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-accent/30 to-transparent rounded-full blur-3xl" />
          <div className="pointer-events-none hidden md:block absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-3xl" />

          {/* Grid overlay */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.05]"
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
                Faça seu diagnóstico financeiro gratuito em 2 minutos ou converse
                com um especialista no WhatsApp para descobrir seus próximos passos.
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
                  <Stethoscope className="w-7 h-7 text-white" />
                </div>

                <h3 className="text-xl font-bold text-white mb-2">
                  Descubra seu plano ideal
                </h3>
                <p className="text-white/60 text-sm mb-6">
                  Diagnóstico 100% gratuito em 2 minutos. Sem compromisso.
                </p>

                <Link
                  to={DIAGNOSTICO_PATH}
                  className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-white text-primary font-semibold shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300"
                >
                  <Stethoscope className="h-4 w-4" />
                  Fazer Diagnóstico Gratuito
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <a
                  href={getWhatsAppUrl(CTA_WHATSAPP_MESSAGE)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3.5 mt-3 rounded-xl bg-white/10 border border-white/20 text-white text-sm font-medium hover:bg-white/15 transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                  Falar com Especialista no WhatsApp
                </a>

                <p className="text-white/40 text-xs text-center mt-4">
                  Atendimento 100% online e humanizado. Resposta em até 24h.
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
