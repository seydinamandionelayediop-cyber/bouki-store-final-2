/* Tests de bout en bout (navigateur réel). Nécessite Playwright :
     npm i -D playwright && npx playwright install chromium
   Lancer :  node tests/e2e.cjs      (le script démarre son propre serveur local) */
const http = require("http"), fs = require("fs"), path = require("path");
const { chromium } = require("playwright");
const ROOT = path.resolve(__dirname, "..");
const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".json": "application/json" };
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
const NUM = "221787560327";

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
    await page.evaluate(() => localStorage.clear()); await page.reload({ waitUntil: "load" });

    await t("7 produits + tuile WhatsApp, titre « MERCH DROPS. »", async () => {
      eq(await page.locator(".product-grid .card:not(.card-promo)").count(), 7); eq(await page.locator(".card-promo").count(), 1);
      ok((await page.locator("#collTitle").textContent()).includes("MERCH"));
    });
    await t("5 univers BOUKI + titre officiel", async () => {
      eq(await page.locator(".universe-card").count(), 5);
      ok((await page.locator("#servicesTitle").textContent()).includes("UN UNIVERS QUI CONNECTE"));
    });
    await t("section « Comment commander » absente, aucune sélection de taille", async () => {
      eq(await page.locator("text=/Comment commander/i").count(), 0); eq(await page.locator("#opt-size").count(), 0);
    });
    await t("parcours : THÉSEYDINA uniquement, citation, signature", async () => {
      const txt = await page.locator("#parcours").innerText();
      ok(/THÉSEYDINA\.\s*UNE VISION EN MOUVEMENT/i.test(txt)); ok(txt.includes("De l’idée à l’impact."));
      ok(txt.includes("Créer, c’est relier les talents, les idées et les opportunités pour construire un avenir plus grand que soi."));
      ok(txt.includes("5 %") && txt.includes("3C"));
    });
    await t("images chargées (aucune cassée)", async () => {
      await page.evaluate(async () => { for (const i of document.images) { i.loading = "eager"; } await Promise.all([...document.images].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; }))); });
      const broken = await page.evaluate(() => [...document.images].filter(i => !i.naturalWidth).map(i => i.src)); eq(broken.length, 0, broken.join(","));
    });
    await t("pas de débordement horizontal", async () => { const o = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth); ok(o <= 0, "débordement " + o + "px"); });
    await t("liens d'ancre : cibles existantes", async () => {
      const bad = await page.evaluate(() => [...document.querySelectorAll("a[href^='#']")].map(a => a.getAttribute("href")).filter(h => h.length > 1 && !h.startsWith("#produit/") && !document.querySelector(h))); eq(bad.length, 0, bad.join(","));
    });
    await t("liens WhatsApp : numéro configuré", async () => {
      const hrefs = await page.evaluate(() => [...document.querySelectorAll("a[href*='wa.me']")].map(a => a.href)); ok(hrefs.length >= 3);
      ok(hrefs.every(h => h.startsWith("https://wa.me/" + NUM + "?text=")), hrefs.join("\n"));
    });
    await t("menu mobile / navigation", async () => {
      if (w <= 820) { await page.click("#menuBtn"); eq(await page.getAttribute("#menuBtn", "aria-expanded"), "true"); await page.click("#mainNav a[href='#impression']"); }
      else await page.click("#mainNav a[href='#impression']");
      await page.waitForTimeout(300);
    });

    // formulaire impression
    await t("impression : champs vides → erreurs claires, rien ne s'ouvre", async () => {
      await page.locator("#impression").scrollIntoViewIfNeeded();
      let popped = false; page.once("popup", () => { popped = true; });
      await page.click("#printRequestForm button[type=submit]"); await page.waitForTimeout(300);
      eq(await page.locator(".field-err:visible").count(), 6); ok(await page.locator("#printStatus").isHidden()); ok(!popped, "ouverture inattendue");
      eq(await page.locator("#printType option").allTextContents().then(a => a.join("|")), "Choisir…|Impression textile|Impression papier|Impression grand format|Impression sur objets|Autre");
    });
    await t("impression : téléphone invalide refusé", async () => {
      await page.fill("#printName", "Awa Diop"); await page.fill("#printPhone", "12"); await page.selectOption("#printType", "Impression textile");
      await page.fill("#printSupport", "T-shirt"); await page.fill("#printQty", "50"); await page.fill("#printDescription", "50 T-shirts DTF, A4 dos");
      await page.click("#printRequestForm button[type=submit]"); ok(/invalide/.test(await page.textContent("#err-phone")));
    });
    await t("impression : demande valide → message WhatsApp correct, statut honnête", async () => {
      await page.fill("#printPhone", "77 123 45 67"); await page.check("#printDesign");
      const [popup] = await Promise.all([page.waitForEvent("popup", { timeout: 5000 }).catch(() => null), page.click("#printRequestForm button[type=submit]")]);
      ok(popup, "WhatsApp non ouvert"); const url = popup.url();
      ok(url.startsWith("https://wa.me/" + NUM + "?text=")); const msg = decodeURIComponent(url.split("?text=")[1]);
      ok(msg.includes("Nom : Awa Diop") && msg.includes("Type d’impression : Impression textile") && msg.includes("Support : T-shirt") && msg.includes("Quantité : 50") && msg.includes("Design déjà disponible : Oui") && msg.includes("Téléphone : 77 123 45 67"), msg);
      ok(/PAS encore envoyée/.test(await page.textContent("#printStatusText")));
    });
    await t("impression : popup bloqué → lien de repli, pas de fausse confirmation", async () => {
      await page.evaluate(() => { window.open = () => null; }); await page.click("#printRequestForm button[type=submit]");
      ok(/ne s’est pas ouvert/.test(await page.textContent("#printStatusText"))); ok((await page.getAttribute("#printOpen", "href")).startsWith("https://wa.me/" + NUM));
    });
    await page.reload({ waitUntil: "load" });

    // produit / panier sans taille
    await t("fiche produit : pas de taille, bouton « CHOISIR D’AUTRES ARTICLES » ajoute et revient à la collection", async () => {
      await page.goto(base + "/#produit/bouki-core"); await page.waitForSelector("#productDialog[open]");
      eq(await page.locator("#opt-size").count(), 0); eq(await page.locator("#productDialog >> text=Ajouter au panier").count(), 0);
      await page.click("[aria-label='Augmenter la quantité']");
      await page.click("#productDialog >> text=CHOISIR D’AUTRES ARTICLES"); await page.waitForTimeout(300);
      eq(await page.locator("#cartCount").textContent(), "2"); ok(await page.locator("#productDialog[open]").count() === 0);
    });
    await t("ajout d'autres articles (hoodie, mug)", async () => {
      for (const s of ["instinct-hoodie", "hors-du-moule-mug"]) { await page.goto(base + "/#produit/" + s); await page.waitForSelector("#productDialog[open]"); await page.click("#productDialog >> text=CHOISIR D’AUTRES ARTICLES"); await page.waitForTimeout(150); }
      eq(await page.locator("#cartCount").textContent(), "4");
    });
    await t("panier : totaux, +/−/suppression", async () => {
      await page.click("#cartBtn"); await page.waitForSelector("#cartDialog[open]");
      eq(await page.locator(".cart-line").count(), 3); eq(await page.locator("#cartSubtotal").textContent(), "49 000 FCFA"); // 24000+18000+7000
      await page.locator(".cart-line", { hasText: "BOUKI CORE" }).locator("[data-act=minus]").click(); eq(await page.locator("#cartSubtotal").textContent(), "37 000 FCFA");
      await page.locator(".cart-line", { hasText: "HORS DU MOULE. MUG" }).locator("[data-act=del]").click(); eq(await page.locator(".cart-line").count(), 2); eq(await page.locator("#cartSubtotal").textContent(), "30 000 FCFA");
    });
    await t("ancien panier avec taille : toujours commandable", async () => {
      await page.keyboard.press("Escape");
      await page.evaluate(() => localStorage.setItem("bouki-cart-v1", JSON.stringify([{ id: "01", size: "XXL", color: "Noir", qty: 1 }, { id: "04", size: "??", color: "Noir", qty: 1 }]))); await page.reload();
      eq(await page.locator("#cartCount").textContent(), "2"); await page.click("#cartBtn");
      ok(!/Taille/.test(await page.locator("#cartLines").innerText()));
    });
    await t("commande : téléphone obligatoire", async () => {
      await page.fill("#fPhone", ""); await page.click("#checkoutForm button[type=submit]"); ok(await page.locator("#phoneErr").isVisible());
      await page.fill("#fPhone", "12"); await page.click("#checkoutForm button[type=submit]"); ok(/invalide/.test(await page.textContent("#phoneErr")));
    });
    await t("commande WhatsApp sans taille : message, total, numéro", async () => {
      await page.fill("#fName", "Awa Diop"); await page.fill("#fPhone", "77 123 45 67"); await page.fill("#fZone", "Yoff, Dakar");
      const [popup] = await Promise.all([page.waitForEvent("popup", { timeout: 5000 }).catch(() => null), page.click("#checkoutForm button[type=submit]")]);
      
      await page.waitForSelector("#recapDialog[open]"); const msg = await page.inputValue("#recapText"); const href = await page.getAttribute("#recapOpen", "href");
      ok(href.startsWith("https://wa.me/" + NUM + "?text=")); ok(!/Taille/.test(msg), msg);
      ok(msg.includes("1. Produit : BOUKI CORE\n   Couleur : Noir\n   Quantité : 1\n   Prix unitaire : 12 000 FCFA"), msg);
      ok(msg.includes("Sous-total : 30 000 FCFA") && msg.includes("Téléphone : 77 123 45 67"));
      ok(/PAS encore envoyé/.test(await page.textContent("#recapStatus")));
    });
    await t("vider le panier", async () => {
      await page.keyboard.press("Escape"); await page.click("#cartBtn"); await page.click("#clearCart"); ok(await page.locator("#cartEmpty").isVisible()); eq(await page.locator("#cartCount").textContent(), "0");
    });
    await t("infos enrichies", async () => { await page.keyboard.press("Escape"); ok(await page.locator(".info-item").count() >= 8); });
    await t("page 404", async () => { const r = await page.goto(base + "/inexistant"); eq(r.status(), 404); });
    await t("aucune erreur JavaScript / console", async () => { eq(errors.length, 0, errors.join(" | ")); });
    await t("aucune ressource locale en échec", async () => { const b = badReq.filter(x => !/inexistant/.test(x)); eq(b.length, 0, b.join(" | ")); });

    await page.goto(base + "/"); await page.evaluate(() => { document.querySelectorAll(".reveal").forEach(e => e.classList.add("in")); });
    await page.screenshot({ path: path.join(__dirname, "screenshots", `${label}-accueil.png`), fullPage: true });
    await ctx.close();
  }
  await browser.close(); server.close();
  console.log(`\nRÉSULTAT : ${pass} réussis, ${fail} échoués`); if (fail) { console.log(failures.join("\n")); process.exit(1); }
})().catch(e => { console.error(e); process.exit(1); });
