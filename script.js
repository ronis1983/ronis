// Depth effect for the hero character: it follows the mouse a little and
// moves toward the viewer as the page scrolls, so it feels like it is
// flying out of the screen. Does nothing for users who prefer reduced motion.
(function () {
    var hero = document.querySelector('.hero');
    var character = document.querySelector('.hero-character');
    if (!hero || !character) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var mx = 0, my = 0, s = 0, queued = false;

    function apply() {
        queued = false;
        character.style.setProperty('--mx', mx.toFixed(3));
        character.style.setProperty('--my', my.toFixed(3));
        character.style.setProperty('--s', s.toFixed(3));
    }
    function queue() {
        if (!queued) { queued = true; requestAnimationFrame(apply); }
    }

    if (window.matchMedia('(pointer: fine)').matches) {
        hero.addEventListener('pointermove', function (e) {
            var r = hero.getBoundingClientRect();
            mx = ((e.clientX - r.left) / r.width - 0.5) * 2;
            my = ((e.clientY - r.top) / r.height - 0.5) * 2;
            queue();
        });
        hero.addEventListener('pointerleave', function () { mx = 0; my = 0; queue(); });
    }

    window.addEventListener('scroll', function () {
        s = Math.min(1, Math.max(0, window.scrollY / hero.offsetHeight));
        queue();
    }, { passive: true });
})();
