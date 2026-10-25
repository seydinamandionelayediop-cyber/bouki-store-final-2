// Tests unitaires : panier + message WhatsApp.  Lancer : npm test   (Node ≥ 18, aucune dépendance)
const test = require("node:test");
const assert = require("node:assert/strict");
const { createCart } = require("../js/cart.js");
const WA = require("../js/whatsapp.js");

global.window = {};
require("../config/store.js");
require("../data/products.js");
const STORE = global.window.STORE, PRODUCTS = global.window.PRODUCTS;

const memStorage = () => { const m = {}; return { getItem: k => (k in m ? m[k] : null), setItem: (k, v) => { m[k] = String(v); }, _m: m }; };

test("7 produits exactement, champs obligatoires présents", () => {
  assert.equal(PRODUCTS.length, 7);
  const ids = new Set(PRODUCTS.map(p => p.id)), slugs = new Set(PRODUCTS.map(p => p.slug));
  assert.equal(ids.size, 7); assert.equal(slugs.size, 7);
  for (const p of PRODUCTS) {
    for (const f of ["id", "slug", "name", "description", "category", "alt", "status"]) assert.ok(p[f], `${p.id}.${f}`);
    assert.ok(Number.isInteger(p.price) && p.price > 0);
    assert.ok(p.images.length >= 1);
  }
});

test("numéro WhatsApp exact", () => assert.equal(STORE.whatsappNumber, "221787560327"));

test("format prix", () => {
  assert.equal(WA.formatPrice(12000), "12 000 FCFA");
  assert.equal(WA.formatPrice(6500), "6 500 FCFA");
  assert.equal(WA.formatPrice(1250000), "1 250 000 FCFA");
});

test("taille obligatoire pour un vêtement, pas pour un accessoire", () => {
  const c = createCart(PRODUCTS);
  assert.equal(c.add("01", { color: "Noir" }, 1).ok, false);
  assert.equal(c.count(), 0);
  assert.equal(c.add("01", { size: "M", color: "Noir" }, 1).ok, true);
  assert.equal(c.add("05", { color: "Noir" }, 1).ok, true);
  assert.equal(c.add("01", { size: "ZZ", color: "Noir" }, 1).ok, false);
});

test("variantes = lignes distinctes, même variante = cumul", () => {
  const c = createCart(PRODUCTS);
  c.add("01", { size: "M", color: "Noir" }, 1); c.add("01", { size: "L", color: "Noir" }, 1); c.add("01", { size: "M", color: "Noir" }, 2);
  assert.equal(c.lines().length, 2); assert.equal(c.count(), 4);
  assert.equal(c.lines().find(l => l.size === "M").qty, 3);
});

test("quantités : plafond, plancher, suppression", () => {
  const c = createCart(PRODUCTS, { maxQty: 10 });
  c.add("05", { color: "Noir" }, 99);
  assert.equal(c.count(), 10);
  const k = c.lines()[0].key;
  c.setQty(k, 4); assert.equal(c.count(), 4);
  c.setQty(k, "abc"); // valeur invalide : jamais de NaN
  assert.ok(Number.isFinite(c.count()) && c.count() >= 0);
  c.setQty(k, 4);
  c.setQty(k, 0); assert.equal(c.lines().length, 0);
});

test("totaux exacts", () => {
  const c = createCart(PRODUCTS);
  c.add("01", { size: "M", color: "Noir" }, 2);   // 2 × 12000
  c.add("04", { size: "L", color: "Noir" }, 1);   // 18000
  c.add("07", { color: "Noir / Jaune" }, 3);      // 3 × 7000
  assert.equal(c.subtotal(), 24000 + 18000 + 21000);
});

