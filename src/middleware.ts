import { NextResponse, type NextRequest } from "next/server";
import {
  NOM_COOKIE,
  doitEtreRenouvele,
  optionsCookie,
  signerSession,
  verifierSession,
} from "@/lib/auth/session";

/**
 * Filtrage des routes du back-office.
 *
 * Le middleware n'est qu'un premier rempart : il vérifie la signature du jeton,
 * sans consulter l'annuaire. Chaque page revérifie la session côté serveur
 * (`exigerUtilisateur`), de sorte qu'un contournement du middleware ne donne
 * accès à rien.
 *
 * Il prolonge aussi les sessions actives : au-delà de quinze minutes, le jeton
 * est réémis, ce qui repousse d'autant l'expiration pour inactivité.
 */
export async function middleware(requete: NextRequest) {
  const { pathname, search } = requete.nextUrl;

  // La page de connexion reste ouverte.
  if (pathname.startsWith("/admin/connexion")) {
    return NextResponse.next();
  }

  const session = await verifierSession(requete.cookies.get(NOM_COOKIE)?.value);

  if (!session) {
    const destination = requete.nextUrl.clone();
    destination.pathname = "/admin/connexion";
    destination.search = "";
    destination.searchParams.set("session", "expiree");
    if (pathname !== "/admin") {
      destination.searchParams.set("suite", `${pathname}${search}`);
    }
    return NextResponse.redirect(destination);
  }

  const reponse = NextResponse.next();

  if (doitEtreRenouvele(session)) {
    const jeton = await signerSession({
      id: session.sub,
      email: session.email,
      nom: session.nom,
      role: session.role,
      persistante: session.persistante,
    });
    reponse.cookies.set(NOM_COOKIE, jeton, optionsCookie(session.persistante));
  }

  return reponse;
}

export const config = {
  matcher: ["/admin/:path*"],
};
