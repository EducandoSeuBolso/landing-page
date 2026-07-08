import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Resolve âncoras absolutas (/#secao) após navegação de rota: a home pode
// ainda não ter montado quando o effect roda, então tenta por alguns frames.
// Depende do objeto location (nova identidade a cada navegação) para que
// re-cliques no mesmo link também rolem.
export default function ScrollToHash() {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) {
      window.scrollTo({ top: 0 });
      return;
    }
    let attempts = 0;
    let frame = 0;
    const tryScroll = () => {
      const el = document.getElementById(location.hash.slice(1));
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      } else if (attempts < 20) {
        attempts += 1;
        frame = requestAnimationFrame(tryScroll);
      }
    };
    tryScroll();
    return () => cancelAnimationFrame(frame);
  }, [location]);

  return null;
}
