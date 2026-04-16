document.addEventListener("DOMContentLoaded", function () {
    // Pill Nav behavior on scroll
    const pillNav = document.querySelector('.pill-nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            pillNav.style.background = 'rgba(58, 13, 13, 0.95)';
            pillNav.style.boxShadow = '0 5px 20px rgba(0,0,0,0.8)';
        } else {
            pillNav.style.background = 'var(--glass-bg)';
            pillNav.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5)';
        }
    });

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

        // Close when clicking a link
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
                delay: 3000,
                disableOnInteraction: false,
            },
            speed: 1000,
            loop: true,
            allowTouchMove: false
        });
    });

    // Text fade animation on scroll
    const fadeElements = document.querySelectorAll('h3, h4, p, .outlet-name, .price-amount, .price-type, .journey-text p, .presence-title');
    
    const fadeObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: "0px 0px -40px 0px"
    });

    fadeElements.forEach(el => {
        if (!el.classList.contains('hero-title') && !el.classList.contains('hero-subtitle')) {
            el.classList.add('fade-on-scroll');
            fadeObserver.observe(el);
        }
    });

    // Back to top behavior
    const backToTopBtn = document.getElementById("backToTop");
    window.addEventListener("scroll", function () {
        if (window.scrollY > 500) {
            backToTopBtn.style.display = "flex";
        } else {
            backToTopBtn.style.display = "none";
        }
    });

    backToTopBtn.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Village page video performance: lazy-load clips and keep only one playing.
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

        const lazyVideoObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    loadVillageVideo(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: "350px 0px",
            threshold: 0.01
        });

        villageVideos.forEach(video => lazyVideoObserver.observe(video));

        let activeVillageVideo = null;
        const playOnlyVisibleVideo = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const video = entry.target;

                if (entry.isIntersecting && entry.intersectionRatio >= 0.65) {
                    loadVillageVideo(video);

                    villageVideos.forEach(other => {
                        if (other !== video) other.pause();
                    });

                    const playPromise = video.play();
                    if (playPromise && typeof playPromise.catch === 'function') {
                        playPromise.catch(() => {});
                    }
                    activeVillageVideo = video;
                } else if (!entry.isIntersecting && activeVillageVideo === video) {
                    video.pause();
                    activeVillageVideo = null;
                }
            });
        }, {
            threshold: [0, 0.45, 0.65, 0.85]
        });

        villageVideos.forEach(video => playOnlyVisibleVideo.observe(video));

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                villageVideos.forEach(video => video.pause());
            }
        });
    }

    // Pause hero video when it's out of view to reduce background CPU use.
    const villageHeroVideo = document.querySelector('.village-hero-video');
    if (villageHeroVideo) {
        const ensureHeroVideoLoaded = () => {
            if (villageHeroVideo.dataset.loaded === 'true') return;
            const src = villageHeroVideo.dataset.src;
            if (!src) return;
            villageHeroVideo.src = src;
            villageHeroVideo.load();
            villageHeroVideo.dataset.loaded = 'true';
        };

        const heroVideoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    ensureHeroVideoLoaded();
                    const playPromise = villageHeroVideo.play();
                    if (playPromise && typeof playPromise.catch === 'function') {
                        playPromise.catch(() => {});
                    }
                } else {
                    villageHeroVideo.pause();
                }
            });
        }, {
            threshold: [0, 0.2, 0.5]
        });

        heroVideoObserver.observe(villageHeroVideo);
    }
});
