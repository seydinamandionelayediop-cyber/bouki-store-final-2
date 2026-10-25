/* BOUKI — Logique du panier (pure, testable sous Node). Le stockage est injecté. */
(function (root) {
  "use strict";

  var KEY_VERSION = "bouki-cart-v1";

  function createCart(products, opts) {
    opts = opts || {};
    var maxQty = opts.maxQty || 10;
    var storage = opts.storage || null;
    var items = []; // { id, size, color, qty }

    function find(id) { for (var i = 0; i < products.length; i++) if (products[i].id === id) return products[i]; return null; }
    function keyOf(l) { return [l.id, l.size || "", l.color || ""].join("|"); }
    function clamp(q) { q = Math.floor(Number(q)); if (!isFinite(q) || q < 1) return 1; return Math.min(q, maxQty); }

    /** Contrôle les options obligatoires. → { ok, error } */
    function validateSelection(product, sel) {
      if (!product) return { ok: false, error: "Produit introuvable." };
      if (product.status !== "available") return { ok: false, error: "Ce produit n'est pas disponible pour le moment." };
      if (product.sizes && product.sizes.length && (!sel.size || product.sizes.indexOf(sel.size) < 0))
        return { ok: false, error: "Choisis une taille." };
      var names = (product.colors || []).map(function (c) { return c.name; });
      if (names.length && (!sel.color || names.indexOf(sel.color) < 0))
        return { ok: false, error: "Choisis une couleur." };
      return { ok: true, error: "" };
    }

    function save() {
      if (!storage) return;
      try { storage.setItem(KEY_VERSION, JSON.stringify(items)); } catch (e) { /* stockage indisponible : le panier reste en mémoire */ }
    }

    function load() {
      if (!storage) return;
      try {
        var raw = JSON.parse(storage.getItem(KEY_VERSION) || "[]");
        if (!Array.isArray(raw)) return;
        raw.forEach(function (l) {
          var p = l && find(String(l.id));
          if (!p || !validateSelection(p, { size: l.size || "", color: l.color || "" }).ok) return; // ligne périmée : ignorée
          var line = { id: p.id, size: l.size || "", color: l.color || "", qty: clamp(l.qty) };
          var ex = items.filter(function (x) { return keyOf(x) === keyOf(line); })[0];
          if (ex) ex.qty = clamp(ex.qty + line.qty); else items.push(line);
        });
      } catch (e) { items = []; }
    }

    function add(id, sel, qty) {
      var p = find(id), v = validateSelection(p, sel || {});
      if (!v.ok) return v;
      var line = { id: p.id, size: (sel && sel.size) || "", color: (sel && sel.color) || "", qty: clamp(qty || 1) };
      var ex = items.filter(function (x) { return keyOf(x) === keyOf(line); })[0];
      if (ex) ex.qty = clamp(ex.qty + line.qty); else items.push(line);
      save();
      return { ok: true, error: "" };
    }
    function remove(key) { items = items.filter(function (l) { return keyOf(l) !== key; }); save(); }
    function setQty(key, qty) {
      var q = Math.floor(Number(qty));
      if (q < 1) return remove(key);
      items.forEach(function (l) { if (keyOf(l) === key) l.qty = clamp(q); });
      save();
    }
    function clear() { items = []; save(); }
    function lines() {
      return items.map(function (l) { return { key: keyOf(l), product: find(l.id), size: l.size, color: l.color, qty: l.qty }; });
    }
    function count() { return items.reduce(function (n, l) { return n + l.qty; }, 0); }
    function subtotal() { return lines().reduce(function (s, l) { return s + l.product.price * l.qty; }, 0); }

    load();
    return { add: add, remove: remove, setQty: setQty, clear: clear, lines: lines, count: count,
             subtotal: subtotal, validateSelection: validateSelection, keyOf: keyOf, maxQty: maxQty };
  }

  var api = { createCart: createCart };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.BoukiCart = api;
})(typeof window !== "undefined" ? window : globalThis);
