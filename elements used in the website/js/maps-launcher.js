(function () {
    'use strict';

    function detectPlatform() {
        var ua = navigator.userAgent || navigator.vendor || '';
        var isIOS = /iPad|iPhone|iPod/.test(ua) ||
            (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        var isAndroid = /Android/i.test(ua);
        return { isIOS: isIOS, isAndroid: isAndroid, isMobile: isIOS || isAndroid };
    }

    function parseMapsUrl(url) {
        if (!url) return null;
        var q = null, lat = null, lng = null;
        try {
            var u = new URL(url, window.location.href);
            q = u.searchParams.get('q') || u.searchParams.get('query') || u.searchParams.get('daddr');
        } catch (e) { /* ignore */ }

        var pbLat = url.match(/!3d(-?[\d.]+)/);
        var pbLng = url.match(/!2d(-?[\d.]+)/);
        var pbName = url.match(/!2s([^!]+)/);
        if (pbLat) lat = pbLat[1];
        if (pbLng) lng = pbLng[1];
        if (!q && pbName) {
            try { q = decodeURIComponent(pbName[1].replace(/\+/g, ' ')); }
            catch (e) { q = pbName[1]; }
        }
        if (!q && !lat) return null;
        return { q: q, lat: lat, lng: lng };
    }

    function buildUrls(info) {
        var query = encodeURIComponent(info.q || '');
        var hasLL = info.lat && info.lng;
        var ll = hasLL ? (info.lat + ',' + info.lng) : '';
        var google = 'https://www.google.com/maps/search/?api=1&query=' + (query || ll);
        var apple = 'https://maps.apple.com/?q=' + (query || ll) + (hasLL ? '&ll=' + ll : '');
        var geo = hasLL
            ? ('geo:' + ll + '?q=' + ll + (info.q ? '(' + encodeURIComponent(info.q) + ')' : ''))
            : ('geo:0,0?q=' + query);
        return { google: google, apple: apple, geo: geo };
    }

    var modalInjected = false;
    function ensureModal() {
        if (modalInjected) return;
        modalInjected = true;
        var style = document.createElement('style');
        style.textContent = [
            '.maps-launcher-overlay{position:absolute;inset:0;cursor:pointer;background:transparent;z-index:5;display:none;}',
            '.maps-launcher-wrap{position:relative;}',
            '@media (hover:none) and (pointer:coarse){.maps-launcher-overlay{display:block;}}',
            '.maps-launcher-sheet-bg{position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:99998;display:flex;align-items:flex-end;justify-content:center;animation:mlFade .2s ease;}',
            '.maps-launcher-sheet{background:#fff;width:100%;max-width:480px;border-radius:18px 18px 0 0;padding:18px 20px 28px;box-shadow:0 -8px 30px rgba(0,0,0,0.2);animation:mlSlide .25s ease;}',
            '.maps-launcher-sheet h4{margin:0 0 14px;font-family:"Outfit",sans-serif;font-size:1.05rem;color:#333;text-align:center;font-weight:600;}',
            '.maps-launcher-sheet button{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;padding:14px;margin:8px 0;border:none;border-radius:12px;font-family:"Outfit",sans-serif;font-size:1rem;font-weight:600;cursor:pointer;background:#f4f4f6;color:#222;transition:background .15s ease;}',
            '.maps-launcher-sheet button:hover{background:#ebebef;}',
            '.maps-launcher-sheet button.ml-cancel{background:transparent;color:#8a1538;margin-top:6px;}',
            '@keyframes mlFade{from{opacity:0}to{opacity:1}}',
            '@keyframes mlSlide{from{transform:translateY(100%)}to{transform:translateY(0)}}'
        ].join('');
        document.head.appendChild(style);
    }

    function showIOSChooser(urls) {
        ensureModal();
        var bg = document.createElement('div');
        bg.className = 'maps-launcher-sheet-bg';
        bg.innerHTML =
            '<div class="maps-launcher-sheet" role="dialog" aria-label="Open in Maps">' +
            '<h4>Open location in</h4>' +
            '<button type="button" data-ml="apple">Apple Maps</button>' +
            '<button type="button" data-ml="google">Google Maps</button>' +
            '<button type="button" class="ml-cancel" data-ml="cancel">Cancel</button>' +
            '</div>';
        document.body.appendChild(bg);
        var close = function () { if (bg.parentNode) bg.parentNode.removeChild(bg); };
        bg.addEventListener('click', function (e) {
            if (e.target === bg) { close(); return; }
            var btn = e.target.closest('button[data-ml]');
            if (!btn) return;
            var choice = btn.getAttribute('data-ml');
            close();
            if (choice === 'apple') window.location.href = urls.apple;
            else if (choice === 'google') window.location.href = urls.google;
        });
    }

    function handleOpen(info, evt) {
        var p = detectPlatform();
        if (!p.isMobile) return; // desktop: let default link behavior continue
        if (evt) { evt.preventDefault(); evt.stopPropagation(); }
        var urls = buildUrls(info);
        if (p.isAndroid) {
            window.location.href = urls.google; // Android opens in default Maps app via intent
        } else if (p.isIOS) {
            showIOSChooser(urls);
        }
    }

    function wrapIframe(iframe) {
        var src = iframe.getAttribute('src') || iframe.getAttribute('data-src');
        var info = parseMapsUrl(src);
        if (!info) return;
        var parent = iframe.parentNode;
        if (!parent) return;
        // Ensure parent is positioned for overlay anchoring
        var cs = window.getComputedStyle(parent);
        if (cs.position === 'static') parent.style.position = 'relative';
        var overlay = document.createElement('a');
        overlay.className = 'maps-launcher-overlay';
        overlay.setAttribute('aria-label', 'Open location in maps app');
        overlay.href = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(info.q || (info.lat + ',' + info.lng));
        overlay.target = '_blank';
        overlay.rel = 'noopener';
        overlay.addEventListener('click', function (e) { handleOpen(info, e); });
        parent.appendChild(overlay);
    }

    function bindAnchor(a) {
        var href = a.getAttribute('href');
        var info = parseMapsUrl(href);
        if (!info) return;
        a.addEventListener('click', function (e) { handleOpen(info, e); });
    }

    function init() {
        var iframes = document.querySelectorAll('iframe[src*="google.com/maps"], iframe[data-src*="google.com/maps"], iframe[src*="maps.google."], iframe[data-src*="maps.google."]');
        for (var i = 0; i < iframes.length; i++) wrapIframe(iframes[i]);

        var anchors = document.querySelectorAll('a[href*="google.com/maps"], a[href*="maps.google."], a[href*="maps.app.goo"], a[href*="maps.apple.com"]');
        for (var j = 0; j < anchors.length; j++) bindAnchor(anchors[j]);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
