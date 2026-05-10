import { useState } from "react";
import { Menu, X, MessageCircle } from "lucide-react";
import bolsitoLogo from "@/assets/bolsito.png";

const navLinks = [
  { label: "Início",    href: "#inicio" },
  { label: "Serviços",  href: "#servicos" },
  { label: "Sobre",     href: "#sobre" },
  { label: "Contato",   href: "#contato" },
];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed top-3 sm:top-4 left-1/2 z-50 -translate-x-1/2 w-[calc(100%-1rem)] sm:w-[calc(100%-2rem)] max-w-5xl pointer-events-none"
    >
      {/* ── Main bar ── */}
      <div className="glass rounded-2xl border border-border/60 px-4 py-2 shadow-lg shadow-primary/5 pointer-events-auto">
        <div className="flex items-center justify-between gap-3">

          {/* Logo */}
          <a
            href="#inicio"
            className="flex items-center gap-2.5 shrink-0 group"
            aria-label="Ir para início"
          >
            <img
              src={bolsitoLogo}
              alt="Educando seu Bolso"
              className="h-8 w-8 object-contain transition-transform group-hover:scale-105"
            />
            <span className="font-semibold text-foreground text-sm hidden lg:block">
              Educando seu Bolso
            </span>
          </a>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-3 py-1.5 text-sm rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* CTA + mobile toggle */}
          <div className="flex items-center gap-2 shrink-0">
            <a
              href="https://minhaagendavirtual.com.br/educandoseubolso"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg font-semibold text-white hover:opacity-90 transition-opacity"
              style={{ background: "linear-gradient(135deg,#0E87C6,#FF8A00)" }}
            >
              <MessageCircle className="h-3.5 w-3.5" />
              Agendar Consulta
            </a>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground"
              aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile dropdown ── */}
      {mobileOpen && (
        <div className="md:hidden mt-2 glass rounded-2xl border border-border/60 p-3 shadow-lg shadow-primary/5 animate-fade-up pointer-events-auto">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2.5 text-sm rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
              >
                {link.label}
              </a>
            ))}
            <a
              href="https://minhaagendavirtual.com.br/educandoseubolso"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 px-3 py-2.5 text-sm rounded-lg font-semibold text-white flex items-center gap-2"
              style={{ background: "linear-gradient(135deg,#0E87C6,#FF8A00)" }}
            >
              <MessageCircle className="h-4 w-4" />
              Agendar Consulta
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Header;
