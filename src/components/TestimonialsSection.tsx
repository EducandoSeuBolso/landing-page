import { Star, Quote } from "lucide-react";

/**
 * TODO (Prova Social): Substituir os depoimentos ilustrativos abaixo pelos
 * depoimentos reais ou prints verificados de clientes da consultoria
 * (ex.: nome real ou iniciais, perfil/cidade e texto/print do WhatsApp/Google).
 */
const testimonials = [
  {
    // TODO: Substituir por depoimento real do cliente 1
    name: "Maria Silva",
    role: "Empresária",
    content:
      "Depois da consultoria, consegui quitar todas as minhas dívidas em 8 meses e ainda comecei a investir. Mudou completamente minha relação com o dinheiro!",
    rating: 5,
  },
  {
    // TODO: Substituir por depoimento real do cliente 2
    name: "João Santos",
    role: "Servidor Público",
    content:
      "O planejamento financeiro me ajudou a organizar minha aposentadoria. Hoje tenho clareza sobre meu futuro financeiro e durmo tranquilo.",
    rating: 5,
  },
  {
    // TODO: Substituir por depoimento real do cliente 3
    name: "Ana Oliveira",
    role: "Casal",
    content:
      "A consultoria para casais transformou nosso relacionamento. Agora temos metas em comum e estamos construindo nosso patrimônio juntos.",
    rating: 5,
  },
];

const TestimonialsSection = () => {
  return (
    <section id="depoimentos" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-semibold mb-4">
            <span className="w-1.5 h-1.5 bg-primary rounded-full" />
            Depoimentos
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-foreground mb-4 leading-tight">
            O que nossos clientes{" "}
            <span className="gradient-text-blue-orange">dizem</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Histórias reais de transformação financeira que nos motivam a continuar.
          </p>
        </div>

        {/* Testimonials Grid — TODO: opcionalmente trocar por galeria de prints reais */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-card rounded-2xl p-8 shadow-card border border-border/50 relative"
            >
              {/* Quote Icon */}
              <div className="absolute -top-4 -left-4 w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-soft">
                <Quote className="w-5 h-5 text-primary-foreground" />
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-accent text-accent" />
                ))}
              </div>

              {/* Content */}
              <p className="text-foreground mb-6 leading-relaxed">
                &ldquo;{testimonial.content}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
                  <span className="text-primary font-bold text-lg">
                    {testimonial.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <div className="font-semibold text-foreground">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
