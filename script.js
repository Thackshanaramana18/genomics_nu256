// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // ===== MOUSE TRAIL EFFECT =====
    // Inspired by Framer's Mouse Trail component
    const MouseTrail = (() => {
        const config = {
            variant: 'line', // 'line', 'dots', 'particles', 'pixel'
            trailColor: '#22c55e',
            trailColorEnd: '#a8f5c8',
            trailLength: 25,
            lineWidth: 2.5,
            fadeOut: true,
            smoothing: 0.3,
            dotSize: 5,
            blendMode: 'lighter',
            autoFade: true,
            fadeDuration: 1.5
        };

        const canvas = document.createElement('canvas');
        canvas.style.cssText = 'position: fixed; top: 0; left: 0; pointer-events: none; z-index: 9999;';
        document.body.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        const trailPoints = [];
        let lastTime = performance.now();

        const resizeCanvas = () => {
            const dpr = window.devicePixelRatio || 1;
            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.scale(dpr, dpr);
        };

        const parseColor = (col) => {
            if (col.startsWith('#')) {
                let hex = col.slice(1);
                if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
                return {
                    r: parseInt(hex.slice(0, 2), 16),
                    g: parseInt(hex.slice(2, 4), 16),
                    b: parseInt(hex.slice(4, 6), 16)
                };
            }
            return { r: 0, g: 0, b: 0 };
        };

        const startRGB = parseColor(config.trailColor);
        const endRGB = parseColor(config.trailColorEnd);

        const rgba = (a, t) => {
            const r = Math.round(startRGB.r + (endRGB.r - startRGB.r) * t);
            const g = Math.round(startRGB.g + (endRGB.g - startRGB.g) * t);
            const b = Math.round(startRGB.b + (endRGB.b - startRGB.b) * t);
            return `rgba(${r},${g},${b},${Math.max(0, Math.min(1, a))})`;
        };

        const addPoint = (x, y) => {
            const last = trailPoints[trailPoints.length - 1];
            const s = Math.max(0.001, 1 - config.smoothing);
            const sx = last ? last.x + (x - last.x) * s : x;
            const sy = last ? last.y + (y - last.y) * s : y;

            trailPoints.push({ x: sx, y: sy, life: 1 });

            if (trailPoints.length > config.trailLength) {
                trailPoints.splice(0, trailPoints.length - config.trailLength);
            }
        };

        const drawFrame = (dt) => {
            ctx.globalCompositeOperation = config.blendMode;
            ctx.clearRect(0, 0, canvas.width / (window.devicePixelRatio || 1), canvas.height / (window.devicePixelRatio || 1));

            if (config.autoFade && trailPoints.length) {
                const decay = dt / Math.max(0.001, config.fadeDuration);
                for (let i = trailPoints.length - 1; i >= 0; i--) {
                    trailPoints[i].life -= decay;
                    if (trailPoints[i].life <= 0) {
                        trailPoints.splice(i, 1);
                    }
                }
            }

            if (trailPoints.length < 2) {
                if (trailPoints.length === 1) {
                    const p = trailPoints[0];
                    const a = config.autoFade ? p.life : 1;
                    ctx.fillStyle = rgba(a, 0);
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, config.lineWidth, 0, Math.PI * 2);
                    ctx.fill();
                }
                return;
            }

            if (config.variant === 'line') {
                for (let i = 1; i < trailPoints.length; i++) {
                    const p1 = trailPoints[i - 1];
                    const p2 = trailPoints[i];
                    const t = i / (trailPoints.length - 1);
                    const lifeFactor = config.autoFade ? p2.life : 1;
                    const fadeAlpha = config.fadeOut ? (i / trailPoints.length) : 1;
                    const a = fadeAlpha * lifeFactor;
                    const widthScale = config.fadeOut ? 0.3 + 0.7 * a : 1;

                    ctx.strokeStyle = rgba(a, t);
                    ctx.lineWidth = Math.max(1, config.lineWidth * widthScale);
                    ctx.lineCap = 'round';
                    ctx.lineJoin = 'round';
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                }
            } else if (config.variant === 'dots') {
                for (let i = 0; i < trailPoints.length; i++) {
                    const p = trailPoints[i];
                    const t = i / (trailPoints.length - 1);
                    const a = (i / trailPoints.length) * (config.autoFade ? p.life : 1);
                    const r = config.dotSize * (config.fadeOut ? 0.3 + 0.7 * a : 1);

                    ctx.fillStyle = rgba(a, t);
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        };

        const animate = () => {
            const now = performance.now();
            let dt = (now - lastTime) / 1000;
            dt = Math.max(0, Math.min(dt, 0.05));
            lastTime = now;

            drawFrame(dt);
            requestAnimationFrame(animate);
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        animate();

        document.addEventListener('mousemove', (e) => {
            addPoint(e.clientX, e.clientY);
        });

        return { config };
    })();
    
    // ===== 3D CAROUSEL FOR SERVICES =====
    const carousel3D = document.querySelector('.carousel-3d');
    const prevBtn = document.getElementById('prevService');
    const nextBtn = document.getElementById('nextService');
    
    if (carousel3D && prevBtn && nextBtn) {
        let currentRotation = 0;
        const rotationStep = 60; // 360 / 6 items
        
        const updateCarousel = () => {
            carousel3D.style.transform = `rotateY(${currentRotation}deg)`;
        };
        
        prevBtn.addEventListener('click', () => {
            currentRotation -= rotationStep;
            carousel3D.style.animationPlayState = 'paused';
            updateCarousel();
        });
        
        nextBtn.addEventListener('click', () => {
            currentRotation += rotationStep;
            carousel3D.style.animationPlayState = 'paused';
            updateCarousel();
        });
        
        // Resume animation after 5 seconds of inactivity
        let resumeTimeout;
        const pauseAndResume = () => {
            clearTimeout(resumeTimeout);
            carousel3D.style.animationPlayState = 'paused';
            resumeTimeout = setTimeout(() => {
                carousel3D.style.animationPlayState = 'running';
            }, 5000);
        };
        
        prevBtn.addEventListener('click', pauseAndResume);
        nextBtn.addEventListener('click', pauseAndResume);
    }
    
    // ===== EXPAND SERVICES BUTTON =====
    const expandBtn = document.getElementById('expandServicesBtn');
    const servicesGrid = document.getElementById('servicesGridExpanded');
    const carousel3DContainer = document.querySelector('.carousel-3d-container');
    const carouselControls = document.querySelector('.carousel-controls');
    
    if (expandBtn && servicesGrid) {
        expandBtn.addEventListener('click', () => {
            const isActive = servicesGrid.classList.toggle('active');
            expandBtn.classList.toggle('active');
            
            // Hide carousel and controls when expanding grid
            if (isActive) {
                carousel3DContainer.classList.add('hidden');
                carouselControls.classList.add('hidden');
                expandBtn.innerHTML = '<span>Hide All Services</span><span class="iconify" data-icon="mdi:chevron-down"></span>';
            } else {
                carousel3DContainer.classList.remove('hidden');
                carouselControls.classList.remove('hidden');
                expandBtn.innerHTML = '<span>View All Services</span><span class="iconify" data-icon="mdi:chevron-down"></span>';
            }
            
            // Ensure icons render
            if (window.Iconify) {
                window.Iconify.scan();
            }
        });
    }
    
    // ===== TILT EFFECT FOR SERVICE GRID CARDS =====
    const tiltCards = document.querySelectorAll('.tilt-card');
    
    tiltCards.forEach(card => {
        const content = card.querySelector('.service-grid-content');
        
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = ((y - centerY) / centerY) * 15;
            const rotateY = ((centerX - x) / centerX) * 15;
            
            content.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(30px)`;
        });
        
        card.addEventListener('mouseleave', () => {
            content.style.transform = 'rotateX(0deg) rotateY(0deg) translateZ(0px)';
        });
    });
    
    // Ensure icons render properly
    if (window.Iconify) {
        window.Iconify.scan();
    }
    
    // ... rest of existing code

    
    // Ensure video plays on page load
    const video = document.getElementById('background-video');
    if (video) {
        video.play();
    }
    
    // Ensure Iconify icons load and render
    if (window.Iconify) {
        window.Iconify.scan();
    }
    
    // Fallback: reload Iconify icons after a delay
    setTimeout(() => {
        if (window.Iconify) {
            window.Iconify.scan();
        }
    }, 300);

    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile menu toggle
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');

    if (menuToggle && navMenu) {
        const toggleMenu = () => {
            menuToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
            menuToggle.setAttribute('aria-expanded', menuToggle.classList.contains('active'));
        };
        
        menuToggle.addEventListener('click', toggleMenu);
        
        // Keyboard accessibility - Enter or Space to toggle menu
        menuToggle.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleMenu();
            }
        });

        // Close menu when clicking on a link
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                menuToggle.classList.remove('active');
                navMenu.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
            });
            
            // Keyboard accessibility for nav links
            link.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    link.click();
                }
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!menuToggle.contains(e.target) && !navMenu.contains(e.target)) {
                menuToggle.classList.remove('active');
                navMenu.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // Animate numbers on scroll
    const animateNumbers = () => {
        const numberElements = document.querySelectorAll('.achievement-number');
        
        numberElements.forEach(element => {
            const target = parseInt(element.getAttribute('data-target'));
            const duration = 2000; // 2 seconds for smooth animation
            const startTime = Date.now();
            let animationFrameId = null;
            
            // Spring physics simulation (Framer-like smooth spring)
            const damping = 30; // Framer-like damping for smooth settling
            const stiffness = 100; // Standard stiffness
            const mass = 1;
            
            let current = 0; // Start from 0
            let velocity = 0;
            let prevTime = Date.now();
            
            // Initialize display to 0
            element.textContent = '0';
            
            const animate = () => {
                const now = Date.now();
                const elapsed = now - startTime;
                const deltaTime = (now - prevTime) / 1000; // Convert to seconds
                prevTime = now;
                
                // Spring physics: calculate force using Hooke's law
                const distance = target - current;
                const force = distance * stiffness; // F = kx (spring force)
                const dampeningForce = velocity * damping; // Friction force
                const acceleration = (force - dampeningForce) / mass;
                
                // Update velocity and position
                velocity += acceleration * deltaTime;
                current += velocity * deltaTime;
                
                // Stop animation when close enough and velocity is near zero
                if (Math.abs(distance) < 0.5 && Math.abs(velocity) < 0.1) {
                    element.textContent = target.toLocaleString();
                    return;
                }
                
                // Format number with thousand separators
                const displayValue = Math.round(current);
                element.textContent = displayValue.toLocaleString();
                
                animationFrameId = requestAnimationFrame(animate);
            };
            
            // Check if element is in viewport
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !entry.target.dataset.animated) {
                        entry.target.dataset.animated = 'true';
                        prevTime = Date.now();
                        animate();
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });
            
            observer.observe(element);
        });
    };
    
    // Contact form handling
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const data = Object.fromEntries(formData);
            
            // Simple validation and success message
            console.log('Form submitted with data:', data);
            alert('Thank you for your message! We will get back to you shortly.');
            
            // Reset form
            contactForm.reset();
        });
    }
    
    // Call on page load and ensure it runs
    animateNumbers();
    
    // ===== CAROUSEL HOVER DEPTH EFFECT =====
    const carouselItems = document.querySelectorAll('.carousel-item');
    carouselItems.forEach(item => {
        const card = item.querySelector('.service-card-3d');
        if (card) {
            item.addEventListener('mouseenter', () => {
                card.style.boxShadow = '0 20px 50px rgba(0, 0, 0, 0.3), 0 0 30px rgba(34, 197, 94, 0.2)';
                card.style.transform = 'translateY(-8px)';
            });
            
            item.addEventListener('mouseleave', () => {
                card.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.15)';
                card.style.transform = '';
            });
        }
    });
    
    const observerOptions = {
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = entry.target.dataset.animation || 'fadeInUp 0.8s ease-out forwards';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all cards and service cards
    document.querySelectorAll('.card, .service-card').forEach(el => {
        el.style.opacity = '0';
        observer.observe(el);
    });
    
    // ===== SCROLL EFFECTS AND MICRO ANIMATIONS =====
    
    // 1. Parallax scroll effect for hero section
    const heroSection = document.querySelector('.hero-section');
    const heroContainer = document.querySelector('.hero-container');
    
    if (heroSection && heroContainer) {
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            if (scrollY < window.innerHeight) {
                heroContainer.style.transform = `translateY(${scrollY * 0.5}px)`;
            }
        });
    }
    
    // 2. Text fade-in with stagger effect on all paragraphs
    const paragraphs = document.querySelectorAll('.mv-statement-text, .block-text, .about-intro, .achievement-description, .values-section-subtitle');
    
    paragraphs.forEach((p, index) => {
        p.style.opacity = '0';
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.animation = `fadeInUp 0.8s ease-out forwards`;
                    }, index * 100);
                    observer.unobserve(entry.target);
                }
            });
        });
        observer.observe(p);
    });
    
    // 3. Scale animation for cards on scroll
    const allCards = document.querySelectorAll('.service-item, .achievement-card, .contact-info-card, .value-card, .value-showcase-card, .about-block');
    
    allCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'scale(0.95)';
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animation = `scaleInUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards`;
                    observer.unobserve(entry.target);
                }
            });
        });
        observer.observe(card);
    });
    
    // 4. Floating animation for icons
    const icons = document.querySelectorAll('.service-icon, .achievement-icon, .info-icon, .value-icon, .value-showcase-icon');
    
    icons.forEach((icon, index) => {
        icon.style.animation = `float${index % 2 === 0 ? '1' : '2'} 3s ease-in-out infinite`;
    });
    
    // 5. Line drawing animation for dividers
    const dividers = document.querySelectorAll('.achievements-divider, .about-divider, .mv-divider');
    
    dividers.forEach(divider => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animation = `expandWidth 0.8s ease-out forwards`;
                    observer.unobserve(entry.target);
                }
            });
        });
        observer.observe(divider);
    });
    
    // 6. Hover glow effect for interactive elements
    const interactiveElements = document.querySelectorAll('.service-item, .cta-button, .contact-info-card, .submit-button, .value-card');
    
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', function() {
            this.style.transition = 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
        });
    });
    
    // 7. Stagger animation for list items
    const listItems = document.querySelectorAll('.values-grid .value-card, .contact-info-wrapper .contact-info-card');
    
    listItems.forEach((item, index) => {
        item.style.opacity = '0';
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.animation = `slideInLeft 0.6s ease-out forwards`;
                    }, index * 100);
                    observer.unobserve(entry.target);
                }
            });
        });
        observer.observe(item);
    });
    
    // 8. Number counter pulse effect
    const numberElements = document.querySelectorAll('.achievement-number, .highlight-number');
    
    numberElements.forEach(num => {
        num.addEventListener('animationend', () => {
            num.style.animation = `pulse 2s ease-in-out infinite`;
        });
    });
    
    // ===== ADVANCED SCROLL ANIMATIONS =====
    
    // 9. Reveal text animation on scroll (clip-path effect)
    const revealTexts = document.querySelectorAll('.section-title, .services-main-title, .collaborate-title');
    
    revealTexts.forEach(text => {
        text.style.clipPath = 'inset(0 100% 0 0)';
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animation = `revealText 0.8s ease-out forwards`;
                    // Reset clipPath after animation completes to ensure text stays visible
                    setTimeout(() => {
                        entry.target.style.clipPath = 'inset(0)';
                    }, 800);
                    observer.unobserve(entry.target);
                }
            });
        });
        observer.observe(text);
    });
    
    // 10. Parallax depth effect with rotation on scroll
    // REMOVED - Rotation effect disabled per user request for cleaner centered look
    /*
    const parallaxElements = document.querySelectorAll('.tech-feature, .mv-statement');
    
    parallaxElements.forEach((el, index) => {
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            const rect = el.getBoundingClientRect();
            const elementCenter = rect.top + rect.height / 2;
            const windowCenter = window.innerHeight / 2;
            const distance = elementCenter - windowCenter;
            const angle = (distance / window.innerHeight) * 5;
            
            el.style.transform = `perspective(1000px) rotateX(${angle}deg) translateZ(0)`;
        });
    });
    */
    
    // 11. Counter-up animation on scroll with easing
    const counterElements = document.querySelectorAll('.feature-number');
    
    counterElements.forEach(counter => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.dataset.animated) {
                    entry.target.dataset.animated = 'true';
                    entry.target.style.animation = `slideDown 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards`;
                }
            });
        });
        observer.observe(counter);
    });
    
    // 12. Background color shift on scroll
    window.addEventListener('scroll', () => {
        const scrollPercentage = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
        const hue = (scrollPercentage * 3.6) % 360;
        document.documentElement.style.setProperty('--scroll-hue', `${hue}deg`);
    });
    
    // 13. Element blur/focus effect based on scroll position
    // REMOVED - Blur effect disabled per user request
    /*
    const focusElements = document.querySelectorAll('.service-item, .achievement-card');
    
    window.addEventListener('scroll', () => {
        focusElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            const elementCenter = rect.top + rect.height / 2;
            const windowCenter = window.innerHeight / 2;
            const distance = Math.abs(elementCenter - windowCenter);
            const blur = Math.max(0, Math.min(5, (distance / window.innerHeight) * 10));
            
            el.style.filter = `blur(${blur}px)`;
        });
    });
    */
    
    // 14. Smooth scroll snap with momentum effect
    const scrollSections = document.querySelectorAll('.page');
    
    window.addEventListener('scroll', () => {
        scrollSections.forEach(section => {
            const rect = section.getBoundingClientRect();
            const progress = Math.max(0, Math.min(1, 1 - Math.abs(rect.top) / window.innerHeight));
            section.style.opacity = 0.7 + progress * 0.3;
        });
    });
    
    // 15. Text shimmer effect on scroll
    const shimmerTexts = document.querySelectorAll('.mv-main-title, .section-title');
    
    shimmerTexts.forEach(text => {
        text.addEventListener('mouseenter', () => {
            text.style.animation = `shimmer 0.6s ease-in-out`;
        });
    });
    
    // 16. Dynamic shadow depth effect
    const shadowElements = document.querySelectorAll('.service-item, .achievement-card, .contact-info-card');
    
    window.addEventListener('scroll', () => {
        shadowElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            const centerY = rect.top + rect.height / 2;
            const distance = Math.abs(centerY - window.innerHeight / 2);
            const shadowIntensity = Math.max(5, Math.min(20, (window.innerHeight / 2 - distance) / 50));
            
            el.style.boxShadow = `0 ${shadowIntensity}px ${shadowIntensity * 2}px rgba(0, 0, 0, ${shadowIntensity / 100})`;
        });
    });
    
    // 17. Zoom in parallax for hero slogan
    const heroSlogan = document.querySelector('.hero-slogan');
    
    if (heroSlogan) {
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            if (scrollY < window.innerHeight) {
                const scale = 1 + scrollY * 0.0005;
                heroSlogan.style.transform = `scale(${scale})`;
            }
        });
    }
    
    // 18. Title word animation on scroll
    const titles = document.querySelectorAll('.mv-statement-title, .block-title, .service-title');
    
    titles.forEach(title => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animation = `slideInRight 0.6s ease-out forwards`;
                    observer.unobserve(entry.target);
                }
            });
        });
        observer.observe(title);
    });
    
    // 19. Intersection observer for staggered animations on grid items
    const gridItems = document.querySelectorAll('.values-grid .value-card, .services-container .service-item');
    
    gridItems.forEach((item, index) => {
        item.style.opacity = '0';
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const delay = (index % 3) * 0.15;
                    setTimeout(() => {
                        entry.target.style.animation = `bounceInUp 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards`;
                    }, delay * 1000);
                    observer.unobserve(entry.target);
                }
            });
        });
        observer.observe(item);
    });
    
    // 20. Mouse parallax effect on hero
    let mouseX = 0;
    let mouseY = 0;
    
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX / window.innerWidth;
        mouseY = e.clientY / window.innerHeight;
        
        const heroTitle = document.querySelector('.hero-text h1');
        if (heroTitle && window.scrollY < window.innerHeight) {
            const moveX = (mouseX - 0.5) * 20;
            const moveY = (mouseY - 0.5) * 20;
            heroTitle.style.transform = `translate(${moveX}px, ${moveY}px)`;
        }
    });
    
    // 21. Stagger load animation for all page sections
    const sections = document.querySelectorAll('.page');
    
    sections.forEach((section, index) => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.animation = `fadeInUp 0.8s ease-out forwards`;
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        observer.observe(section);
    });
});

// Handle responsive video sizing
window.addEventListener('resize', function() {
    const video = document.getElementById('background-video');
    if (video) {
        video.style.width = '100%';
        video.style.height = '100%';
    }
});

// 3D Anatomy Visualization
function initializeAnatomy3D() {
    const container = document.getElementById('anatomy-canvas');
    if (!container) return;
    
    // Check if THREE is loaded
    if (!window.THREE) {
        console.log('THREE.js not loaded yet, retrying...');
        setTimeout(initializeAnatomy3D, 500);
        return;
    }

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x071127);
    scene.fog = new THREE.Fog(0x071127, 10, 7.5);
    
    const width = container.clientWidth;
    const height = container.clientHeight;
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 3;
    camera.position.y = 0;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Lighting - more prominent
    const light1 = new THREE.PointLight(0x6366f1, 2, 100);
    light1.position.set(5, 5, 5);
    scene.add(light1);

    const light2 = new THREE.PointLight(0x818cf8, 1.5, 100);
    light2.position.set(-5, -5, 5);
    scene.add(light2);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    // Create particle system
    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = 800;
    const positionArray = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
        positionArray[i] = (Math.random() - 0.5) * 6;
        positionArray[i + 1] = (Math.random() - 0.5) * 6;
        positionArray[i + 2] = (Math.random() - 0.5) * 6;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positionArray, 3));

    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.08,
        color: 0x6366f1,
        transparent: true,
        opacity: 0.8,
        sizeAttenuation: true
    });

    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    // Create helix structure - more visible
    const helixGroup = new THREE.Group();
    
    const helixGeometry = new THREE.BufferGeometry();
    const helixPositions = [];
    const helixColors = [];

    for (let i = 0; i < 300; i++) {
        const t = i / 100;
        const x = Math.cos(t * Math.PI * 4) * 1.5;
        const y = t * 1.8 - 2.7;
        const z = Math.sin(t * Math.PI * 4) * 1.5;

        helixPositions.push(x, y, z);
        helixColors.push(0.39, 0.41, 0.98); // Brighter indigo
    }

    helixGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(helixPositions), 3));
    helixGeometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(helixColors), 3));

    const helixMaterial = new THREE.LineBasicMaterial({
        vertexColors: true,
        linewidth: 3,
        fog: false
    });

    const helix = new THREE.Line(helixGeometry, helixMaterial);
    helixGroup.add(helix);

    // Create second helix
    const helix2Geometry = new THREE.BufferGeometry();
    const helix2Positions = [];
    const helix2Colors = [];

    for (let i = 0; i < 300; i++) {
        const t = i / 100;
        const x = Math.cos(t * Math.PI * 4 + Math.PI) * 1.5;
        const y = t * 1.8 - 2.7;
        const z = Math.sin(t * Math.PI * 4 + Math.PI) * 1.5;

        helix2Positions.push(x, y, z);
        helix2Colors.push(0.50, 0.50, 1.0); // Lighter indigo
    }

    helix2Geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(helix2Positions), 3));
    helix2Geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(helix2Colors), 3));

    const helix2Material = new THREE.LineBasicMaterial({
        vertexColors: true,
        linewidth: 3,
        fog: false
    });

    const helix2 = new THREE.Line(helix2Geometry, helix2Material);
    helixGroup.add(helix2);

    scene.add(helixGroup);

    // Mouse interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    document.addEventListener('mousemove', (e) => {
        const rect = container.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
            targetX = (e.clientX - rect.left) / rect.width - 0.5;
            targetY = (e.clientY - rect.top) / rect.height - 0.5;
        }
    });

    // Animation loop
    let frameCount = 0;
    function animate() {
        requestAnimationFrame(animate);
        frameCount++;

        // Smooth mouse following
        mouseX += (targetX - mouseX) * 0.05;
        mouseY += (targetY - mouseY) * 0.05;

        // Rotate particles
        particles.rotation.x += 0.00008;
        particles.rotation.y += 0.0001;

        // Rotate helix based on mouse
        helixGroup.rotation.x = mouseY * 0.5;
        helixGroup.rotation.y = mouseX * 0.5;
        helixGroup.rotation.z += 0.0002;

        renderer.render(scene, camera);
    }

    animate();

    // Handle window resize
    const resizeObserver = new ResizeObserver(() => {
        const newWidth = container.clientWidth;
        const newHeight = container.clientHeight;
        if (newWidth > 0 && newHeight > 0) {
            camera.aspect = newWidth / newHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(newWidth, newHeight);
        }
    });
    
    resizeObserver.observe(container);
}

// Initialize 3D anatomy when Three.js is loaded
if (window.THREE) {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(initializeAnatomy3D, 100);
    });
} else {
    // If script loads before THREE.js, wait for it
    const checkThree = setInterval(() => {
        if (window.THREE) {
            clearInterval(checkThree);
            document.addEventListener('DOMContentLoaded', function() {
                setTimeout(initializeAnatomy3D, 100);
            });
        }
    }, 100);
}

// ===== SCROLL TO TOP BUTTON =====
(function() {
    const scrollBtn = document.getElementById('scrollToTop');
    
    if (scrollBtn) {
        // Show/hide button based on scroll position
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                scrollBtn.classList.add('show');
            } else {
                scrollBtn.classList.remove('show');
            }
        });
        
        // Scroll to top on click
        scrollBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
        
        // Keyboard accessibility - Enter or Space
        scrollBtn.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                scrollBtn.click();
            }
        });
    }
})();

// ===== FORM VALIDATION & FEEDBACK =====
(function() {
    const form = document.querySelector('.contact-form');
    
    if (form) {
        const inputs = form.querySelectorAll('.form-input, .form-textarea');
        const submitBtn = form.querySelector('.submit-button');
        
        // Email validation
        const validateEmail = (email) => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        };
        
        // Validate individual fields
        const validateField = (field) => {
            const value = field.value.trim();
            const feedback = field.parentElement.querySelector('.form-feedback');
            let isValid = true;
            let message = '';
            
            if (field.type === 'email') {
                if (!value) {
                    isValid = false;
                    message = 'Email is required';
                } else if (!validateEmail(value)) {
                    isValid = false;
                    message = 'Please enter a valid email address';
                } else {
                    message = 'Email looks good!';
                }
            } else if (field.classList.contains('form-textarea')) {
                if (!value) {
                    isValid = false;
                    message = 'Message is required';
                } else if (value.length < 10) {
                    isValid = false;
                    message = 'Message must be at least 10 characters';
                } else {
                    message = 'Message received!';
                }
            } else if (field.name === 'name' || field.name === 'phone') {
                if (!value) {
                    isValid = false;
                    message = field.placeholder + ' is required';
                } else {
                    message = 'Looks good!';
                }
            }
            
            // Update field styling
            field.classList.remove('success', 'error');
            if (feedback) {
                feedback.classList.remove('success', 'error');
                feedback.textContent = message;
            }
            
            if (isValid && value) {
                field.classList.add('success');
                if (feedback) feedback.classList.add('success');
            } else if (!isValid && value) {
                field.classList.add('error');
                if (feedback) feedback.classList.add('error');
            }
            
            return isValid;
        };
        
        // Real-time validation on input
        inputs.forEach(input => {
            input.addEventListener('blur', () => validateField(input));
            input.addEventListener('input', () => {
                if (input.classList.contains('error') || input.classList.contains('success')) {
                    validateField(input);
                }
                
                // Character counter for textarea
                if (input.classList.contains('form-textarea')) {
                    const maxChars = 500;
                    const currentChars = input.value.length;
                    const counter = input.parentElement.querySelector('.char-counter');
                    if (counter) {
                        counter.textContent = `${currentChars}/${maxChars} characters`;
                        if (currentChars > maxChars) {
                            input.value = input.value.substring(0, maxChars);
                            counter.textContent = `${maxChars}/${maxChars} characters (max reached)`;
                        }
                    }
                }
            });
            
            // Add focus glow effect
            input.addEventListener('focus', () => {
                input.style.animation = 'fieldGlow 0.6s ease-out';
            });
            
            input.addEventListener('blur', () => {
                input.style.animation = '';
            });
        });
        
        // Form submission
        if (submitBtn) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                
                let allValid = true;
                inputs.forEach(input => {
                    if (!validateField(input)) {
                        allValid = false;
                    }
                });
                
                if (allValid) {
                    // Show loading state
                    submitBtn.classList.add('loading');
                    submitBtn.disabled = true;
                    submitBtn.textContent = 'Sending...';
                    
                    // Simulate form submission
                    setTimeout(() => {
                        submitBtn.classList.remove('loading');
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = '<span class="iconify" data-icon="mdi:check"></span> Message Sent!';
                        submitBtn.style.animation = 'successCheckmark 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
                        submitBtn.style.background = 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)';
                        
                        // Show success message
                        form.style.animation = 'pageTransitionFadeIn 0.6s ease-out';
                        
                        // Reset form
                        setTimeout(() => {
                            form.reset();
                            inputs.forEach(input => {
                                input.classList.remove('success', 'error');
                                const feedback = input.parentElement.querySelector('.form-feedback');
                                if (feedback) {
                                    feedback.classList.remove('success', 'error');
                                    feedback.textContent = '';
                                }
                            });
                            
                            // Reset button
                            submitBtn.innerHTML = 'Send Message';
                            submitBtn.style.animation = '';
                            
                            // Show success alert
                            alert('Thank you for your message! We will get back to you soon.');
                        }, 2000);
                    }, 1500);
                }
            });
        }
    }
})();