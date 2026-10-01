/* Three small things, none of which the page depends on to be usable:

   - The header gets a frosted backdrop once the page has scrolled, so text
     passing beneath it stays readable. Over the hero it stays clear, the way
     the design draws it.
   - The figure walks on as the page is scrolled.
   - The ring in the nav lights up around the section currently being read,
     and follows you down the page.

   Without this file the header is still fixed and every link still works;
   the backdrop just never appears, the figure stands still and no ring
   lights up. On a page with no sections of its own, the markup says which
   link is current and this leaves it alone. */
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

    /* The figure walks on as the page is scrolled. --walk runs from 0 at the
       top of the page to 1 once the first screen has gone by, and the
       stylesheet turns that into how far the figure has travelled; nothing
       about how far, or in which direction, is decided here.

       Tied to the scroll position rather than played as an animation, so it
       runs backwards on the way up and the figure is always where the
       scrollbar says it is. Left alone for a reader who has asked for less
       motion: the property stays unset and the stylesheet's fallback holds
       the figure still. */
    var stage = document.querySelector(".stage-frame");
    var composition = document.querySelector(".hero");
    var walks = !!(stage && composition) && !(window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    var walked = -1;

    function markWalk() {
        if (!walks) return;

        var box = stage.getBoundingClientRect();
        if (box.height <= 0) return;

        var along = Math.min(Math.max(-box.top / box.height, 0), 1);

        /* Rounded before it is written. A thousandth of the stride is well
           under a pixel, so anything finer than this is a style
           invalidation that changes nothing on screen. */
        along = Math.round(along * 1000) / 1000;
        if (along === walked) return;
        walked = along;
        composition.style.setProperty("--walk", along);
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
        pending = null;
        markScrolled();
        markWalk();
        if (pairs.length) markCurrent();
    }

    /* A scroll can fire many times between two frames, and the figure can
       only move once per frame anyway, so the work is collapsed onto the
       next one rather than repeated for every event. */
    var pending = null;

    function schedule() {
        if (pending === null) pending = requestAnimationFrame(update);
    }

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });

    /* ----------------------------------------------------------------------
       The clip on the hero

       It runs by itself, and the still underneath is what everyone sees if it
       cannot: a missing file, a decode error, a browser that will not
       autoplay it, a browser that cannot show transparency, a request to
       reduce motion, or this script never running at all. The still is what
       renders first in every case, and the clip only ever replaces it once it
       is genuinely playing.
       ---------------------------------------------------------------------- */
    var hero = document.querySelector(".hero");
    var clip = document.querySelector(".hero__clip");

    if (hero && clip) {
        var alphaOk = null;

        /* A transparent clip shown by a browser that cannot decode the alpha
           channel is an opaque rectangle over the wordmark, which is worse
           than the still. Rather than guess from the browser's name, decode
           one 2x2 transparent frame and look at it. */
        var checkAlpha = function (done) {
            if (alphaOk !== null) return done(alphaOk);

            var probe = document.createElement("video");
            var settle = function (ok) {
                if (alphaOk !== null) return;
                alphaOk = ok;
                done(ok);
            };

            probe.muted = true;
            probe.playsInline = true;
            probe.src = "data:video/webm;base64,GkXfo59ChoEBQveBAULygQRC84EIQoKEd2VibUKHgQJChYECGFOAZwEAAAAAAAITEU2bdLpNu4tTq4QVSalmU6yBoU27i1OrhBZUrmtTrIHYTbuMU6uEElTDZ1OsggEpTbuMU6uEHFO7a1OsggH97AEAAAAAAABZAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVSalmsirXsYMPQkBNgI1MYXZmNjAuMTYuMTAwV0GNTGF2ZjYwLjE2LjEwMESJiEBEAAAAAAAAFlSua8yuAQAAAAAAAEPXgQFzxYgOaPQMobajWJyBACK1nIN1bmSIgQCGhVZfVlA5g4EBI+ODhAJiWgDglLCBArqBApqBAlPAgQFVsIRVuYEBElTDZ0CAc3OgY8CAZ8iaRaOHRU5DT0RFUkSHjUxhdmY2MC4xNi4xMDBzc9pjwItjxYgOaPQMobajWGfIpUWjh0VOQ09ERVJEh5hMYXZjNjAuMzEuMTAyIGxpYnZweC12cDlnyKFFo4hEVVJBVElPTkSHkzAwOjAwOjAwLjA0MDAwMDAwMAAfQ7Z1yeeBAKDEoZ6BAAAAgkmDQgAAEAAWADgkHBlwAAAgIAARv/u8AAB1oaGmn+6BAaWagkmDQgAAEAAWADgkHBlwAAAgAAARv8qgAAAcU7trkbuPs4EAt4r3gQHxggGv8IED";
            probe.addEventListener("loadeddata", function () {
                try {
                    var canvas = document.createElement("canvas");
                    canvas.width = probe.videoWidth || 2;
                    canvas.height = probe.videoHeight || 2;
                    var ctx = canvas.getContext("2d");
                    ctx.drawImage(probe, 0, 0);
                    settle(ctx.getImageData(0, 0, 1, 1).data[3] < 20);
                } catch (e) {
                    settle(false);
                }
            });
            probe.addEventListener("error", function () { settle(false); });
            setTimeout(function () { settle(false); }, 400);
        };

        var fallBackToStill = function () {
            hero.classList.remove("is-playing");
        };

        var start = function () {
            checkAlpha(function (ok) {
                if (!ok) return;   /* the still stays, and nothing is fetched */

                /* It loops. The file is one stride, cut where the walk
                   returns to its opening pose, so the wrap costs less than
                   the clip's own worst step between two neighbouring
                   frames and there is nothing to fade over. */
                clip.loop = true;

                /* Only once it is actually playing does the still step aside.
                   Until then, and if it ever stops being able to, the still is
                   what is on screen. */
                clip.addEventListener("playing", function () {
                    hero.classList.add("is-playing");
                });
                clip.addEventListener("error", fallBackToStill);
                clip.addEventListener("stalled", fallBackToStill);

                var attempt = clip.play();
                if (attempt && attempt.catch) attempt.catch(fallBackToStill);
            });
        };

        var reduced = window.matchMedia &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        if (!reduced && clip.canPlayType("video/webm")) {
            /* Held until the page has loaded, so the clip never competes with
               the first screen. The still is up long before it arrives. */
            if (document.readyState === "complete") start();
            else window.addEventListener("load", start);
        }
    }

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
