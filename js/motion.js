/* BOUKI — animations modernes (aucune dépendance). Si le mouvement est réduit, seul le comportement utile reste actif. */
(function () {
  "use strict";
  var doc = document, root = doc.documentElement;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function $(s, r) { return (r || doc).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); }
  if (!reduce) root.classList.add("motion");

  /* --- barre de progression + en-tête intelligent + parallaxe, un seul rAF --- */
  var bar = doc.createElement("div"); bar.className = "scroll-progress"; bar.setAttribute("aria-hidden", "true"); doc.body.appendChild(bar);
  var header = $(".site-header"), nav = $("#mainNav"), heroImg = $(".hero-visual img"), lastY = 0, ticking = false;
  function frame() {
    var y = window.pageYOffset, max = Math.max(1, root.scrollHeight - window.innerHeight);
    if (!reduce) bar.style.transform = "scaleX(" + Math.min(1, y / max) + ")";
    if (header && !reduce) {
      var menuOpen = nav && nav.classList.contains("open");
      header.classList.toggle("is-hidden", !menuOpen && y > 140 && y > lastY + 4);
      if (y < lastY - 4 || y < 140 || menuOpen) header.classList.remove("is-hidden");
    }
    lastY = y; ticking = false;
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }, { passive: true });
  frame();

  /* --- apparitions au scroll --- */
  if (!reduce && "IntersectionObserver" in window) {
    var groups = [
      [".section-head, .services-heading, .print-intro > *:not(figure), .founder-hero .founder-heading > *, .tech-intro > *, .omni-block > *, .community > *", null],
      [".universe-card", "up"], [".print-benefits li", "up"], [".print-form", "up"], [".print-visual, .founder-visual, .tech-visual", "zoom"],
      [".founder-speech > *", "up"], [".founder-timeline li", "left"], [".tech-feature", "up"], [".omni-points article", "up"], [".info-item", "up"]
    ];
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    groups.forEach(function (g) {
      $$(g[0]).forEach(function (el, i) {
        if (el.hasAttribute("data-anim") || el.closest(".hero")) return;
        el.setAttribute("data-anim", g[1] || "up"); el.style.setProperty("--d", String(Math.min(i % 4, 3)));
        io.observe(el);
      });
    });
  }

  /* --- parallaxe douce du hero (rAF, desktop et mobile) --- */
  if (!reduce && heroImg) {
    var wrap = heroImg.parentNode;
    window.addEventListener("scroll", function () {
      var y = window.pageYOffset; if (y > 900) return;
      wrap.style.translate = "0 " + (y * 0.04) + "px";
    }, { passive: true });
  }

  /* --- carrousel produits : barre de progression --- */
  var grid = $("#productGrid");
  if (grid) {
    var prog = doc.createElement("div"); prog.className = "carousel-progress"; prog.setAttribute("aria-hidden", "true"); prog.innerHTML = "<i></i>";
    var hint = doc.createElement("p"); hint.className = "carousel-hint"; hint.textContent = "Balaie pour découvrir le drop →";
    grid.parentNode.insertBefore(prog, grid.nextSibling); prog.parentNode.insertBefore(hint, prog.nextSibling);
    var fill = prog.firstChild;
    var upd = function () {
      var max = grid.scrollWidth - grid.clientWidth; if (max <= 0) return;
      var ratio = grid.clientWidth / grid.scrollWidth, p = grid.scrollLeft / max;
      fill.style.width = (ratio * 100) + "%"; fill.style.transform = "translateX(" + (p * (1 / ratio - 1) * 100) + "%)";
      if (grid.scrollLeft > 20) hint.style.opacity = "0";
    };
    grid.addEventListener("scroll", upd, { passive: true }); window.addEventListener("resize", upd); setTimeout(upd, 300);
  }

  /* --- barre du bas : onglet actif + compteur panier --- */
  var tabs = $$(".tabbar a[data-sec]");
  if (tabs.length && "IntersectionObserver" in window) {
    var secs = tabs.map(function (a) { return $(a.getAttribute("href")); }).filter(Boolean);
    var act = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        tabs.forEach(function (a) { a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id); });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    secs.forEach(function (s) { act.observe(s); });
  }
  var tabCart = $("#tabCart"), cartBtn = $("#cartBtn"), count = $("#tabCount"), srcCount = $("#cartCount");
  if (tabCart && cartBtn) tabCart.addEventListener("click", function () { cartBtn.click(); });
  if (count && srcCount) {
    var sync = function () {
      var n = parseInt(srcCount.textContent, 10) || 0, had = count.classList.contains("has");
      count.textContent = n; count.classList.toggle("has", n > 0);
      if (n > 0 && had) { count.classList.remove("bump"); void count.offsetWidth; count.classList.add("bump"); }
    };
    new MutationObserver(sync).observe(srcCount, { childList: true, characterData: true, subtree: true }); sync();
  }
})();
