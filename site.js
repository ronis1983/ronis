/* Gives the header a frosted backdrop once the page has scrolled, so text
   passing beneath it stays readable. Over the hero it stays clear, the way
   the design draws it. Nothing else on the page depends on this file. */
(function () {
    var header = document.querySelector(".site-header");
    if (!header) return;

    function mark() {
        header.classList.toggle("is-scrolled", window.scrollY > 24);
    }

    mark();
    window.addEventListener("scroll", mark, { passive: true });
})();
