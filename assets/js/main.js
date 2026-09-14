/* ==========================================================================
   Site behaviour: sticky header, mobile menu, scroll reveals, work filter,
   counters, hero parallax, image fallbacks, form validation.
   Every animation is gated behind prefers-reduced-motion.
   ========================================================================== */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $  = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* ------------------------------------------------- sticky header state */
  /* ---- headline: both display lines to one width ------------------------
     The two lines of the hero headline read as a single block only when they
     end flush. They do not naturally: "שאנשים זוכרים" measures 1.40x the
     width of "מעצב חוויות", while in English the second line is 9% narrower
     than the first. The first line is the anchor; the second is scaled to it.

     Measured rather than hardcoded per language, because the headline is copy
     and copy gets rewritten -- a hardcoded ratio would go silently wrong the
     first time someone edits it. One pass is enough: width scales linearly
     with font-size, and the tracking on the outlined line is em-based so it
     scales with it. */
  function fitHeadline() {
    var title = $(".hero__title");
    if (!title) return;
    var lines = $$(".line", title);
    if (lines.length < 2) return;

    /* drop any previous fit so the cascade's own clamp() is what we measure */
    lines.forEach(function (el) { el.style.fontSize = ""; });

    /* the span is display:block, so its box is the column, not the text --
       a Range gives the ink */
    var rects = function (el) {
      var r = document.createRange();
      r.selectNodeContents(el);
      return { box: r.getBoundingClientRect().width,
               lines: Array.prototype.filter.call(r.getClientRects(), function (x) { return x.width > 1; }).length };
    };
    var ink = function (el) { return rects(el).box; };

    /* Only meaningful while every line is a single visual line. Once one
       wraps, its bounding box is the width of its longest word, not of the
       phrase, and matching that equalises nothing -- it just resizes the
       headline. English wraps at this column width, so the fit stands down
       there and the cascade's own size is left in place. */
    for (var n = 0; n < lines.length; n++) {
      if (rects(lines[n]).lines !== 1) return;
    }

    var target = ink(lines[0]);
    if (!target) return;                       /* fonts not in yet; caller retries */

    /* Two passes. The first lands within ~1%, the rest being hinting and
       sub-pixel rounding at the new size rather than anything linear; the
       second measures the fitted line and corrects for it. */
    for (var pass = 0; pass < 2; pass++) {
      for (var i = 1; i < lines.length; i++) {
        var w = ink(lines[i]);
        if (!w) continue;
        var base = parseFloat(getComputedStyle(lines[i]).fontSize);
        lines[i].style.fontSize = (base * target / w).toFixed(2) + "px";
      }
    }
  }

  function initHeadlineFit() {
    if (!$(".hero__title")) return;
    fitHeadline();
    /* the web font changes every measurement, so fit again once it lands */
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(fitHeadline);
    }
    /* the inline size is px, so it has to be recomputed when the clamp moves */
    var t;
    window.addEventListener("resize", function () {
      clearTimeout(t);
      t = setTimeout(fitHeadline, 120);
    });
    /* swapping language swaps the text under us */
    document.addEventListener("langchange", function () {
      /* let the new text lay out first */
      requestAnimationFrame(fitHeadline);
    });
  }

  function initHeader() {
    var header = $(".site-header");
    if (!header) return;
    var onScroll = function () {
      header.classList.toggle("is-stuck", window.scrollY > 12);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* -------------------------------------------------------- mobile menu */
  function initMenu() {
    var btn = $(".menu-btn");
    var nav = $("#primary-nav");
    if (!btn || !nav) return;

    var close = function () {
      btn.setAttribute("aria-expanded", "false");
      nav.classList.remove("is-open");
      document.body.style.overflow = "";
    };

    btn.addEventListener("click", function () {
      var open = btn.getAttribute("aria-expanded") !== "true";
      btn.setAttribute("aria-expanded", String(open));
      nav.classList.toggle("is-open", open);
      /* stop the page scrolling behind the full-screen sheet */
      document.body.style.overflow = open ? "hidden" : "";
    });

    $$(".nav__link", nav).forEach(function (link) {
      link.addEventListener("click", close);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && btn.getAttribute("aria-expanded") === "true") {
        close();
        btn.focus();
      }
    });

    /* if the viewport grows past the breakpoint, drop the locked state */
    window.matchMedia("(min-width: 861px)").addEventListener("change", function (e) {
      if (e.matches) close();
    });
  }

  /* ------------------------------------------------------ scroll reveals */
  function initReveals() {
    var items = $$(".reveal");
    if (!items.length) return;

    if (reduceMotion || !("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.08 });

    items.forEach(function (el) { io.observe(el); });
  }

  /* ------------------------------------------------------- stat counters */
  function initCounters() {
    var nums = $$("[data-count-to]");
    if (!nums.length) return;

    var render = function (el, value) {
      el.textContent = value + (el.dataset.suffix || "");
    };

    if (reduceMotion || !("IntersectionObserver" in window)) {
      nums.forEach(function (el) { render(el, Number(el.dataset.countTo)); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        io.unobserve(el);

        var target = Number(el.dataset.countTo) || 0;
        var start = performance.now();
        var dur = 1400;

        var tick = function (now) {
          var t = Math.min((now - start) / dur, 1);
          /* ease-out cubic */
          var eased = 1 - Math.pow(1 - t, 3);
          render(el, Math.round(target * eased));
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.5 });

    nums.forEach(function (el) { render(el, 0); io.observe(el); });
  }

  /* ---------------------------------------------------------- work filter */
  function initFilter() {
    var filters = $$(".filter");
    var cards = $$(".work-card");
    if (!filters.length || !cards.length) return;

    filters.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var key = btn.dataset.filter;

        filters.forEach(function (f) {
          f.setAttribute("aria-pressed", String(f === btn));
        });

        cards.forEach(function (card) {
          var match = key === "all" || card.dataset.category === key;
          card.hidden = !match;
        });
      });
    });
  }

  /* -------------------------------------------------------- hero parallax */
  /* Publishes scroll offset as one custom property and lets CSS do the rest:
     each sky layer multiplies it by its own --depth, so adding or retuning a
     layer never comes back here. One property write per frame, no per-element
     style churn.

     This replaced a version that moved .hero__figure -- an element deleted
     when the hero became a single composited photograph, so the whole
     function had been returning immediately and there was no parallax at all,
     only code that looked like there was.

     The photograph itself still does not move: its bottom edge is the hero's
     bottom edge and keeping that above the fold at every viewport was
     measured carefully. Only the added sky drifts. */
  function initParallax() {
    var hero = $(".hero");
    var sky = $(".hero__sky");
    if (!hero || !sky || reduceMotion) return;

    var ticking = false;
    var apply = function () {
      /* Clamp to the sky band's own height, not the hero's. The band is the
         top ~54% and scrolls out of view well before the hero does, so past
         that the layers are invisible and the travel is wasted -- spending it
         inside the range where the sky is actually on screen is what makes
         the displacement large enough to read at all. */
      var limit = sky.offsetHeight || 460;
      var y = Math.max(0, Math.min(window.scrollY, limit));
      /* on .hero, so the sky layers and the copy can both read it */
      hero.style.setProperty("--sy", y + "px");
      ticking = false;
    };
    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(apply);
    }, { passive: true });
    apply();
  }

  /* ------------------------------------------------------ image fallbacks */
  /* The three photographs are dropped into assets/ by hand. Until they are
     there the CSS gradients carry the design; this only has to deal with the
     one real <img> — the cape cutout. */
  function initImageFallbacks() {
    $$("[data-fallback]").forEach(function (img) {
      var flag = function () {
        var host = img.closest(img.dataset.fallback) || img.parentElement;
        if (host) host.classList.add("is-missing");
      };
      /* naturalWidth is 0 when a cached image already failed before binding */
      if (img.complete && img.naturalWidth === 0) flag();
      img.addEventListener("error", flag);
    });
  }

  /* ----------------------------------------------------- form validation */
  function initForm() {
    var form = $("#contact-form");
    if (!form) return;

    var fields = $$("[data-validate]", form);

    var messageFor = function (field) {
      var lang = window.siteLang ? window.siteLang.current() : "he";
      var key = field.validity.valueMissing ? "required" : "invalid";
      return field.getAttribute("data-msg-" + key + "-" + lang) || "";
    };

    var showError = function (field, message) {
      var slot = document.getElementById(field.getAttribute("aria-describedby"));
      field.classList.toggle("is-invalid", Boolean(message));
      field.setAttribute("aria-invalid", String(Boolean(message)));
      if (slot) {
        slot.textContent = message;
        slot.classList.toggle("is-shown", Boolean(message));
      }
    };

    var check = function (field) {
      var ok = field.checkValidity();
      showError(field, ok ? "" : messageFor(field));
      return ok;
    };

    fields.forEach(function (field) {
      /* only nag after the user has left the field once */
      field.addEventListener("blur", function () { check(field); });
      field.addEventListener("input", function () {
        if (field.classList.contains("is-invalid")) check(field);
      });
    });

    form.addEventListener("submit", function (e) {
      var firstBad = null;
      fields.forEach(function (field) {
        if (!check(field) && !firstBad) firstBad = field;
      });
      if (firstBad) {
        e.preventDefault();
        firstBad.focus();
      }
    });

    /* re-render any visible messages in the new language */
    document.addEventListener("langchange", function () {
      fields.forEach(function (field) {
        if (field.classList.contains("is-invalid")) check(field);
      });
    });
  }

  /* ------------------------------------------------------- active section */
  function initActiveNav() {
    var links = $$(".nav__link[href^='#']");
    if (!links.length || !("IntersectionObserver" in window)) return;

    var sections = links
      .map(function (l) { return document.querySelector(l.getAttribute("href")); })
      .filter(Boolean);
    if (!sections.length) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (l) {
          l.classList.toggle("is-active", l.getAttribute("href") === "#" + entry.target.id);
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });

    sections.forEach(function (s) { io.observe(s); });
  }

  function init() {
    try {
      initHeader();
      initMenu();
      initReveals();
      initCounters();
      initHeadlineFit();
      initFilter();
      initParallax();
      initImageFallbacks();
      initForm();
      initActiveNav();
    } catch (err) {
      /* never let a script failure leave the page blank: .reveal starts
         hidden only because .js is set, so drop it and show everything */
      document.documentElement.classList.remove("js");
      $$(".reveal").forEach(function (el) { el.classList.add("is-visible"); });
      throw err;
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
