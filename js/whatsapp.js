/* BOUKI — Construction du message WhatsApp (logique pure, testable sous Node) */
(function (root) {
  "use strict";

  /** 12000 → "12 000 FCFA" (espaces simples, sans dépendre d'Intl) */
  function formatPrice(n, currency) {
    var v = Math.round(Number(n) || 0);
    return String(v).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " " + (currency || "FCFA");
  }

  /** Référence locale de commande : BK-YYMMDD-XXXX (non unique côté serveur, simple repère). */
  function makeOrderRef(date, rnd) {
    var d = date || new Date();
    var p = function (n) { return String(n).padStart(2, "0"); };
    var r = (rnd !== undefined ? rnd : Math.random());
    var tail = Math.floor(r * 36 * 36 * 36 * 36).toString(36).toUpperCase().padStart(4, "0");
    return "BK-" + String(d.getFullYear()).slice(2) + p(d.getMonth() + 1) + p(d.getDate()) + "-" + tail;
  }

  /** Lignes : [{ product:{name,price}, size, color, qty }] */
  function computeTotals(lines, store) {
    var subtotal = lines.reduce(function (s, l) { return s + l.product.price * l.qty; }, 0);
    var fee = (store && typeof store.deliveryFee === "number") ? store.deliveryFee : null;
    return { subtotal: subtotal, fee: fee, total: subtotal + (fee || 0) };
  }

  function buildOrderMessage(opts) {
    var store = opts.store, lines = opts.lines, c = opts.customer || {}, cur = store.currency || "FCFA";
    var t = computeTotals(lines, store);
    var out = ["Bonjour " + store.brand + ", je souhaite commander :", ""];
    if (opts.ref) out.splice(1, 0, "Référence : " + opts.ref);
    lines.forEach(function (l, i) {
      out.push((i + 1) + ". Produit : " + l.product.name);
      if (l.size) out.push("   Taille : " + l.size);
      if (l.color) out.push("   Couleur : " + l.color);
      out.push("   Quantité : " + l.qty);
      out.push("   Prix unitaire : " + formatPrice(l.product.price, cur));
      out.push("");
    });
    out.push("Sous-total : " + formatPrice(t.subtotal, cur));
    out.push(t.fee === null ? "Livraison : frais à confirmer" : "Livraison : " + formatPrice(t.fee, cur));
    out.push("Total estimé : " + formatPrice(t.total, cur) + (t.fee === null ? " (hors livraison)" : ""));
    out.push("");
    out.push("Nom : " + (c.name || ""));
    out.push("Téléphone : " + (c.phone || ""));
    out.push("Zone de livraison : " + (c.zone || ""));
    out.push("Notes : " + (c.notes || ""));
    out.push("");
    out.push("Merci de confirmer la disponibilité, les frais de livraison et les modalités de paiement.");
    return out.join("\n");
  }

  function buildWhatsAppUrl(number, text) {
    var n = String(number || "").replace(/\D/g, "");
    if (!n) throw new Error("Numéro WhatsApp non configuré");
    return "https://wa.me/" + n + "?text=" + encodeURIComponent(text);
  }

  /** Téléphone optionnel : 8 à 15 chiffres, +, espaces, points, tirets, parenthèses tolérés. */
  function isValidPhone(v) {
    if (!v) return true;
    if (!/^[+\d][\d\s.\-()]*$/.test(v.trim())) return false;
    var digits = v.replace(/\D/g, "").length;
    return digits >= 8 && digits <= 15;
  }

  var api = { formatPrice: formatPrice, makeOrderRef: makeOrderRef, computeTotals: computeTotals,
              buildOrderMessage: buildOrderMessage, buildWhatsAppUrl: buildWhatsAppUrl, isValidPhone: isValidPhone };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.BoukiWA = api;
})(typeof window !== "undefined" ? window : globalThis);
