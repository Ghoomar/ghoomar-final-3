(function () {
    var body = document.body;
    if (!body) return;

    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    body.classList.add('page-transition-enabled');

    function isEligibleLink(anchor) {
        if (!anchor) return false;
        if (anchor.hasAttribute('download')) return false;
        if (anchor.getAttribute('target') && anchor.getAttribute('target') !== '_self') return false;

        var rawHref = anchor.getAttribute('href');
        if (!rawHref) return false;

        // Skip in-page anchors and non-http navigation.
        if (rawHref.indexOf('#') === 0) return false;
        if (rawHref.indexOf('mailto:') === 0) return false;
        if (rawHref.indexOf('tel:') === 0) return false;
        if (rawHref.indexOf('javascript:') === 0) return false;

        var url;
        try {
            url = new URL(anchor.href, window.location.href);
        } catch (e) {
            return false;
        }

        // Allow any http/https link to fade out before navigating
        if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;
        return true;
    }

    var navigating = false;

    // Reset navigating flag when page is shown from bfcache (browser back/forward)
    window.addEventListener('pageshow', function (event) {
        if (event.persisted) {
            navigating = false;
            body.classList.remove('page-is-leaving');
        }
    });

    document.addEventListener('click', function (event) {
        if (navigating || event.defaultPrevented) return;
        if (event.button !== 0) return;
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

        var anchor = event.target.closest('a[href]');
        if (!isEligibleLink(anchor)) return;

        event.preventDefault();
        navigating = true;

        body.classList.add('page-is-leaving');

        window.setTimeout(function () {
            window.location.assign(anchor.href);
        }, 250);
    });

    // Navigation visibility logic: show only in hero section, hide when scrolling down
    var nav = document.querySelector('.thali-nav, .master-nav, .village-nav');
    if (nav) {
        window.addEventListener('scroll', function () {
            if (window.scrollY > 80) {
                nav.classList.add('nav-hidden');
            } else {
                nav.classList.remove('nav-hidden');
            }
        }, { passive: true });
    }
})();
