/* BOUKI — Interface de la boutique (aucune dépendance, aucun build) */
(function () {
  "use strict";

  var STORE = window.STORE, PRODUCTS = window.PRODUCTS, WA = window.BoukiWA, Cart = window.BoukiCart;
  var FALLBACK_IMG = "assets/products/placeholder.svg";
  var BADGES = { new: "NOUVEAU", limited: "ÉDITION LIMITÉE", bestseller: "BEST-SELLER" };
  var STATUS = { available: "En stock", soldout: "Épuisé", soon: "Bientôt disponible" };

  /* ---------- utilitaires ---------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function h(tag, attrs) {
    var el = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      var v = attrs[k];
      if (v === null || v === undefined || v === false) return;
      if (k === "class") el.className = v;
      else if (k === "text") el.textContent = v;
      else el.setAttribute(k, v === true ? "" : v);
    });
    for (var i = 2; i < arguments.length; i++) {
      var c = arguments[i];
      if (c === null || c === undefined || c === false) continue;
      el.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    }
    return el;
  }
  function money(n) { return WA.formatPrice(n, STORE.currency); }
  function safeStorage() {
    try { var s = window.localStorage, k = "__bouki_probe"; s.setItem(k, "1"); s.removeItem(k); return s; } catch (e) { return null; }
  }
  function img(src, alt, cls, lazy) {
    var el = h("img", { src: src, alt: alt || "", class: cls, loading: lazy ? "lazy" : null, decoding: "async" });
    el.addEventListener("error", function () { if (el.getAttribute("src") !== FALLBACK_IMG) el.setAttribute("src", FALLBACK_IMG); });
    return el;
  }
  var toastTimer;
  function toast(msg) {
    var t = $("#toast"); t.textContent = msg; t.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.classList.remove("show"); }, 2600);
  }
  function waLink(text) { return WA.buildWhatsAppUrl(STORE.whatsappNumber, text); }

  var cart = Cart.createCart(PRODUCTS, { storage: safeStorage(), maxQty: STORE.maxQtyPerLine });

  /* ---------- dialogues ---------- */
  function openDialog(d) {
    $$("dialog[open]").forEach(function (o) { if (o !== d) o.close(); });
    if (typeof d.showModal === "function") d.showModal(); else d.setAttribute("open", "");
    document.body.classList.add("locked");
  }
  function wireDialog(d) {
    d.addEventListener("click", function (e) { if (e.target === d) d.close(); });
    d.addEventListener("close", function () { if (!$("dialog[open]")) document.body.classList.remove("locked"); });
    $$("[data-close]", d).forEach(function (b) { b.addEventListener("click", function () { d.close(); }); });
  }
  ["productDialog", "cartDialog", "recapDialog"].forEach(function (id) { wireDialog($("#" + id)); });

  /* ---------- textes de config ---------- */
  $$("[data-drop-name]").forEach(function (n) { n.textContent = STORE.dropName; });
  $$("[data-drop-number]").forEach(function (n) { n.textContent = String(STORE.dropName).replace(/\D/g, "") || n.textContent; });
  $("#year").textContent = new Date().getFullYear();
  document.title = "BOUKI — Streetwear, création & expériences digitales · TECH DOFF.";
  $$("[data-wa]").forEach(function (a) {
    var purpose = a.getAttribute("data-wa");
    var msg = purpose === "community"
      ? "Bonjour BOUKI, je souhaite rejoindre la communauté et être prévenu des prochains drops."
      : purpose === "studio"
        ? "Bonjour BOUKI, je souhaite en savoir plus sur le studio créatif (identité visuelle, branding, packaging, direction artistique). Pouvez-vous m’orienter ?"
      : purpose === "services"
        ? "Bonjour BOUKI, je souhaite discuter d’un projet créatif/digital. Je suis intéressé(e) par vos services d’identité de marque, d’expériences digitales et interactives, de supports de communication ou de stratégie marketing innovante. Pouvez-vous m’orienter ?"
        : "Bonjour BOUKI, je souhaite avoir des informations sur le drop.";
    a.setAttribute("href", purpose === "community" && STORE.communityWhatsAppGroup ? STORE.communityWhatsAppGroup : waLink(msg));
  });
  if (!STORE.pricesConfirmed) { $("#priceNote").hidden = false; $("#cartPriceNote").hidden = false; }
  (function socials() {
    var c = STORE.contact || {}, box = $("#footSocials");
    [["Instagram", c.instagram], ["TikTok", c.tiktok], ["E-mail", c.email ? "mailto:" + c.email : null]].forEach(function (x) {
      if (x[1]) box.appendChild(h("a", { href: x[1], target: x[1].indexOf("mailto:") ? "_blank" : null, rel: "noopener" }, x[0] + " ↗"));
    });
  })();

  /* ---------- menu mobile ---------- */
  var menuBtn = $("#menuBtn"), nav = $("#mainNav");
  function setMenu(open) {
    nav.classList.toggle("open", open); menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
  }
  menuBtn.addEventListener("click", function () { setMenu(!nav.classList.contains("open")); });
  $$("a", nav).forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && nav.classList.contains("open")) { setMenu(false); menuBtn.focus(); } });

  /* ---------- grille produits ---------- */
  function productCard(p, i) {
    var sold = p.status !== "available";
    var media = h("a", { class: "card-media", href: "#produit/" + p.slug, tabindex: "-1", "aria-hidden": "true" },
      img(p.images[0], p.alt, null, i > 3),
      p.badge && BADGES[p.badge] ? h("span", { class: "badge", text: BADGES[p.badge] }) : null,
      sold ? h("span", { class: "badge badge-dark", text: STATUS[p.status] ? STATUS[p.status].toUpperCase() : "INDISPONIBLE" }) : null,
      h("span", { class: "idx", text: p.id }));
    return h("article", { class: "card reveal", style: "--i:" + (i % 4) },
      media,
      h("p", { class: "card-cat", text: p.category }),
      h("h3", { class: "card-name" }, h("a", { href: "#produit/" + p.slug, text: p.name })),
      h("p", { class: "card-price", text: money(p.price) }),
      h("a", { class: "card-cta", href: "#produit/" + p.slug, "aria-label": (sold ? "Voir " : "Choisir ") + p.name },
        sold ? "Voir la pièce" : "Choisir", h("span", { "aria-hidden": "true", text: "+" })));
  }
  function renderGrid() {
    var grid = $("#productGrid"); grid.textContent = "";
    PRODUCTS.slice(0, 7).forEach(function (p, i) { grid.appendChild(productCard(p, i)); });
    grid.appendChild(h("a", { class: "card card-promo reveal", "data-wa": "tile", href: waLink("Bonjour BOUKI, je souhaite avoir des informations sur le drop."), target: "_blank", rel: "noopener" },
      h("span", { class: "promo-k", text: "Une question ?" }),
      h("span", { class: "promo-t", text: "Écris-nous sur WhatsApp" }),
      h("span", { class: "promo-a", "aria-hidden": "true", text: "↗" })));
  }

  /* ---------- fiche produit ---------- */
  var current = null; // { p, color, qty }
  function chipGroup(name, legend, values, selected, onChange) {
    var set = h("fieldset", { class: "opt", id: "opt-" + name }, h("legend", {}, legend));
    var row = h("div", { class: "chips" });
    values.forEach(function (v) {
      var id = "pd-" + name + "-" + v.value.replace(/\W/g, "");
      var input = h("input", { type: "radio", name: "pd-" + name, id: id, value: v.value, checked: selected === v.value });
      input.addEventListener("change", function () { onChange(v.value); setErr(""); });
      var label = h("label", { for: id, class: "chip" }, v.hex ? h("i", { class: "sw", style: "background:" + v.hex, "aria-hidden": "true" }) : null, v.label || v.value);
      row.appendChild(input); row.appendChild(label);
    });
    set.appendChild(row); return set;
  }
  function setErr(msg) { var e = $("#pdErr"); if (e) { e.textContent = msg; e.hidden = !msg; } }

  function openProduct(p, pushHash) {
    var sold = p.status !== "available";
    current = { p: p, color: (p.colors && p.colors.length === 1) ? p.colors[0].name : "", qty: 1 };
    var body = $("#productBody"); body.textContent = "";

    var main = img(p.images[0], p.alt, "pd-main", false);
    var thumbs = h("div", { class: "pd-thumbs" });
    if (p.images.length > 1) p.images.forEach(function (src, k) {
      var t = h("button", { type: "button", class: "pd-thumb", "aria-label": "Voir la photo " + (k + 1), "aria-current": k === 0 ? "true" : null }, img(src, "", null, true));
      t.addEventListener("click", function () {
        main.setAttribute("src", src); $$(".pd-thumb", thumbs).forEach(function (x) { x.removeAttribute("aria-current"); }); t.setAttribute("aria-current", "true");
      });
      thumbs.appendChild(t);
    });

    var qtyVal = h("output", { id: "pdQty", "aria-live": "polite", text: "1" });
    function setQty(n) { current.qty = Math.max(1, Math.min(cart.maxQty, n)); qtyVal.textContent = current.qty; }
    var minus = h("button", { type: "button", class: "q-btn", "aria-label": "Diminuer la quantité", text: "−" });
    var plus = h("button", { type: "button", class: "q-btn", "aria-label": "Augmenter la quantité", text: "+" });
    minus.addEventListener("click", function () { setQty(current.qty - 1); });
    plus.addEventListener("click", function () { setQty(current.qty + 1); });

    var addBtn = h("button", { type: "button", class: "btn btn-dark full", disabled: sold, text: sold ? "Indisponible" : "CHOISIR D’AUTRES ARTICLES" });
    var waBtn = h("button", { type: "button", class: "btn btn-gold full", disabled: sold }, "Commander sur WhatsApp ", h("span", { "aria-hidden": "true", text: "↗" }));

    function check() {
      var v = cart.validateSelection(p, { color: current.color });
      if (!v.ok) { setErr(v.error); var f = $("#opt-color input"); if (f) f.focus(); }
      return v.ok;
    }
    addBtn.addEventListener("click", function () {
      if (sold || !check()) return;
      cart.add(p.id, { color: current.color }, current.qty);
      renderCart(); bump();
      $("#productDialog").close(); clearHash();
      $("#collection").scrollIntoView({ behavior: "smooth", block: "start" });
      toast(p.name + " ajouté au panier. Choisis d’autres articles.");
    });
    waBtn.addEventListener("click", function () {
      if (!check()) return;
      cart.add(p.id, { color: current.color }, current.qty);
      renderCart(); $("#productDialog").close(); clearHash();
      openDialog($("#cartDialog"));
      $("#fPhone").focus();
      toast("Renseigne ton numéro pour continuer la commande");
    });

    var close = h("button", { type: "button", class: "icon-btn modal-x", "data-close": "", "aria-label": "Fermer la fiche produit", text: "×" });
    var info = h("div", { class: "pd-info" },
      h("p", { class: "card-cat", text: p.category }),
      h("h2", { id: "pdName", text: p.name }),
      h("p", { class: "pd-price" }, money(p.price), !STORE.pricesConfirmed ? h("small", { text: " prix indicatif" }) : null),
      p.badge && BADGES[p.badge] ? h("p", {}, h("span", { class: "badge static", text: BADGES[p.badge] })) : null,
      h("p", { class: "pd-desc", text: p.description }),
      h("p", { class: "pd-status " + p.status }, h("i", { "aria-hidden": "true" }), STATUS[p.status] || "Indisponible"),
      p.colors && p.colors.length ? chipGroup("color", "Couleur", p.colors.map(function (c) { return { value: c.name, hex: c.hex }; }), current.color, function (v) { current.color = v; }) : null,
      h("div", { class: "opt" }, h("span", { class: "legend", text: "Quantité" }), h("div", { class: "qty" }, minus, qtyVal, plus)),
      h("p", { id: "pdErr", class: "form-error", role: "alert", hidden: true }),
      h("div", { class: "pd-actions" }, addBtn, waBtn),
      h("p", { class: "fine", text: "Pas de paiement en ligne : la commande se confirme sur WhatsApp." }));

    body.appendChild(close);
    body.appendChild(h("div", { class: "pd-grid" }, h("div", { class: "pd-gallery" }, main, thumbs), info));
    wireDialog$(close);
    var d = $("#productDialog"); openDialog(d);
    if (pushHash) history.replaceState(null, "", "#produit/" + p.slug);
  }
  function wireDialog$(btn) { btn.addEventListener("click", function () { $("#productDialog").close(); }); }
  function clearHash() { if (location.hash) history.replaceState(null, "", location.pathname + location.search); }
  $("#productDialog").addEventListener("close", function () { if (!this.open && /^#produit\//.test(location.hash)) clearHash(); });

  function routeFromHash() {
    var m = /^#produit\/([\w-]+)$/.exec(location.hash);
    if (!m) return;
    var p = PRODUCTS.filter(function (x) { return x.slug === m[1]; })[0];
    if (p) openProduct(p, false);
  }
  window.addEventListener("hashchange", routeFromHash);

  /* ---------- panier ---------- */
  function bump() { var c = $("#cartCount"); c.classList.remove("bump"); void c.offsetWidth; c.classList.add("bump"); }
  var focusKey = null;
  function renderCart() {
    var lines = cart.lines(), n = cart.count(), list = $("#cartLines"), empty = !lines.length;
    $("#cartCount").textContent = n; $("#cartCount").setAttribute("aria-label", n + (n > 1 ? " articles" : " article"));
    $("#cartTitleCount").textContent = "(" + n + ")";
    $("#cartEmpty").hidden = !empty; $("#cartSummary").hidden = empty;
    list.textContent = "";
    lines.forEach(function (l) {
      var opts = [l.color].filter(Boolean).join(" · ");
      var minus = h("button", { type: "button", class: "q-btn", "data-act": "minus", "data-key": l.key, "aria-label": "Diminuer la quantité de " + l.product.name, text: "−" });
      var plus = h("button", { type: "button", class: "q-btn", "data-act": "plus", "data-key": l.key, "aria-label": "Augmenter la quantité de " + l.product.name, disabled: l.qty >= cart.maxQty, text: "+" });
      var del = h("button", { type: "button", class: "link-btn", "data-act": "del", "data-key": l.key, "aria-label": "Supprimer " + l.product.name + (opts ? " (" + opts + ")" : "") }, "Supprimer");
      minus.addEventListener("click", function () { focusKey = l.key + "|minus"; cart.setQty(l.key, l.qty - 1); renderCart(); });
      plus.addEventListener("click", function () { focusKey = l.key + "|plus"; cart.setQty(l.key, l.qty + 1); renderCart(); });
      del.addEventListener("click", function () { focusKey = "list"; cart.remove(l.key); renderCart(); });
      list.appendChild(h("li", { class: "cart-line" },
        img(l.product.images[0], l.product.alt, "cl-img", true),
        h("div", { class: "cl-info" },
          h("p", { class: "cl-name", text: l.product.name }),
          opts ? h("p", { class: "cl-opts", text: opts }) : null,
          h("p", { class: "cl-unit", text: money(l.product.price) + " l’unité" }),
          h("div", { class: "cl-row" }, h("div", { class: "qty sm" }, minus, h("output", { text: String(l.qty) }), plus), del)),
        h("p", { class: "cl-total", text: money(l.product.price * l.qty) })));
    });
    var fee = typeof STORE.deliveryFee === "number" ? STORE.deliveryFee : null, sub = cart.subtotal();
    $("#cartSubtotal").textContent = money(sub);
    $("#cartDelivery").textContent = fee === null ? "À confirmer" : money(fee);
    $("#cartTotal").textContent = money(sub + (fee || 0)) + (fee === null ? " + livraison" : "");
    if (focusKey) {
      var k = focusKey; focusKey = null;
      var el = k === "list" ? null : $('[data-key="' + k.split("|")[0] + '"][data-act="' + k.split("|")[1] + '"]:not([disabled])');
      (el || (empty ? $("#cartEmpty a") : $("#cartLines button"))).focus();
    }
  }
  $("#cartBtn").addEventListener("click", function () { renderCart(); openDialog($("#cartDialog")); });
  $("#cartEmpty a").addEventListener("click", function () { $("#cartDialog").close(); });
  $("#clearCart").addEventListener("click", function () { cart.clear(); renderCart(); toast("Panier vidé"); });

  /* ---------- commande WhatsApp ---------- */
  var lastOrigin = "cartDialog";
  function launchWhatsApp(lines, customer, origin) {
    var ref = WA.makeOrderRef(new Date());
    var text = WA.buildOrderMessage({ store: STORE, lines: lines, customer: customer, ref: ref });
    var url = waLink(text), opened = null;
    try { opened = window.open(url, "_blank"); if (opened) opened.opener = null; } catch (e) { opened = null; }
    lastOrigin = origin || "cartDialog";
    $("#recapText").value = text; $("#recapOpen").setAttribute("href", url); $("#recapCopied").textContent = "";
    $("#recapStatus").textContent = opened
      ? "Référence " + ref + ". WhatsApp s’est ouvert dans un nouvel onglet ou une application. Ton message n’est PAS encore envoyé : vérifie-le, puis appuie sur « Envoyer » dans WhatsApp."
      : "Référence " + ref + ". WhatsApp ne s’est pas ouvert automatiquement. Utilise le bouton « Ouvrir WhatsApp » ou copie le récapitulatif et colle-le dans une conversation avec BOUKI. Ton message n’est PAS encore envoyé.";
    openDialog($("#recapDialog"));
  }
  $("#recapCopy").addEventListener("click", function () {
    var ta = $("#recapText"), msg = $("#recapCopied");
    function done(ok) { msg.textContent = ok ? "Récapitulatif copié." : "Copie impossible : sélectionne le texte puis copie-le manuellement."; }
    function legacy() { ta.focus(); ta.select(); var ok = false; try { ok = document.execCommand("copy"); } catch (e) { ok = false; } done(ok); }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(ta.value).then(function () { done(true); }, legacy); else legacy();
  });
  $("#fPhone").addEventListener("input", function () { var e = $("#phoneErr"); e.hidden = true; });
  $("#checkoutForm").addEventListener("submit", function (ev) {
    ev.preventDefault();
    var f = ev.target, phone = f.phone.value.trim(), err = $("#phoneErr");
    if (!cart.lines().length) return;
    if (!phone) {
      err.textContent = "Renseigne ton numéro de téléphone pour que nous puissions confirmer la commande."; err.hidden = false; f.phone.focus(); return;
    }
    if (!WA.isValidPhone(phone)) {
      err.textContent = "Numéro invalide : saisis entre 8 et 15 chiffres (ex. 77 123 45 67)."; err.hidden = false; f.phone.focus(); return;
    }
    launchWhatsApp(cart.lines(), { name: f.name.value.trim(), phone: phone, zone: f.zone.value.trim(), notes: f.notes.value.trim() }, "cartDialog");
  });

  /* ---------- demande impression urgente ---------- */
  var printForm = $("#printRequestForm");
  function printErr(name, msg) {
    var e = $("#err-" + name), field = printForm.elements[name];
    if (e) { e.textContent = msg || ""; e.hidden = !msg; }
    if (field) { field.setAttribute("aria-invalid", msg ? "true" : "false"); field.closest(".pf").classList.toggle("invalid", !!msg); }
  }
  function printValidate(f) {
    var errs = {}, v = function (n) { return String(f.elements[n].value || "").trim(); };
    if (v("name").length < 2) errs.name = "Indique ton nom complet.";
    if (!v("phone")) errs.phone = "Indique ton numéro de téléphone.";
    else if (!WA.isValidPhone(v("phone"))) errs.phone = "Numéro invalide : saisis entre 8 et 15 chiffres (ex. 77 123 45 67).";
    if (!v("type")) errs.type = "Choisis un type d’impression.";
    if (!v("support")) errs.support = "Précise le support (T-shirt, flyer, bâche…).";
    var q = Number(v("quantity"));
    if (!v("quantity") || !isFinite(q) || q < 1 || Math.floor(q) !== q) errs.quantity = "Indique une quantité (nombre entier, 1 minimum).";
    if (v("description").length < 5) errs.description = "Décris ton besoin en quelques mots (dimensions, délai, détails).";
    return errs;
  }
  if (printForm) {
    ["name", "phone", "type", "support", "quantity", "description"].forEach(function (n) {
      printForm.elements[n].addEventListener("input", function () { printErr(n, ""); });
      printForm.elements[n].addEventListener("change", function () { printErr(n, ""); });
    });
    printForm.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var f = ev.target, errs = printValidate(f), order = ["name", "phone", "type", "support", "quantity", "description"], first = null;
      order.forEach(function (n) { printErr(n, errs[n] || ""); if (errs[n] && !first) first = n; });
      $("#printStatus").hidden = true;
      if (first) { f.elements[first].focus(); return; }
      var message = ["Bonjour BOUKI, je souhaite faire une demande d’impression urgente :", "",
        "Nom : " + f.name.value.trim(), "Téléphone : " + f.phone.value.trim(),
        "Type d’impression : " + f.type.value, "Support : " + f.support.value.trim(),
        "Quantité : " + Number(f.quantity.value),
        "Design déjà disponible : " + (f.design.checked ? "Oui" : "Non"),
        "Description : " + f.description.value.trim(), "",
        "Merci de me confirmer la faisabilité, le délai et le devis."].join("\n");
      var url = waLink(message), opened = null;
      try { opened = window.open(url, "_blank"); if (opened) opened.opener = null; } catch (e) { opened = null; }
      $("#printOpen").setAttribute("href", url);
      $("#printStatusText").textContent = opened
        ? "WhatsApp s’est ouvert avec ta demande. Elle n’est PAS encore envoyée : vérifie le message puis appuie sur « Envoyer » dans WhatsApp."
        : "WhatsApp ne s’est pas ouvert automatiquement. Utilise le bouton « Ouvrir WhatsApp » ci-dessous. Ta demande n’est PAS encore envoyée.";
      $("#printStatus").hidden = false;
    });
  }

  /* ---------- infos ---------- */
  function renderInfo() {
    var box = $("#infoList");
    (STORE.info || []).forEach(function (it) {
      var prov = !it.text;
      box.appendChild(h("details", { class: "info-item", "data-provisional": prov ? "true" : null },
        h("summary", {}, it.title, h("span", { "aria-hidden": "true", class: "plus", text: "+" })),
        h("p", { text: prov ? STORE.provisionalText : it.text })));
    });
  }

  /* ---------- apparition au scroll ---------- */
  function reveal() {
    var els = $$(".reveal");
    if (!("IntersectionObserver" in window)) { els.forEach(function (e) { e.classList.add("in"); }); return; }
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }); }, { threshold: 0.08 });
    els.forEach(function (e) { io.observe(e); });
  }

  /* ---------- démarrage ---------- */
  renderGrid(); renderInfo(); renderCart(); reveal(); routeFromHash();
})();
