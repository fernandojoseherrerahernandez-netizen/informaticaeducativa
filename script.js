/**
 * @file script.js
 * @description Lógica central de la Plataforma Educativa (SPA).
 * Gestiona el enrutamiento por hash, animaciones al hacer scroll y la interactividad de la barra lateral.
 * @author Fernando Herrera
 */

document.addEventListener("DOMContentLoaded", () => {
    // Inicialización centralizada de todos los módulos de la aplicación
    App.init();
});

/**
 * Espacio de nombres principal de la aplicación para evitar contaminar el ámbito global.
 */
const App = {
    init() {
        this.initAnimations();
        this.initAccordionMenu();
        this.initSidebarToggle();
        this.initRouter();
    },

    /* =======================================================================
       1. MÓDULO DE ANIMACIONES (Intersection Observer)
       ======================================================================= */
    
    /**
     * Inicializa el observador para revelar elementos a medida que entran en la vista.
     */
    initAnimations() {
        const revealOptions = {
            threshold: 0.15,
            rootMargin: "0px 0px -50px 0px"
        };

        // Guardamos el observador globalmente en App para poder usarlo en el Router
        this.revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('active');
            });
        }, revealOptions);

        this.observeElements();
    },

    /**
     * Busca todos los elementos con la clase '.reveal' y los suscribe al observador.
     */
    observeElements() {
        const revealElements = document.querySelectorAll('.reveal');
        revealElements.forEach(el => {
            this.revealObserver.observe(el);
        });
    },

    /* =======================================================================
       2. MÓDULO DE NAVEGACIÓN Y MENÚ ACORDEÓN
       ======================================================================= */
    
    /**
     * Configura los eventos de clic para los menús desplegables (Grados y Unidades).
     */
    initAccordionMenu() {
        // A. Acordeón Principal (Grados) - Soporte Multi-Grado Optimizado
        const accordionContainers = document.querySelectorAll('.accordion');

        accordionContainers.forEach(container => {
            const accordionBtn = container.querySelector('.accordion-btn');
            const accordionContent = container.querySelector('.accordion-content');

            if (accordionBtn && accordionContent) {
                accordionBtn.addEventListener('click', () => {
                    const isActive = container.classList.toggle('active');
                    
                    if (isActive) {
                        accordionContent.style.maxHeight = `${accordionContent.scrollHeight}px`;
                    } else {
                        accordionContent.style.maxHeight = null;
                        this.closeAllNestedAccordions();
                    }
                });
            }
        });

        // B. Sub-acordeones (Unidades) - Corregido y Adaptado de forma dinámica
        const nestedBtns = document.querySelectorAll('.nested-accordion-btn');
        nestedBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // Evita que el clic cierre el acordeón padre
                
                const parent = btn.parentElement;
                const content = btn.nextElementSibling;
                const isActive = parent.classList.toggle('active');
                
                // Buscamos dinámicamente el contenedor de grado correspondiente para ajustar su altura real
                const mainAccordionContent = btn.closest('.accordion-content');
                
                if (isActive) {
                    content.style.maxHeight = `${content.scrollHeight}px`;
                    // Ajustamos dinámicamente la altura del padre para que no corte el contenido
                    if (mainAccordionContent) {
                        mainAccordionContent.style.maxHeight = `${mainAccordionContent.scrollHeight + content.scrollHeight}px`;
                    }
                } else {
                    if (mainAccordionContent) {
                        mainAccordionContent.style.maxHeight = `${mainAccordionContent.scrollHeight - content.scrollHeight}px`;
                    }
                    content.style.maxHeight = null;
                }
            });
        });
    },

    /**
     * Función auxiliar para cerrar todos los sub-menús cuando se cierra el menú principal.
     */
    closeAllNestedAccordions() {
        document.querySelectorAll('.nested-accordion').forEach(nested => {
            nested.classList.remove('active');
            const content = nested.querySelector('.nested-accordion-content');
            if (content) content.style.maxHeight = null;
        });
    },

    /**
     * Configura el botón para colapsar/expandir la barra lateral en dispositivos móviles/tablets.
     */
    initSidebarToggle() {
        const toggleSidebarBtn = document.getElementById('toggle-sidebar');
        
        // Autocolapsar en pantallas menores a 900px al cargar
        if (window.innerWidth <= 900) {
            document.body.classList.add('sidebar-collapsed');
        }

        if (toggleSidebarBtn) {
            toggleSidebarBtn.addEventListener('click', () => {
                document.body.classList.toggle('sidebar-collapsed');
                const icon = toggleSidebarBtn.querySelector('i');
                
                if (icon) {
                    const isCollapsed = document.body.classList.contains('sidebar-collapsed');
                    icon.className = isCollapsed ? 'ph-bold ph-caret-right' : 'ph-bold ph-list';
                }
            });
        }
    },

    /* =======================================================================
       3. MÓDULO DE ENRUTAMIENTO (SPA HASH ROUTER)
       ======================================================================= */
    
    /**
     * Inicializa el sistema de rutas observando los cambios de Hash en la URL.
     */
    initRouter() {
        const navItems = document.querySelectorAll('.nav-item, .sub-nav-item, .theme-item');
        
        // Actualiza el Hash cuando se hace clic en un elemento del menú
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const targetId = item.getAttribute('data-target');
                if (targetId) window.location.hash = targetId;
            });
        });

        // Escucha el evento nativo del navegador para el cambio de URL
        window.addEventListener('hashchange', () => {
            const currentHash = window.location.hash.substring(1);
            this.switchView(currentHash);
        });

        // Ejecuta la ruta inicial al cargar la página por primera vez
        const initialHash = window.location.hash.substring(1);
        this.switchView(initialHash);
    },

    /**
     * Cambia la vista activa de la aplicación, actualiza la UI y fuerza las animaciones.
     * @param {string} targetId - El ID de la vista a mostrar (ej. 'view-u3-t1')
     */
    switchView(targetId) {
        if (!targetId) targetId = 'view-inicio'; // Ruta por defecto

        this.updateVisibleSection(targetId);
        this.updateActiveMenuState(targetId);
        this.updateDynamicHeader(targetId);
    },

    /**
     * Oculta todas las secciones y muestra solo la sección objetivo.
     * @param {string} targetId 
     */
    updateVisibleSection(targetId) {
        const views = document.querySelectorAll('.view-section');
        views.forEach(view => view.classList.remove('active'));
        
        const targetView = document.getElementById(targetId);
        if (targetView) {
            targetView.classList.add('active');
            
            // Forzamos las animaciones para que los elementos aparezcan de inmediato sin hacer scroll
            const elements = targetView.querySelectorAll('.reveal');
            elements.forEach(el => {
                el.classList.add('active');
                if (this.revealObserver) this.revealObserver.unobserve(el); 
            });

            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    },

    /**
     * Expande dinámicamente los menús necesarios para reflejar dónde está el usuario.
     * @param {string} targetId 
     */
    updateActiveMenuState(targetId) {
        const navItems = document.querySelectorAll('.nav-item, .sub-nav-item, .theme-item');
        navItems.forEach(item => item.classList.remove('active'));
        
        const activeBtn = document.querySelector(`[data-target="${targetId}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
            
            // Expande la Unidad correspondiente
            const nestedAccordion = activeBtn.closest('.nested-accordion');
            if (nestedAccordion) {
                nestedAccordion.classList.add('active');
                const nestedContent = nestedAccordion.querySelector('.nested-accordion-content');
                if (nestedContent) nestedContent.style.maxHeight = `${nestedContent.scrollHeight}px`;
            }
            
            // Expande el Grado correspondiente de manera dinámica utilizando la ubicación del botón activo
            const accordionContainer = activeBtn.closest('.accordion');
            if (accordionContainer) {
                accordionContainer.classList.add('active');
                const accordionContent = accordionContainer.querySelector('.accordion-content');
                if (accordionContent) {
                    accordionContent.style.maxHeight = `${accordionContent.scrollHeight}px`;
                }
            }
        }
    },

    /**
     * Actualiza la barra de navegación superior (Perfil del docente vs Etiqueta de Unidad).
     * @param {string} targetId 
     */
    updateDynamicHeader(targetId) {
        const headerTeacher = document.getElementById('header-teacher-info');
        const headerUnit = document.getElementById('header-unit-info');
        const unitText = document.getElementById('unit-text');

        if (targetId === 'view-inicio') {
            if (headerTeacher) headerTeacher.style.display = 'flex';
            if (headerUnit) headerUnit.style.display = 'none';
        } else {
            if (headerTeacher) headerTeacher.style.display = 'none';
            if (headerUnit) {
                headerUnit.style.display = 'flex';
                if (unitText) {
                    // Extrae el número de la unidad usando Expresiones Regulares (Regex)
                    const match = targetId.match(/u(\d+)/);
                    unitText.textContent = match ? `UNIDAD ${match[1]}` : "CONTENIDO";
                }
            }
        }
    }
};
