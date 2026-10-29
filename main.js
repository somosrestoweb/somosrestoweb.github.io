(function () {
  "use strict";

  var BRAND = window.__BRAND__ || {};
  var WA = BRAND.whatsapp || "5491167922355";
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var canHover = matchMedia("(hover: hover)").matches;

  document.documentElement.classList.remove("no-js");
  document.documentElement.classList.add("js");

  function safe(fn, name) {
    try { fn(); } catch (err) { console.warn("[restoweb] " + name + " failed:", err); }
  }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function waLink(text) { return "https://wa.me/" + WA + "?text=" + encodeURIComponent(text); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  /* ---------- Splash ---------- */
  function initSplash() {
    var splash = $("[data-splash]");
    var done = false;
    var hide = function () {
      if (done) return;
      done = true;
      if (splash) splash.classList.add("is-out");
      document.body.classList.add("is-loaded");
      setTimeout(function () {
        $$("[data-split]").forEach(function (el) { el.classList.add("is-split-in"); });
        $$("[data-draw]").forEach(function (el) { el.classList.add("is-drawn"); });
      }, splash ? 250 : 50);
    };
    setTimeout(hide, splash ? 1200 : 100);
    setTimeout(hide, 3000);
  }

  /* ---------- Headline split ---------- */
  function splitWords(el) {
    if (el.dataset.splitDone) return;
    el.dataset.splitDone = "1";
    el.setAttribute("aria-label", el.textContent.trim().replace(/\s+/g, " "));
    var wrap = function (text) {
      return text.split(/(\s+)/).map(function (w) {
        if (!w) return "";
        return /^\s+$/.test(w) ? w : '<span class="split-word" aria-hidden="true"><span>' + esc(w) + "</span></span>";
      }).join("");
    };
    el.innerHTML = Array.prototype.map.call(el.childNodes, function (node) {
      if (node.nodeType === 3) return wrap(node.textContent);
      if (node.nodeName === "BR") return "<br>";
      if (node.nodeType === 1) {
        var tag = node.tagName.toLowerCase();
        return "<" + tag + ">" + wrap(node.textContent) + "</" + tag + ">";
      }
      return "";
    }).join("");
    $$(".split-word > span", el).forEach(function (s, i) { s.style.transitionDelay = (i * 0.07) + "s"; });
  }
  function initSplit() {
    $$("[data-split]").forEach(function (el) { el.classList.remove("reveal"); splitWords(el); });
    setTimeout(function () {
      $$("[data-split]").forEach(function (el) { el.classList.add("is-split-in"); });
    }, 5000);
  }

  /* ---------- Nav ---------- */
  function initNav() {
    var nav = $("[data-nav]");
    var burger = $("[data-burger]");
    if (!nav) return;
    var onScroll = function () { nav.classList.toggle("is-scrolled", window.scrollY > 30); };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    if (!burger) return;
    var close = function () {
      nav.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    };
    burger.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.style.overflow = open ? "hidden" : "";
    });
    $$("[data-menu] a").forEach(function (a) { a.addEventListener("click", close); });
  }

  /* ---------- Smooth anchors ---------- */
  function initAnchors() {
    document.addEventListener("click", function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute("href");
      if (!id || id === "#") return;
      var el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: reduced ? "auto" : "smooth" });
    });
  }

  /* ---------- Reveal ---------- */
  function initReveal() {
    var items = $$(".reveal");
    if (!("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
      });
    }, { threshold: 0.01, rootMargin: "0px 0px -6% 0px" });
    items.forEach(function (el, i) {
      el.style.transitionDelay = ((i % 4) * 0.07) + "s";
      io.observe(el);
    });
    setTimeout(function () {
      $$(".reveal:not(.is-visible)").forEach(function (el) {
        if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add("is-visible");
      });
    }, 6000);
  }

  /* ---------- Hero depth (mouse parallax) ---------- */
  function initStage() {
    var stage = $("[data-stage]");
    if (!stage || !canHover) return;
    var layers = $$("[data-depth]", stage);
    var tx = 0, ty = 0, cx = 0, cy = 0, running = false;
    var tick = function () {
      cx += (tx - cx) * 0.08; cy += (ty - cy) * 0.08;
      layers.forEach(function (l) {
        var d = parseFloat(l.dataset.depth) || 1;
        l.style.translate = (cx * d * 14).toFixed(2) + "px " + (cy * d * 14).toFixed(2) + "px";
      });
      if (Math.abs(tx - cx) > 0.001 || Math.abs(ty - cy) > 0.001) requestAnimationFrame(tick);
      else running = false;
    };
    window.addEventListener("mousemove", function (e) {
      tx = e.clientX / window.innerWidth - 0.5;
      ty = e.clientY / window.innerHeight - 0.5;
      if (!running) { running = true; requestAnimationFrame(tick); }
    });
  }

  /* ---------- Case tilt ---------- */
  function initTilt() {
    if (!canHover) return;
    $$(".case").forEach(function (card) {
      var frame = $(".browser", card);
      if (!frame || card.dataset.tiltBound) return;
      card.dataset.tiltBound = "1";
      frame.addEventListener("mousemove", function (e) {
        var r = frame.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        frame.style.transform = "perspective(1100px) rotateY(" + (x * 6) + "deg) rotateX(" + (-y * 6) + "deg) translateY(-6px)";
      });
      frame.addEventListener("mouseout", function (e) {
        if (!frame.contains(e.relatedTarget)) frame.style.transform = "";
      });
    });
  }

  /* ---------- Magnetic CTA ---------- */
  function initMagnetic() {
    if (!canHover) return;
    $$(".magnetic").forEach(function (b) {
      b.addEventListener("mousemove", function (e) {
        var r = b.getBoundingClientRect();
        var x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
        b.style.transform = "translate(" + x * 0.18 + "px," + y * 0.3 + "px)";
      });
      b.addEventListener("mouseout", function (e) {
        if (!b.contains(e.relatedTarget)) b.style.transform = "";
      });
    });
  }

  /* ---------- Live order / reservation demo ---------- */
  function initDemo() {
    var form = $("[data-demo]");
    var out = $("[data-demo-out]");
    if (!form || !out) return;
    var bubble = out.parentElement;
    var render = function () {
      var f = form.elements;
      var mode = (form.querySelector('input[name="mode"]:checked') || {}).value || "delivery";
      $$("[data-show]", form).forEach(function (el) {
        el.hidden = el.dataset.show.split(" ").indexOf(mode) === -1;
      });
      var lines;
      if (mode === "reserva") {
        lines = [
          "¡Hola! Quiero reservar una mesa",
          "",
          "• Nombre: " + esc(f.name.value.trim() || "—"),
          "• Personas: " + esc(f.people.value),
          "• Día: " + esc(f.day.value),
          "• Horario: " + esc(f.time.value)
        ];
        if (f.occasion.value) lines.push("• Ocasión: " + esc(f.occasion.value));
      } else {
        lines = [
          mode === "delivery" ? "¡Hola! Quiero hacer un pedido para delivery 🛵" : "¡Hola! Quiero hacer un pedido para retirar 🛍️",
          "",
          "• Nombre: " + esc(f.name.value.trim() || "—")
        ];
        if (mode === "delivery") lines.push("• Dirección: " + esc(f.address.value.trim() || "—"));
        lines.push("• Pedido: " + esc(f.order.value));
        if (f.changes.value) lines.push("• Cambios: " + esc(f.changes.value));
        if (mode === "takeaway") lines.push("• Retiro: " + esc(f.pickup.value));
      }
      out.innerHTML = lines.join("<br/>");
      bubble.classList.add("is-bump");
      setTimeout(function () { bubble.classList.remove("is-bump"); }, 180);
    };
    form.addEventListener("input", render);
    form.addEventListener("change", render);
    render();
  }

  /* ---------- Process line progress ---------- */
  function initSteps() {
    var steps = $("[data-steps]");
    if (!steps) return;
    var update = function () {
      var r = steps.getBoundingClientRect();
      var p = (window.innerHeight * 0.85 - r.top) / (r.height + window.innerHeight * 0.3);
      steps.style.setProperty("--progress", Math.max(0, Math.min(1, p)).toFixed(3));
    };
    window.addEventListener("scroll", update, { passive: true });
    update();
  }

  /* ---------- GSAP parallax (optional) ---------- */
  function initParallax() {
    if (!window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    $$("[data-parallax]").forEach(function (el) {
      gsap.to(el, {
        yPercent: (parseFloat(el.dataset.parallax) || 0.1) * 100, ease: "none",
        scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: 0.6 }
      });
    });
  }

  /* ---------- WhatsApp prefilled links ---------- */
  function initWhatsApp() {
    var msgs = BRAND.messages || {};
    $$("[data-wa]").forEach(function (a) {
      var text = msgs[a.dataset.wa];
      if (text) a.href = waLink(text);
    });
  }

  /* ---------- "Quiero mi web" wizard ---------- */
  function initWizard() {
    var form = $("[data-wizard]");
    if (!form) return;
    var steps = $$(".wstep", form);
    var prev = $("[data-prev]", form), next = $("[data-next]", form), send = $("[data-send]", form);
    var bar = $("[data-progress]"), label = $("[data-step-label]");
    var error = $("[data-error]", form), done = $("[data-done]", form), doneLink = $("[data-done-link]", form);
    var current = 0;

    /* Localidad (Capital Federal + partidos de Buenos Aires) → barrio (solo CABA) */
    var CAPITAL = "Capital Federal";
    var PARTIDOS = ["Adolfo Alsina", "Adolfo Gonzales Chaves", "Alberti", "Almirante Brown", "Arrecifes", "Avellaneda",
      "Ayacucho", "Azul", "Bahía Blanca", "Balcarce", "Baradero", "Benito Juárez", "Berazategui", "Berisso", "Bolívar",
      "Bragado", "Brandsen", "Campana", "Cañuelas", "Capitán Sarmiento", "Carlos Casares", "Carlos Tejedor",
      "Carmen de Areco", "Castelli", "Chacabuco", "Chascomús", "Chivilcoy", "Colón", "Coronel Dorrego", "Coronel Pringles",
      "Coronel Rosales", "Coronel Suárez", "Daireaux", "Dolores", "Ensenada", "Escobar", "Esteban Echeverría",
      "Exaltación de la Cruz", "Ezeiza", "Florencio Varela", "Florentino Ameghino", "General Alvarado", "General Alvear",
      "General Arenales", "General Belgrano", "General Guido", "General Juan Madariaga", "General La Madrid",
      "General Las Heras", "General Lavalle", "General Paz", "General Pinto", "General Pueyrredón (Mar del Plata)",
      "General Rodríguez", "General San Martín", "General Viamonte", "General Villegas", "Guaminí", "Hipólito Yrigoyen",
      "Hurlingham", "Ituzaingó", "José C. Paz", "Junín", "La Costa", "La Matanza", "La Plata", "Lanús", "Laprida",
      "Las Flores", "Leandro N. Alem", "Lezama", "Lincoln", "Lobería", "Lobos", "Lomas de Zamora", "Luján", "Magdalena",
      "Maipú", "Malvinas Argentinas", "Mar Chiquita", "Marcos Paz", "Mercedes", "Merlo", "Monte", "Monte Hermoso",
      "Moreno", "Morón", "Navarro", "Necochea", "Nueve de Julio", "Olavarría", "Patagones", "Pehuajó", "Pellegrini",
      "Pergamino", "Pila", "Pilar", "Pinamar", "Presidente Perón", "Puan", "Punta Indio", "Quilmes", "Ramallo", "Rauch",
      "Rivadavia", "Rojas", "Roque Pérez", "Saavedra", "Saladillo", "Salliqueló", "Salto", "San Andrés de Giles",
      "San Antonio de Areco", "San Cayetano", "San Fernando", "San Isidro", "San Miguel", "San Nicolás", "San Pedro",
      "San Vicente", "Suipacha", "Tandil", "Tapalqué", "Tigre", "Tordillo", "Tornquist", "Trenque Lauquen",
      "Tres Arroyos", "Tres de Febrero", "Tres Lomas", "Veinticinco de Mayo", "Vicente López", "Villa Gesell",
      "Villarino", "Zárate"];
    var BARRIOS = ["Agronomía", "Almagro", "Balvanera", "Barracas", "Belgrano", "Boedo", "Caballito", "Chacarita",
      "Coghlan", "Colegiales", "Constitución", "Flores", "Floresta", "La Boca", "La Paternal", "Liniers", "Mataderos",
      "Monte Castro", "Montserrat", "Nueva Pompeya", "Núñez", "Palermo", "Parque Avellaneda", "Parque Chacabuco",
      "Parque Chas", "Parque Patricios", "Puerto Madero", "Recoleta", "Retiro", "Saavedra", "San Cristóbal",
      "San Nicolás", "San Telmo", "Vélez Sarsfield", "Versalles", "Villa Crespo", "Villa del Parque", "Villa Devoto",
      "Villa General Mitre", "Villa Lugano", "Villa Luro", "Villa Ortúzar", "Villa Pueyrredón", "Villa Real",
      "Villa Riachuelo", "Villa Santa Rita", "Villa Soldati", "Villa Urquiza"];
    var addOptions = function (select, list) {
      list.forEach(function (t) { var o = document.createElement("option"); o.value = o.textContent = t; select.appendChild(o); });
    };
    var locality = $("[data-localities]", form), barrio = $("[data-barrios]", form);
    if (locality && barrio) {
      addOptions(locality, [CAPITAL]);
      var group = document.createElement("optgroup");
      group.label = "Provincia de Buenos Aires";
      addOptions(group, PARTIDOS);
      locality.appendChild(group);
      addOptions(barrio, BARRIOS);
      var syncBarrio = function () {
        var isCapital = locality.value === CAPITAL;
        barrio.disabled = !isCapital;
        barrio.required = isCapital;
        barrio.options[0].textContent = isCapital ? "Elegí un barrio" : "Primero elegí Capital Federal";
        if (!isCapital) { barrio.value = ""; barrio.classList.remove("is-invalid"); }
      };
      locality.addEventListener("change", syncBarrio);
      syncBarrio();
    }

    var val = function (name) {
      if (name === "city") {
        var loc = val("locality"), b = val("barrio");
        return loc === CAPITAL && b ? b + ", " + loc : loc;
      }
      var els = form.elements[name];
      if (!els) return "";
      if (els.length !== undefined && els.tagName !== "SELECT" && els[0] && (els[0].type === "checkbox" || els[0].type === "radio")) {
        return Array.prototype.filter.call(els, function (e) { return e.checked; }).map(function (e) { return e.value; }).join(", ");
      }
      if (els.type === "checkbox") return els.checked ? els.value : "";
      return (els.value || "").trim();
    };

    var fields = [
      ["name", "Nombre"], ["phone", "WhatsApp"], ["resto", "Restaurante"], ["kind", "Tipo de cocina"],
      ["city", "Ubicación"], ["branches", "Sucursales"], ["instagram", "Instagram"],
      ["style", "Estilo"], ["colors", "Colores"], ["logo", "¿Tiene logo?"], ["photos", "¿Tiene fotos?"],
      ["sections", "Secciones"], ["domain", "¿Tiene dominio?"], ["when", "Para cuándo"], ["notes", "Comentarios"]
    ];

    var renderSummary = function () {
      fields.forEach(function (f) {
        var dd = $('[data-sum="' + f[0] + '"]');
        if (dd) dd.textContent = val(f[0]);
      });
    };

    var show = function (i) {
      current = i;
      steps.forEach(function (s, k) { s.classList.toggle("is-active", k === i); });
      prev.hidden = i === 0;
      next.hidden = i === steps.length - 1;
      send.hidden = i !== steps.length - 1;
      if (bar) bar.style.width = ((i + 1) / steps.length * 100) + "%";
      if (label) label.textContent = "Paso " + (i + 1) + " de " + steps.length;
      error.textContent = "";
    };

    var validate = function (i) {
      var missing = [];
      $$("[required]", steps[i]).forEach(function (el) {
        el.classList.remove("is-invalid");
        if (!el.value.trim()) { el.classList.add("is-invalid"); missing.push(el.dataset.label || el.name); }
      });
      if (missing.length) {
        error.textContent = "Completá: " + missing.join(", ") + ".";
        var first = $(".is-invalid", steps[i]);
        if (first) first.focus();
        return false;
      }
      return true;
    };

    form.addEventListener("input", function (e) {
      if (e.target.classList) e.target.classList.remove("is-invalid");
      renderSummary();
    });
    form.addEventListener("change", renderSummary);
    next.addEventListener("click", function () {
      if (!validate(current)) return;
      show(Math.min(current + 1, steps.length - 1));
      form.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    });
    prev.addEventListener("click", function () { show(Math.max(current - 1, 0)); });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      for (var k = 0; k < steps.length; k++) {
        if (!validate(k)) { show(k); validate(k); return; }
      }
      var lines = ["¡Hola restoweb! Quiero mi web 🙌", ""];
      var groups = [
        ["*Sobre mí*", ["name", "phone"]],
        ["*El restaurante*", ["resto", "kind", "city", "branches", "instagram"]],
        ["*Estética*", ["style", "colors", "logo", "photos"]],
        ["*Lo que necesito*", ["sections", "domain", "when", "notes"]]
      ];
      var labels = {};
      fields.forEach(function (f) { labels[f[0]] = f[1]; });
      groups.forEach(function (g) {
        var rows = g[1].map(function (n) { var v = val(n); return v ? "• " + labels[n] + ": " + v : ""; }).filter(Boolean);
        if (rows.length) { lines.push(g[0]); lines = lines.concat(rows); lines.push(""); }
      });
      var url = waLink(lines.join("\n").trim());
      doneLink.href = url;
      done.hidden = false;
      window.open(url, "_blank", "noopener");
    });

    show(0);
    renderSummary();
  }

  /* ---------- Hero rotating word ---------- */
  function initRotator() {
    var r = $("[data-rotate]");
    if (!r) return;
    var words = r.dataset.rotate.split("|");
    var em = $("em", r);
    var i = 0;
    setInterval(function () {
      r.classList.add("is-out");
      setTimeout(function () {
        i = (i + 1) % words.length;
        em.textContent = words[i];
        r.classList.remove("is-out");
        r.classList.add("is-in");
        void em.offsetWidth;
        r.classList.remove("is-in");
      }, 450);
    }, 2600);
  }

  function initYear() {
    $$("[data-year]").forEach(function (y) { y.textContent = new Date().getFullYear(); });
  }

  function boot() {
    safe(initSplit, "split");
    safe(initSplash, "splash");
    safe(initNav, "nav");
    safe(initAnchors, "anchors");
    safe(initReveal, "reveal");
    safe(initStage, "stage");
    safe(initTilt, "tilt");
    safe(initMagnetic, "magnetic");
    safe(initDemo, "demo");
    safe(initSteps, "steps");
    safe(initParallax, "parallax");
    safe(initWhatsApp, "whatsapp");
    safe(initWizard, "wizard");
    safe(initRotator, "rotator");
    safe(initYear, "year");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
