# ASAD — site de l’association

Site de l’association de protection animale **ASAD** (Hérault et Gard) :
adoption, urgences vétérinaires, familles d’accueil, bénévolat, dons et livre d’or.
Le back-office est amorcé (coquille, connexion, tableau de bord).

Construit avec **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS 4**,
`next/image` et `lucide-react`. Aucune base de données : tout le contenu vit dans
des fichiers TypeScript, prêts à être remplacés par un back-office.

Conforme au handoff `design_handoff_asad` — palette « Noir, blanc, rouge »,
typographie Figtree, et les cinq écrans publics livrés reproduits au pixel.

---

## Base de données

**Tout le contenu du site vit en base PostgreSQL** : animaux, photos, livre d’or,
actualités, collectes, demandes, candidatures, signalements, comptes et textes
du site. Aucune donnée n’est stockée dans un fichier — le site fonctionne donc
en ligne, sur un hébergement sans disque persistant.

Une seule variable à renseigner : `DATABASE_URL`.

```bash
createdb asad                 # en local
npm run db:migrate            # crée les tables
npm run db:seed               # charge le contenu de départ
```

| Commande | Rôle |
| --- | --- |
| `npm run db:generate` | Crée un fichier de migration après modification du schéma |
| `npm run db:migrate` | Applique les migrations |
| `npm run db:seed` | Charge le contenu de départ (idempotent) |
| `npm run db:studio` | Ouvre l’explorateur de base |

Le schéma est dans [`src/db/schema.ts`](src/db/schema.ts) — 14 tables.
Les lectures passent par `src/lib/donnees/`, les écritures par les actions de
`src/app/actions/`. Aucun composant ne connaît le schéma.

En ligne, `DATABASE_URL` est la chaîne fournie par Neon, Supabase ou Vercel
Postgres. Lancez `npm run db:migrate` puis `npm run db:seed` une fois.

---

## Démarrer

```bash
npm install
npm run dev
```

Le site est servi sur <http://localhost:3000>.

| Commande        | Rôle                        |
| --------------- | --------------------------- |
| `npm run dev`   | Serveur de développement    |
| `npm run build` | Build de production         |
| `npm start`     | Sert le build de production |
| `npm run lint`  | ESLint                      |
| `npm run auth:demarrage` | Crée les deux comptes du départ (guidé) |
| `npm run auth:secret` | Génère la clé de signature des sessions |
| `npm run auth:utilisateur` | Crée ou met à jour un compte du back-office |
| `npm run auth:lister` | Liste les comptes configurés |

---

## Les pages

### Site public

| Route                     | Écran                                                       |
| ------------------------- | ----------------------------------------------------------- |
| `/`                       | Accueil                                                      |
| `/animaux`                | Catalogue : recherche, six filtres, tri, pagination          |
| `/animaux/[slug]`         | Fiche animal — l’encadré change selon le statut              |
| `/animaux/[slug]/adopter` | Demande d’adoption en quatre étapes                          |
| `/urgences`               | Campagnes de collecte, « Où va votre don », widget HelloAsso |
| `/association`            | Missions et fonctionnement                                   |
| `/nous-aider`             | Les trois façons d’aider                                     |
| `/don`                    | Faire un don (HelloAsso)                                     |
| `/rejoindre`              | Famille d’accueil et bénévolat, avec leurs formulaires       |
| `/signaler`               | Signaler un animal                                           |
| `/actualites`             | Actualités et articles                                       |
| `/livre-or`               | Livre d’or modéré + formulaire public                        |
| `/contact`                | Contact et questions fréquentes                              |
| `/mentions-legales` · `/confidentialite` · `/cookies` | Pages légales            |

### Back-office

