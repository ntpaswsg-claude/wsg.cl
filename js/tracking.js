/*
 * Webstorage.cl — Tracking de eventos vía dataLayer (GTM-T9X9MB)
 * ---------------------------------------------------------------
 * ADITIVO. No modifica el formulario, sus validaciones, campos, ni FORM_ENDPOINT.
 * Todos los listeners usan addEventListener y NO usan preventDefault/stopPropagation.
 * Cargar al FINAL de <body>:  <script src="js/tracking.js" defer></script>
 *
 * IMPORTANTE (generate_lead):
 *   Este archivo NO dispara generate_lead automáticamente, porque debe ocurrir
 *   SOLO dentro del success handler real del formulario (tras respuesta OK del
 *   endpoint / al mostrar el mensaje de éxito). Para eso expone:
 *       window.wsgTrackGenerateLead()
 *   Llama esa función desde tu success handler existente (ver README-integracion.md).
 */
(function () {
  'use strict';

  // El snippet de GTM ya inicializa window.dataLayer. Esto es una salvaguarda
  // idempotente por si tracking.js cargara antes que el snippet (no lo duplica).
  window.dataLayer = window.dataLayer || [];

  function push(obj) {
    try {
      window.dataLayer.push(obj);
    } catch (e) {
      /* nunca romper el sitio por tracking */
    }
  }

  // ---------------------------------------------------------------------------
  // CLICKS — delegación de eventos (un solo listener en document)
  // ---------------------------------------------------------------------------
  var COTIZA_TEXTS = [
    'cotiza',
    'cotiza aquí',
    'cotiza aqui',
    'cotiza sin compromiso',
    'enviar cotización',
    'enviar cotizacion'
  ];

  function normText(el) {
    return (el.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
  }

  document.addEventListener(
    'click',
    function (e) {
      var el = e.target && e.target.closest ? e.target.closest('a, button') : null;
      if (!el) return;

      var hrefAttr = el.getAttribute ? el.getAttribute('href') : null;
      var href = hrefAttr || '';
      var hrefLower = href.toLowerCase();
      var text = normText(el);

      // click_whatsapp — href contiene wa.me o whatsapp
      if (hrefLower.indexOf('wa.me') !== -1 || hrefLower.indexOf('whatsapp') !== -1) {
        push({ event: 'click_whatsapp' });
      }

      // click_email — href empieza con mailto:
      if (hrefLower.indexOf('mailto:') === 0) {
        push({ event: 'click_email' });
      }

      // click_izi_demo — href="#izi-storage" o texto contiene "conocer izi storage"
      if (href === '#izi-storage' || text.indexOf('conocer izi storage') !== -1) {
        push({ event: 'click_izi_demo' });
      }

      // click_cotiza — href="#cotizar" O texto exacto de la lista
      if (href === '#cotizar' || COTIZA_TEXTS.indexOf(text) !== -1) {
        push({ event: 'click_cotiza' });
      }
    },
    false // fase de bubbling; aditivo; no interfiere con otros handlers
  );

  // ---------------------------------------------------------------------------
  // VISIBILIDAD DE SECCIONES — IntersectionObserver, una sola vez cada una
  // ---------------------------------------------------------------------------
  function observeOnce(selector, eventName) {
    var node = document.querySelector(selector);
    if (!node || typeof IntersectionObserver === 'undefined') return;

    var fired = false;
    var io = new IntersectionObserver(
      function (entries) {
        for (var i = 0; i < entries.length; i++) {
          if (entries[i].isIntersecting && !fired) {
            fired = true;
            push({ event: eventName });
            io.disconnect();
            break;
          }
        }
      },
      { threshold: 0.3 }
    );
    io.observe(node);
  }

  // ---------------------------------------------------------------------------
  // SCROLL 75% — una sola vez
  // ---------------------------------------------------------------------------
  var scroll75Fired = false;
  function onScroll() {
    if (scroll75Fired) return;
    var doc = document.documentElement;
    var body = document.body;
    var scrollTop = window.pageYOffset || doc.scrollTop || body.scrollTop || 0;
    var winH = window.innerHeight || doc.clientHeight || 0;
    var fullH = Math.max(
      body.scrollHeight, doc.scrollHeight,
      body.offsetHeight, doc.offsetHeight,
      body.clientHeight, doc.clientHeight
    );
    if (fullH <= 0) return;
    var scrolled = (scrollTop + winH) / fullH;
    if (scrolled >= 0.75) {
      scroll75Fired = true;
      push({ event: 'scroll_75' });
      window.removeEventListener('scroll', onScroll);
    }
  }

  // ---------------------------------------------------------------------------
  // generate_lead — expuesto para llamar DESDE el success handler del form
  // ---------------------------------------------------------------------------
  window.wsgTrackGenerateLead = function () {
    push({
      event: 'generate_lead',
      form_name: 'cotizacion_wsg',
      lead_source: 'webstorage_cl',
      page_location: window.location.href
    });
  };

  // ---------------------------------------------------------------------------
  // INIT
  // ---------------------------------------------------------------------------
  function init() {
    observeOnce('#izi-storage', 'view_izi_section');
    observeOnce('#cotizar', 'view_form_section');
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // por si la página ya carga scrolleada / es corta
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
