/* Tests de bout en bout (navigateur réel). Nécessite Playwright :
     npm i -D playwright && npx playwright install chromium
   Lancer :  node tests/e2e.cjs      (le script démarre son propre serveur local) */
const http = require("http"), fs = require("fs"), path = require("path");
const { chromium } = require("playwright");
const ROOT = path.resolve(__dirname, "..");
const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".svg": "image/svg+xml", ".json": "application/json" };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]); if (p.endsWith("/")) p += "index.html";
  const f = path.join(ROOT, p);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404, { "content-type": MIME[".html"] }); return res.end(fs.readFileSync(path.join(ROOT, "404.html"))); }
  res.writeHead(200, { "content-type": MIME[path.extname(f)] || "application/octet-stream" }); res.end(fs.readFileSync(f));
});
let pass = 0, fail = 0; const failures = [];
async function t(name, fn) { try { await fn(); pass++; console.log("  ✓", name); } catch (e) { fail++; failures.push(name); console.log("  ✗", name, "\n     ", String(e.message).split("\n")[0]); } }
const eq = (a, b, m) => { if (a !== b) throw new Error((m || "") + " attendu " + JSON.stringify(b) + " reçu " + JSON.stringify(a)); };
const ok = (c, m) => { if (!c) throw new Error(m || "assertion"); };

