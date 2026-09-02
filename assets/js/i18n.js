/* ==========================================================================
   Bilingual toggle (Hebrew / English)

   Hebrew is the source of truth in the markup; English lives in a data-en
   attribute, so no string is written twice:

       <h1 data-en="Design that stops the scroll">עיצוב שגורם לעצור</h1>

   On the first run each element's original Hebrew is captured into data-he,
   after which the two simply swap. With JS disabled the page still renders
   correctly in Hebrew.
   ========================================================================== */
(function () {
  "use strict";

  var STORAGE_KEY = "ronis-portfolio-lang";
  var DEFAULT_LANG = "he";
  /* attributes that can carry a translation, e.g. data-en-placeholder */
  var ATTRS = ["placeholder", "aria-label", "alt", "content", "title"];

  function readStored() {
    try {
      var v = localStorage.getItem(STORAGE_KEY);
      return v === "he" || v === "en" ? v : null;
    } catch (e) {
      return null; /* private mode / blocked storage */
    }
  }

  function writeStored(lang) {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {
      /* not fatal — the choice just won't survive a reload */
    }
  }

  function apply(lang) {
    var root = document.documentElement;
    root.lang = lang;
    root.dir = lang === "he" ? "rtl" : "ltr";

    /* text content */
    document.querySelectorAll("[data-en]").forEach(function (el) {
      if (!el.hasAttribute("data-he")) {
        el.setAttribute("data-he", el.innerHTML.trim());
      }
      var next = el.getAttribute("data-" + lang);
      if (next !== null) el.innerHTML = next;
    });

    /* translatable attributes */
    ATTRS.forEach(function (attr) {
      var enKey = "data-en-" + attr;
      var heKey = "data-he-" + attr;
      document.querySelectorAll("[" + enKey + "]").forEach(function (el) {
        if (!el.hasAttribute(heKey)) {
          el.setAttribute(heKey, el.getAttribute(attr) || "");
        }
        var next = el.getAttribute("data-" + lang + "-" + attr);
        if (next !== null) el.setAttribute(attr, next);
      });
    });

    /* toggle state */
    document.querySelectorAll("[data-lang]").forEach(function (btn) {
      btn.setAttribute("aria-pressed", String(btn.dataset.lang === lang));
    });

    document.dispatchEvent(new CustomEvent("langchange", { detail: { lang: lang } }));
  }

  function setLang(lang) {
    apply(lang);
    writeStored(lang);
  }

  /* expose for other scripts (form messages need the current language) */
  window.siteLang = {
    current: function () {
      return document.documentElement.lang === "en" ? "en" : "he";
    },
    set: setLang
  };

  function init() {
    apply(readStored() || DEFAULT_LANG);

    document.querySelectorAll("[data-lang]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        setLang(btn.dataset.lang);
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