| Route                      | État                                                        |
| -------------------------- | ----------------------------------------------------------- |
| `/admin`                   | Tableau de bord — livré, protégé par authentification       |
| `/admin/connexion`         | Connexion, cinq états — fonctionnelle                       |
| `/admin/animaux` | Liste, création et éditeur en 7 onglets |
| `/admin/livre-or` | Modération en 5 onglets, réponse publique |
| `/admin/demandes` | Demandes d'adoption avec suivi de statut |
| `/admin/familles` · `/admin/benevoles` | Candidatures reçues |
| `/admin/signalements` | Signalements, classés par priorité |
| `/admin/urgences` | Collectes : objectif, montant réel, nouvelles |
| `/admin/actualites` | Articles : liste et éditeur |
| `/admin/medias` | Images référencées sur le site |
| `/admin/contenu` · `/admin/parametres` | Textes, coordonnées, liens HelloAsso |
| `/admin/utilisateurs` | Comptes et accès |

Chaque écran vérifie les droits du rôle : masquer une rubrique dans le menu ne suffit pas.

---

## Configurer les liens (HelloAsso, réseaux, contact)

**Tous les liens sont réunis dans [`src/content/site.ts`](src/content/site.ts).**
Rien n’est codé en dur ailleurs : changer une destination se fait à un seul endroit.

Deux façons de les définir : directement dans `site.ts`, ou par variable
d’environnement (copier `.env.example` en `.env.local`).

```bash
cp .env.example .env.local
```

| Clé                              | Utilisation                                               |
| -------------------------------- | --------------------------------------------------------- |
| `NEXT_PUBLIC_HELLOASSO_DON`      | Bouton « Faire un don »                                   |
| `NEXT_PUBLIC_HELLOASSO_URGENCE`  | Boutons des campagnes d’urgence                           |
| `NEXT_PUBLIC_HELLOASSO_ADHESION` | Bouton « Adhérer »                                        |
| `NEXT_PUBLIC_HELLOASSO_PAGE`     | Lien vers la page publique HelloAsso                      |
| `NEXT_PUBLIC_HELLOASSO_IFRAME`   | Widget intégré ; vide = emplacement réservé affiché       |

Le paiement n’est pas développé côté site : HelloAsso s’en charge. Une campagne
peut surcharger le lien global via son champ `lienHelloAsso`.

---

## Où se trouve le contenu

Tout le contenu éditable est dans `src/content/`. Les composants n’écrivent
jamais de texte en dur.

Les **données** (animaux, livre d’or, actualités, collectes, comptes…) sont en
base. `src/content/` ne garde que ce qui relève du code : libellés de
formulaires, textes légaux, navigation.

| Fichier           | Contenu                                                    |
| ----------------- | ---------------------------------------------------------- |
| `site.ts`         | Routes, navigation, valeurs de repli des liens             |
| `accueil.ts`      | Valeurs de repli des textes d’accueil                      |
| `aider.ts`        | Les trois façons d’aider, paliers de don                   |
| `pages.ts`        | Textes des pages éditoriales                               |
| `faq.ts`          | Questions fréquentes                                       |
| `rgpd.ts`         | Mentions d’information des formulaires (CNIL)              |
| `admin.ts`        | Navigation du back-office                                  |

Les liens HelloAsso, les coordonnées et les textes d’accueil sont **modifiables
depuis le back-office** (`/admin/parametres` et `/admin/contenu`) : la valeur en
base l’emporte sur celle du code.

`src/db/donnees-initiales/` contient le jeu de départ chargé par `db:seed` —
il n’est plus lu ensuite.

Les types sont dans [`src/types/index.ts`](src/types/index.ts).

### Ajouter un animal

Depuis `/admin/animaux`, bouton « Ajouter un animal ». Les champs suivants sont requis
par l’**article L.214-8-1 du code rural** pour les offres de cession : `espece`,
`sexe`, `age`, `identification` et `race` — `race: null` signifiant explicitement
« n’appartient pas à une race ».

Statuts : `brouillon` · `a_adopter` · `urgent` · `reserve` · `adopte`.

- Les `brouillon` ne sont jamais servis au public.
- **Une fiche adoptée n’est pas supprimée** : elle passe en `adopte`, son
  formulaire disparaît, sa photo passe en retrait et le récit de l’adoption
  (`suiteAdoption`) prend sa place, suivi de suggestions.
- `reserve` affiche un panneau « demande en cours » et un bouton désactivé.
- `afficherSurAccueil: true` remonte la fiche sur la page d’accueil.

---

