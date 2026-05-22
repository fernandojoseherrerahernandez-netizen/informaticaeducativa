document.addEventListener("DOMContentLoaded", function() {
    
    /* ---------------------------------------------------\
       1. Animaciones de Revelación (Intersection Observer)
       --------------------------------------------------- */
    const revealOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealOnScroll = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('active');
        });
    }, revealOptions);

    function initRevealAnimations() {
        const revealElements = document.querySelectorAll('.reveal');
        revealElements.forEach(el => {
            revealOnScroll.observe(el);
        });
    }

    initRevealAnimations();


    /* ---------------------------------------------------\
       2. Menú Desplegable (Acordeones Anidados)
       --------------------------------------------------- */
    const accordionBtn = document.querySelector('.accordion-btn');
    const accordionContent = document.querySelector('.accordion-content');
    const accordionContainer = document.querySelector('.accordion');

    if (accordionBtn && accordionContent && accordionContainer) {
        accordionBtn.addEventListener('click', function() {
            accordionContainer.classList.toggle('active');
            if (accordionContainer.classList.contains('active')) {
                accordionContent.style.maxHeight = accordionContent.scrollHeight + "px";
            } else {
                accordionContent.style.maxHeight = null;
                document.querySelectorAll('.nested-accordion').forEach(nested => {
                    nested.classList.remove('active');
                    const content = nested.querySelector('.nested-accordion-content');
                    if (content) content.style.maxHeight = null;
                });
            }
        });
    }

    document.querySelectorAll('.nested-accordion-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const parent = this.parentElement;
            const content = this.nextElementSibling;
            
            parent.classList.toggle('active');
            
            if (parent.classList.contains('active')) {
                content.style.maxHeight = content.scrollHeight + "px";
                if (accordionContent) {
                    accordionContent.style.maxHeight = (accordionContent.scrollHeight + content.scrollHeight) + "px";
                }
            } else {
                content.style.maxHeight = null;
            }
        });
    });


    /* ---------------------------------------------------\
       3. Sistema de Rutas por URL Hash (Deep Linking SPA)
       --------------------------------------------------- */
    const navItems = document.querySelectorAll('.nav-item, .sub-nav-item, .theme-item');
    const views = document.querySelectorAll('.view-section');
    const headerTeacher = document.getElementById('header-teacher-info');
    const headerUnit = document.getElementById('header-unit-info');
    const unitText = document.getElementById('unit-text');

    function switchView(targetId) {
        // Si no hay id en la URL, por defecto va al inicio
        if (!targetId) targetId = 'view-inicio';

        // A. Activar la sección física en pantalla
        views.forEach(view => view.classList.remove('active'));
        const targetView = document.getElementById(targetId);
        
        if (targetView) {
            targetView.classList.add('active');
            
            // Forzar activación instantánea de las animaciones visuales
            const elements = targetView.querySelectorAll('.reveal');
            elements.forEach(el => {
                el.classList.add('active');
                revealOnScroll.unobserve(el); 
            });

            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // B. Actualizar visualmente el menú lateral y desplegar contenedores si es necesario
        navItems.forEach(item => item.classList.remove('active'));
        const activeBtn = document.querySelector(`[data-target="${targetId}"]`);
        
        if (activeBtn) {
            activeBtn.classList.add('active');
            
            // Si es un tema dentro de una unidad, expande el sub-acordeón automáticamente
            const nestedAccordion = activeBtn.closest('.nested-accordion');
            if (nestedAccordion) {
                nestedAccordion.classList.add('active');
                const nestedContent = nestedAccordion.querySelector('.nested-accordion-content');
                if (nestedContent) nestedContent.style.maxHeight = nestedContent.scrollHeight + "px";
            }
            
            // También expande el acordeón principal de Grados
            if (accordionContainer && accordionContent) {
                accordionContainer.classList.add('active');
                accordionContent.style.maxHeight = accordionContent.scrollHeight + "px";
            }
        }

        // C. Cambiar dinámicamente las etiquetas del Navbar superior
        if (targetId === 'view-inicio') {
            if (headerTeacher) headerTeacher.style.display = 'flex';
            if (headerUnit) headerUnit.style.display = 'none';
        } else {
            if (headerTeacher) headerTeacher.style.display = 'none';
            if (headerUnit) {
                headerUnit.style.display = 'flex';
                if (unitText) {
                    // Detecta automáticamente el número de unidad mediante el ID (ej: view-u3-t1 -> UNIDAD 3)
                    const match = targetId.match(/u(\d+)/);
                    unitText.textContent = match ? `UNIDAD ${match[1]}` : "CONTENIDO";
                }
            }
        }
    }

    // Al hacer clic en el menú, en lugar de cambiar la vista directamente, cambiamos el hash de la URL
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            const targetId = this.getAttribute('data-target');
            if (targetId) {
                window.location.hash = targetId;
            }
        });
    });

    // Detectar cuando cambia el Hash (por ejemplo, si el usuario navega atrás/adelante)
    window.addEventListener('hashchange', function() {
        const currentHash = window.location.hash.substring(1);
        switchView(currentHash);
    });

    // Carga Inicial: Lee la URL al abrir el sitio por primera vez para ver si trae un enlace compartido
    const initialHash = window.location.hash.substring(1);
    switchView(initialHash);


    /* ---------------------------------------------------\
       4. Control de la Barra Lateral (Sidebar Toggle)
       --------------------------------------------------- */
    const toggleSidebarBtn = document.getElementById('toggle-sidebar');
    if (window.innerWidth <= 900) document.body.classList.add('sidebar-collapsed');

    if (toggleSidebarBtn) {
        toggleSidebarBtn.addEventListener('click', function() {
            document.body.classList.toggle('sidebar-collapsed');
            const icon = toggleSidebarBtn.querySelector('i');
            if (icon) icon.className = document.body.classList.contains('sidebar-collapsed') 
                ? 'ph-bold ph-caret-right' : 'ph-bold ph-list';
        });
    }
});