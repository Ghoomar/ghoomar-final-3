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

        if (closeMenu) {
            closeMenu.addEventListener('click', () => {
                mobileOverlay.classList.remove('active');
            });
        }

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

    // Village page gallery videos
    // On load: seek each video to 0.01s after metadata loads — forces browser to decode
    // and display the actual first frame while keeping it paused.
    // Desktop: play on hover, pause on leave.
    // Mobile: scroll-snap autoplay.
    const villageVideos = Array.from(document.querySelectorAll('.village-gallery-video'));
    if (villageVideos.length > 0) {
        const isHoverDevice = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

        // Force first frame to render for all videos
        villageVideos.forEach(video => {
            const showFirstFrame = () => {
                video.currentTime = 0.01;
            };
            if (video.readyState >= 1) {
                showFirstFrame();
            } else {
                video.addEventListener('loadedmetadata', showFirstFrame, { once: true });
            }
        });

        if (isHoverDevice) {
            // DESKTOP: play on hover, pause and return to first frame on leave
            villageVideos.forEach(video => {
                const card = video.closest('.village-video-card');
                if (!card) return;
                card.addEventListener('mouseenter', () => {
                    const p = video.play();
                    if (p && typeof p.catch === 'function') p.catch(() => {});
                });
                card.addEventListener('mouseleave', () => {
                    video.pause();
                    video.currentTime = 0.01;
                });
            });

        } else {
            // MOBILE: scroll-snap — autoplay snapped video, pause others
            const grid = document.querySelector('.village-video-grid');
            const mobileObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    const video = entry.target;
                    if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
                        villageVideos.forEach(v => { if (v !== video) v.pause(); });
                        const p = video.play();
                        if (p && typeof p.catch === 'function') p.catch(() => {});
                    } else {
                        video.pause();
                    }
                });
            }, { root: grid, threshold: 0.5 });

            villageVideos.forEach(v => mobileObserver.observe(v));
        }

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
