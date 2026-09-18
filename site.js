/* Two small things, neither of which the page depends on to be usable:

   - The header gets a frosted backdrop once the page has scrolled, so text
     passing beneath it stays readable. Over the hero it stays clear, the way
     the design draws it.
   - The ring in the nav lights up around the section currently being read,
     and follows you down the page.

   Without this file the header is still fixed and every link still works;
   the backdrop just never appears and no ring lights up. On a page with no
   sections of its own, the markup says which link is current and this leaves
   it alone. */
(function () {
    "use strict";

    var header = document.querySelector(".site-header");
    if (!header) return;

    function markScrolled() {
        header.classList.toggle("is-scrolled", window.scrollY > 24);
    }

    /* The narrow-screen menu. The collapsed layout is switched on from here
       rather than declared in the stylesheet, so a panel is never hidden with
       no way to open it: if this never runs, the links stay in their row. */
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".site-nav");

    if (toggle && nav) {
        header.classList.add("has-js-nav");

        var setOpen = function (open) {
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
            toggle.setAttribute("aria-label", open ? "סגירת תפריט" : "פתיחת תפריט");
            nav.classList.toggle("is-open", open);
        };

        var isOpen = function () {
            return toggle.getAttribute("aria-expanded") === "true";
        };

        toggle.addEventListener("click", function () {
            setOpen(!isOpen());
        });

        /* Every link here goes to a section of this same page, so following
           one means the menu has done its job. */
        nav.addEventListener("click", function (event) {
            if (event.target.closest("a")) setOpen(false);
        });

        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape" && isOpen()) {
                setOpen(false);
                toggle.focus();
            }
        });

        document.addEventListener("click", function (event) {
            if (!isOpen()) return;
            if (!nav.contains(event.target) && !toggle.contains(event.target)) setOpen(false);
        });

        /* Widening the window past the breakpoint puts the links back in the
           row, where a left-open panel would otherwise linger. */
        window.addEventListener("resize", function () {
            if (window.innerWidth > 768 && isOpen()) setOpen(false);
        });
    }

    var pairs = [];
    [].forEach.call(document.querySelectorAll('.nav-link[href^="#"]'), function (link) {
        var section = document.querySelector(link.getAttribute("href"));
        if (section) pairs.push({ link: link, section: section });
    });

    /* The section being read is the last one whose top has passed just under
       the header. Before the first one does - while the hero is still on
       screen - nothing is lit, which is the point: no ring until you have
       arrived somewhere. */
    function markCurrent() {
        /* A section counts as the one being read once its top has come up
           into the first fifth of the screen, not the moment it clears the
           header - otherwise the ring only catches up long after the section
           fills the view. */
        var line = header.offsetHeight + window.innerHeight * 0.2;
        var current = null;

        pairs.forEach(function (pair) {
            if (pair.section.getBoundingClientRect().top <= line) current = pair;
        });

        /* The last section can be too short to ever reach that line, so the
           foot of the page counts as having arrived at it. */
        var atBottom = window.innerHeight + window.scrollY >=
            document.documentElement.scrollHeight - 2;
        if (atBottom && pairs.length) current = pairs[pairs.length - 1];

        pairs.forEach(function (pair) {
            var on = pair === current;
            pair.link.classList.toggle("is-current", on);
            if (on) pair.link.setAttribute("aria-current", "true");
            else pair.link.removeAttribute("aria-current");
        });
    }

    function update() {
        markScrolled();
        if (pairs.length) markCurrent();
    }

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });

    /* Sections ease in as they arrive rather than being there all at once.
       The hidden state is added here rather than in the stylesheet, so a
       section is never left invisible if this never runs. */
    var sections = [].slice.call(document.querySelectorAll(".section"));
    if (!sections.length) return;

    if (!("IntersectionObserver" in window)) {
        sections.forEach(function (s) { s.classList.add("is-revealed"); });
        return;
    }

    var seen = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-revealed");
            seen.unobserve(entry.target);   // it stays arrived; no flicker on the way back up
        });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.08 });

    sections.forEach(function (s) {
        s.classList.add("js-reveal");
        seen.observe(s);
    });
})();
