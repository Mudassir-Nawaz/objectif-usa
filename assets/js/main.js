/**
 * Mobile Drawer Navigation System
 * @version 2.3.0
 */

// ============================================
// 1. ENVIRONMENT CONFIGURATION
// ============================================
const ENV = {
    isDev: window.location.hostname === 'localhost' || 
            window.location.hostname === '127.0.0.1' || 
            window.location.hostname.includes('staging') ||
            window.location.search.includes('debug=true')
};

const log = {
    info: (msg) => ENV.isDev && console.log(`✓ ${msg}`),
    warn: (msg) => ENV.isDev && console.warn(`⚠ ${msg}`),
    error: (msg) => ENV.isDev && console.error(`✗ ${msg}`),
    event: (action) => ENV.isDev && console.log(`→ ${action}`)
};

// ============================================
// 2. DRAWER ANIMATION SYSTEM
// ============================================
class DrawerManager {
    constructor() {
        this.overlay = null;
        this.openBtn = null;
        this.closeBtn = null;
        this.isOpen = false;
        
        this.init();
    }
    
    init() {
        this.overlay = document.getElementById('mobileMenuOverlay');
        this.openBtn = document.getElementById('mobileMenuButton');
        this.closeBtn = document.getElementById('closeMenuButton');
        
        if (!this.overlay || !this.openBtn || !this.closeBtn) {
            log.error('Drawer elements not found');
            return;
        }
        
        this.attachEvents();
        log.info('Drawer ready');
    }
    
    attachEvents() {
        this.openBtn.addEventListener('click', () => this.open());
        this.closeBtn.addEventListener('click', () => this.close());
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) this.close();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) this.close();
        });
        window.addEventListener('resize', () => {
            if (window.innerWidth >= 768 && this.isOpen) this.close();
        });
    }
    
    open() {
        if (this.isOpen) return;
        this.overlay.style.display = 'flex';
        this.overlay.style.opacity = '0';
        this.overlay.offsetHeight;
        this.overlay.style.opacity = '1';
        document.body.style.overflow = 'hidden';
        this.isOpen = true;
        log.event('Drawer opened');
    }
    
    close() {
        if (!this.isOpen) return;
        this.overlay.style.opacity = '0';
        setTimeout(() => {
            this.overlay.style.display = 'none';
            document.body.style.overflow = '';
        }, 300);
        this.isOpen = false;
        log.event('Drawer closed');
    }
}

// ============================================
// 3. MOBILE SUBMENU HANDLER
// ============================================
class MobileSubmenuHandler {
    constructor() {
        this.init();
    }
    
    init() {
        const menuItems = document.querySelectorAll('#mobileMenuOverlay li');
        
        menuItems.forEach(item => {
            const link = item.querySelector(':scope > a');
            const submenu = item.querySelector(':scope > ul');
            
            if (link && submenu) {
                this.makeAccordionItem(link, submenu);
            }
        });
        
        log.info('Mobile submenu handler ready');
    }
    
    makeAccordionItem(link, submenu) {
        let isOpen = false;
        
        const linkText = link.textContent.trim();
        link.innerHTML = '';
        
        const textSpan = document.createElement('span');
        textSpan.className = 'menu-text';
        textSpan.textContent = linkText;
        
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'submenu-toggle';
        toggleBtn.setAttribute('aria-label', `Toggle ${linkText} submenu`);
        toggleBtn.innerHTML = `
            <svg class="toggle-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `;
        
        link.appendChild(textSpan);
        link.appendChild(toggleBtn);
        
        submenu.style.maxHeight = '0';
        submenu.style.opacity = '0';
        submenu.style.visibility = 'hidden';
        submenu.style.overflow = 'hidden';
        submenu.style.transition = 'all 0.3s ease';
        
        textSpan.addEventListener('click', (e) => {
            e.stopPropagation();
            const href = link.getAttribute('href');
            if (href && href !== '#') {
                log.event(`Navigating to: ${href}`);
                window.location.href = href;
            }
        });
        
        toggleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            if (isOpen) {
                this.closeSubmenu(link, submenu, toggleBtn);
                isOpen = false;
                log.event(`Submenu closed: ${linkText}`);
            } else {
                this.closeAllSubmenus(link);
                this.openSubmenu(link, submenu, toggleBtn);
                isOpen = true;
                log.event(`Submenu opened: ${linkText}`);
            }
        });
        
        link.submenuData = { isOpen, submenu, toggleBtn };
    }
    
    openSubmenu(link, submenu, toggleBtn) {
        const icon = toggleBtn.querySelector('.toggle-icon');
        if (icon) {
            icon.style.transform = 'rotate(90deg)';
        }
        
        submenu.style.maxHeight = submenu.scrollHeight + 'px';
        submenu.style.opacity = '1';
        submenu.style.visibility = 'visible';
        link.setAttribute('aria-expanded', 'true');
        toggleBtn.setAttribute('aria-expanded', 'true');
    }
    
    closeSubmenu(link, submenu, toggleBtn) {
        const icon = toggleBtn.querySelector('.toggle-icon');
        if (icon) {
            icon.style.transform = 'rotate(0deg)';
        }
        
        submenu.style.maxHeight = '0';
        submenu.style.opacity = '0';
        submenu.style.visibility = 'hidden';
        link.setAttribute('aria-expanded', 'false');
        toggleBtn.setAttribute('aria-expanded', 'false');
    }
    
    closeAllSubmenus(currentLink = null) {
        const allSubmenus = document.querySelectorAll('#mobileMenuOverlay ul');
        allSubmenus.forEach(submenu => {
            const parentLi = submenu.closest('li');
            const parentLink = parentLi ? parentLi.querySelector(':scope > a') : null;
            
            if (parentLink && parentLink !== currentLink && parentLink.submenuData) {
                const data = parentLink.submenuData;
                if (data.isOpen) {
                    this.closeSubmenu(parentLink, data.submenu, data.toggleBtn);
                    data.isOpen = false;
                }
            }
        });
    }
    
    closeAll() {
        const allSubmenus = document.querySelectorAll('#mobileMenuOverlay ul');
        allSubmenus.forEach(submenu => {
            const parentLi = submenu.closest('li');
            const parentLink = parentLi ? parentLi.querySelector(':scope > a') : null;
            
            if (parentLink && parentLink.submenuData) {
                const data = parentLink.submenuData;
                if (data.isOpen) {
                    this.closeSubmenu(parentLink, data.submenu, data.toggleBtn);
                    data.isOpen = false;
                }
            }
        });
    }
}