## Formulaires

Six formulaires, tous validés côté serveur (`src/app/actions/formulaires.ts`) :
adoption, famille d’accueil, bénévolat, contact, signalement et livre d’or.

La **demande d’adoption** se fait en quatre étapes (coordonnées, foyer, mode de
vie, motivation), avec validation par étape, conservation de la saisie au retour
arrière, et une référence de dossier à la confirmation.

Chacun affiche, comme le recommande la CNIL : **pourquoi** les données sont
collectées, **qui** les reçoit, **combien de temps** elles sont conservées et
**comment exercer ses droits**. Consentement explicite obligatoire, champ piège
anti-robots.

### Acheminement des demandes

`src/lib/notifications.ts` décide où part la demande :

1. si `ASAD_FORM_WEBHOOK_URL` est défini, elle part en JSON vers ce webhook
   (Make, Zapier, n8n… qui la relaie vers la boîte mail) ;
2. sinon, elle est **journalisée côté serveur** — rien n’est perdu, mais rien
   n’est envoyé.

Pour brancher un fournisseur d’e-mail, ajouter un canal dans `envoyerDemande`.
C’est le seul fichier à modifier.

---

## Authentification du back-office

L’accès à `/admin` est protégé. Trois rôles sont définis :

| Rôle | Libellé affiché | Rubriques visibles |
| --- | --- | --- |
| `admin` | Accès complet | Les 13 rubriques |
| `editeur` | Animaux et livre d’or | Tableau de bord, Animaux, Livre d’or |
| `benevole` | Consultation | Lecture seule, dossiers attribués |

Le rôle `editeur` est volontairement étroit : ajouter et modifier des fiches
animaux, relire les messages du livre d’or. Rien d’autre. Son tableau de bord
est simplifié — deux grands raccourcis nommés en clair, et seulement les
indicateurs sur lesquels il peut agir. Les photos s’ajoutent depuis l’éditeur de
fiche, ce qui évite une rubrique « Médias » de plus à comprendre.

Le rôle `benevole` est prévu par la maquette mais n’est utilisé par aucun compte
pour l’instant.

### Créer les comptes

Une seule commande, qui vous guide :

```bash
npm run auth:demarrage
```

Elle crée les deux comptes du départ — le vôtre en accès complet, puis celui
qui gère les animaux et le livre d’or — et génère la clé de signature. Les mots
de passe ne s’affichent pas pendant la saisie : c’est normal.

Ensuite : `npm run auth:utilisateur` pour ajouter ou modifier un compte,
`npm run auth:lister` pour voir ceux qui existent.

Les comptes sont enregistrés dans `data/utilisateurs.json`, **ignoré par Git** :
il contient des empreintes de mots de passe. Les mots de passe eux-mêmes ne sont
jamais stockés, seulement une empreinte **scrypt** salée.

### En production

Beaucoup d’hébergements n’ont pas de disque persistant. Reportez alors les
comptes dans la variable d’environnement `ASAD_UTILISATEURS` — la commande
`auth:utilisateur` affiche la valeur à copier — et `ASAD_AUTH_SECRET` dans les
variables de votre hébergeur.

Sans `ASAD_AUTH_SECRET`, la connexion est **refusée en production** : mieux vaut
un site inaccessible qu’un site signé avec une clé devinable.

### Ce qui est en place

| Protection | Mise en œuvre |
| --- | --- |
| Mots de passe | Empreinte scrypt salée, comparaison en temps constant |
| Sessions | JWT HS256 dans un cookie `HttpOnly`, `Secure` en production, `SameSite=Lax` |
| Expiration | 2 h d’inactivité, prolongées tant que l’on navigue ; 30 jours avec « Rester connecté » |
| Filtrage des routes | `src/middleware.ts` sur `/admin/*` |
| Double garde | Chaque page revérifie la session côté serveur : un compte supprimé ou désactivé perd l’accès immédiatement, même si son jeton reste valide |
| Force brute | 5 tentatives par adresse et par IP, puis blocage 15 min |
| Énumération de comptes | Message d’erreur identique et temps de réponse constant, que l’adresse existe ou non |
| Redirection ouverte | La destination après connexion est bornée à `/admin` |
| CSRF | Protection intégrée des actions serveur Next.js |

