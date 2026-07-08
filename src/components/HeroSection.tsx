import { ArrowRight, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section
      id="inicio"
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background"
    >
      {/* ── Mesh gradient base — matches bolsito-frontend exactly ── */}
      <div className="absolute inset-0 mesh-gradient" />

      {/* ── Animated colour orbs ── */}
      <div
        className="absolute top-1/4 left-1/4 -translate-x-1/2 w-[600px] h-[500px] rounded-full blur-[150px] animate-glow-pulse opacity-60"
        style={{ background: "rgba(14,135,198,0.25)" }}
      />
      <div
        className="absolute top-1/3 right-1/4 w-[500px] h-[400px] rounded-full blur-[130px] animate-glow-pulse opacity-50"
        style={{ background: "rgba(14,135,198,0.18)", animationDelay: "2s" }}
      />
      <div
        className="absolute bottom-1/4 right-1/3 w-[450px] h-[350px] rounded-full blur-[120px] opacity-50"
        style={{ background: "rgba(255,138,0,0.22)" }}
      />

      {/* ── Subtle grid overlay ── */}
      <div
        className="absolute inset-0 opacity-[0.03]"
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
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-foreground leading-[1.05] mb-6 animate-fade-up"
          style={{ animationDelay: "100ms" }}
        >
          Transforme sua relação{" "}
          <br className="hidden sm:block" />
          com o{" "}
          <span className="gradient-text-blue-orange">dinheiro</span>
        </h1>

        {/* Sub-heading */}
        <p
          className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10 animate-fade-up"
          style={{ animationDelay: "200ms" }}
        >
          Consultoria especializada para conquistar sua liberdade financeira
          com planejamento inteligente e acompanhamento personalizado.
        </p>

        {/* CTAs */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up"
          style={{ animationDelay: "300ms" }}
        >
          <Button
            size="lg"
            asChild
            className="gradient-bg-blue-orange rounded-xl px-8 h-14 text-base font-semibold text-white shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border-0"
          >
            <Link to="/diagnostico">
              Fazer diagnóstico gratuito
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>

          <Button
            variant="outline"
            size="lg"
            asChild
            className="rounded-xl px-8 h-14 text-base font-semibold border-2 border-border hover:bg-card hover:border-primary/30 hover:-translate-y-1 transition-all duration-300"
          >
            <a
              href="https://minhaagendavirtual.com.br/educandoseubolso"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Calendar className="mr-2 h-4 w-4 text-accent" />
              Agendar consulta
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
