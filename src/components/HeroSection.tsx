import { ArrowRight, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DIAGNOSTICO_PATH, getWhatsAppUrl } from "@/config/contact";

const HERO_WHATSAPP_MESSAGE =
  "Olá! Vim pela página de consultoria financeira e gostaria de falar com um especialista.";

const HeroSection = () => {
  return (
    <section
      id="inicio"
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background"
    >
      {/* ── Mesh gradient base — matches bolsito-frontend exactly ── */}
      <div className="absolute inset-0 mesh-gradient" />

      {/* ── Animated colour orbs (disabled on mobile to reduce GPU blur cost) ── */}
      <div
        className="pointer-events-none hidden md:block absolute top-1/4 left-1/4 -translate-x-1/2 w-[560px] h-[460px] rounded-full blur-[110px] animate-glow-pulse opacity-60"
        style={{ background: "rgba(14,135,198,0.25)" }}
      />
      <div
        className="pointer-events-none hidden md:block absolute top-1/3 right-1/4 w-[460px] h-[380px] rounded-full blur-[100px] animate-glow-pulse opacity-50"
        style={{ background: "rgba(14,135,198,0.18)", animationDelay: "2s" }}
      />
      <div
        className="pointer-events-none hidden md:block absolute bottom-1/4 right-1/3 w-[420px] h-[320px] rounded-full blur-[96px] opacity-50"
        style={{ background: "rgba(255,138,0,0.22)" }}
      />

      {/* ── Subtle grid overlay ── */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#0E87C6 1px,transparent 1px),linear-gradient(to right,#0E87C6 1px,transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      {/* ── Content ── */}
      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 text-center pt-28 pb-20">
        {/* H1 */}
        <h1
          className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1] mb-6 animate-fade-up"
          style={{ animationDelay: "100ms" }}
        >
          Saia das dívidas, organize suas contas ou invista com segurança com{" "}
          <span className="gradient-text-blue-orange">
            um plano feito para a sua realidade.
          </span>
        </h1>

        {/* Sub-heading */}
        <p
          className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10 animate-fade-up"
          style={{ animationDelay: "200ms" }}
        >
          Atendimento 100% online e individual com especialistas. Faça seu
          diagnóstico gratuito em 2 minutos e descubra seus próximos passos.
        </p>

        {/* CTAs */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up"
          style={{ animationDelay: "300ms" }}
        >
          <Button
            size="lg"
            asChild
            className="gradient-bg-blue-orange w-full sm:w-auto rounded-xl px-8 h-14 text-base font-semibold text-white shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border-0"
          >
            <Link to={DIAGNOSTICO_PATH}>
              Fazer Diagnóstico Gratuito
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>

          <Button
            variant="outline"
            size="lg"
            asChild
            className="w-full sm:w-auto rounded-xl px-8 h-14 text-base font-semibold border-2 border-border hover:bg-card hover:border-primary/30 hover:-translate-y-1 transition-all duration-300"
          >
            <a
              href={getWhatsAppUrl(HERO_WHATSAPP_MESSAGE)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="mr-2 h-4 w-4 text-accent" />
              Falar com Especialista no WhatsApp
            </a>
          </Button>
        </div>

        {/* Micro-copy de confiança */}
        <p
          className="mt-5 text-sm font-medium text-muted-foreground animate-fade-up"
          style={{ animationDelay: "380ms" }}
        >
          ✓ 100% Gratuito • ✓ Sem compromisso • ✓ Atendimento humanizado
        </p>
      </div>
    </section>
  );
};

export default HeroSection;
