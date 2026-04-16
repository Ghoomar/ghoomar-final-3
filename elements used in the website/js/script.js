document.addEventListener("DOMContentLoaded", function () {
    const pillNav = document.querySelector('.pill-nav');
    const backToTopBtn = document.getElementById("backToTop");

    // Single rAF-throttled scroll handler — replaces two separate scroll listeners
    let scrollRafPending = false;
    window.addEventListener('scroll', () => {
        if (!scrollRafPending) {
            scrollRafPending = true;
            requestAnimationFrame(() => {
                const y = window.scrollY;

                if (pillNav) {
                    if (y > 50) {
                        pillNav.style.background = 'rgba(255, 244, 194, 0.97)';
                        pillNav.style.boxShadow = '0 5px 20px rgba(163, 28, 33, 0.18)';
                    } else {
                        pillNav.style.background = 'var(--glass-bg)';
                        pillNav.style.boxShadow = '0 8px 24px rgba(163, 28, 33, 0.1)';
                    }
                }

                if (backToTopBtn) {
                    backToTopBtn.style.display = y > 500 ? 'flex' : 'none';
                }

                scrollRafPending = false;
            });
        }
    }, { passive: true });

    // Back to top click
    if (backToTopBtn) {
        backToTopBtn.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Mobile Navigation Toggle
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mobileOverlay = document.getElementById('mobile-overlay');
    const closeMenu = document.getElementById('close-menu');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    if (mobileMenuToggle && mobileOverlay) {
        mobileMenuToggle.addEventListener('click', () => {
            mobileOverlay.classList.add('active');
        });

        closeMenu.addEventListener('click', () => {
            mobileOverlay.classList.remove('active');
        });

        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileOverlay.classList.remove('active');
            });
        });
    }

    // Initialize Swiper for Offers/Menu Grid (Fade Effect)
    const offerSwipers = document.querySelectorAll('.fade-swiper');
    offerSwipers.forEach(swiperEl => {
        new Swiper(swiperEl, {
            effect: 'fade',
            autoplay: {
                delay: 4000,
                disableOnInteraction: false,
            },
            speed: 800,
            loop: true,
            allowTouchMove: false
        });
    });

    // Scroll fade — section headings only (not every <p> on the page)
    const fadeElements = document.querySelectorAll(
        'h3:not(.hero-title), h4:not(.hero-subtitle), .outlet-name, .presence-title'
    );

    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                fadeObserver.unobserve(entry.target); // stop watching once visible
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: "0px 0px -30px 0px"
    });

    fadeElements.forEach(el => {
        el.classList.add('fade-on-scroll');
        fadeObserver.observe(el);
    });

    // Village page gallery videos — lazy-load + play only the visible one
    const villageVideos = Array.from(document.querySelectorAll('.village-gallery-video'));
    if (villageVideos.length > 0) {
        const loadVillageVideo = (video) => {
            if (video.dataset.loaded === 'true') return;
            const src = video.dataset.src;
            if (!src) return;
            video.src = src;
            video.load();
            video.dataset.loaded = 'true';
        };

        // Single combined observer: lazy-load at 200px margin, play when 65% visible
        let activeVillageVideo = null;
        const videoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const video = entry.target;
                if (entry.isIntersecting) {
                    loadVillageVideo(video);
                    if (entry.intersectionRatio >= 0.65) {
                        villageVideos.forEach(other => { if (other !== video) other.pause(); });
                        const p = video.play();
                        if (p && typeof p.catch === 'function') p.catch(() => {});
                        activeVillageVideo = video;
                    }
                } else if (activeVillageVideo === video) {
                    video.pause();
                    activeVillageVideo = null;
                }
            });
        }, {
            rootMargin: "200px 0px",
            threshold: [0, 0.65]
        });

        villageVideos.forEach(video => videoObserver.observe(video));

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) villageVideos.forEach(v => v.pause());
        });
    }

    // Hero video — pause when scrolled out of view
    const villageHeroVideo = document.querySelector('.village-hero-video');
    if (villageHeroVideo) {
        const tryPlay = () => {
            const p = villageHeroVideo.play();
            if (p && typeof p.catch === 'function') p.catch(() => {});
        };

        if (villageHeroVideo.readyState >= 3) {
            tryPlay();
        } else {
            villageHeroVideo.addEventListener('canplay', tryPlay, { once: true });
        }

        const heroVideoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    tryPlay();
                } else {
                    villageHeroVideo.pause();
                }
            });
        }, { threshold: 0.1 });

        heroVideoObserver.observe(villageHeroVideo);
    }
});
