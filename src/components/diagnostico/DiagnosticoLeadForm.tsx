import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { tierContent, type Tier } from "./diagnostico-data";

const WHATSAPP_NUMBER = "5531999189537";

function buildWhatsappUrl(name: string, tier: Tier): string {
  const zone = tierContent[tier].zoneWord;
  const greeting = name ? `Olá, meu nome é ${name}. ` : "Olá! ";
  const msg = `${greeting}Acabei de fazer o diagnóstico de saúde financeira e fiquei na zona de ${zone}. Gostaria de agendar minha consultoria.`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
}

const schema = z.object({
  name: z.string().min(1, "Informe seu nome"),
  email: z.string().email("E-mail inválido"),
  phone: z.string().min(8, "Informe um WhatsApp válido"),
  consent: z.boolean().refine((v) => v === true, {
    message: "É necessário aceitar para continuar",
  }),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultName: string;
  tier: Tier;
  onSubmitLead: (data: {
    name: string;
    email: string;
    phone: string;
    consent: boolean;
  }) => Promise<void> | void;
}

export function DiagnosticoLeadForm({
  open,
  onOpenChange,
  defaultName,
  tier,
  onSubmitLead,
}: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: defaultName, email: "", phone: "", consent: false },
  });

  // react-hook-form captures defaultValues only on mount; the form lives above
  // the Radix Dialog, so `defaultName` may change (user typed their name after
  // this component mounted). Re-seed the fields each time the dialog opens.
  useEffect(() => {
    if (open) reset({ name: defaultName, email: "", phone: "", consent: false });
  }, [open, defaultName, reset]);

  async function submit(values: FormValues) {
    await onSubmitLead(values);
    window.open(buildWhatsappUrl(values.name, tier), "_blank", "noopener");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agende sua consultoria</DialogTitle>
          <DialogDescription>
            Deixe seu contato e você será direcionado ao WhatsApp para falar com
            nossa equipe.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4">
          <div>
            <Input placeholder="Seu nome" {...register("name")} />
            {errors.name && (
              <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div>
            <Input type="email" placeholder="Seu melhor e-mail" {...register("email")} />
            {errors.email && (
              <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div>
            <Input placeholder="WhatsApp (com DDD)" {...register("phone")} />
            {errors.phone && (
              <p className="mt-1 text-xs text-destructive">{errors.phone.message}</p>
            )}
          </div>
          <label className="flex items-start gap-2 text-xs text-muted-foreground">
            <input type="checkbox" className="mt-0.5" {...register("consent")} />
            <span>
              Autorizo o contato da Educando Seu Bolso e concordo com o uso dos
              meus dados para essa finalidade.
            </span>
          </label>
          {errors.consent && (
            <p className="-mt-2 text-xs text-destructive">{errors.consent.message}</p>
          )}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="gradient-bg-blue-orange h-12 rounded-xl border-0 font-semibold text-white shadow-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl disabled:hover:translate-y-0"
          >
            {isSubmitting ? "Enviando..." : "Ir para o WhatsApp"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