### Limites connues

- Le compteur de tentatives est **en mémoire** : il se réinitialise au
  redémarrage et n’est pas partagé entre plusieurs instances. Un déploiement
  multi-instance demanderait Redis ou une base.
- La **réinitialisation de mot de passe** envoie la demande dans le canal
  configuré (`lib/notifications.ts`) mais ne génère pas encore de lien à usage
  unique : un administrateur relance le mot de passe avec `auth:utilisateur`.
- Pas encore de **double authentification**.

---

## Le livre d’or

Cadrage voulu par l’association : **aucun message n’est publié automatiquement**.
Ni notes en étoiles, ni commentaires publics libres. Un visiteur envoie son
message par le formulaire ; il n’apparaît qu’une fois passé en statut `publie`
dans `src/content/livre-or.ts`. La modération se fera depuis `/admin/livre-or`.

---

## Structure

```
src/
├── app/
│   ├── layout.tsx            Document, police, métadonnées, données structurées
│   ├── (site)/               Site public — barre d’aide, en-tête, pied de page
│   ├── admin/
│   │   ├── (interface)/      Coquille : barre latérale, barre supérieure
│   │   └── connexion/        Écran plein, hors coquille
│   ├── actions/              Actions serveur des formulaires
│   ├── sitemap.ts robots.ts  SEO
│   └── globals.css           Jetons de design
├── components/
│   ├── brand/                Logo, icônes de marque
│   ├── ui/                   Design system (Button, Container, Badge…)
│   ├── layout/               En-tête, menu mobile, pied de page
│   ├── accueil/              Sections de la page d’accueil
│   ├── animaux/              Cartes, catalogue, fiche, galerie, favoris
│   ├── formulaires/          Les six formulaires
│   └── admin/                Coquille et composants du back-office
├── content/                  ← Contenu éditable
├── lib/
│   ├── auth/                 Rôles, mots de passe, sessions, gardes
│   └── …                     Sélection, filtres, validation, formatage
├── middleware.ts             Filtrage des routes /admin
└── types/                    Modèle de données
```

---

## Design

Jetons définis une seule fois dans le bloc `@theme` de
[`src/app/globals.css`](src/app/globals.css).

| Jeton            | Valeur    | Usage                                        |
| ---------------- | --------- | -------------------------------------------- |
| `--color-pri`    | `#000000` | Barre d'aide, bandeaux sombres, pied de page, barre admin |
| `--color-acc`    | `#D6001C` | Dons, badges, liens, entrée active admin     |
| `--color-canvas` | `#FFFFFF` | Fond de page                                 |
| `--color-subtil` | `#F5F5F5` | Survols, encadrés internes, fond du back-office |
| `--color-soft`   | `#FFECEE` | Cercles d'icônes, pistes de barres           |
| `--color-warm`   | `#F7F7F7` | Panneaux de mise en avant                    |
| `--color-mut`    | `#616161` | Texte secondaire                             |

Trois couleurs, pas une de plus : **noir, blanc, rouge**. Les gris sont du noir
transparent, les roses très clairs du rouge transparent. Les quatre pastilles de
statut du back-office se distinguent par la valeur, pas par la teinte —
noir (fait), rouge (urgent), rouge dilué (en attente), gris (neutre).

Les neuf combinaisons de texte du site passent le seuil AA (4,5:1) ; la plus
serrée est à 4,8:1.

