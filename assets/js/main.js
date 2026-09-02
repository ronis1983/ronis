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
  function initParallax() {
    var figure = $(".hero__figure");
    if (!figure || reduceMotion) return;

    var ticking = false;
    var onScroll = function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = Math.min(window.scrollY, 700);
        figure.style.transform = "translateY(" + (y * 0.08) + "px)";
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
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