(async () => {
  await new Promise(r => server.listen(0, r));
  const base = "http://127.0.0.1:" + server.address().port;
  const browser = await chromium.launch();
  fs.mkdirSync(path.join(__dirname, "screenshots"), { recursive: true });

  const SIZES = [["mobile-360", 360, 800], ["mobile-390", 390, 844], ["tablette-768", 768, 1024], ["desktop-1440", 1440, 900]];
  for (const [label, w, hgt] of SIZES) {
    console.log(`\n▸ ${label} (${w}×${hgt})`);
    const ctx = await browser.newContext({ viewport: { width: w, height: hgt }, hasTouch: w < 800, isMobile: w < 800, permissions: ["clipboard-read", "clipboard-write"] });
    const page = await ctx.newPage();
    const errors = [], badReq = [];
    page.on("pageerror", e => errors.push(e.message));
    page.on("console", m => { if (m.type() === "error" && !/fonts\.(googleapis|gstatic)|ERR_(NAME|INTERNET|CONNECTION|PROXY|TUNNEL)|Failed to load resource/.test(m.text())) errors.push(m.text()); });
    page.on("requestfailed", r => { if (r.url().startsWith(base)) badReq.push(r.url()); });
    page.on("response", r => { if (r.url().startsWith(base) && r.status() >= 400) badReq.push(r.status() + " " + r.url()); });
    await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    await ctx.route(/^https:\/\/wa\.me\//, r => r.fulfill({ status: 200, contentType: "text/html", body: "<title>wa.me (simulé)</title>" }));
    await page.goto(base + "/", { waitUntil: "load" });

    await t("7 produits affichés + tuile WhatsApp", async () => { eq(await page.locator(".product-grid .card:not(.card-promo)").count(), 7); eq(await page.locator(".card-promo").count(), 1); });
    await t("prix en FCFA", async () => { const txt = await page.locator(".card-price").allTextContents(); eq(txt.length, 7); ok(txt.every(x => /^\d{1,3}( \d{3})* FCFA$/.test(x)), txt.join("|")); eq(txt[0], "12 000 FCFA"); });
    await t("images chargées (aucune cassée)", async () => {
      await page.evaluate(async () => { for (const i of document.images) { i.loading = "eager"; } await Promise.all([...document.images].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; }))); });
      const broken = await page.evaluate(() => [...document.images].filter(i => !i.naturalWidth).map(i => i.src)); eq(broken.length, 0, broken.join(","));
    });
    await t("pas de débordement horizontal", async () => { const o = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth); ok(o <= 0, "débordement " + o + "px"); });
    await t("menu / navigation", async () => {
      if (w <= 820) { await page.click("#menuBtn"); eq(await page.getAttribute("#menuBtn", "aria-expanded"), "true"); ok(await page.locator("#mainNav a[href='#univers']").isVisible()); await page.click("#mainNav a[href='#univers']"); eq(await page.getAttribute("#menuBtn", "aria-expanded"), "false"); }
      else { await page.click("#mainNav a[href='#commander']"); }
      await page.waitForTimeout(300);
    });
    await t("tous les liens d'ancre mènent à une cible existante", async () => {
      const bad = await page.evaluate(() => [...document.querySelectorAll("a[href^='#']")].map(a => a.getAttribute("href")).filter(h => h.length > 1 && !h.startsWith("#produit/") && !document.querySelector(h))); eq(bad.length, 0, bad.join(","));
    });
    await t("boutons : aucun sans nom accessible", async () => {
      const bad = await page.evaluate(() => [...document.querySelectorAll("button, a[href]")].filter(e => !e.closest("dialog") || e.closest("dialog[open]")).filter(e => !(e.getAttribute("aria-label") || e.textContent.trim())).length); eq(bad, 0);
    });
    await t("liens WhatsApp : numéro 221787560327", async () => {
      const hrefs = await page.evaluate(() => [...document.querySelectorAll("a[href*='wa.me']")].map(a => a.href)); ok(hrefs.length >= 3); ok(hrefs.every(h => h.startsWith("https://wa.me/221787560327?text=")), hrefs.join("\n"));
    });

    // fiche produit
    await page.goto(base + "/#collection"); await page.evaluate(() => localStorage.clear()); await page.reload();
    await t("fiche produit s'ouvre (lien profond)", async () => {
      await page.locator(".card-cta").first().click(); await page.waitForSelector("#productDialog[open]"); eq(await page.locator("#pdName").textContent(), "DAKAR CLUB TEE"); ok(/#produit\/dakar-club-tee/.test(page.url()));
    });
    await t("taille obligatoire : ajout bloqué + message", async () => {
      await page.click("text=Ajouter au panier"); ok(await page.locator("#pdErr").isVisible()); eq(await page.locator("#pdErr").textContent(), "Choisis une taille."); eq(await page.locator("#cartCount").textContent(), "0");
    });
    await t("WhatsApp depuis fiche : taille obligatoire aussi", async () => {
      await page.click("#productDialog >> text=Commander sur WhatsApp"); ok(await page.locator("#recapDialog[open]").count() === 0); ok(await page.locator("#pdErr").isVisible());
    });
    await t("ajout au panier (taille M, qté 2)", async () => {
      await page.locator("label.chip", { hasText: /^M$/ }).click(); await page.click("[aria-label='Augmenter la quantité']"); eq(await page.locator("#pdQty").textContent(), "2");
      await page.click("#productDialog >> text=Ajouter au panier"); eq(await page.locator("#cartCount").textContent(), "2"); ok(await page.locator("#productDialog[open]").count() === 0);
    });
    await t("clavier : fermeture de la fiche avec Échap", async () => { await page.goto(base + "/#produit/city-cap"); await page.waitForSelector("#productDialog[open]"); await page.keyboard.press("Escape"); await page.waitForSelector("#productDialog:not([open])", { state: "attached" }); await page.waitForFunction(() => !location.hash); });
    await t("produit sans taille (casquette) ajoutable directement", async () => {
      await page.goto(base + "/#produit/city-cap"); await page.waitForSelector("#productDialog[open]"); ok(await page.locator("#opt-size").count() === 0);
      await page.click("#productDialog >> text=Ajouter au panier"); eq(await page.locator("#cartCount").textContent(), "3");
    });
    await t("ajout tote + hoodie L", async () => {
      await page.goto(base + "/#produit/weekender-tote"); await page.click("#productDialog >> text=Ajouter au panier");
      await page.goto(base + "/#produit/bouki-heavy-hoodie"); await page.locator("label.chip", { hasText: /^L$/ }).click(); await page.click("#productDialog >> text=Ajouter au panier"); eq(await page.locator("#cartCount").textContent(), "5");
    });

    // panier
    await t("panier : lignes, sous-total exact", async () => {
      await page.click("#cartBtn"); await page.waitForSelector("#cartDialog[open]");
      eq(await page.locator(".cart-line").count(), 4); // tee M, cap, tote, hoodie
      ok(await page.locator("#cartEmpty").isHidden(), "état vide visible alors que le panier contient des articles");
      ok(await page.locator("#cartSummary").isVisible());
      eq(await page.locator("#cartSubtotal").textContent(), "63 500 FCFA"); // 24000+8000+6500+25000
    });
    await t("quantité + / − / suppression", async () => {
      const tee = page.locator(".cart-line", { hasText: "DAKAR CLUB TEE" });
      await tee.locator("[data-act=plus]").click(); eq(await page.locator("#cartCount").textContent(), "6");
      await page.locator(".cart-line", { hasText: "DAKAR CLUB TEE" }).locator("[data-act=minus]").click();
      await page.locator(".cart-line", { hasText: "DAKAR CLUB TEE" }).locator("[data-act=minus]").click(); eq(await page.locator("#cartCount").textContent(), "4");
      await page.locator(".cart-line", { hasText: "WEEKENDER TOTE" }).locator("[data-act=del]").click(); eq(await page.locator(".cart-line").count(), 3);
      eq(await page.locator("#cartSubtotal").textContent(), "45 000 FCFA"); // 12000 + 8000 + 25000
    });
    await t("quantité plafonnée à 10", async () => {
      const cap = page.locator(".cart-line", { hasText: "CITY CAP" });
      for (let i = 0; i < 12; i++) { const b = page.locator(".cart-line", { hasText: "CITY CAP" }).locator("[data-act=plus]"); if (await b.isDisabled()) break; await b.click(); }
      eq(await page.locator(".cart-line", { hasText: "CITY CAP" }).locator("output").textContent(), "10"); ok(await page.locator(".cart-line", { hasText: "CITY CAP" }).locator("[data-act=plus]").isDisabled());
      for (let i = 0; i < 9; i++) await page.locator(".cart-line", { hasText: "CITY CAP" }).locator("[data-act=minus]").click();
    });
    await t("persistance après actualisation", async () => {
      const before = await page.locator("#cartCount").textContent(); await page.reload(); eq(await page.locator("#cartCount").textContent(), before); await page.click("#cartBtn"); eq(await page.locator(".cart-line").count(), 3);
    });
    await t("pas de débordement horizontal (panier ouvert)", async () => { const o = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth); ok(o <= 0); });
    await page.screenshot({ path: path.join(__dirname, "screenshots", `${label}-panier.png`) });

    // commande WhatsApp
    await t("téléphone invalide refusé", async () => { await page.fill("#fPhone", "12"); await page.click("#checkoutForm button[type=submit]"); ok(await page.locator("#phoneErr").isVisible()); ok(await page.locator("#recapDialog[open]").count() === 0); });
    let popupUrl = null;
    await t("commande WhatsApp : message, total, encodage, numéro", async () => {
      await page.fill("#fName", "Awa Diop"); await page.fill("#fPhone", "77 123 45 67"); await page.fill("#fZone", "Yoff, Dakar"); await page.fill("#fNotes", "Après 18h — merci !");
      const [popup] = await Promise.all([ctx.waitForEvent("page", { timeout: 5000 }).catch(() => null), page.click("#checkoutForm button[type=submit]")]);
      if (popup) { popupUrl = popup.url(); await popup.close().catch(() => {}); }
      await page.waitForSelector("#recapDialog[open]");
      const msg = await page.inputValue("#recapText"); const href = await page.getAttribute("#recapOpen", "href");
      ok(href.startsWith("https://wa.me/221787560327?text=")); eq(decodeURIComponent(href.split("?text=")[1]), msg);
      ok(/^Bonjour BOUKI, je souhaite commander :\nRéférence : BK-\d{6}-[0-9A-Z]{4}\n/.test(msg), msg.slice(0, 80));
      ok(msg.includes("1. Produit : DAKAR CLUB TEE\n   Taille : M\n   Couleur : Noir\n   Quantité : 1\n   Prix unitaire : 12 000 FCFA"), msg);
      ok(msg.includes("Produit : CITY CAP\n   Couleur : Noir\n   Quantité : 1\n   Prix unitaire : 8 000 FCFA"));
      ok(msg.includes("Produit : BOUKI HEAVY HOODIE\n   Taille : L"));
      ok(msg.includes("Sous-total : 45 000 FCFA") && msg.includes("Livraison : frais à confirmer") && msg.includes("Total estimé : 45 000 FCFA (hors livraison)"));
      ok(msg.includes("Nom : Awa Diop\nTéléphone : 77 123 45 67\nZone de livraison : Yoff, Dakar\nNotes : Après 18h — merci !"));
      ok(href.includes("%C3%A9") && !/[ \n]/.test(href));
      ok(/PAS encore envoyé/.test(await page.textContent("#recapStatus")), "message honnête");
    });
    await t("popup WhatsApp ouvert vers wa.me/221787560327", async () => { ok(popupUrl && popupUrl.startsWith("https://wa.me/221787560327?text="), "popup: " + popupUrl); });
    await t("bouton copier", async () => {
      await page.click("#recapCopy"); await page.waitForFunction(() => document.querySelector("#recapCopied").textContent.length > 0);
      eq(await page.textContent("#recapCopied"), "Récapitulatif copié."); const clip = await page.evaluate(() => navigator.clipboard.readText()); eq(clip, await page.inputValue("#recapText"));
    });
    await page.screenshot({ path: path.join(__dirname, "screenshots", `${label}-recap.png`) });
    await t("commande directe depuis une fiche produit", async () => {
      await page.keyboard.press("Escape"); await page.goto(base + "/#produit/teranga-oversize"); await page.waitForSelector("#productDialog[open]");
      await page.locator("label.chip", { hasText: /^XL$/ }).click(); await page.click("#productDialog >> text=Commander sur WhatsApp"); await page.waitForSelector("#recapDialog[open]");
      const msg = await page.inputValue("#recapText"); ok(msg.includes("Produit : TERANGA OVERSIZE\n   Taille : XL\n   Couleur : Écru\n   Quantité : 1\n   Prix unitaire : 15 000 FCFA") && msg.includes("Total estimé : 15 000 FCFA"), msg);
    });
    await t("repli : popup bloqué → récapitulatif + copie proposés", async () => {
      await page.keyboard.press("Escape"); await page.evaluate(() => { window.open = () => null; });
      await page.click("#cartBtn"); await page.click("#checkoutForm button[type=submit]"); await page.waitForSelector("#recapDialog[open]");
      ok(/ne s’est pas ouvert/.test(await page.textContent("#recapStatus"))); ok(await page.locator("#recapCopy").isVisible());
    });
    await t("vider le panier → état vide explicite", async () => {
      await page.keyboard.press("Escape"); await page.click("#cartBtn"); await page.click("#clearCart"); ok(await page.locator("#cartEmpty").isVisible()); eq(await page.locator("#cartCount").textContent(), "0"); ok(await page.locator("#cartSummary").isHidden());
    });
    await t("panier corrompu en localStorage : pas de crash", async () => {
      await page.keyboard.press("Escape"); await page.evaluate(() => localStorage.setItem("bouki-cart-v1", "{oups")); await page.reload(); eq(await page.locator("#cartCount").textContent(), "0");
    });
    await t("infos : rubriques provisoires signalées", async () => { eq(await page.locator(".info-item").count(), 5); ok(await page.locator(".info-item[data-provisional]").count() >= 3); });
    await t("page 404", async () => { const r = await page.goto(base + "/inexistant"); eq(r.status(), 404); ok(await page.locator("text=Retour à la boutique").count() > 0); });
    await t("aucune erreur JavaScript / console", async () => { eq(errors.length, 0, errors.join(" | ")); });
    await t("aucune ressource locale en échec (404, réseau)", async () => { const b = badReq.filter(x => !/inexistant/.test(x)); eq(b.length, 0, b.join(" | ")); });

    await page.goto(base + "/"); await page.evaluate(() => { document.querySelectorAll(".reveal").forEach(e => e.classList.add("in")); });
    await page.screenshot({ path: path.join(__dirname, "screenshots", `${label}-accueil.png`), fullPage: true });
    await ctx.close();
  }
  await browser.close(); server.close();
  console.log(`\nRÉSULTAT : ${pass} réussis, ${fail} échoués`); if (fail) { console.log(failures.join("\n")); process.exit(1); }
})();
