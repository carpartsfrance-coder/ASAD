import type { Metadata } from "next";
import { CoquilleAdmin } from "@/components/admin/CoquilleAdmin";
import { exigerUtilisateur } from "@/lib/auth/garde";
import { compteursAdmin } from "@/lib/donnees/compteurs";

export const metadata: Metadata = {
  title: { default: "Administration", template: "%s | Administration ASAD" },
  robots: { index: false, follow: false },
};

/**
 * Coquille du back-office.
 *
 * Le middleware a déjà filtré la requête, mais on revérifie ici : lui ne
 * consulte pas l'annuaire et ne voit donc pas qu'un compte a été supprimé ou
 * désactivé depuis l'émission du jeton.
 */
export default async function LayoutAdmin({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const utilisateur = await exigerUtilisateur();
  const compteurs = await compteursAdmin();

  return (
    <CoquilleAdmin utilisateur={utilisateur} compteurs={compteurs}>
      {children}
    </CoquilleAdmin>
  );
}
