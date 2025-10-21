// ===== MODERN PORTFOLIO JS =====

// DOM Elements cache with null safety
const DOM = {
    menuToggle: document.querySelector('.menu-toggle'),
    navLinks: document.querySelector('.nav-links'),
    yearElement: document.getElementById('year'),
    skipLink: document.querySelector('.skip-link'),
    navLinksAll: document.querySelectorAll('.nav-link'),
    sections: document.querySelectorAll('section[id]'),
    fadeElements: document.querySelectorAll('.fade-in')
};

// ===== MOBILE NAVIGATION =====
class MobileNavigation {
    constructor() {
        this.isOpen = false;
        this.init();
    }

    init() {
        // Menu toggle functionality
        DOM.menuToggle?.addEventListener('click', () => this.toggleMenu());
        
        // Close menu when clicking on nav links (mobile)
        DOM.navLinksAll?.forEach(link => {
            link.addEventListener('click', () => this.closeMenu());
        });

        // Close menu when pressing Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeMenu();
                DOM.menuToggle?.focus();
            }
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isOpen && 
                !DOM.navLinks?.contains(e.target) && 
                !DOM.menuToggle?.contains(e.target)) {
                this.closeMenu();
            }
        });
    }

    toggleMenu() {
        this.isOpen = !this.isOpen;
        
        if (DOM.navLinks) {
            DOM.navLinks.setAttribute('data-visible', this.isOpen);
            DOM.navLinks.classList.toggle('active', this.isOpen);
        }

        if (DOM.menuToggle) {
            DOM.menuToggle.setAttribute('aria-expanded', this.isOpen);
            DOM.menuToggle.innerHTML = this.isOpen ? '✕' : '&#9776;';
        }

        // Trap focus when menu is open
        if (this.isOpen) {
            this.trapFocus(DOM.navLinks);
        }
    }

    closeMenu() {
        this.isOpen = false;
        
        if (DOM.navLinks) {
            DOM.navLinks.setAttribute('data-visible', 'false');
            DOM.navLinks.classList.remove('active');
        }

        if (DOM.menuToggle) {
            DOM.menuToggle.setAttribute('aria-expanded', 'false');
            DOM.menuToggle.innerHTML = '&#9776;';
        }
    }

    trapFocus(element) {
        const focusableElements = element.querySelectorAll(
            'a[href], button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length > 0) {
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            element.addEventListener('keydown', (e) => {
                if (e.key === 'Tab') {
                    if (e.shiftKey && document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    } else if (!e.shiftKey && document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            });

            firstElement.focus();
        }
    }
}

// ===== SMOOTH SCROLLING =====
class SmoothScroll {
    constructor() {
        this.init();
    }

    init() {
        // Smooth scroll for anchor links
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href^="#"]');
            if (link && link.getAttribute('href') !== '#') {
                e.preventDefault();
                this.scrollToTarget(link.getAttribute('href'));
            }
        });
    }

    scrollToTarget(targetId) {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
            const targetPosition = targetElement.offsetTop - headerHeight - 20;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    }
}

// ===== ACTIVE NAV LINK HIGHLIGHTING =====
class ActiveNavHighlight {
    constructor() {
        this.sections = DOM.sections;
        this.navLinks = DOM.navLinksAll;
        this.init();
    }

    init() {
        // Initial highlight
        this.highlightActiveSection();

        // Throttled scroll event for performance
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.highlightActiveSection();
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }

    highlightActiveSection() {
        let currentSection = '';
        const scrollPosition = window.scrollY + 100;

        this.sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSection = section.getAttribute('id');
            }
        });

        this.navLinks.forEach(link => {
            link.classList.remove('active');
            link.removeAttribute('aria-current');
            
            if (link.getAttribute('href') === `#${currentSection}` || 
                (currentSection === 'home' && link.getAttribute('href') === '#home')) {
                link.classList.add('active');
                link.setAttribute('aria-current', 'page');
            }
        });
    }
}

// ===== INTERSECTION OBSERVER FOR ANIMATIONS =====
class ScrollAnimations {
    constructor() {
        this.fadeElements = DOM.fadeElements;
        this.init();
    }

    init() {
        if (!this.fadeElements.length) return;

        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animationDelay = entry.target.dataset.delay || '0ms';
                    entry.target.classList.add('animate-in');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        this.fadeElements.forEach((element, index) => {
            element.dataset.delay = `${index * 100}ms`;
            observer.observe(element);
        });
    }
}

// ===== PERFORMANCE UTILITIES =====
class PerformanceUtils {
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    static throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
}

// ===== ACCESSIBILITY UTILITIES =====
class AccessibilityUtils {
    static initSkipLink() {
        DOM.skipLink?.addEventListener('click', (e) => {
            const target = document.querySelector(DOM.skipLink.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.setAttribute('tabindex', '-1');
                target.focus();
                setTimeout(() => target.removeAttribute('tabindex'), 1000);
            }
        });
    }

    static initFocusManagement() {
        // Add focus styles for keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });

        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });
    }
}

// ===== Lazy Loading for Images =====
class LazyLoader {
    constructor() {
        this.images = document.querySelectorAll('img[data-src]');
        this.init();
    }

    init() {
        if (!('IntersectionObserver' in window)) {
            this.loadImagesImmediately();
            return;
        }

        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadImage(entry.target);
                    imageObserver.unobserve(entry.target);
                }
            });
        });

        this.images.forEach(img => imageObserver.observe(img));
    }

    loadImage(img) {
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        img.onload = () => img.classList.add('loaded');
    }

    loadImagesImmediately() {
        this.images.forEach(img => this.loadImage(img));
    }
}

// ===== Initialize Everything =====
class PortfolioApp {
    constructor() {
        this.init();
    }

    init() {
        // Set current year
        if (DOM.yearElement) {
            DOM.yearElement.textContent = new Date().getFullYear();
        }

        // Initialize modules
        this.modules = {
            mobileNav: new MobileNavigation(),
            smoothScroll: new SmoothScroll(),
            activeNav: new ActiveNavHighlight(),
            animations: new ScrollAnimations(),
            lazyLoader: new LazyLoader()
        };

        // Initialize accessibility features
        AccessibilityUtils.initSkipLink();
        AccessibilityUtils.initFocusManagement();

        // Add loaded class to body when page is fully loaded
        window.addEventListener('load', () => {
            document.body.classList.add('loaded');
        });

        // Error handling
        this.initErrorHandling();
    }

    initErrorHandling() {
        window.addEventListener('error', (e) => {
            console.error('Portfolio error:', e.error);
        });

        // Handle promise rejections
        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled promise rejection:', e.reason);
            e.preventDefault();
        });
    }
}

// ===== Initialize the application =====
document.addEventListener('DOMContentLoaded', () => {
    new PortfolioApp();
});

// ===== Service Worker Registration (Optional) =====
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// ===== Export for potential module usage =====
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PortfolioApp };
}