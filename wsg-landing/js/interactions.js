/* =========================================================
 * interactions.js
 * Interacciones UI del sitio WSG.cl:
 *  - Estado scrolled de la navegación.
 *  - Menú móvil (toggle).
 *  - Cierre de menú móvil al hacer click en un link.
 *  - Reveals progresivos con IntersectionObserver.
 *  - FAQ acordeón: abrir uno cierra los demás.
 *  - Año dinámico en el footer.
 * ========================================================= */

(function () {
  "use strict";

  /* ------------------------------------------------------
   * Nav: estado "scrolled" + menú móvil
   * ------------------------------------------------------ */
  const nav = document.getElementById("nav");
  const navToggle = document.getElementById("nav-toggle");

  function onScrollNav() {
    if (!nav) return;
    if (window.scrollY > 12) {
      nav.classList.add("is-scrolled");
    } else {
      nav.classList.remove("is-scrolled");
    }
  }
  window.addEventListener("scroll", onScrollNav, { passive: true });
  onScrollNav();

  if (navToggle && nav) {
    navToggle.addEventListener("click", function () {
      const isOpen = nav.classList.toggle("is-mobile-open");
      navToggle.classList.toggle("is-open", isOpen);
      navToggle.setAttribute("aria-expanded", String(isOpen));
      navToggle.setAttribute(
        "aria-label",
        isOpen ? "Cerrar menú" : "Abrir menú"
      );
    });

    // Cerrar al hacer click en cualquier link interno del menú
    nav.querySelectorAll(".nav__links a").forEach(function (link) {
      link.addEventListener("click", function () {
        if (nav.classList.contains("is-mobile-open")) {
          nav.classList.remove("is-mobile-open");
          navToggle.classList.remove("is-open");
          navToggle.setAttribute("aria-expanded", "false");
          navToggle.setAttribute("aria-label", "Abrir menú");
        }
      });
    });
  }

  /* ------------------------------------------------------
   * Reveals con IntersectionObserver
   * ------------------------------------------------------ */
  const revealEls = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window && revealEls.length) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    revealEls.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    // Fallback: mostrar todo si no hay soporte
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* ------------------------------------------------------
   * FAQ acordeón exclusivo (abrir uno cierra otros)
   * ------------------------------------------------------ */
  const faqItems = document.querySelectorAll(".faq .faq__item");
  faqItems.forEach(function (item) {
    item.addEventListener("toggle", function () {
      if (item.open) {
        faqItems.forEach(function (other) {
          if (other !== item && other.open) {
            other.open = false;
          }
        });
      }
    });
  });

  /* ------------------------------------------------------
   * Año dinámico en footer
   * ------------------------------------------------------ */
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
})();
