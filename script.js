// Scroll and pointer effects. Does nothing for users who prefer reduced motion.
//  - hero: the skyline, text and character move at different speeds while
//    scrolling (parallax), and the character also follows the mouse a little
//    and grows slightly, as if flying out of the screen
//  - elements marked data-parallax data-speed="n" float relative to the viewport
//  - sections fade in when they scroll into view
(function () {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var hero = document.querySelector('.hero');
    var character = document.querySelector('.hero-character');
    var layers = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));
    var mx = 0, my = 0, queued = false;

    function apply() {
        queued = false;
        var vh = window.innerHeight;

        if (hero) {
            var sy = Math.min(Math.max(window.scrollY, 0), hero.offsetHeight);
            hero.style.setProperty('--sy', sy.toFixed(1));
            if (character) {
                character.style.setProperty('--mx', mx.toFixed(3));
                character.style.setProperty('--my', my.toFixed(3));
                character.style.setProperty('--s', (sy / hero.offsetHeight).toFixed(3));
            }
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

    if (hero && character && window.matchMedia('(pointer: fine)').matches) {
        hero.addEventListener('pointermove', function (e) {
            var r = hero.getBoundingClientRect();
            mx = ((e.clientX - r.left) / r.width - 0.5) * 2;
            my = ((e.clientY - r.top) / r.height - 0.5) * 2;
            queue();
        });
        hero.addEventListener('pointerleave', function () { mx = 0; my = 0; queue(); });
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
