/**
 * Ghoomar Thali - Specific Logic
 * Handles ScrollSpy and Navbar toggle
 */
document.addEventListener('DOMContentLoaded', function () {
    const nav       = document.getElementById('thaliNav');
    const links     = document.querySelectorAll('.thali-nav-link');
    const hamburger = document.getElementById('thaliHamburger');
    const drawer    = document.getElementById('thaliNavLinks');

    const sections = Array.from(
        document.querySelectorAll('section[id], footer[id]')
    );

    if (hamburger && drawer) {
        hamburger.addEventListener('click', function () {
            const open = hamburger.classList.toggle('open');
            drawer.classList.toggle('open', open);
            hamburger.setAttribute('aria-expanded', open);
        });

        links.forEach(function (a) {
            a.addEventListener('click', function () {
                hamburger.classList.remove('open');
                drawer.classList.remove('open');
                hamburger.setAttribute('aria-expanded', 'false');
            });
        });
    }

    function onScroll() {
        if (nav) {
            nav.classList.toggle('scrolled', window.scrollY > 30);
        }

        let current = '';
        sections.forEach(function (sec) {
            if (window.scrollY >= sec.offsetTop - 150) {
                current = sec.id;
            }
        });

        links.forEach(function (a) {
            if (current) {
                a.classList.toggle('active', a.getAttribute('href') === '#' + current);
            }
        });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Menu Inquiry Form logic
    const form = document.getElementById('menuInquiryForm');
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();

            const name = document.getElementById('miq-name').value.trim();
            const outletValue = document.getElementById('miq-outlet').value;
            const error = document.getElementById('miqError');

            if (!name || !outletValue) {
                error.textContent = 'Please fill in both fields before sending.';
                return;
            }
            error.textContent = '';

            const outletNumbers = {
                "Chandni Chowk, Delhi": "919717090971",
                "Connaught Place, Delhi": "919810703703",
                "Patna, Bihar": "919031296999",
                "Guwahati, Assam": "919871944399"
            };

            const whatsappNumber = outletNumbers[outletValue] || "918803980000";
            const message = `Khamma Ghani, this is ${name}, and I'm planning to visit soon, could you please share today's menu?`;

            window.open(`https://wa.me/${whatsappNumber}?text=` + encodeURIComponent(message), '_blank');
        });
    }
});
