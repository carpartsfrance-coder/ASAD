import { Container } from "@/components/ui/Container";
import { IconCircle } from "@/components/ui/IconCircle";
import { StatIcon } from "@/components/ui/StatIcon";
import { configSite } from "@/lib/donnees/config-site";

/** Bandeau de chiffres-clés, en chevauchement sous le héro. */
export async function StatsBand() {
  const { statistiques } = await configSite();

  return (
    <Container as="section" aria-label="Nos chiffres">
      <ul className="grid grid-cols-1 divide-y divide-line rounded-panel bg-white py-6 shadow-stat sm:grid-cols-3 sm:divide-x sm:divide-y-0 lg:py-[30px]">
        {statistiques.map((stat) => (
          <li
            key={stat.id}
            className="flex items-center justify-center gap-5 px-6 py-5 sm:py-0"
          >
            <IconCircle taille={64}>
              <StatIcon icone={stat.icone} />
            </IconCircle>
            <p>
              <span className="block text-[30px] leading-[1.1] font-extrabold text-pri lg:text-num">
                {stat.valeur}
              </span>
              <span className="mt-0.5 block text-[15px] text-mut">
                {stat.libelle}
              </span>
            </p>
          </li>
        ))}
      </ul>
    </Container>
  );
}
