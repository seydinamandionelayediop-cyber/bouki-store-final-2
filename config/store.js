/* ==========================================================================
   BOUKI — CONFIGURATION CENTRALE DE LA BOUTIQUE
   Tout ce qui est réglable sans toucher au code est ici.
   Ce fichier ne contient AUCUN secret : il est public sur le site.
   ========================================================================== */
window.STORE = {
  brand: "BOUKI",
  tagline: "TECH DOFF.",
  dropName: "DROP 001",
  siteUrl: "", // ex. "https://bouki.vercel.app" — optionnel, utile pour le partage

  // WhatsApp : format international, SANS « + », espaces ou tirets.
  whatsappNumber: "221787560327",
  // GROUPE WHATSAPP BOUKI : colle ici le lien d’invitation (https://chat.whatsapp.com/XXXX).
  // Tant qu’il est vide, le bouton « Rejoindre » ouvre une conversation WhatsApp avec BOUKI.
  communityWhatsAppGroup: "",

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
    { id: "commander", title: "Comment ça marche ?",
      text: "Choisis tes pièces et ajoute-les au panier, puis renseigne ton numéro de téléphone et envoie le récapitulatif sur WhatsApp. Nous confirmons la disponibilité, la livraison et le paiement avec toi. Aucune commande n'est validée tant que tu n'as pas appuyé sur « Envoyer » dans WhatsApp." },
    { id: "paiement",  title: "Paiement",
      text: "Il n'y a pas de paiement en ligne sur ce site. Les modalités de paiement sont confirmées avec toi sur WhatsApp avant la validation de la commande." },
    { id: "livraison", title: "Livraison",
      text: "Les frais et le délai de livraison dépendent de ta zone. Ils te sont confirmés sur WhatsApp avant toute validation." },
    { id: "impression", title: "Impression urgente et devis",
      text: "Pour un support à produire rapidement, remplis le formulaire « Impression urgente ». Nous te recontactons sur WhatsApp pour confirmer la faisabilité, le délai et le devis. Aucun délai n'est garanti avant cette confirmation." },
    { id: "studio",    title: "Studio créatif et solutions interactives",
      text: "Identité visuelle, packaging, QR codes, NFC, menus interactifs, réalité augmentée : écris-nous sur WhatsApp pour présenter ton projet, nous te répondons avec une proposition adaptée." },
    { id: "omni",      title: "OMNI Score™",
      text: "L'OMNI Score™ est un diagnostic de maturité digitale pour les marques et les projets. Écris-nous sur WhatsApp pour en savoir plus." },
    { id: "retours",   title: "Retours et échanges", text: null },
    { id: "cgv",       title: "Conditions de vente", text: null },
    { id: "confid",    title: "Confidentialité",
      text: "Cette boutique n'utilise ni compte client, ni paiement en ligne, ni cookie de suivi. Le panier est gardé uniquement dans ton navigateur. Les informations que tu saisis (nom, téléphone, zone, demande d'impression) ne sont envoyées nulle part : elles sont seulement ajoutées au message WhatsApp que tu choisis d'envoyer." }
  ],
  provisionalText: "Information bientôt disponible. Pour le moment, écris-nous sur WhatsApp : nous te répondons avec tous les détails."
};
