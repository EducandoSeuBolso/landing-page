import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Stethoscope } from "lucide-react";

// CTA fixo no rodapé mobile da home; some quando a CTASection (#contato)
// está visível para não duplicar chamadas na mesma viewport.
export default function MobileCtaBar() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const target = document.getElementById("contato");
    if (!target) return;
    const observer = new IntersectionObserver(
      ([entry]) => setHidden(entry.isIntersecting),
      { threshold: 0.15 },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  if (hidden) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 p-3 md:hidden">
      <Link
        to="/diagnostico"
        className="gradient-bg-blue-orange pointer-events-auto flex h-12 w-full items-center justify-center gap-2 rounded-xl font-semibold text-white shadow-xl"
      >
        <Stethoscope className="h-4 w-4" />
        Fazer diagnóstico gratuito
      </Link>
    </div>
  );
}
