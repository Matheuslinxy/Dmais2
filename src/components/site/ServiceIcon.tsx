import {
  Store,
  Sparkles,
  Signpost,
  Flag,
  Sticker,
  Layers,
  Lightbulb,
  Car,
  Printer,
  PanelsTopLeft,
  Square,
  type LucideIcon,
} from "lucide-react";

export const SERVICE_ICONS: Record<string, { icon: LucideIcon; label: string }> = {
  store: { icon: Store, label: "Fachada" },
  sparkles: { icon: Sparkles, label: "Destaque" },
  signpost: { icon: Signpost, label: "Placa" },
  flag: { icon: Flag, label: "Faixa" },
  sticker: { icon: Sticker, label: "Adesivo" },
  layers: { icon: Layers, label: "Camadas" },
  lightbulb: { icon: Lightbulb, label: "Luminoso" },
  car: { icon: Car, label: "Veículo" },
  printer: { icon: Printer, label: "Impressão" },
  panels: { icon: PanelsTopLeft, label: "Painel" },
  square: { icon: Square, label: "Genérico" },
};

export function ServiceIcon({ name, className }: { name: string; className?: string }) {
  const Icon = SERVICE_ICONS[name]?.icon ?? Square;
  return <Icon className={className} />;
}
