/* ==========================================================================
   BOUKI — LES 7 PRODUITS DU DROP  (fichier à modifier à chaque nouveau drop)
   --------------------------------------------------------------------------
   • Exactement 7 emplacements. Pour changer de drop : modifie, ne supprime pas.
   • price      : en FCFA, nombre entier sans espace (12000).  ⚠ PRIX D'EXEMPLE
                  à remplacer avant publication, puis config/store.js →
                  pricesConfirmed: true.
   • images     : une ou plusieurs photos. Chemins relatifs à la racine du site.
                  Les visuels bouki-0X.svg sont PROVISOIRES : remplace-les par
                  tes vraies photos (bouki-01.jpg, etc.) et mets à jour le chemin.
   • sizes      : liste de tailles à choisir. [] = pas de choix de taille.
   • colors     : liste { name, hex }. Une seule couleur = sélectionnée d'office.
   • status     : "available" (en stock) | "soldout" (épuisé) | "soon" (bientôt)
   • badge      : "new" | "limited" | "bestseller" | null
   • alt        : texte alternatif des images (accessibilité).
   ========================================================================== */
(function () {
  var APPAREL = ["XS", "S", "M", "L", "XL", "XXL"];
  window.PRODUCTS = [
    {
      id: "01", slug: "bouki-core", name: "BOUKI CORE",
      description: "La pièce signature : un T-shirt noir essentiel, relevé par le symbole de la hyène couronnée.",
      price: 12000, category: "T-shirt",
      images: ["assets/products/bouki-01.jpg"],
      alt: "T-shirt noir BOUKI Core avec petit emblème hyène couronnée sur fond crème",
      sizes: APPAREL, colors: [{ name: "Noir", hex: "#171717" }],
      status: "available", badge: "bestseller"
    },
    {
      id: "02", slug: "hors-du-moule", name: "HORS DU MOULE",
      description: "Une pièce écrue à grand graphisme, pensée pour celles et ceux qui tracent leur propre voie.",
      price: 12000, category: "T-shirt graphique",
      images: ["assets/products/bouki-02.jpg"],
      alt: "T-shirt écru BOUKI avec graphisme noir et jaune de la hyène couronnée",
      sizes: APPAREL, colors: [{ name: "Crème", hex: "#F5F0E6" }],
      status: "available", badge: "new"
    },
    {
      id: "03", slug: "dakar-en-mouvement", name: "DAKAR EN MOUVEMENT",
      description: "Un hommage graphique à l'énergie urbaine de Dakar, entre architecture, mouvement et culture.",
      price: 12000, category: "T-shirt graphique",
      images: ["assets/products/bouki-03.jpg"],
      alt: "T-shirt noir avec graphisme urbain jaune et crème inspiré de Dakar",
      sizes: APPAREL, colors: [{ name: "Noir", hex: "#171717" }],
      status: "available", badge: "limited"
    },
    {
      id: "04", slug: "instinct-hoodie", name: "INSTINCT HOODIE",
      description: "Un hoodie noir à forte présence, avec la couronne et la hyène en signature centrale.",
      price: 18000, category: "Hoodie",
      images: ["assets/products/bouki-04.jpg"],
      alt: "Sweat à capuche noir BOUKI avec grand emblème jaune et crème",
      sizes: APPAREL, colors: [{ name: "Noir", hex: "#171717" }],
      status: "available", badge: "limited"
    },
    {
      id: "05", slug: "bouki-signature-cap", name: "BOUKI SIGNATURE",
      description: "Une casquette noire minimaliste pour porter le symbole BOUKI au quotidien.",
      price: 8000, category: "Casquette",
      images: ["assets/products/bouki-05.jpg"],
      alt: "Casquette noire BOUKI brodée du symbole de la hyène couronnée",
      sizes: [], colors: [{ name: "Noir", hex: "#171717" }],
      status: "available", badge: null
    },
    {
      id: "06", slug: "bouki-everyday-tote", name: "BOUKI EVERYDAY",
      description: "Un tote bag écru pour transporter tes essentiels avec une signature graphique affirmée.",
      price: 7000, category: "Tote bag",
      images: ["assets/products/bouki-06.jpg"],
      alt: "Tote bag en toile écrue avec grande hyène couronnée noire et jaune",
      sizes: [], colors: [{ name: "Crème", hex: "#F5F0E6" }],
      status: "available", badge: null
    },
    {
      id: "07", slug: "hors-du-moule-mug", name: "HORS DU MOULE. MUG",
      description: "Un mug noir aux détails jaunes, pour garder l'esprit BOUKI même hors de la rue.",
      price: 7000, category: "Mug",
      images: ["assets/products/bouki-07.jpg"],
      alt: "Mug noir BOUKI avec emblème jaune et crème et intérieur jaune",
      sizes: [], colors: [{ name: "Noir / Jaune", hex: "#171717" }],
      status: "available", badge: "new"
    }
  ];
})();