test("persistance + rejet des lignes périmées/corrompues", () => {
  const s = memStorage();
  const a = createCart(PRODUCTS, { storage: s }); a.add("02", { size: "S", color: "Crème" }, 2);
  const b = createCart(PRODUCTS, { storage: s });
  assert.equal(b.count(), 2); assert.equal(b.subtotal(), 24000);
  s.setItem("bouki-cart-v1", JSON.stringify([{ id: "99", qty: 3 }, { id: "01", size: "M", color: "Noir", qty: -5 }, { id: "01", size: "??", color: "Noir", qty: 1 }]));
  const c = createCart(PRODUCTS, { storage: s });
  assert.equal(c.lines().length, 1); assert.equal(c.count(), 1);
  s.setItem("bouki-cart-v1", "{pas du json");
  assert.equal(createCart(PRODUCTS, { storage: s }).count(), 0);
});

test("stockage indisponible : le panier fonctionne en mémoire", () => {
  const broken = { getItem() { throw new Error("x"); }, setItem() { throw new Error("x"); } };
  const c = createCart(PRODUCTS, { storage: broken });
  assert.equal(c.add("05", { color: "Noir" }, 1).ok, true); assert.equal(c.count(), 1);
});

test("produit épuisé non ajoutable", () => {
  const list = PRODUCTS.map(p => p.id === "05" ? { ...p, status: "soldout" } : p);
  assert.equal(createCart(list).add("05", { color: "Noir" }, 1).ok, false);
});

test("message WhatsApp : contenu, totaux, accents, encodage", () => {
  const c = createCart(PRODUCTS);
  c.add("01", { size: "M", color: "Noir" }, 2); c.add("06", { color: "Crème" }, 1);
  const lines = c.lines();
  const msg = WA.buildOrderMessage({ store: STORE, lines, ref: "BK-TEST-0001",
    customer: { name: "Awa Diop", phone: "77 123 45 67", zone: "Yoff, Dakar", notes: "Livraison après 18h — merci !" } });
  assert.match(msg, /^Bonjour BOUKI, je souhaite commander :/);
  assert.match(msg, /Référence : BK-TEST-0001/);
  assert.match(msg, /1\. Produit : BOUKI CORE\n   Taille : M\n   Couleur : Noir\n   Quantité : 2\n   Prix unitaire : 12 000 FCFA/);
  assert.match(msg, /2\. Produit : BOUKI EVERYDAY\n   Couleur : Crème\n   Quantité : 1\n   Prix unitaire : 7 000 FCFA/);
  assert.match(msg, /Sous-total : 31 000 FCFA/);
  assert.match(msg, /Livraison : frais à confirmer/);
  assert.match(msg, /Total estimé : 31 000 FCFA \(hors livraison\)/);
  assert.match(msg, /Nom : Awa Diop\nTéléphone : 77 123 45 67\nZone de livraison : Yoff, Dakar\nNotes : Livraison après 18h — merci !/);
  const url = WA.buildWhatsAppUrl(STORE.whatsappNumber, msg);
  assert.ok(url.startsWith("https://wa.me/221787560327?text="));
  assert.ok(!/[ \n]/.test(url));
  assert.equal(decodeURIComponent(url.split("?text=")[1]), msg);
  assert.ok(url.includes("%C3%A8me")); // è encodé en UTF-8
});

test("frais de livraison configurés : ajoutés au total", () => {
  const c = createCart(PRODUCTS); c.add("05", { color: "Noir" }, 1);
  const msg = WA.buildOrderMessage({ store: { ...STORE, deliveryFee: 2000 }, lines: c.lines() });
  assert.match(msg, /Livraison : 2 000 FCFA/); assert.match(msg, /Total estimé : 10 000 FCFA\n/);
});

test("validation du téléphone", () => {
  for (const ok of ["", "771234567", "+221 77 123 45 67", "77-123-45-67"]) assert.equal(WA.isValidPhone(ok), true, ok);
  for (const ko of ["abc", "123", "77 12", "+++221"]) assert.equal(WA.isValidPhone(ko), false, ko);
});

test("référence de commande", () => assert.match(WA.makeOrderRef(new Date(2026, 9, 24), 0.5), /^BK-261024-[0-9A-Z]{4}$/));
test("numéro vide refusé", () => assert.throws(() => WA.buildWhatsAppUrl("", "x")));
