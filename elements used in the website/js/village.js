/**
 * Ghoomar Village - Dynamic Logic
 * Handles ScrollSpy, Showcase Galleries, and Master Menu Modal
 */
document.addEventListener('DOMContentLoaded', function () {
    // Detect slow connections (mobile data / data-saver mode)
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const isSlowConnection = conn && (
        conn.saveData === true ||
        conn.effectiveType === 'slow-2g' ||
        conn.effectiveType === '2g' ||
        conn.effectiveType === '3g'
    );

    // On slow connections, revert gallery first-video eager preloading to on-demand only
    if (isSlowConnection) {
        document.querySelectorAll('.showcase-video-gallery video:first-child').forEach(v => {
            v.preload = 'none';
        });
    }

    // ---- Hero Video: inline script already set src & triggered load early ----
    // Just ensure play() is called once the DOM is ready
    const isMobile = window.innerWidth < 768;
    const heroToLoad = isMobile
        ? document.querySelector('.village-hero-video.mobile-video')
        : document.querySelector('.village-hero-video.desktop-video');
    if (heroToLoad) {
        // On slow connections, wait for canplay before attempting play
        if (isSlowConnection) {
            heroToLoad.addEventListener('canplay', () => heroToLoad.play().catch(() => {}), { once: true });
        } else {
            heroToLoad.play().catch(() => {});
        }
    }

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
                if (v.tagName === 'VIDEO') { v.pause(); v.currentTime = 0; }
            });

            idx = ((n % vids.length) + vids.length) % vids.length;
            updateDots();
            updateCarousel();

            // Play active — enable preload on demand so it starts fetching
            const targetVid = vids[idx];
            if (targetVid && targetVid.tagName === 'VIDEO') {
                if (targetVid.preload === 'none') targetVid.preload = 'auto';
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

        // Prime an adjacent video so its first frame is visible (not black)
        function primeFirstFrame(vid) {
            if (!vid || vid.tagName !== 'VIDEO') return;
            if (vid.preload === 'none') {
                vid.preload = 'metadata';
                vid.load();
            }
            const showFrame = () => { if (vid.currentTime === 0) vid.currentTime = 0.001; };
            if (vid.readyState >= 1) showFrame();
            else vid.addEventListener('loadedmetadata', showFrame, { once: true });
        }

        function updateCarousel() {
            const total = vids.length;
            const flatMode = window.innerWidth < 768;
            vids.forEach((v, i) => {
                const isActive = idx === i;
                const isLeft = (idx - 1 + total) % total === i;
                const isRight = (idx + 1) % total === i;

                if (isActive) {
                    v.style.zIndex = '3';
                    v.style.opacity = '1';
                    v.style.pointerEvents = 'auto';
                    v.style.transform = `translateX(0%) scale(1)`;
                } else if (isLeft) {
                    v.style.zIndex = '2';
                    v.style.opacity = '0.7';
                    v.style.pointerEvents = 'auto';
                    v.style.transform = `translateX(-45%) scale(0.85)`;
                    primeFirstFrame(v);
                } else if (isRight) {
                    v.style.zIndex = '2';
                    v.style.opacity = '0.7';
                    v.style.pointerEvents = 'auto';
                    v.style.transform = `translateX(45%) scale(0.85)`;
                    primeFirstFrame(v);
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
                    } else if (isActive && v.tagName === 'VIDEO') {
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
            if (active && active.tagName === 'VIDEO' && active.paused) {
                active.play().catch(e => {
                    if (e.name !== 'AbortError') {
                        console.warn("Play failed", e);
                    }
                });
            }
        }
        function stopAuto() {
            const active = vids[idx];
            if (active && active.tagName === 'VIDEO') active.pause();
        }

        // Event Listeners
        if (prevBtn) prevBtn.addEventListener('click', () => { stopAuto(); goTo(--idx); startAuto(); });
        if (nextBtn) nextBtn.addEventListener('click', () => { stopAuto(); goTo(++idx); startAuto(); });

        // Auto-advance on video end (if not looping)
        vids.forEach((v, i) => {
            if (v.tagName === 'VIDEO') v.addEventListener('ended', () => goTo(idx + 1));
        });

        // First video already has preload="auto" in HTML — just ensure it starts loading
        const firstVid = vids[0];
        if (firstVid && firstVid.tagName === 'VIDEO' && firstVid.readyState === 0) {
            firstVid.load();
        }

        // Optimization: Intersection Observer
        // Start preloading earlier (10% visible) so video is buffered by the time it's fully on screen
        const observer = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                const active = vids[idx];
                if (active && active.tagName === 'VIDEO' && active.preload !== 'auto') {
                    active.preload = 'auto';
                    active.load();
                }
                if (!active || active.tagName !== 'VIDEO' || active.paused) goTo(idx);
                startAuto();
            } else {
                vids.forEach(v => { if (v.tagName === 'VIDEO') v.pause(); });
                stopAuto();
            }
        }, { threshold: 0.1 });

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
