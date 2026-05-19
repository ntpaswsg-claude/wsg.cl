/* =========================================================
 * forms.js
 * Validación y manejo del formulario de cotización de WSG.cl.
 * Como el sitio es estático, este script no envía datos a un
 * backend: valida los campos y muestra un mensaje de éxito
 * simulado. Para conectarlo a un servicio real (Formspree,
 * Google Forms, Apps Script, API propia, etc.) basta con
 * reemplazar el bloque `submitForm` por una llamada `fetch`.
 * ========================================================= */

(function () {
  "use strict";

  const form = document.getElementById("quote-form");
  const feedback = document.getElementById("form-feedback");
  if (!form || !feedback) return;

  const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const PHONE_RX = /^[+\d\s().-]{6,}$/;

  /* ------------------------------------------------------
   * Helpers de error por campo
   * ------------------------------------------------------ */
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

  function clearAllErrors() {
    [
      "nombre",
      "empresa",
      "email",
      "telefono",
      "volumen",
      "privacidad",
    ].forEach(clearError);
  }

  /* ------------------------------------------------------
   * Validación
   * ------------------------------------------------------ */
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

    if (!data.email || !EMAIL_RX.test(data.email.trim())) {
      setError("email", "Ingresa un email válido.");
      ok = false;
    }

    if (data.telefono && !PHONE_RX.test(data.telefono.trim())) {
      setError("telefono", "Ingresa un teléfono válido.");
      ok = false;
    }

    if (!data.volumen) {
      setError("volumen", "Selecciona un volumen estimado.");
      ok = false;
    }

    if (!data.privacidad) {
      setError("privacidad", "Debes aceptar para poder contactarte.");
      ok = false;
    }

    return ok;
  }

  /* ------------------------------------------------------
   * Submit (sin backend real)
   * Para conectar a un backend real reemplazar el cuerpo
   * de esta función por una llamada `fetch` al endpoint.
   * ------------------------------------------------------ */
  // Log de depuración solo si se accede con ?debug=1 en la URL.
  const DEBUG = /[?&]debug=1\b/.test(window.location.search);

  function submitForm(data) {
    return new Promise(function (resolve) {
      setTimeout(function () {
        if (DEBUG) {
          try { console.info("[WSG.cl] cotización (sin backend):", data); }
          catch (e) { /* noop */ }
        }
        resolve({ ok: true });
      }, 700);
    });
  }

  function showFeedback(type, message) {
    feedback.className = "form__feedback";
    feedback.classList.add(type === "success" ? "is-success" : "is-error");
    feedback.textContent = message;
  }

  /* ------------------------------------------------------
   * Toast de confirmación / error
   * ------------------------------------------------------ */
  const toastEl = document.getElementById("toast");
  let toastTimer = null;

  function showToast(type, message) {
    if (!toastEl) return;
    toastEl.className = "toast toast--" + (type === "success" ? "success" : "error");
    toastEl.textContent = message;
    // Forzar reflow para que la transición se dispare aun en envíos seguidos
    void toastEl.offsetWidth;
    toastEl.classList.add("is-visible");

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-visible");
    }, 4500);
  }

  /* ------------------------------------------------------
   * Listeners
   * ------------------------------------------------------ */
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    clearAllErrors();
    feedback.className = "form__feedback";
    feedback.textContent = "";

    const data = {
      nombre: form.nombre.value,
      empresa: form.empresa.value,
      email: form.email.value,
      telefono: form.telefono.value,
      volumen: form.volumen.value,
      mensaje: form.mensaje.value,
      privacidad: form.privacidad.checked,
    };

    if (!validate(data)) {
      showFeedback(
        "error",
        "Revisa los campos marcados antes de enviar."
      );
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn ? submitBtn.textContent : "";
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Enviando...";
    }

    submitForm(data)
      .then(function (res) {
        if (res && res.ok) {
          const successMsg =
            "¡Gracias! Recibimos tu solicitud. Te contactaremos en menos de 24 horas hábiles.";
          showFeedback("success", successMsg);
          showToast("success", "Cotización enviada · te contactaremos pronto");
          form.reset();
        } else {
          const errorMsg =
            "No pudimos enviar tu cotización. Inténtalo nuevamente o escríbenos a contacto@wsg.cl";
          showFeedback("error", errorMsg);
          showToast("error", "No pudimos enviar tu cotización");
        }
      })
      .catch(function () {
        const errorMsg =
          "No pudimos enviar tu cotización. Inténtalo nuevamente o escríbenos a contacto@wsg.cl";
        showFeedback("error", errorMsg);
        showToast("error", "No pudimos enviar tu cotización");
      })
      .finally(function () {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        }
      });
  });

  // Limpiar error al volver a tocar el campo
  ["nombre", "empresa", "email", "telefono", "volumen", "privacidad"].forEach(
    function (name) {
      const field = form.querySelector('[name="' + name + '"]');
      if (!field) return;
      field.addEventListener("input", function () {
        clearError(name);
      });
      field.addEventListener("change", function () {
        clearError(name);
      });
    }
  );
})();
