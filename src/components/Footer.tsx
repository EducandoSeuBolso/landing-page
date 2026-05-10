import { ExternalLink, Phone, MapPin } from "lucide-react";
import bolsitoLogo from "@/assets/bolsito.png";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 sm:py-12">
        <div className="grid grid-cols-2 gap-6 sm:gap-8 md:grid-cols-4">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src={bolsitoLogo} alt="Educando seu Bolso" className="h-7 w-7 object-contain" />
              <span className="font-semibold text-foreground text-sm">Educando seu Bolso</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Educação financeira acessível e de qualidade para todos os brasileiros.
            </p>
            <a
              href="https://wa.me/5531999189537"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Phone className="h-3 w-3 shrink-0" />
              (31) 99918-9537
            </a>
            <a
              href="https://www.google.com/maps/search/?api=1&query=Educando+Seu+Bolso+Alameda+das+Falcatas+922+São+Luiz+Belo+Horizonte+MG"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <MapPin className="h-3 w-3 shrink-0" />
              Alameda das Falcatas, 922 — São Luiz, Belo Horizonte - MG
            </a>
          </div>

          {/* Serviços */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Serviços</h4>
            <ul className="flex flex-col gap-2">
              {[
                { label: "Planejamento Financeiro", href: "#servicos" },
                { label: "Controle de Gastos",      href: "#servicos" },
                { label: "Investimentos",            href: "#servicos" },
                { label: "Análise de Dívidas",       href: "#servicos" },
                { label: "Finanças para Casais",     href: "#servicos" },
              ].map((item) => (
                <li key={item.label}>
                  <a href={item.href} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Empresa */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Empresa</h4>
            <ul className="flex flex-col gap-2">
              <li>
                <a href="#sobre" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  Sobre nós
                </a>
              </li>
              <li>
                <a
                  href="https://minhaagendavirtual.com.br/educandoseubolso"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                  Consultoria
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </li>
              <li>
                <a href="#contato" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  Contato
                </a>
              </li>
            </ul>
          </div>

          {/* Conecte-se */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Conecte-se</h4>
            <ul className="flex flex-col gap-2">
              {[
                { label: "WhatsApp",  href: "https://wa.me/5531999189537" },
                { label: "Instagram", href: "https://www.instagram.com/educandoseubolso/" },
                { label: "YouTube",   href: "https://www.youtube.com/educandoseubolso" },
                { label: "Facebook",  href: "https://www.facebook.com/people/Blog-Educando-Seu-Bolso/61554308285348/" },
                { label: "LinkedIn",  href: "https://www.linkedin.com/company/educandoseubolso" },
                { label: "Blog",      href: "https://educandoseubolso.blog.br/" },
              ].map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                  >
                    {item.label}
                    <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            &copy; 2026{" "}
            <span className="gradient-text-blue-orange font-medium">Educando seu Bolso</span>
            . Todos os direitos reservados.
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Privacidade
            </a>
            <a href="#sobre" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Sobre
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
