import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("Erro 404: tentativa de acesso à rota inexistente:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4">
      <div className="text-center max-w-md">
        <h1 className="mb-3 text-6xl font-extrabold text-foreground">404</h1>
        <p className="mb-2 text-xl font-semibold text-foreground">
          Página não encontrada
        </p>
        <p className="mb-6 text-sm text-muted-foreground">
          A página que você procura não existe ou foi movida.
        </p>
        <Link
          to="/"
          className="gradient-bg-blue-orange inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:opacity-95"
        >
          Voltar para a página inicial
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