// ============================================
// 4. FAQ ACCORDION SYSTEM
// ============================================
class FAQAccordion {
    constructor() {
        this.init();
    }
    
    init() {
        const faqContainers = document.querySelectorAll('.faq-accordion');
        
        if (faqContainers.length === 0) return;
        
        faqContainers.forEach(container => {
            this.setupAccordion(container);
        });
        
        log.info('FAQ accordion ready');
    }
    
    setupAccordion(container) {
        const items = container.querySelectorAll('.faq-item');
        const enableFirst = container.getAttribute('data-enable-first') === 'yes';
        
        // Close all items
        const closeAllItems = () => {
            items.forEach(item => {
                const button = item.querySelector('.faq-question-btn');
                const content = item.querySelector('.faq-answer-content');
                if (button && content) {
                    button.classList.remove('active');
                    content.classList.remove('active');
                    button.setAttribute('aria-expanded', 'false');
                    content.setAttribute('aria-hidden', 'true');
                    content.style.maxHeight = null;
                }
            });
        };
        
        // Open specific item
        const openItem = (item) => {
            const button = item.querySelector('.faq-question-btn');
            const content = item.querySelector('.faq-answer-content');
            if (button && content) {
                button.classList.add('active');
                content.classList.add('active');
                button.setAttribute('aria-expanded', 'true');
                content.setAttribute('aria-hidden', 'false');
                content.style.maxHeight = content.scrollHeight + 'px';
            }
        };
        
        // Initialize each item
        items.forEach((item, index) => {
            const button = item.querySelector('.faq-question-btn');
            const content = item.querySelector('.faq-answer-content');
            
            if (!button || !content) return;
            
            // Set initial state
            content.style.maxHeight = null;
            button.setAttribute('aria-expanded', 'false');
            content.setAttribute('aria-hidden', 'true');
            
            // Add click handler
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const isActive = button.classList.contains('active');
                closeAllItems();
                if (!isActive) {
                    openItem(item);
                    log.event(`FAQ opened: ${index + 1}`);
                }
            });
        });
        
        // Open first item if enabled
        if (enableFirst && items.length > 0) {
            openItem(items[0]);
        }
    }
}

// ============================================
// 5. INITIALIZATION
// ============================================
let drawer = null;
let submenuHandler = null;
let faqAccordion = null;

const initAll = () => {
    drawer = new DrawerManager();
    submenuHandler = new MobileSubmenuHandler();
    faqAccordion = new FAQAccordion();
    
    const overlay = document.getElementById('mobileMenuOverlay');
    if (overlay) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'style' && overlay.style.display === 'none') {
                    if (submenuHandler) submenuHandler.closeAll();
                }
            });
        });
        observer.observe(overlay, { attributes: true });
    }
    
    log.info('All systems ready');
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
} else {
    initAll();
}

if (ENV.isDev) {
    window.__debug = {
        drawer: () => drawer,
        submenuHandler: () => submenuHandler,
        faqAccordion: () => faqAccordion,
        env: ENV
    };
}