La palette du handoff était « Nuit turquoise » (#111827 + #0FB5AE). Elle a été
remplacée à la demande par un noir franc et un rouge vif, sur fond blanc pur.

Le fond du site public est blanc pur. Le back-office garde `--color-subtil` :
ses cartes sont blanches et se détacheraient mal sur du blanc.

Changer de palette se fait dans le seul bloc `@theme` : aucune couleur n'est
écrite en dur dans les composants, hormis les codes de statut du back-office
(succès, attente, alerte), volontairement distincts de la couleur de marque.

Quatre paires de couleurs fonctionnelles (succès, attente, alerte, neutre) sont
réservées au back-office et n’apparaissent jamais sur le site public.

Police **Figtree** via `next/font/google` : auto-hébergée au build, aucune
requête externe au runtime.

> ⚠️ Le logo est une **reconstitution vectorielle** faite d’après la maquette
> ([`src/components/brand/Logo.tsx`](src/components/brand/Logo.tsx)). Le
> remplacer par le SVG officiel avant la mise en production.

---

## Images

Les photos définitives ne sont pas disponibles : `public/images/` contient des
**visuels temporaires générés**, marqués « PHOTO TEMPORAIRE ». Aucune image n’a
été extraite de la maquette.

Chaque animal a une galerie de quatre photos (`<slug>-1.jpg` à `-4.jpg`). Pour
les remplacer : déposer la vraie photo au même chemin, ou changer le chemin dans
`src/content/animaux.ts`. Chaque photo porte un `alt` descriptif défini à côté
d’elle.

Pour des images hébergées ailleurs, ajouter le domaine dans
`images.remotePatterns` de `next.config.ts`.

---

## Accessibilité

- Lien d’évitement « Aller au contenu principal ».
- Menu mobile et tiroir admin en `role="dialog"` + `aria-modal` : focus déplacé
  puis rendu au bouton, focus piégé, `Échap` ferme, défilement bloqué.
- Anneau de focus visible sur tous les éléments interactifs.
- Un seul `<h1>` par page, repères `header` / `nav` / `main` / `footer` nommés.
- Fils d’Ariane, `aria-current`, `aria-pressed` sur les coups de cœur,
  `role="status"` et `role="alert"` sur les retours de formulaire,
  `role="progressbar"` sur les collectes et le formulaire en quatre étapes.
- Textes alternatifs descriptifs sur toutes les images.
- `prefers-reduced-motion` respecté.
- Aucun débordement horizontal, de 375 px à 1440 px.

---

## SEO

- Métadonnées par page (titre, description, canonique, Open Graph, Twitter).
- `sitemap.xml` généré, incluant fiches animaux et actualités.
- `robots.txt` : formulaires d’adoption et back-office exclus de l’indexation.
- Données structurées : `NGO`, `Product` (fiche animal), `NewsArticle`, `FAQPage`.
- Favicon vectoriel `src/app/icon.svg`.

Avant la mise en ligne, définir `NEXT_PUBLIC_SITE_URL` : les URL canoniques et le
sitemap en dépendent.

---

## Assistant de rédaction (facultatif)

Dans le back-office, l'éditeur d'une fiche animal affiche un encadré
**« Vous préférez raconter ? »**. La bénévole y écrit ce qu'elle sait de
l'animal avec ses mots ; l'assistant remplit à sa place la description,
l'histoire, les traits de caractère, la taille et les compatibilités.

Rien n'est enregistré : les valeurs sont **posées dans le formulaire**, où elles
sont relues et corrigées. Un bouton « Annuler » remet les valeurs précédentes.

### La règle de fond

**L'assistant n'invente jamais un fait.** Il reformule uniquement ce qui figure
dans les notes ; si une information n'y est pas, le champ reste vide et
l'encadré le dit explicitement (« Laissé vide, faute d'information dans vos
notes »).

Il ne touche jamais aux champs suivants, qui restent saisis à la main :

- **nom, espèce, sexe, âge, race, identification, nombre d'animaux de la
  portée** — ce sont les mentions prévues par le code rural (art. L.214-8-1) ;
- **vacciné, identifié, stérilisé** — ce sont des affirmations sanitaires qui
  engagent l'association.

### Activer

Créer une clé sur <https://platform.openai.com/api-keys>, puis la poser dans
Render (service `asad` → *Environment*) :

```
OPENAI_API_KEY = sk-...
```

Sans cette clé, l'encadré n'apparaît pas et le back-office fonctionne
exactement comme avant.

Le modèle par défaut est `gpt-5.6-terra` ; `OPENAI_MODEL` permet d'en choisir un
autre (`gpt-5.6-luna` coûte moins cher, `gpt-5.6-sol` écrit un peu mieux).
À raison d'une fiche par jour, la dépense reste de l'ordre de quelques
centimes par mois.

