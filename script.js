// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Create debug indicator
    const debugDiv = document.createElement('div');
    debugDiv.id = 'debug-indicator';
    debugDiv.style.cssText = 'position: fixed; top: 0; left: 0; background: yellow; color: black; padding: 10px; z-index: 10000; font-size: 12px; max-width: 300px;';
    debugDiv.textContent = 'Debug: Loading...';
    document.body.appendChild(debugDiv);

    // Mobile menu toggle
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');

    debugDiv.textContent = `Toggle: ${!!mobileMenuToggle}, Menu: ${!!navMenu}`;

    if (mobileMenuToggle && navMenu) {
        mobileMenuToggle.addEventListener('click', function(e) {
            e.preventDefault();
            navMenu.classList.toggle('active');
            mobileMenuToggle.classList.toggle('active');
            
            const isActive = navMenu.classList.contains('active');
            debugDiv.textContent = `Menu active: ${isActive} | Classes: ${navMenu.className}`;
            debugDiv.style.background = isActive ? 'lime' : 'yellow';
        });
    } else {
        debugDiv.textContent = 'ERROR: Elements not found!';
        debugDiv.style.background = 'red';
        debugDiv.style.color = 'white';
    }

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            // Close mobile menu when a link is clicked
            if (navMenu && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                if (mobileMenuToggle) {
                    mobileMenuToggle.classList.remove('active');
                }
            }
            
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// Add scroll effect to header
let lastScroll = 0;
const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        header.style.background = 'rgba(10, 10, 10, 0.98)';
    } else {
        header.style.background = 'rgba(10, 10, 10, 0.95)';
    }
    
    lastScroll = currentScroll;
});

// Active section highlighting for side menu
const sections = document.querySelectorAll('section[id]');
const sideNavLinks = document.querySelectorAll('#side-nav a[href^="#"]');

function highlightActiveSection() {
    const scrollPosition = window.pageYOffset + 200; // Offset for better UX
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    // Check if we're at the bottom of the page
    const isAtBottom = (window.pageYOffset + windowHeight) >= documentHeight - 50;
    
    if (isAtBottom) {
        // Highlight the last section (Community)
        sideNavLinks.forEach(link => {
            link.classList.remove('active');
        });
        const lastSection = sections[sections.length - 1];
        const lastSectionId = lastSection.getAttribute('id');
        const lastLink = document.querySelector(`#side-nav a[href="#${lastSectionId}"]`);
        if (lastLink) {
            lastLink.classList.add('active');
        }
    } else {
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                // Remove active class from all links
                sideNavLinks.forEach(link => {
                    link.classList.remove('active');
                });
                
                // Add active class to current section link
                const activeLink = document.querySelector(`#side-nav a[href="#${sectionId}"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                }
            }
        });
    }
}

// Run on scroll
window.addEventListener('scroll', highlightActiveSection);

// Run on page load
highlightActiveSection();
