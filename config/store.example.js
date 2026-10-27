/* EXEMPLE DE CONFIGURATION — copie de config/store.js sans aucune donnée sensible.
   Le fichier réellement utilisé par le site est config/store.js. */
window.STORE = {
  brand: "BOUKI",
  tagline: "HORS DU MOULE.",
  dropName: "DROP 001",
  siteUrl: "", // ex. "https://bouki.vercel.app" — optionnel, utile pour le partage

  // WhatsApp : format international, SANS « + », espaces ou tirets.
  whatsappNumber: "221787560327",

  currency: "FCFA",
  maxQtyPerLine: 10, // quantité maximale par ligne de panier

  // ⚠ PRIX : les prix de data/products.js sont des PRIX D'EXEMPLE tant que
  // cette valeur est false (un bandeau « prix indicatifs » est alors affiché).
  // Passe-la à true quand tu as validé tes prix définitifs.
  pricesConfirmed: false,

  // Frais de livraison en FCFA. null = non configurés → le message WhatsApp
  // indique « frais de livraison à confirmer ». Exemple : 2000
  deliveryFee: null,

  // Coordonnées publiques (null = non affiché). À COMPLÉTER avant le lancement.
  contact: {
    instagram: null, // ex. "https://instagram.com/bouki"
    tiktok: null,
    email: null,     // ex. "contact@bouki.sn"
    address: null    // ne rien inventer : laisser null si pas d'adresse publique
  },

  // Rubriques d'information. texte = null → message provisoire affiché.
  // ⚠ Remplace chaque null par ton vrai texte avant le lancement public.
  info: [
    { id: "commander", title: "Comment ça marche ?", text: "Choisis tes pièces, ajoute-les au panier puis envoie le récapitulatif sur WhatsApp." },
    { id: "livraison", title: "Livraison", text: null },
    { id: "retours",   title: "Retours et échanges", text: null },
    { id: "cgv",       title: "Conditions de vente", text: null },
    { id: "confid",    title: "Confidentialité",
      text: "Cette boutique n'utilise ni compte client, ni paiement en ligne, ni cookie de suivi. Le panier est gardé uniquement dans ton navigateur. Les informations que tu saisis (nom, téléphone, zone) ne sont envoyées nulle part : elles sont seulement ajoutées au message WhatsApp que tu choisis d'envoyer." }
  ],
  provisionalText: "Information bientôt disponible. Pour le moment, écris-nous sur WhatsApp : nous te répondons avec tous les détails."
};
