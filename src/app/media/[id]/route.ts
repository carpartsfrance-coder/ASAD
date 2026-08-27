import { eq } from "drizzle-orm";
import { db } from "@/db";
import { medias } from "@/db/schema";

/**
 * Sert une image stockée en base.
 *
 * L'identifiant ne change jamais et le contenu non plus : la réponse peut
 * donc être mise en cache indéfiniment par le navigateur et par le CDN.
 */
export async function GET(
  _requete: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    return new Response("Identifiant invalide", { status: 400 });
  }

  const [ligne] = await db
    .select({
      donnees: medias.donnees,
      typeMime: medias.typeMime,
      url: medias.url,
    })
    .from(medias)
    .where(eq(medias.id, id))
    .limit(1);

  if (!ligne) {
    return new Response("Image introuvable", { status: 404 });
  }

  // Média enregistré sous forme d'adresse : on y renvoie.
  if (!ligne.donnees && ligne.url) {
    return Response.redirect(new URL(ligne.url, "http://localhost"), 302);
  }

  if (!ligne.donnees) {
    return new Response("Image introuvable", { status: 404 });
  }

  return new Response(new Uint8Array(ligne.donnees), {
    headers: {
      "Content-Type": ligne.typeMime,
      "Content-Length": String(ligne.donnees.length),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
