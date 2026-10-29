(function () {
  "use strict";

  var BRAND = window.__BRAND__ || {};
  var WA = BRAND.whatsapp || "5491167922355";
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var canHover = matchMedia("(hover: hover)").matches;

  document.documentElement.classList.remove("no-js");

  function safe(fn, name) {
    try { fn(); } catch (err) { console.warn("[bondi] " + name + " failed:", err); }
  }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function waLink(text) { return "https://wa.me/" + WA + "?text=" + encodeURIComponent(text); }

  /* ---------- Splash ---------- */
  function initSplash() {
    var splash = $("[data-splash]");
    if (!splash) return;
    var done = false;
    var hide = function () {
      if (done) return;
      done = true;
      splash.classList.add("is-out");
      document.body.classList.add("is-loaded");
      setTimeout(revealHero, 250);
    };
    // Don't wait for every photo: the logo animation needs ~1.1s, then go.
    setTimeout(hide, 1300);
    setTimeout(hide, 3000);
  }

  /* ---------- Hero headline split ---------- */
  function escHTML(s) { return s.replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function splitWords(el) {
    if (el.dataset.splitDone) return;
    el.dataset.splitDone = "1";
    el.setAttribute("aria-label", el.textContent.trim().replace(/\s+/g, " "));
    var wrap = function (text) {
      return text.split(/(\s+)/).map(function (w) {
        if (!w) return "";
        return /^\s+$/.test(w) ? w : '<span class="split-word" aria-hidden="true"><span>' + escHTML(w) + "</span></span>";
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
    $$(".split-word > span", el).forEach(function (s, i) { s.style.transitionDelay = (i * 0.08) + "s"; });
  }
  function initSplit() {
    $$("[data-split]").forEach(function (el) {
      el.classList.remove("reveal");
      splitWords(el);
    });
    // Safety: never leave the headline hidden
    setTimeout(revealHero, 5000);
  }
  function revealHero() {
    $$("[data-split]").forEach(function (el) { el.classList.add("is-split-in"); });
  }

  /* ---------- Nav ---------- */
  function initNav() {
    var nav = $("[data-nav]");
    var burger = $("[data-burger]");
    if (!nav) return;
    var onScroll = function () { nav.classList.toggle("is-scrolled", window.scrollY > 40); };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    if (burger) {
      burger.addEventListener("click", function () {
        var open = nav.classList.toggle("is-open");
        burger.setAttribute("aria-expanded", open ? "true" : "false");
        burger.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
        document.body.style.overflow = open ? "hidden" : "";
      });
      $$("[data-menu] a").forEach(function (a) {
        a.addEventListener("click", function () {
          nav.classList.remove("is-open");
          burger.setAttribute("aria-expanded", "false");
          document.body.style.overflow = "";
        });
      });
    }
  }

  /* ---------- Smooth anchors (native) ---------- */
  function initAnchors() {
    document.addEventListener("click", function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute("href");
      if (!id || id === "#") return;
      var el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 70, behavior: reduced ? "auto" : "smooth" });
    });
  }

  /* ---------- Reveal on scroll ---------- */
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
      el.style.transitionDelay = ((i % 3) * 0.08) + "s";
      io.observe(el);
    });
    setTimeout(function () {
      $$(".reveal:not(.is-visible)").forEach(function (el) {
        if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add("is-visible");
      });
    }, 6000);
  }

  /* ---------- Count-up ---------- */
  function initCount() {
    var els = $$("[data-count]");
    if (!els.length || !("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        var el = e.target, end = parseInt(el.dataset.count, 10) || 0;
        if (end === 0) return;
        var t0 = performance.now(), dur = 1400;
        var tick = function (t) {
          var p = Math.min(1, (t - t0) / dur);
          el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(tick);
        };
        el.textContent = "0";
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.05 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Sesame seeds (canvas) ---------- */
  function initSeeds() {
    var canvas = $("[data-seeds]");
    if (!canvas || reduced) return;
    var ctx = canvas.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W, H, parts = [], visible = true;
    var resize = function () {
      W = canvas.offsetWidth; H = canvas.offsetHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);
    var count = W < 700 ? 30 : 70;
    for (var i = 0; i < count; i++) {
      parts.push({
        x: Math.random() * W, y: Math.random() * H,
        r: Math.random() * 1.6 + 1.4,
        vx: (Math.random() - .5) * .25, vy: Math.random() * .35 + .08,
        rot: Math.random() * Math.PI, vr: (Math.random() - .5) * .02,
        a: Math.random() * .45 + .35, gold: Math.random() < .2
      });
    }
    var mx = -999, my = -999;
    canvas.parentElement.addEventListener("mousemove", function (e) {
      var r = canvas.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top;
    });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }).observe(canvas);
    }
    var loop = function () {
      requestAnimationFrame(loop);
      if (!visible) return;
      ctx.clearRect(0, 0, W, H);
      parts.forEach(function (p) {
        var dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
        if (d2 < 9000) { var f = (9000 - d2) / 9000 * 1.6; p.x += dx / 60 * f; p.y += dy / 60 * f; }
        p.x += p.vx; p.y += p.vy; p.rot += p.vr;
        if (p.y > H + 5) { p.y = -5; p.x = Math.random() * W; }
        if (p.x < -5) p.x = W + 5; else if (p.x > W + 5) p.x = -5;
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, p.r * 1.7, p.r, p.rot, 0, Math.PI * 2);
        ctx.fillStyle = p.gold ? "rgba(245,183,0," + (p.a * .7) + ")" : "rgba(214,190,140," + p.a + ")";
        ctx.fill();
      });
    };
    loop();
  }

  /* ---------- Menu tabs ---------- */
  function initTabs() {
    var tabs = $$("[data-tab]");
    var dishes = $$("[data-cat]");
    if (!tabs.length) return;
    var show = function (cat) {
      tabs.forEach(function (t) { t.setAttribute("aria-selected", t.dataset.tab === cat ? "true" : "false"); });
      dishes.forEach(function (d, i) {
        var on = d.dataset.cat === cat;
        d.classList.toggle("is-hidden", !on);
        d.classList.remove("is-entering");
        if (on) {
          void d.offsetWidth;
          d.style.animationDelay = (i % 8) * 0.05 + "s";
          d.classList.add("is-entering");
        }
      });
    };
    tabs.forEach(function (t) { t.addEventListener("click", function () { show(t.dataset.tab); }); });
    show("burgers");
  }

  /* ---------- Card tilt (hover devices only) ---------- */
  function initTilt() {
    if (!canHover) return;
    $$(".dish").forEach(function (card) {
      if (card.dataset.tiltBound) return;
      card.dataset.tiltBound = "1";
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        card.style.transform = "perspective(900px) rotateY(" + (x * 7) + "deg) rotateX(" + (-y * 7) + "deg) translateY(-6px)";
      });
      card.addEventListener("mouseout", function (e) {
        if (!card.contains(e.relatedTarget)) card.style.transform = "";
      });
    });
  }

  /* ---------- Parallax (GSAP, optional) ---------- */
  function initParallax() {
    if (!window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    $$("[data-parallax]").forEach(function (el) {
      var k = parseFloat(el.dataset.parallax) || 0.1;
      gsap.to(el, {
        yPercent: k * 100, ease: "none",
        scrollTrigger: { trigger: el.closest("section") || el, start: "top bottom", end: "bottom top", scrub: 0.6 }
      });
    });
    gsap.to(".marquee", {
      rotate: 1.4, ease: "none",
      scrollTrigger: { trigger: ".marquee", start: "top bottom", end: "bottom top", scrub: 0.8 }
    });
  }

  /* ---------- WhatsApp links with prefilled text ---------- */
  function initWhatsApp() {
    var msgs = BRAND.messages || {};
    $$("[data-wa]").forEach(function (a) {
      var text = msgs[a.dataset.wa];
      if (text) a.href = waLink(text);
    });
  }

  /* ---------- Pedidos (delivery / take away) y reservas → WhatsApp ---------- */
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function isoDate(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function money(n) { return "$" + n.toLocaleString("es-AR"); }

  var MODES = {
    delivery: {
      btn: "Enviar pedido por WhatsApp",
      note: "Te confirmamos el pedido, el total con envío y la demora por WhatsApp.",
      done: "Te abrimos WhatsApp con tu pedido."
    },
    takeaway: {
      btn: "Enviar pedido por WhatsApp",
      note: "Te avisamos por WhatsApp cuando esté listo para retirar.",
      done: "Te abrimos WhatsApp con tu pedido."
    },
    reserva: {
      btn: "Enviar reserva por WhatsApp",
      note: "Te confirmamos disponibilidad por WhatsApp a la brevedad.",
      done: "Te abrimos WhatsApp con tu reserva."
    }
  };

  function initOrder() {
    var form = $("[data-order]");
    if (!form) return;
    var f = form.elements;
    var error = $("[data-error]", form);
    var done = $("[data-done]", form);
    var doneLink = $("[data-done-link]", form);
    var doneText = $("[data-done-text]", form);
    var submitLabel = $("[data-submit-label]", form);
    var note = $("[data-note]", form);
    var cartList = $("[data-cart]", form);
    var totalEl = $("[data-total]", form);
    var pill = $("[data-cart-pill]");
    var pillCount = pill && $("[data-cart-count]", pill);
    var brandName = BRAND.name || "Bondi Smash";

    /* Productos: se leen del menú de la página, así precios y nombres están en un solo lugar. */
    var items = $$("[data-item]").map(function (el) {
      var cat = el.closest("[data-cat]");
      var tab = cat && $('[data-tab="' + cat.dataset.cat + '"]');
      return { el: el, name: el.dataset.item, price: parseInt(el.dataset.price, 10) || 0, group: tab ? tab.textContent : "" };
    });
    var qty = items.map(function () { return 0; });
    items.forEach(function (it) {
      var label = $("[data-price-label]", it.el);
      if (label) label.textContent = money(it.price);
    });

    var lastGroup = null;
    cartList.innerHTML = items.map(function (it, i) {
      var head = "";
      if (it.group !== lastGroup) { head = '<li class="cart__cat">' + escHTML(it.group) + "</li>"; lastGroup = it.group; }
      var n = escHTML(it.name);
      return head + '<li class="cart__item" data-i="' + i + '">' +
        '<span class="cart__name">' + n + "<small>" + money(it.price) + "</small></span>" +
        '<span class="qty"><button type="button" data-step="-1" aria-label="Quitar uno: ' + n + '" disabled>−</button>' +
        '<output aria-live="polite">0</output>' +
        '<button type="button" data-step="1" aria-label="Agregar uno: ' + n + '">+</button></span></li>';
    }).join("");

    var count = function () { return qty.reduce(function (a, b) { return a + b; }, 0); };
    var subtotal = function () { return items.reduce(function (s, it, i) { return s + it.price * qty[i]; }, 0); };

    var refresh = function () {
      var c = count();
      totalEl.textContent = money(subtotal());
      if (c) cartList.classList.remove("is-invalid");
      if (pill) { pill.hidden = c === 0; pillCount.textContent = c; }
    };
    var setQty = function (i, q) {
      qty[i] = Math.max(0, Math.min(20, q));
      var row = $('[data-i="' + i + '"]', cartList);
      $("output", row).textContent = qty[i];
      $('[data-step="-1"]', row).disabled = qty[i] === 0;
      row.classList.toggle("is-on", qty[i] > 0);
      refresh();
    };

    cartList.addEventListener("click", function (e) {
      var b = e.target.closest("[data-step]");
      if (!b) return;
      var i = +b.closest("[data-i]").dataset.i;
      setQty(i, qty[i] + parseInt(b.dataset.step, 10));
    });

    /* Modo: delivery, take away o reserva */
    var mode = function () { return (form.querySelector('input[name="mode"]:checked') || {}).value || "delivery"; };
    var applyMode = function () {
      var m = mode();
      $$("[data-show]", form).forEach(function (el) {
        el.hidden = el.dataset.show.split(" ").indexOf(m) === -1;
      });
      submitLabel.textContent = MODES[m].btn;
      note.textContent = MODES[m].note;
      error.textContent = "";
      done.hidden = true;
    };
    var setMode = function (m) {
      var radio = form.querySelector('input[name="mode"][value="' + m + '"]');
      if (radio && !radio.checked) { radio.checked = true; applyMode(); }
    };
    $$('input[name="mode"]', form).forEach(function (r) { r.addEventListener("change", applyMode); });
    $$("[data-mode]").forEach(function (a) {
      a.addEventListener("click", function () { setMode(a.dataset.mode); });
    });
    applyMode();

    /* "+ Agregar" del menú: suma al pedido sin moverte de donde estás */
    $$("[data-add]").forEach(function (btn) {
      var original = btn.innerHTML;
      btn.addEventListener("click", function () {
        var el = btn.closest("[data-item]");
        var i = items.findIndex(function (it) { return it.el === el; });
        if (i === -1) return;
        if (mode() === "reserva") setMode("delivery");
        setQty(i, qty[i] + 1);
        btn.classList.add("is-added");
        if (!btn.classList.contains("pricelist__add")) btn.textContent = "✓ Agregado (" + qty[i] + ")";
        clearTimeout(btn._t);
        btn._t = setTimeout(function () { btn.classList.remove("is-added"); btn.innerHTML = original; }, 1400);
        if (pill) { pill.classList.remove("is-bump"); void pill.offsetWidth; pill.classList.add("is-bump"); }
      });
    });

    /* La pastilla "Tu pedido" se esconde cuando ya estás en el formulario */
    if (pill && "IntersectionObserver" in window) {
      new IntersectionObserver(function (en) {
        pill.classList.toggle("is-away", en[0].isIntersecting);
      }, { threshold: 0.15 }).observe(form);
    }

    /* Reserva: fechas y turnos */
    var date = f.date;
    var time = $("[data-slots]", form);
    var closed = BRAND.closedDays || [];

    var today = new Date();
    date.min = isoDate(today);
    var max = new Date(); max.setDate(max.getDate() + 60);
    date.max = isoDate(max);

    var slots = BRAND.slots || {};
    var lunchDays = BRAND.lunchDays || [];
    var fillSlots = function () {
      if (!slots.dinner) return;
      var day = -1;
      if (date.value) {
        var q = date.value.split("-");
        day = new Date(+q[0], +q[1] - 1, +q[2]).getDay();
      }
      var list = (lunchDays.indexOf(day) !== -1 ? (slots.lunch || []) : []).concat(slots.dinner);
      var prev = time.value;
      time.innerHTML = '<option value="">Elegí</option>' + list.map(function (s) {
        return "<option>" + s + "</option>";
      }).join("");
      if (list.indexOf(prev) !== -1) time.value = prev;
    };
    fillSlots();
    date.addEventListener("change", fillSlots);

    var fmtDate = function (v) {
      var p = v.split("-");
      var d = new Date(+p[0], +p[1] - 1, +p[2]);
      var days = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
      return days[d.getDay()] + " " + p[2] + "/" + p[1];
    };

    $$("input, select, textarea", form).forEach(function (el) {
      el.addEventListener("input", function () { el.classList.remove("is-invalid"); error.textContent = ""; });
    });

    var checked = function (name) { return (form.querySelector('input[name="' + name + '"]:checked') || {}).value || ""; };

    var validate = function (m) {
      var problems = [];
      var flag = function (el, what) { el.classList.add("is-invalid"); problems.push(what); };
      [f.name, f.address, f.date, f.time, cartList].forEach(function (el) { el.classList.remove("is-invalid"); });
      if (!f.name.value.trim()) flag(f.name, "tu nombre");
      if (m === "delivery" && !f.address.value.trim()) flag(f.address, "la dirección");
      if (m !== "reserva" && !count()) flag(cartList, "elegir algo del menú");
      if (m === "reserva") {
        if (!f.date.value) flag(f.date, "la fecha");
        if (!f.time.value) flag(f.time, "el horario");
      }
      if (problems.length) return "Nos falta " + problems.join(", ").replace(/, ([^,]*)$/, " y $1") + ".";
      if (m === "reserva") {
        var p = f.date.value.split("-");
        var picked = new Date(+p[0], +p[1] - 1, +p[2]);
        if (f.date.value < date.min) { f.date.classList.add("is-invalid"); return "Elegí una fecha a partir de hoy."; }
        if (closed.indexOf(picked.getDay()) !== -1) { f.date.classList.add("is-invalid"); return "Ese día estamos cerrados. ¿Probamos con otro?"; }
      }
      return "";
    };

    var message = function (m) {
      var who = "• Nombre: " + f.name.value.trim();
      if (m === "reserva") {
        var lines = [
          "¡Hola " + brandName + "! Quiero reservar una mesa 🍔",
          "",
          who,
          "• Personas: " + (checked("people") || "2"),
          "• Día: " + fmtDate(f.date.value),
          "• Horario: " + f.time.value
        ];
        if (f.occasion.value) lines.push("• Ocasión: " + f.occasion.value);
        if (f.notes.value.trim()) lines.push("• Comentarios: " + f.notes.value.trim());
        return lines.join("\n");
      }
      var out = [
        "¡Hola " + brandName + "! Quiero hacer un pedido " + (m === "delivery" ? "para *delivery* 🛵" : "para *retirar en el local* 🛍️"),
        "",
        who
      ];
      if (m === "delivery") {
        var addr = f.address.value.trim();
        if (f.floor.value.trim()) addr += ", " + f.floor.value.trim();
        out.push("• Dirección: " + addr);
        if (f.ref.value.trim()) out.push("• Entre calles: " + f.ref.value.trim());
      } else {
        out.push("• Retiro: " + f.pickup.value);
      }
      out.push("", "*Mi pedido*");
      items.forEach(function (it, i) {
        if (qty[i]) out.push(qty[i] + " × " + it.name + " — " + money(it.price * qty[i]));
      });
      out.push("Subtotal: " + money(subtotal()) + (m === "delivery" ? " + envío" : ""));
      if (f.changes.value.trim()) out.push("", "• Cambios: " + f.changes.value.trim());
      out.push("• Pago: " + checked("pay"));
      return out.join("\n");
    };

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var m = mode();
      var problem = validate(m);
      if (problem) {
        error.textContent = problem;
        var first = $(".is-invalid", form);
        if (first && first.focus && first.tagName !== "UL") first.focus();
        else if (first) first.scrollIntoView({ block: "center", behavior: reduced ? "auto" : "smooth" });
        return;
      }
      var url = waLink(message(m));
      doneLink.href = url;
      doneText.textContent = MODES[m].done;
      done.hidden = false;
      window.open(url, "_blank", "noopener");
    });
  }

  function initYear() {
    var y = $("[data-year]");
    if (y) y.textContent = new Date().getFullYear();
  }

  function boot() {
    safe(initSplit, "split");
    safe(initSplash, "splash");
    safe(initNav, "nav");
    safe(initAnchors, "anchors");
    safe(initReveal, "reveal");
    safe(initCount, "count");
    safe(initSeeds, "seeds");
    safe(initTabs, "tabs");
    safe(initTilt, "tilt");
    safe(initParallax, "parallax");
    safe(initWhatsApp, "whatsapp");
    safe(initOrder, "order");
    safe(initYear, "year");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
