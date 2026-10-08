// Ícones lucide (os mesmos do Calm Kids e do CalmBaby) para a navegação e o menu do Perfil.
// Tiles, cenários, fases e celebrações usam os emojis 3D de src/lib/illustrations.ts.

import {
  BookOpen,
  CircleHelp,
  Compass,
  Download,
  HeartHandshake,
  House,
  LifeBuoy,
  NotebookPen,
  Route,
  ShieldCheck,
  UserRound,
  type LucideIcon,
} from "lucide-react";

/** Navegação inferior: mesmas posições do BottomNav do CalmBaby, com a aba Cenários no meio. */
export const navIcons = {
  home: House,
  plan: Route,
  scenarios: Compass,
  diary: NotebookPen,
  more: UserRound,
} satisfies Record<string, LucideIcon>;

/** Itens do menu do Perfil. */
export const moreIcons = {
  scenario: Compass,
  rules: BookOpen,
  support: CircleHelp,
  install: Download,
  privacy: ShieldCheck,
  care: LifeBuoy,
  commitment: HeartHandshake,
} satisfies Record<string, LucideIcon>;
