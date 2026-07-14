/* =========================================================
 * forms.js
 * Validación y envío del formulario de cotización de WSG.cl.
 *
 * Modo de operación:
 *  - Si FORM_ENDPOINT está vacío  → modo mock (simula envío).
 *  - Si FORM_ENDPOINT tiene URL   → envío real vía fetch POST
 *    al endpoint de Google Apps Script (JSON).
 *
 * En ningún caso recarga la página: siempre maneja submit
 * con event.preventDefault() y muestra el resultado en un
 * toast + feedback inline.
 * ========================================================= */

(function () {
  "use strict";

  // ┌─────────────────────────────────────────────────────────────────┐
  // │  CONFIGURACIÓN — pega aquí la URL de tu Google Apps Script      │
  // │  Ejemplo: https://script.google.com/macros/s/XXXXX/exec         │
  // └─────────────────────────────────────────────────────────────────┘
  const FORM_ENDPOINT = "https://script.google.com/macros/s/AKfycbwhy6aQgXUkikdOdhGdV8sHjZ2Fx0cHMWkbgGTfx0ETYLiO1PSzcWV1JU6IcVMU0eGATA/exec";

  /* ------------------------------------------------------
   * Referencias DOM
   * ------------------------------------------------------ */
  const form = document.getElementById("quote-form");
  const feedback = document.getElementById("form-feedback");
  const toastEl = document.getElementById("toast");
  if (!form || !feedback) return;

  /* ------------------------------------------------------
   * Validación
   * ------------------------------------------------------ */
  const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const PHONE_RX = /^[+\d\s().-]{6,}$/;

  function setError(name, message) {
    const field = form.querySelector('[name="' + name + '"]');
    const errorEl = form.querySelector('[data-error-for="' + name + '"]');
    if (field && field.parentElement) {
      field.parentElement.classList.add("is-invalid");
    }
    if (errorEl) errorEl.textContent = message || "";
  }

  function clearError(name) {
    const field = form.querySelector('[name="' + name + '"]');
    const errorEl = form.querySelector('[data-error-for="' + name + '"]');
    if (field && field.parentElement) {
      field.parentElement.classList.remove("is-invalid");
    }
    if (errorEl) errorEl.textContent = "";
  }

  const ALL_FIELDS = [
    "nombre",
    "empresa",
    "correo",
    "whatsapp",
    "sitio_web_instagram",
    "plataforma_venta",
    "cantidad_sku",
    "pedidos_mensuales",
    "tipo_productos",
    "necesidad_logistica",
    "privacidad",
  ];

  function clearAllErrors() {
    ALL_FIELDS.forEach(clearError);
  }

  function validate(data) {
    let ok = true;

    if (!data.nombre || data.nombre.trim().length < 2) {
      setError("nombre", "Ingresa tu nombre.");
      ok = false;
    }
    if (!data.empresa || data.empresa.trim().length < 2) {
      setError("empresa", "Ingresa el nombre de tu empresa.");
      ok = false;
    }
    if (!data.correo || !EMAIL_RX.test(data.correo.trim())) {
      setError("correo", "Ingresa un correo válido.");
      ok = false;
    }
    if (!data.whatsapp || !PHONE_RX.test(data.whatsapp.trim())) {
      setError("whatsapp", "Ingresa un WhatsApp de contacto.");
      ok = false;
    }
    if (!data.pedidos_mensuales) {
      setError("pedidos_mensuales", "Selecciona un rango de pedidos.");
      ok = false;
    }
    if (!data.privacidad) {
      setError("privacidad", "Debes aceptar para poder contactarte.");
      ok = false;
    }
    return ok;
  }

  /* ------------------------------------------------------
   * Construcción del payload (campos exactos esperados
   * por el script de Google Apps Script)
   * ------------------------------------------------------ */
  function buildPayload() {
    return {
      nombre: (form.nombre && form.nombre.value || "").trim(),
      empresa: (form.empresa && form.empresa.value || "").trim(),
      correo: (form.correo && form.correo.value || "").trim(),
      whatsapp: (form.whatsapp && form.whatsapp.value || "").trim(),
      sitio_web_instagram: (form.sitio_web_instagram && form.sitio_web_instagram.value || "").trim(),
      plataforma_venta: (form.plataforma_venta && form.plataforma_venta.value || "").trim(),
      cantidad_sku: (form.cantidad_sku && form.cantidad_sku.value || "").trim(),
      pedidos_mensuales: (form.pedidos_mensuales && form.pedidos_mensuales.value || "").trim(),
      tipo_productos: (form.tipo_productos && form.tipo_productos.value || "").trim(),
      necesidad_logistica: (form.necesidad_logistica && form.necesidad_logistica.value || "").trim(),
      fecha_envio: new Date().toISOString(),
      origen_formulario: "wsg-landing",
      pagina: window.location.href,
    };
  }

  /* ------------------------------------------------------
   * Envío: real (fetch) o mock según FORM_ENDPOINT
   * ------------------------------------------------------ */
  function submitForm(payload) {
    if (!FORM_ENDPOINT) {
      // Modo mock: simula latencia y resuelve OK
      return new Promise(function (resolve) {
        setTimeout(function () {
          resolve({ ok: true, mock: true });
        }, 700);
      });
    }

    // Modo real: POST JSON al endpoint de Google Apps Script
    return fetch(FORM_ENDPOINT, {
      method: "POST",
      // GAS web apps no aceptan preflight CORS personalizado: con
      // text/plain el navegador no dispara OPTIONS y GAS recibe el
      // body completo en e.postData.contents.
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
      redirect: "follow",
    })
      .then(function (res) {
        return { ok: res.ok, mock: false, status: res.status };
      })
      .catch(function () {
        return { ok: false, mock: false, error: true };
      });
  }

  /* ------------------------------------------------------
   * UI: feedback inline + toast
   * ------------------------------------------------------ */
  function showFeedback(type, message) {
    feedback.className = "form__feedback";
    feedback.classList.add(type === "success" ? "is-success" : "is-error");
    feedback.textContent = message;
  }

  let toastTimer = null;
  function showToast(type, message) {
    if (!toastEl) return;
    toastEl.className = "toast toast--" + (type === "success" ? "success" : "error");
    toastEl.textContent = message;
    // Reflow para reiniciar transición si el toast ya estaba visible
    void toastEl.offsetWidth;
    toastEl.classList.add("is-visible");

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-visible");
    }, 5000);
  }

  /* ------------------------------------------------------
   * Mensajes (centralizados para mantenibilidad)
   * ------------------------------------------------------ */
  const MSG = {
    mockToast:
      "Formulario recibido (modo prueba). Configura FORM_ENDPOINT para activar el envío real.",
    successToast: "Solicitud recibida. El equipo de WSG te contactará pronto.",
    errorToast:
      "Hubo un problema al enviar. Por favor intenta de nuevo o escríbenos por WhatsApp.",
    inlineSuccess:
      "¡Gracias! Recibimos tu solicitud. Te contactaremos en menos de 24 horas hábiles.",
    inlineError:
      "No pudimos enviar tu cotización. Inténtalo nuevamente o escríbenos por WhatsApp.",
    inlineValidation: "Revisa los campos marcados antes de enviar.",
  };

  /* ------------------------------------------------------
   * Submit listener (nunca recarga la página)
   * ------------------------------------------------------ */
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    clearAllErrors();
    feedback.className = "form__feedback";
    feedback.textContent = "";

    const payload = buildPayload();
    // El payload reusa los nombres exactos esperados por el backend;
    // la validación trabaja sobre el mismo objeto.
    const data = Object.assign({}, payload, {
      privacidad: form.privacidad ? form.privacidad.checked : false,
    });

    if (!validate(data)) {
      showFeedback("error", MSG.inlineValidation);
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn ? submitBtn.textContent : "";
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Enviando...";
    }

    submitForm(payload)
      .then(function (res) {
        if (res && res.ok) {
          if (res.mock) {
            showFeedback("success", MSG.inlineSuccess);
            showToast("success", MSG.mockToast);
          } else {
            showFeedback("success", MSG.inlineSuccess);
            showToast("success", MSG.successToast);
          }
          form.reset();
          // Tracking ADITIVO: envío confirmado como exitoso. Único punto
          // donde se dispara generate_lead (definido en tracking.js).
          if (window.wsgTrackGenerateLead) window.wsgTrackGenerateLead();
        } else {
          showFeedback("error", MSG.inlineError);
          showToast("error", MSG.errorToast);
        }
      })
      .catch(function () {
        showFeedback("error", MSG.inlineError);
        showToast("error", MSG.errorToast);
      })
      .finally(function () {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        }
      });
  });

  /* ------------------------------------------------------
   * Limpiar errores al volver a tocar un campo
   * ------------------------------------------------------ */
  ALL_FIELDS.forEach(function (name) {
    const field = form.querySelector('[name="' + name + '"]');
    if (!field) return;
    field.addEventListener("input", function () { clearError(name); });
    field.addEventListener("change", function () { clearError(name); });
  });
})();
