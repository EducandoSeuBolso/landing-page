import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Resolve âncoras absolutas (/#secao) após navegação de rota: a home pode
// ainda não ter montado quando o effect roda, então tenta por alguns frames.
export default function ScrollToHash() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0 });
      return;
    }
    let attempts = 0;
    let frame = 0;
    const tryScroll = () => {
      const el = document.getElementById(hash.slice(1));
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      } else if (attempts < 20) {
        attempts += 1;
        frame = requestAnimationFrame(tryScroll);
      }
    };
    tryScroll();
    return () => cancelAnimationFrame(frame);
  }, [pathname, hash]);

  return null;
}
