# Le logo de l'association

`asad-logo-original.png` est le fichier fourni par l'association (2087 × 753,
fond transparent). **C'est la source : ne pas la modifier.** Tout ce que le site
affiche en est découpé.

Ce dossier n'est pas publié : il reste dans le projet comme référence.

## Ce qui en est tiré

| Fichier                              | Contenu                              |
| ------------------------------------ | ------------------------------------ |
| `public/marque/asad-marque.png`      | le cœur avec le chien et le chat     |
| `public/marque/asad-mot.png`         | le mot « ASAD », noir                 |
| `public/marque/asad-mot-blanc.png`   | le même, blanc, pour les fonds noirs  |
| `public/marque/asad-complet.png`     | le logo entier, baseline comprise     |
| `public/marque/asad-partage.png`     | 1200 × 630, pour les réseaux sociaux  |
| `src/app/icon.png`                   | icône de l'onglet du navigateur       |
| `src/app/apple-icon.png`             | icône sur l'écran d'accueil iPhone    |

Le pictogramme et le mot sont séparés parce que le logo complet fait 3,4 fois
plus large que haut : posé dans un en-tête, sa baseline tomberait à deux pixels
de haut, illisible. Le site les rapproche lui-même, dans les proportions
d'origine.

## Si le logo change

Remplacer `asad-logo-original.png`, puis relancer le découpage :

    npm run marque

Le rouge de la charte (`--color-acc` dans `src/app/globals.css`) est celui du
logo : **#E80020**. S'il changeait, il faudrait le reporter là-bas et vérifier
que le blanc reste lisible dessus.

## Une version vectorielle serait mieux

Le fichier actuel est une image en pixels. Une version `.svg`, `.ai`, `.pdf` ou
`.eps` resterait nette à toutes les tailles, à l'écran comme à l'impression
(banderoles, flyers, kakémonos). Si l'association en a une, elle prend la place
de celle-ci.
