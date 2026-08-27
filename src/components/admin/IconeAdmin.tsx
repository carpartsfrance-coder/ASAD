import {
  FileText,
  HousePlus,
  Images,
  Inbox,
  LayoutDashboard,
  MessageSquareQuote,
  PawPrint,
  Settings,
  Stethoscope,
  TriangleAlert,
  UserCog,
  Users,
} from "lucide-react";
import type { CleIconeAdmin } from "@/content/admin";

const ICONES = {
  tableau: LayoutDashboard,
  animaux: PawPrint,
  demandes: Inbox,
  familles: HousePlus,
  benevoles: Users,
  signalements: TriangleAlert,
  urgences: Stethoscope,
  "livre-or": MessageSquareQuote,
  medias: Images,
  contenu: FileText,
  parametres: Settings,
  utilisateurs: UserCog,
} as const;

/** Icône d'une entrée de navigation du back-office. */
export function IconeAdmin({
  cle,
  size = 18,
}: {
  cle: CleIconeAdmin;
  size?: number;
}) {
  const Icone = ICONES[cle];
  return <Icone size={size} strokeWidth={1.8} aria-hidden="true" className="shrink-0" />;
}
