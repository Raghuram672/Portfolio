document.addEventListener('DOMContentLoaded', () => {

    // --- Elements ---
    const yearSpan = document.getElementById('year');
    const header = document.getElementById('header');
    const burger = document.querySelector('.burger');
    const nav = document.querySelector('.nav-links');
    const darkModeToggle = document.getElementById('darkModeToggle');
    const body = document.body;
    const timelineButtons = document.querySelectorAll('.timeline-button');
    const timelinePanes = document.querySelectorAll('.timeline-pane');
    const timelineLineBg = document.querySelector('.timeline-line-bg'); 
    const timelineLineActive = document.querySelector('.timeline-line-active'); 


    // --- Update Footer Year ---
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // --- Header Scroll Effect ---
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }
    
    const headerHeight = header ? header.offsetHeight : 70;

    // --- Active Navigation Link Highlighting ---
    const activateNavLink = () => {
        let current = '';
        const scrollY = window.pageYOffset;
        const viewportProbe = scrollY + headerHeight + (window.innerHeight * 0.35);
        const sectionsNodeList = document.querySelectorAll('section[id]'); 
        const navLinksNodeList = document.querySelectorAll('.nav-links a'); 

        sectionsNodeList.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionBottom = sectionTop + section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (viewportProbe >= sectionTop && viewportProbe < sectionBottom) {
                current = sectionId;
            }
        });

        if (sectionsNodeList.length > 0 && !current) {
            const firstSection = sectionsNodeList[0];
            const lastSection = sectionsNodeList[sectionsNodeList.length - 1];
            const pageBottom = scrollY + window.innerHeight;

            if (scrollY < firstSection.offsetTop - headerHeight) {
                current = firstSection.getAttribute('id');
            } else if (pageBottom >= document.documentElement.scrollHeight - 2) {
                current = lastSection.getAttribute('id');
            }
        }

        navLinksNodeList.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    };
    window.addEventListener('scroll', activateNavLink);
    activateNavLink(); 


    // --- Mobile Menu Toggle ---
     if (burger && nav) {
         const setMobileMenuState = (isOpen) => {
             nav.classList.toggle('active', isOpen);
             burger.classList.toggle('toggle', isOpen);
             body.classList.toggle('no-scroll', isOpen);
             burger.setAttribute('aria-expanded', String(isOpen));
         };

         burger.addEventListener('click', () => {
             const isOpen = !nav.classList.contains('active');
             setMobileMenuState(isOpen);
         });

         const navLinksForMenu = document.querySelectorAll('.nav-links a');
         navLinksForMenu.forEach(link => {
             link.addEventListener('click', () => {
                 if (nav.classList.contains('active')) {
                     setMobileMenuState(false);
                 }
             });
         });
         document.addEventListener('click', (e) => {
            if (nav.classList.contains('active') && !nav.contains(e.target) && !burger.contains(e.target)) {
                setMobileMenuState(false);
            }
         });
     }

     // --- Dark Mode Logic ---
     const applyDarkMode = (isDark) => {
        if (isDark) {
            body.classList.add('dark-mode');
            body.classList.remove('light-mode'); 
            if(darkModeToggle) darkModeToggle.setAttribute('aria-pressed', 'true');
        } else {
            body.classList.remove('dark-mode');
            body.classList.add('light-mode'); 
            if(darkModeToggle) darkModeToggle.setAttribute('aria-pressed', 'false');
        }
     };
     if (darkModeToggle) {
        const savedPreference = localStorage.getItem('darkMode');
        // Default to dark mode if no preference is saved
        let isInitiallyDark = savedPreference !== null ? savedPreference === 'true' : true; 
        
        // If no saved preference, check OS preference (optional refinement)
        // If you want OS preference to take precedence over hardcoded default when no localStorage is set:
        // const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        // if (savedPreference === null) {
        // isInitiallyDark = prefersDark; // This would make it OS-aware default
        // }


        applyDarkMode(isInitiallyDark);

        darkModeToggle.addEventListener('click', () => {
            const newDarkModeState = !body.classList.contains('dark-mode');
            applyDarkMode(newDarkModeState);
            localStorage.setItem('darkMode', newDarkModeState);
        });
        
        // Listen for OS preference changes ONLY if no user preference is stored
         window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
             if (localStorage.getItem('darkMode') === null) { // Only act if user hasn't made a choice
                 applyDarkMode(e.matches);
             }
         });
     }

    // --- Timeline Interaction ---
    if (timelineButtons.length > 0 && timelinePanes.length > 0) {
        const updateTimelineActiveLine = (activeButton) => {
            if (!timelineLineActive || !timelineLineBg || window.innerWidth <= 768 || !activeButton.offsetParent) {
                if (timelineLineActive) { // Hide line on mobile or if elements missing
                    timelineLineActive.style.setProperty('--timeline-active-line-height', `0px`);
                }
                return; 
            }

            const navTopOffset = timelineLineBg.offsetTop; 
            const buttonTopRelativeToNav = activeButton.offsetTop; 
            const buttonHeight = activeButton.offsetHeight;
            const segmentTop = buttonTopRelativeToNav - navTopOffset + (buttonHeight / 4) ; 
            const segmentHeight = buttonHeight / 2; 

            timelineLineActive.style.setProperty('--timeline-active-line-top', `${segmentTop}px`);
            timelineLineActive.style.setProperty('--timeline-active-line-height', `${segmentHeight}px`);
        };

        timelineButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetId = button.getAttribute('data-target');
                const targetPane = document.getElementById(targetId);

                timelineButtons.forEach(btn => btn.classList.remove('active'));
                timelinePanes.forEach(pane => pane.classList.remove('active'));

                button.classList.add('active');
                if (targetPane) targetPane.classList.add('active');
                
                updateTimelineActiveLine(button);
            });
        });

        const initialActiveButton = document.querySelector('.timeline-button.active');
        if (initialActiveButton) {
             setTimeout(() => updateTimelineActiveLine(initialActiveButton), 150); 
        }
         window.addEventListener('resize', () => {
             const currentActiveButton = document.querySelector('.timeline-button.active');
             if (currentActiveButton) updateTimelineActiveLine(currentActiveButton);
         });
    }

    // --- Intersection Observer for Animations (Sections & Staggered Items) ---
    const sectionObserverOptions = { root: null, rootMargin: '0px', threshold: 0.15 }; 
    
    const sectionObserverCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                const itemsToAnimate = entry.target.querySelectorAll('.animated-item'); // Ensure items have this class
                itemsToAnimate.forEach((item, index) => {
                    item.style.animationDelay = `${index * 0.15}s`; 
                });
                 observer.unobserve(entry.target); 
            }
        });
    };
    
    const sectionScrollObserver = new IntersectionObserver(sectionObserverCallback, sectionObserverOptions);
    
    const sectionsNodeListForObserver = document.querySelectorAll('section[id]'); 
    sectionsNodeListForObserver.forEach(section => {
        sectionScrollObserver.observe(section);
    });

});