L'action serveur revérifie les droits à chaque appel : seul un compte ayant le
droit d'écrire sur les animaux peut déclencher l'assistant.

---

## Mettre en ligne sur Render

Le dépôt contient un fichier [`render.yaml`](render.yaml) : Render lit tout seul
ce qu'il faut créer. Cinq étapes, une seule fois.

### 1. Envoyer le code sur GitHub

Le dossier est déjà un dépôt Git avec un premier commit. Créer un dépôt **privé**
vide sur GitHub, puis :

```bash
git remote add origin https://github.com/<compte>/asad.git
git push -u origin main
```

### 2. Créer le site sur Render

Sur <https://dashboard.render.com> : **New → Blueprint**, choisir le dépôt `asad`.

Render lit `render.yaml` et propose de créer deux choses :

- **asad-base** — la base de données PostgreSQL ;
- **asad** — le site.

Le prix s'affiche avant validation.

> ⚠️ Les plans inscrits dans `render.yaml` sont **payants**, volontairement.
> En gratuit, Render **supprime la base 30 jours après sa création** (14 jours
> de sursis pour la sauver), et le site s'éteint après 15 minutes sans visite —
> il met environ une minute à redémarrer pour le visiteur suivant.

Render branche automatiquement `DATABASE_URL` et génère `ASAD_AUTH_SECRET`.
Rien à recopier à la main.

### 3. Copier le contenu vers Render

Le premier déploiement crée les tables, mais elles sont **vides** : les animaux,
le livre d'or, les textes du site et les comptes du back-office sont encore sur
la machine locale. Une seule commande les transfère.

Dans Render, ouvrir la base **asad-base** et copier son *External Database URL*,
puis :

```bash
npm run db:exporter
npm run db:importer -- "<External Database URL>"
```

Le script affiche le nombre de lignes copiées par table. `sauvegarde-asad.sql`
reste sur la machine : il contient des données personnelles et n'est jamais
versionné.

### 4. Renseigner l'adresse du site

Dans Render, service **asad** → *Environment* → ajouter :

```
NEXT_PUBLIC_SITE_URL = https://asad.onrender.com
```

(puis l'adresse définitive le jour où le domaine `asad.fr` est branché).
Elle sert au plan de site et aux aperçus de partage.

### 5. Se connecter au back-office

`https://<adresse-du-site>/admin`, avec les identifiants déjà créés en local —
ils font partie du contenu copié à l'étape 3.

---

### Ce qui se passe à chaque mise à jour

```bash
git push
```

Render redéploie tout seul. Au démarrage, `npm start` applique d'abord les
migrations de base de données, puis lance le site : la base suit toujours le
code, sans manipulation.

### Sauvegarder la base

Le plan payant inclut les sauvegardes automatiques de Render. Pour une copie
sur la machine, à tout moment :

```bash
DATABASE_URL="<External Database URL>" npm run db:exporter
```

## Reste à faire

### Avant la mise en production

- [ ] Remplacer le logo par le SVG officiel
- [ ] Remplacer les photos temporaires
- [ ] Renseigner les vrais liens HelloAsso et réseaux sociaux
- [ ] Vérifier les coordonnées et compléter le numéro RNA dans `site.ts`
- [ ] Compléter l’hébergeur dans les mentions légales
- [ ] Choisir l’acheminement des formulaires (webhook ou fournisseur e-mail)
- [ ] Définir `NEXT_PUBLIC_SITE_URL`

### Back-office

- [x] Authentification : mots de passe hachés, sessions signées, rôles
- [ ] Créer les comptes avec `npm run auth:demarrage`
- [ ] Lien de réinitialisation de mot de passe à usage unique
- [x] Base de données : tout le contenu y est, plus rien en fichier
- [x] Les 12 rubriques du back-office
- [ ] Téléversement de photos vers un stockage en ligne — aujourd’hui on saisit
      l’adresse de l’image (`/images/…` ou une adresse complète)
- [ ] Vue kanban des demandes d’adoption, notes internes, export PDF
