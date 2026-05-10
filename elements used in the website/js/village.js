/**
 * Ghoomar Village - Dynamic Logic
 * Handles ScrollSpy, Showcase Galleries, and Master Menu Modal
 */
document.addEventListener('DOMContentLoaded', function () {
    // ---- Navigation Elements ----
    const nav         = document.getElementById('villageNav');
    const links       = document.querySelectorAll('.village-nav-link');
    const hamburger   = document.getElementById('villageHamburger');
    const drawer      = document.getElementById('villageNavLinks');
    
    const sections = Array.from(document.querySelectorAll('section[id]'));

    // ---- Mobile Hamburger Toggle ----
    if (hamburger && drawer) {
        hamburger.addEventListener('click', function () {
            const open = hamburger.classList.toggle('open');
            drawer.classList.toggle('open', open);
            hamburger.setAttribute('aria-expanded', open);
        });

        // Close drawer when a link is clicked
        links.forEach(function (a) {
            a.addEventListener('click', function () {
                hamburger.classList.remove('open');
                drawer.classList.remove('open');
                hamburger.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // ---- Scroll Effects: Active Link & Scrolled Background ----
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
            if(current) {
                a.classList.toggle('active', a.getAttribute('href') === '#' + current);
            }
        });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // ---- Showcase Gallery Manager ----
    // Manages the self-scrolling video galleries in the Village "Acts"
    const galleryWrappers = document.querySelectorAll('.gallery-wrapper');
    galleryWrappers.forEach(wrapper => {
        const gallery = wrapper.querySelector('.showcase-video-gallery');
        if (!gallery) return;

        const vids    = Array.from(gallery.querySelectorAll('video, .video-placeholder'));
        const prevBtn = wrapper.querySelector('.gallery-prev');
        const nextBtn = wrapper.querySelector('.gallery-next');
        const dotsEl  = wrapper.querySelector('.gallery-dots');
        let idx = 0;

        // Build Navigation Dots
        if (dotsEl) {
            vids.forEach((_, i) => {
                const dot = document.createElement('span');
                dot.className = 'gallery-dot' + (i === 0 ? ' active' : '');
                dot.addEventListener('click', () => {
                    stopAuto();
                    idx = i;
                    goTo(idx);
                    startAuto();
                });
                dotsEl.appendChild(dot);
            });
        }

        function updateDots() {
            if (!dotsEl) return;
            dotsEl.querySelectorAll('.gallery-dot').forEach((d, i) => {
                d.classList.toggle('active', i === idx);
            });
        }

        function goTo(n) {
            // Pause all
            vids.forEach(v => {
                v.pause();
                v.currentTime = 0;
            });

            idx = ((n % vids.length) + vids.length) % vids.length;
            updateDots();
            updateCarousel();

            // Play active
            const targetVid = vids[idx];
            if (targetVid) {
                const playPromise = targetVid.play();
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        if (error.name !== 'AbortError') {
                            console.warn("Video failed to load:", error);
                        }
                    });
                }
            }
        }

        function updateCarousel() {
            const total = vids.length;
            vids.forEach((v, i) => {
                const isActive = idx === i;
                const isLeft = (idx - 1 + total) % total === i;
                const isRight = (idx + 1) % total === i;

                if (isActive) {
                    v.style.zIndex = '3';
                    v.style.opacity = '1';
                    v.style.pointerEvents = 'auto';
                    v.style.transform = `translateX(0%) translateY(0%) scale(1) rotateY(0deg)`;
                } else if (isLeft) {
                    v.style.zIndex = '2';
                    v.style.opacity = '0.7';
                    v.style.pointerEvents = 'auto';
                    v.style.transform = `translateX(-45%) translateY(-5%) scale(0.85) rotateY(15deg)`;
                } else if (isRight) {
                    v.style.zIndex = '2';
                    v.style.opacity = '0.7';
                    v.style.pointerEvents = 'auto';
                    v.style.transform = `translateX(45%) translateY(-5%) scale(0.85) rotateY(-15deg)`;
                } else {
                    v.style.zIndex = '1';
                    v.style.opacity = '0';
                    v.style.pointerEvents = 'none';
                    v.style.transform = `translateX(0%) scale(0.5)`;
                }
                
                v.onclick = (e) => {
                    if (isLeft) {
                        e.preventDefault();
                        stopAuto(); goTo(idx - 1); startAuto();
                    } else if (isRight) {
                        e.preventDefault();
                        stopAuto(); goTo(idx + 1); startAuto();
                    } else if (isActive) {
                        // Let user pause/play if they click active video
                        if (v.paused) v.play();
                        else v.pause();
                    }
                };
            });
        }
        
        // Initialize layout
        updateCarousel();

        // ---- Autoscroll Logic ----
        function startAuto() {
            // Native video 'ended' event handles auto-advance
            const active = vids[idx];
            if (active && active.paused) {
                active.play().catch(e => {
                    if (e.name !== 'AbortError') {
                        console.warn("Play failed", e);
                    }
                });
            }
        }
        function stopAuto() {
            // Nothing to clear, just pause
            const active = vids[idx];
            if (active) active.pause();
        }

        // Event Listeners
        if (prevBtn) prevBtn.addEventListener('click', () => { stopAuto(); goTo(--idx); startAuto(); });
        if (nextBtn) nextBtn.addEventListener('click', () => { stopAuto(); goTo(++idx); startAuto(); });
        
        // Auto-advance on video end (if not looping)
        vids.forEach((v, i) => {
            v.addEventListener('ended', () => goTo(idx + 1));
        });

        // Optimization: Intersection Observer
        // Only start the first video when the section is actually visible
        const observer = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                // If never played before, start at 0
                if (vids[idx].paused) goTo(idx);
                startAuto();
            } else {
                vids.forEach(v => v.pause());
                stopAuto();
            }
        }, { threshold: 0.3 });
        
        observer.observe(wrapper);
    });

    // ---- Master Menu Modal Logic ----
    const menuButtons = [
        document.getElementById('openMasterMenu'),
        document.getElementById('openMasterMenuMap')
    ];

    // Create Modal Element if it doesn't exist
    let menuModal = document.querySelector('.menu-modal');
    if (!menuModal) {
        menuModal = document.createElement('div');
        menuModal.className = 'menu-modal';
        menuModal.innerHTML = `
            <span class="close-menu-modal">&times;</span>
            <img src="../assets/village/master-menu.png" alt="Ghoomar Village Master Menu" loading="lazy">
        `;
        document.body.appendChild(menuModal);
    }

    const openModal = () => {
        menuModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
        menuModal.classList.remove('active');
        document.body.style.overflow = '';
    };

    menuButtons.forEach(btn => {
        if (btn) btn.addEventListener('click', openModal);
    });

    const closeBtn = menuModal.querySelector('.close-menu-modal');
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    
    menuModal.addEventListener('click', (e) => {
        if (e.target === menuModal) closeModal();
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && menuModal.classList.contains('active')) {
            closeModal();
        }
    });
});
