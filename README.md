# BOUKI — Studio créatif & streetwear · « TECH DOFF. »

BOUKI est un univers créatif sénégalais : streetwear, identité de marque, expériences digitales et interactives, supports de communication et stratégie marketing innovante. Signature : **TECH DOFF.** Site **statique** (HTML / CSS / JavaScript), sans base de données ni build obligatoire, avec sept produits, panier et contact WhatsApp. Préparé pour GitHub + Vercel ; vérifie les conditions de l’hébergement selon ton usage commercial.

---

## A. Décompresser le projet
Double-clique sur `bouki-store-final.zip` : Finder crée le dossier `bouki-store-final`. Place-le où tu veux (ex. `Documents`).

## B. Lancer le site en local sur Mac
**Méthode la plus simple :** double-clique sur `index.html` : le site s'ouvre dans ton navigateur. Tout fonctionne (panier, WhatsApp).

**Méthode « comme en ligne » (recommandée avant publication) :**
1. Ouvre l'app **Terminal** (Cmd + Espace, tape « Terminal »).
2. Tape `cd ` (avec un espace), glisse le dossier `bouki-store-final` dans la fenêtre, appuie sur Entrée.
3. Tape `python3 -m http.server 3000` puis Entrée. *(Si Mac propose d'installer les « outils de développement », accepte.)*
4. Ouvre <http://localhost:3000>. Pour arrêter : `Ctrl + C`.

Alternative avec Node.js installé : `npm start`.

## C. Modifier les 7 produits (à chaque drop)
Un seul fichier : **`data/products.js`**. Il contient exactement 7 emplacements, chacun avec :

| Champ | Rôle |
|---|---|
| `name`, `description`, `category` | textes affichés |
| `price` | prix en FCFA, nombre sans espace (`12000`) |
| `images` | liste de photos (chemins), la première est l'image principale |
| `alt` | description de la photo (accessibilité) |
| `sizes` | tailles proposées ; `[]` = pas de choix de taille |
| `colors` | `{ name: "Noir", hex: "#171916" }` ; plusieurs couleurs possibles, le client doit alors en choisir une |
| `status` | `"available"` (en stock), `"soldout"` (épuisé), `"soon"` (bientôt) |
| `badge` | `"new"`, `"limited"`, `"bestseller"` ou `null` |
| `id`, `slug` | identifiants **uniques** (le `slug` sert dans le lien `#produit/slug`) |

Pour un nouveau drop : modifie les 7 blocs (ne supprime pas la structure), change `dropName` dans `config/store.js`, remplace les photos. Si tu veux plusieurs photos d'un produit : `images: ["assets/products/bouki-01.jpg", "assets/products/bouki-01-dos.jpg"]`.

## D. Remplacer les images sans casser les liens
Les fichiers `assets/products/bouki-01.jpg` à `bouki-07.jpg` sont des **visuels conceptuels générés** pour le Drop 001. Ils définissent une direction artistique cohérente, mais ne garantissent pas le rendu réel des articles fabriqués.
1. Prépare tes photos finales en **portrait 4:5**, environ **1000 × 1250 px**, JPG ou WebP, idéalement sous 250 Ko chacune.
2. Remplace les JPG existants dans `assets/products/` en conservant exactement les mêmes noms.
3. Tu n'as alors pas besoin de modifier `data/products.js`. Si tu préfères d'autres noms, mets à jour le champ `images` du produit concerné.
4. Si une image est introuvable, le site affiche automatiquement une image de secours.

## E. Modifier les prix en FCFA
Dans `data/products.js`, champ `price`. ⚠ **Les prix actuels sont des prix d'exemple.** Tant que `pricesConfirmed` vaut `false` dans `config/store.js`, le site affiche « prix indicatifs ». Une fois tes prix validés : `pricesConfirmed: true`.
Frais de livraison : `deliveryFee` dans `config/store.js` (ex. `2000`). Sans valeur (`null`), le message WhatsApp précise « frais à confirmer ».

## F. Modifier le numéro WhatsApp
`config/store.js` → `whatsappNumber` (format international **sans** `+`, espaces ni tirets). Actuellement : `221787560327`. Tous les boutons WhatsApp du site lisent cette seule valeur.

## G. Modifier couleurs et textes
- **Couleurs et polices :** début de `css/style.css` (bloc `:root`) : `--ink` (noir), `--cream` (crème), `--gold` (jaune doré)…
- **Textes principaux :** `index.html` (hero, manifeste, section Studio créatif, BOUKI Tech, concepts, étapes).
- **Signature :** `config/store.js` → `tagline` (actuellement `TECH DOFF.`).
- **Services créatifs :** section `#services` dans `index.html`; adapte les offres à tes services réellement disponibles.
- **Infos pratiques (taille, livraison, retours, CGV, confidentialité) :** `config/store.js` → `info`.
- **Logo :** `assets/img/bouki-emblem.png` (fond transparent, pour fonds clairs) et `bouki-emblem-light.png` (pour fonds sombres). Le logo a été extrait de ton `bouki-emblem.jpg` : c'est un **PNG** (pas un fichier vectoriel). Si tu as le fichier vectoriel (SVG/AI), remplace-le : le rendu sera plus net en très grand.

## H. Publier sur GitHub
1. Crée un compte sur <https://github.com> puis un dépôt vide (bouton **New**), nom : `bouki-store`.
2. Dans Terminal, depuis le dossier du projet :
```bash
git init
git add .
git commit -m "BOUKI — boutique drop 001"
git branch -M main
git remote add origin https://github.com/TON-COMPTE/bouki-store.git
git push -u origin main
```
(Remplace `TON-COMPTE`. GitHub peut te demander de te connecter.)

## I. Connecter GitHub à Vercel
1. Crée un compte sur <https://vercel.com> avec **Continue with GitHub** (offre Hobby gratuite).
2. **Add New… → Project**, choisis le dépôt `bouki-store` → **Import**.
3. Réglages (voir J) puis **Deploy**. Tu obtiens une adresse `https://xxxx.vercel.app`.
4. Ensuite, chaque `git push` met le site à jour automatiquement.

## J. Commande de build
**Aucune.** Réglages Vercel :
- Framework Preset : **Other**
- Build Command : **vide**
- Output Directory : **`.`** (déjà défini dans `vercel.json`)
- Install Command : **vide**

## K. Tester avant de publier
1. Lance le site (étape B).
2. Ouvre une pièce → clique « CHOISIR D'AUTRES ARTICLES » : la pièce est ajoutée sans choix de taille et tu reviens à la collection.
3. Ouvre le panier, change les quantités, vérifie le total.
4. Remplis nom / téléphone / zone, clique « Commander sur WhatsApp » : **ne l'envoie pas** si tu ne veux pas ; vérifie que le message contient les bons produits, tailles, quantités et total, et que le numéro est `221787560327`.
5. Teste aussi sur ton téléphone (même Wi-Fi : `http://IP-DE-TON-MAC:3000`, ou directement l'adresse Vercel).

**Tests automatiques (optionnels) :**
- `npm test` → 15 tests de la logique (panier, calculs, message WhatsApp). Node 18+ requis, aucune installation.
- `node tests/e2e.cjs` → parcours complet dans un vrai navigateur aux tailles 360×800, 390×844, 768×1024, 1440×900 (nécessite `npm i -D playwright && npx playwright install chromium`). Les captures sont écrites dans `tests/screenshots/`.

## L. Informations commerciales encore à compléter ⚠
Rien n'a été inventé. À renseigner dans `config/store.js` avant le lancement public :
- [ ] **Prix définitifs** (`data/products.js`) puis `pricesConfirmed: true`
- [ ] **Photos réelles** des 7 produits
- [ ] **Livraison** (zones, délais, tarifs) : rubrique `info` « livraison » + `deliveryFee`
- [ ] **Retours et échanges** : rubrique `info` « retours »
- [ ] **Conditions de vente** : rubrique `info` « cgv »
- [ ] **Confidentialité** : texte provisoire fourni, à faire relire
- [ ] **Contact** : Instagram, TikTok, e-mail (`contact`), mentions légales / adresse si nécessaire
- [ ] **Moyens de paiement acceptés** (à communiquer sur WhatsApp, aucun paiement n'est géré par le site)
Tant qu'une rubrique vaut `text: null`, le site affiche « Information bientôt disponible… ».

## M. Publier un nouveau drop
1. Remplace les photos dans `assets/products/`.
2. Mets à jour les 7 produits dans `data/products.js` (noms, prix, tailles, couleurs, statuts, badges).
3. Change `dropName` dans `config/store.js` (ex. `"DROP 002"`).
4. Teste en local (étape K).
5. `git add . && git commit -m "Drop 002" && git push` : Vercel met le site en ligne en ~30 secondes.

Les paniers enregistrés dans les navigateurs des clients sont nettoyés automatiquement : une ligne qui ne correspond plus à un produit/taille/couleur existant est ignorée.

---

## Structure
```
bouki-store-final/
├── index.html            page unique (accueil, collection, univers, commande, infos)
├── 404.html              page d'erreur
├── config/store.js       réglages : WhatsApp, devise, livraison, infos, contact
├── config/store.example.js  exemple de configuration (sans secret)
├── data/products.js      les 7 produits  ← fichier à modifier à chaque drop
├── js/app.js             interface (fiche produit, panier, commande)
├── js/cart.js            logique du panier
├── js/whatsapp.js        construction du message et du lien WhatsApp
├── css/style.css         styles (variables de couleurs en tête)
├── assets/img/           logo (2 variantes), favicons, icônes, image de partage
├── assets/products/      visuels produits (provisoires) + image de secours
├── tests/                tests unitaires et de bout en bout
├── vercel.json  package.json  .gitignore  README.md
```

## Ce que fait (et ne fait pas) le site
- Le panier est enregistré dans le navigateur du client (`localStorage`) ; rien n'est envoyé à un serveur.
- **Aucun paiement en ligne.** Le bouton ouvre WhatsApp avec le récapitulatif ; le client doit encore appuyer sur « Envoyer ». Le site ne prétend jamais que la commande est envoyée ou payée.
- Si WhatsApp ne s'ouvre pas, le récapitulatif s'affiche avec un bouton **Copier**.
- Aucun cookie de suivi, aucune clé API, aucun secret.
- Les polices (Space Grotesk, DM Sans) viennent de Google Fonts (gratuit). Sans connexion à ce service, le site reste lisible avec des polices système.
- Les « concepts artistiques » (Hors du moule, Ndank Ndank, Dakar en mouvement) sont présentés comme pistes créatives, pas comme produits en stock.


## Modifications intégrées depuis le brief « Les changements pour le site »
- Hero enrichi pour mieux raconter l’univers streetwear, Dakar, culture et digital.
- Section boutique renommée « Merch Drops ».
- Sélecteur de tailles retiré des 7 produits ; les tailles sont désactivées dans `data/products.js`.
- Le bouton de la fiche produit devient « CHOISIR D’AUTRES ARTICLES » et ramène à la collection.
- La commande directe depuis la fiche produit ouvre le panier et exige un numéro de téléphone.
- Formulaire « Impression urgente » ajouté ; il prépare une demande de devis sur WhatsApp.
- Concepts artistiques remplacés par une présentation OMNI Score™ / manifeste BOUKI.
- Section « Comment commander » supprimée.
- BOUKI Tech reformulé pour présenter les supports et expériences interactives (menus, QR, NFC, AR).
- Informations pratiques enrichies avec l’univers BOUKI et les drops.

**Lien du groupe WhatsApp :** renseigne `communityWhatsAppGroup` dans `config/store.js` avec le vrai lien d’invitation du groupe. Tant que ce champ est vide, le bouton rejoint une conversation WhatsApp directe avec BOUKI, pas un groupe.

## Visuels et BOUKI TECH

- La direction artistique utilise désormais un en-tête noir, un hero sombre et cinématographique et des accents jaune doré, en cohérence avec la maquette de référence.
- Les sept images produits sont des visuels conceptuels générés pour la maquette ; elles ne garantissent pas le rendu réel des articles fabriqués.
- `assets/img/bouki-hero.jpg` : visuel éditorial principal.
- `assets/img/bouki-ar-editorial.jpg` : illustration conceptuelle du volet AR.
- La section BOUKI TECH présente le concept NFC/QR/AR, mais ne constitue pas une implémentation de reconnaissance AR. Le suivi réel du graphisme, les fichiers cibles, les animations, les puces NFC physiques et les QR finaux doivent encore être configurés et testés avant de les annoncer comme opérationnels.
- Les prix du Drop 001 sont indicatifs : valider les prix, le stock et les tailles avant de passer `pricesConfirmed` à `true` dans `config/store.js`.


## Version production (Univers, Impression urgente, Parcours)
- Section « BOUKI, un univers qui connecte… » : 5 univers (Streetwear, Studio créatif, Solutions interactives, Impression, Formation & 3C).
- Section `#impression` : visuel `assets/img/bouki-print-products.jpg`, formulaire validé champ par champ, message WhatsApp pré-rempli. Aucune confirmation n'est affichée tant que l'envoi n'est pas fait dans WhatsApp.
- Section `#parcours` : THÉSEYDINA — discours, timeline sans dates inventées, citation, signature. Le visuel `assets/img/bouki-studio-illustration.jpg` est une illustration (légende explicite), pas une photo.
- Le bouton produit « CHOISIR D'AUTRES ARTICLES » ajoute la pièce au panier puis ramène à la collection. Plus aucune taille n'est demandée ; les anciens paniers contenant une taille restent commandables.
- **À renseigner** dans `config/store.js` : `communityWhatsAppGroup` (lien chat.whatsapp.com — sinon le bouton ouvre une conversation WhatsApp), `contact` (Instagram, TikTok, e-mail), `pricesConfirmed`, `deliveryFee`, textes « Retours » et « Conditions de vente ».
- Tests : `npm test` (unitaires) et `node tests/e2e.cjs` (navigateur, 4 tailles d'écran).
