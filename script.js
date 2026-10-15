// Scroll and pointer effects. Does nothing for users who prefer reduced motion.
//  - hero: the skyline and the text move at different speeds while scrolling
//    (parallax); the character stays put, standing on the pavement
//  - elements marked data-parallax data-speed="n" would float relative to the viewport (none are marked at the moment)
//  - sections fade in when they scroll into view
(function () {
    // the header is see-through at the very top and solid once scrolled
    var header = document.querySelector('.site-header');
    function markTop() { if (header) header.classList.toggle('at-top', window.scrollY < 8); }
    markTop();
    window.addEventListener('scroll', markTop, { passive: true });

    // play the character video only while the hero is on screen (saves battery and CPU)
    var video = document.querySelector('.hero-character video');
    if (video && 'IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
            if (!video.hasAttribute('autoplay')) return;      // fallback mode: keep the still poster
            if (entries[0].isIntersecting) { var p = video.play(); if (p && p.catch) p.catch(function () {}); }
            else video.pause();
        }).observe(video);
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var hero = document.querySelector('.hero');
    var layers = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));
    var queued = false;

    function apply() {
        queued = false;
        var vh = window.innerHeight;

        if (hero) {
            var sy = Math.min(Math.max(window.scrollY, 0), hero.offsetHeight);
            hero.style.setProperty('--sy', sy.toFixed(1));
        }

        layers.forEach(function (el) {
            // measure the parent so the element's own offset never feeds back into the maths
            var r = el.parentElement.getBoundingClientRect();
            if (r.bottom < -200 || r.top > vh + 200) return;
            var speed = parseFloat(el.getAttribute('data-speed')) || 0;
            var offset = (r.top + r.height / 2 - vh / 2) * speed;
            offset = Math.max(-48, Math.min(48, offset));   // keep the movement subtle on tall (stacked) layouts
            el.style.setProperty('--py', offset.toFixed(1));
        });
    }
    function queue() {
        if (!queued) { queued = true; requestAnimationFrame(apply); }
    }

    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue);
    queue();

    // fade-in on scroll
    if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in');
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });
        document.querySelectorAll('.section-title, .lead, .features li, .project, .cta .btn').forEach(function (el) {
            el.classList.add('reveal');
            io.observe(el);
        });
    }
})();
