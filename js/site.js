/* Tarn — one small script. No libraries. */
(function () {
  "use strict";
  var doc = document, root = doc.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, r) { return (r || doc).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); };
  /* "Pause motion" (footer toggle): CSS loops pause via .is-still, JS loops check this */
  var still = function () { return root.classList.contains("is-still"); };

  /* run a loop only while its element is on screen */
  function whenVisible(el, onIn, onOut) {
    if (!("IntersectionObserver" in window)) { onIn(); return; }
    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { e.isIntersecting ? onIn() : onOut && onOut(); });
    }, { threshold: 0.05 }).observe(el);
  }

  /* ---------- pause / play all motion (WCAG 2.2.2), remembered across pages ---------- */
  var toggles = $$(".motion-toggle");
  var paintToggles = function () {
    toggles.forEach(function (b) {
      b.setAttribute("aria-pressed", String(still()));
      b.textContent = still() ? "Play motion" : "Pause motion";
    });
  };
  toggles.forEach(function (b) {
    b.addEventListener("click", function () {
      root.classList.toggle("is-still");
      try { localStorage.setItem("tarn-still", still() ? "1" : "0"); } catch (e) {}
      paintToggles();
      doc.dispatchEvent(new CustomEvent("tarn:motion"));
    });
  });
  paintToggles();

  /* ---------- concept notices: buttons that would need a real product ---------- */
  var globalNotice = $("#notice"), noticeTimer = null;
  $$("[data-notice]").forEach(function (b) {
    b.addEventListener("click", function () {
      var scope = b.closest("[data-notice-scope]");
      var out = (scope && $(".notice-msg", scope)) || globalNotice;
      if (!out) return;
      out.textContent = "";
      /* re-set on the next frame so the live region announces a repeated message */
      requestAnimationFrame(function () { out.textContent = b.getAttribute("data-notice"); });
      if (out === globalNotice) {
        clearTimeout(noticeTimer);
        noticeTimer = setTimeout(function () { globalNotice.textContent = ""; }, 6000);
      }
    });
  });

  /* ---------- nav: Product dropdown ---------- */
  $$(".dd").forEach(function (dd) {
    var btn = $(".pill", dd), hoverOpen = false;
    function set(open) { dd.classList.toggle("is-open", open); btn.setAttribute("aria-expanded", String(open)); }
    /* a click right after hover keeps the panel open instead of closing what the pointer opened */
    btn.addEventListener("click", function () {
      if (hoverOpen) { hoverOpen = false; set(true); }
      else set(btn.getAttribute("aria-expanded") !== "true");
    });
    dd.addEventListener("mouseenter", function () { hoverOpen = true; set(true); });
    dd.addEventListener("mouseleave", function () { hoverOpen = false; set(false); });
    dd.addEventListener("focusout", function (e) { if (!dd.contains(e.relatedTarget)) set(false); });
    dd.addEventListener("keydown", function (e) { if (e.key === "Escape") { set(false); btn.focus(); } });
  });

  /* ---------- nav: phone menu (locks the page and keeps focus inside while open) ---------- */
  var burger = $(".burger"), mnav = $(".mnav");
  if (burger && mnav) {
    var outside = [$("main"), $("footer")].filter(Boolean);
    var setMenu = function (open) {
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      mnav.classList.toggle("is-open", open);
      doc.body.style.overflow = open ? "hidden" : "";
      outside.forEach(function (el) { if (open) el.setAttribute("inert", ""); else el.removeAttribute("inert"); });
    };
    burger.addEventListener("click", function () { setMenu(burger.getAttribute("aria-expanded") !== "true"); });
    doc.addEventListener("keydown", function (e) { if (e.key === "Escape" && mnav.classList.contains("is-open")) { setMenu(false); burger.focus(); } });
    $$("a", mnav).forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
    $$("[data-notice]", mnav).forEach(function (b) { b.addEventListener("click", function () { setMenu(false); burger.focus(); }); });
    window.addEventListener("resize", function () { if (mnav.classList.contains("is-open") && getComputedStyle(burger).display === "none") setMenu(false); });
    var sub = $(".mnav > button[aria-controls]", mnav), subList = $(".mnav__sub", mnav);
    if (sub) sub.addEventListener("click", function () {
      var open = sub.getAttribute("aria-expanded") !== "true";
      sub.setAttribute("aria-expanded", String(open));
      subList.classList.toggle("is-open", open);
    });
  }

  /* ---------- hero entrance ---------- */
  var hero = $(".hero");
  if (hero) setTimeout(function () { hero.classList.add("is-in"); }, 40);

  /* ---------- insight cards inside the hero phone (every 3.5 s) ---------- */
  var track = $(".insights__track");
  if (track) {
    var cards = $$(".insight", track);
    var clone = cards[0].cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    track.appendChild(clone);
    var all = cards.concat([clone]);
    var i = 0, timer = null, held = false;
    var place = function (anim) {
      track.classList.toggle("no-anim", !anim);
      var step = all[0].getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 0);
      track.style.transform = "translateX(" + (-i * step) + "px)";
      all.forEach(function (c, k) { c.classList.toggle("is-active", k === i || (i === all.length - 1 && k === 0)); });
    };
    place(false);
    window.addEventListener("resize", function () { place(false); });
    if (!reduce) {
      track.addEventListener("transitionend", function (e) {
        if (e.target === track && i === all.length - 1) { i = 0; place(false); }
      });
      var tick = function () { if (still() || held) return; i += 1; place(true); };
      var box = $(".insights");
      box.addEventListener("mouseenter", function () { held = true; });
      box.addEventListener("mouseleave", function () { held = false; });
      box.addEventListener("focusin", function () { held = true; });
      box.addEventListener("focusout", function () { held = false; });
      whenVisible(track, function () { if (!timer) timer = setInterval(tick, 3500); }, function () { clearInterval(timer); timer = null; });
    }
  }

  /* ---------- features carousel: 5 s, there and back, real pause ---------- */
  $$(".car").forEach(function (car) {
    var t = $(".car__track", car), cs = $$(".fcard", t);
    var prev = $("[data-car=prev]", car), next = $("[data-car=next]", car), pp = $("[data-car=pause]", car);
    var dir = 1, timer = null, playing = !reduce, hovering = false;
    var stepW = function () { return cs[0].getBoundingClientRect().width + 24; };
    var idx = function () { return Math.round(t.scrollLeft / stepW()); };
    var max = function () { return Math.ceil((t.scrollWidth - t.clientWidth) / stepW()); };
    var go = function (n) { t.scrollTo({ left: Math.max(0, Math.min(n, max())) * stepW(), behavior: reduce ? "auto" : "smooth" }); };
    var auto = function () {
      if (still()) return;
      var n = idx();
      if (n >= max()) dir = -1; else if (n <= 0) dir = 1;
      go(n + dir);
    };
    var start = function () { stop(); if (playing && !hovering) timer = setInterval(auto, 5000); };
    var stop = function () { clearInterval(timer); timer = null; };
    var paint = function () {
      pp.setAttribute("aria-label", playing ? "Pause carousel" : "Play carousel");
      pp.setAttribute("aria-pressed", String(!playing));
      $(".i-pause", pp).style.display = playing ? "" : "none";
      $(".i-play", pp).style.display = playing ? "none" : "";
    };
    prev.addEventListener("click", function () { go(idx() - 1); start(); });
    next.addEventListener("click", function () { go(idx() + 1); start(); });
    pp.addEventListener("click", function () { playing = !playing; paint(); start(); });
    t.addEventListener("focusin", function () { hovering = true; stop(); });
    t.addEventListener("focusout", function () { hovering = false; start(); });
    t.addEventListener("mouseenter", function () { hovering = true; stop(); });
    t.addEventListener("mouseleave", function () { hovering = false; start(); });
    paint();
    whenVisible(car, start, stop);
  });

  /* ---------- alerts: toasts that stack every 3 s ---------- */
  var toasts = $$(".toast");
  if (toasts.length) {
    var n = toasts.length, head = 2, tt = null, hold = false; // first message starts in front
    var lay = function () {
      toasts.forEach(function (el, k) {
        var pos = (head - k + n * 2) % n;          // 0 back, 1 middle, 2 front, 3 leaving
        el.setAttribute("data-pos", pos <= 3 ? String(pos) : "x");
        /* with reduced motion all six are listed, so none is hidden */
        if (!reduce) el.setAttribute("aria-hidden", pos === 2 ? "false" : "true");
      });
    };
    toasts.forEach(function (el) { el.style.transition = "none"; });
    lay();
    void toasts[0].offsetWidth;
    toasts.forEach(function (el) { el.style.transition = ""; });
    if (!reduce) {
      var abox = $(".alerts"), stack = $(".toasts");
      stack.addEventListener("mouseenter", function () { hold = true; });
      stack.addEventListener("mouseleave", function () { hold = false; });
      whenVisible(abox, function () {
        if (!tt) tt = setInterval(function () { if (still() || hold) return; head = (head + 1) % n; lay(); }, 3000);
      }, function () { clearInterval(tt); tt = null; });
      abox.addEventListener("pointermove", function (e) {
        var r = abox.getBoundingClientRect();
        abox.style.setProperty("--mx", (e.clientX - r.left) + "px");
        abox.style.setProperty("--my", (e.clientY - r.top) + "px");
      });
    }
  }

  /* ---------- marquees pause off screen ---------- */
  $$(".mq").forEach(function (m) {
    whenVisible(m, function () { m.classList.remove("is-paused"); }, function () { m.classList.add("is-paused"); });
  });

  /* ---------- typing helper ---------- */
  function type(el, text, speed, done) {
    var k = 0;
    el.classList.add("is-typing");
    (function step() {
      el.textContent = text.slice(0, k);
      if (k++ < text.length) setTimeout(step, speed + Math.random() * 40);
      else { el.classList.remove("is-typing"); done && done(); }
    })();
  }

  /* ---------- Ask Tarn phone: the conversation starts full; each new loop dims it, then replays ---------- */
  var chat = $(".cphone");
  if (chat) {
    var input = $(".composer__text", chat), steps = $$("[data-step]", chat), log = $(".chat", chat);
    var q = input.getAttribute("data-q");
    var running = false, visible = false, first = true;
    var show = function (k) { steps.forEach(function (s) { s.classList.toggle("is-on", +s.getAttribute("data-step") <= k); }); };
    show(99);
    if (!reduce) {
      var cycle = function () {
        if (still()) { running = false; log.classList.remove("is-dim"); show(99); return; }
        running = true;
        /* first pass: keep the full conversation on screen for a moment before replaying */
        setTimeout(function () {
          if (still()) { running = false; return; }
          log.classList.add("is-dim"); input.textContent = "";
          type(input, q, 55, function () {
            setTimeout(function () {
              input.textContent = ""; log.classList.remove("is-dim"); show(0);
              var k = 1;
              var nextStep = function () {
                show(k);
                if (k++ < 4) setTimeout(nextStep, 1400);
                else setTimeout(function () { running = false; if (visible) cycle(); }, 4200);
              };
              setTimeout(nextStep, 1100);
            }, 500);
          });
        }, first ? 2500 : 700);
        first = false;
      };
      whenVisible(chat, function () { visible = true; if (!running) cycle(); }, function () { visible = false; });
      doc.addEventListener("tarn:motion", function () { if (!still() && visible && !running) cycle(); });
    }
  }

  /* ---------- spending hero: the question field types itself (stops as soon as the visitor takes over) ---------- */
  var sp = $("[data-typed]");
  if (sp) {
    var phrase = sp.getAttribute("data-typed"), stopped = false;
    var takeOver = function () { stopped = true; };
    sp.addEventListener("focus", takeOver, { once: true });
    sp.addEventListener("pointerdown", takeOver, { once: true });
    if (reduce) sp.value = phrase;
    else setTimeout(function () {
      var k = 0;
      (function step() {
        if (stopped) return;
        sp.value = phrase.slice(0, k);
        if (k++ < phrase.length) setTimeout(step, 60 + Math.random() * 40);
      })();
    }, 900);
    var form = sp.closest("form"), ans = $(".ask-field__ans");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      ans.textContent = form.getAttribute("data-answer");
    });
  }

  /* ---------- newsletter ---------- */
  $$(".news").forEach(function (f) {
    var inp = $("input", f), msg = $(".news__msg", f.parentNode);
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(inp.value.trim());
      inp.setAttribute("aria-invalid", String(!ok));
      msg.className = "news__msg " + (ok ? "is-ok" : "is-error");
      msg.textContent = ok ? f.getAttribute("data-ok") : f.getAttribute("data-err");
      if (ok) f.reset(); else inp.focus();
    });
  });

  /* ---------- pricing switch ---------- */
  var sw = $(".switch");
  if (sw) {
    var plans = $(".plans");
    sw.addEventListener("click", function () {
      var on = sw.getAttribute("aria-checked") !== "true";
      sw.setAttribute("aria-checked", String(on));
      plans.classList.toggle("yearly", on);
    });
  }

  /* ---------- comparison accordion ---------- */
  $$(".cmp-head").forEach(function (h) {
    var body = doc.getElementById(h.getAttribute("aria-controls"));
    h.addEventListener("click", function () {
      var open = h.getAttribute("aria-expanded") !== "true";
      h.setAttribute("aria-expanded", String(open));
      body.hidden = !open;
    });
  });

  /* ---------- moments strip drifts with the page ---------- */
  var strip = $(".strip__track");
  if (strip && !reduce) {
    var raf = null;
    var move = function () {
      raf = null;
      var r = strip.parentNode.getBoundingClientRect(), vh = window.innerHeight;
      var p = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
      var room = Math.max(0, strip.scrollWidth - strip.parentNode.clientWidth + 64);
      strip.style.transform = "translateX(" + (-p * Math.min(700, room)) + "px)";
    };
    window.addEventListener("scroll", function () { if (!raf) raf = requestAnimationFrame(move); }, { passive: true });
    move();
  }
})();
