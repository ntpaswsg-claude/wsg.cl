# Integración GTM + eventos de conversión — webstorage.cl

> **Estado:** el `index.html` del sitio **no está en este repositorio** (`ntpaswsg-claude/wsg.cl` solo tiene `README.md` en `main`). Por eso entrego este **paquete drop-in** para pegar en tu `index.html` real, sin tocar nada de tu formulario. Cuando me des acceso al `index.html` (pegándolo o agregando el repo correcto), lo dejo cableado y validado por ti.

Respeta todas las reglas: **no** toca `FORM_ENDPOINT`, ni la lógica de envío, ni validaciones, ni campos, ni estilos, ni textos. Todo es **aditivo**.

---

## PASO 1 · Snippet GTM en `<head>` (lo más arriba posible)

Pega esto **inmediatamente después de `<head>`**, antes de cualquier otro `<script>`:

```html
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-T9X9MB');</script>
<!-- End Google Tag Manager -->
```

## PASO 2 · Snippet noscript tras `<body>`

Pega esto **inmediatamente después de `<body>`**:

```html
<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-T9X9MB"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->
```

> Si hay más de una página HTML, repite PASO 1 y PASO 2 en TODAS.
> **No** instales gtag.js ni ningún `G-XXXX`. GA4 se conecta dentro de GTM.

## PASO 3 · Cargar `tracking.js` al final de `<body>`

Justo **antes de cerrar `</body>`**:

```html
<script src="js/tracking.js" defer></script>
```

(Ajusta la ruta si tu JS vive en otra carpeta.)

## PASO 4 · Disparar `generate_lead` SOLO en el éxito real del envío

`tracking.js` **no** dispara `generate_lead` solo; expone `window.wsgTrackGenerateLead()`.
Llámala **dentro de tu success handler existente**, después de que `FORM_ENDPOINT`
responda OK / se muestre el mensaje de éxito. **No** en el submit, **no** antes de la
respuesta, **no** en error.

Tu código probablemente se ve así (ejemplo típico de envío a Apps Script):

```js
fetch(FORM_ENDPOINT, { method: 'POST', body: data })
  .then(function (res) { return res.json(); }) // o res.text()
  .then(function (result) {
    // ✅ AQUÍ, en el punto donde YA confirmas éxito y muestras el mensaje:
    if (window.wsgTrackGenerateLead) window.wsgTrackGenerateLead();

    // ...tu código existente que muestra "¡Gracias!" / limpia el form...
  })
  .catch(function (err) {
    // ❌ NO llamar aquí. Es el path de error.
  });
```

Si tu éxito se detecta de otra forma (p. ej. mostrando un `<div class="success">`),
pon la llamada **exactamente en esa línea** donde confirmas el éxito. Alternativa
inline equivalente (si prefieres el push literal en vez de la función):

```js
window.dataLayer.push({
  event: 'generate_lead',
  form_name: 'cotizacion_wsg',
  lead_source: 'webstorage_cl',
  page_location: window.location.href
});
```

---

## Eventos implementados en `tracking.js`

| Evento | Disparo |
|--------|---------|
| `click_cotiza` | click en `href="#cotizar"` o texto = Cotiza / Cotiza aquí / Cotiza sin compromiso / Enviar cotización |
| `click_whatsapp` | click en enlace con `wa.me` o `whatsapp` en el href |
| `click_email` | click en enlace `href^="mailto:"` |
| `click_izi_demo` | click en `href="#izi-storage"` o texto contiene "Conocer IZI Storage" |
| `view_izi_section` | `#izi-storage` entra al viewport (IO, threshold 0.3), una vez |
| `view_form_section` | `#cotizar` entra al viewport (IO, threshold 0.3), una vez |
| `scroll_75` | scroll llega al 75% del alto total, una sola vez |
| `generate_lead` | manual, vía `window.wsgTrackGenerateLead()` en el success handler |

Detalles de diseño:
- Delegación de clicks: un único listener en `document` (bubbling), usa `closest('a, button')`.
- Sin `preventDefault` / `stopPropagation`: los enlaces (WhatsApp, mailto, anclas) siguen funcionando igual.
- IntersectionObserver se `disconnect()` tras el primer disparo → una sola vez garantizada.
- `scroll_75` con bandera booleana + `removeEventListener` tras disparar.
- Todo envuelto en try/catch: el tracking nunca puede romper el sitio.

---

## PASO 5 · Validación

1. **Consola limpia:** abre el sitio, DevTools → Console: sin errores nuevos.
2. **GTM cargado:** instala *Tag Assistant* (o extensión GTM/GA Debug) → debe detectar `GTM-T9X9MB`.
3. **Formulario intacto:** haz un **envío de prueba** → confirma que el lead llega a tu Google Sheet como siempre.
4. **Eventos en dataLayer:** en GTM → **Preview** (Tag Assistant), navega el sitio y verifica que aparecen en el resumen de eventos:
   - `click_cotiza`, `click_whatsapp`, `click_email`, `click_izi_demo`
   - `view_izi_section`, `view_form_section` (una vez)
   - `scroll_75` (una sola vez aunque sigas scrolleando)
   - `generate_lead` (solo tras un envío exitoso; NO en error)
5. **Sanity dataLayer:** en Console puedes inspeccionar `window.dataLayer` y ver los pushes.

### Probar en GTM Preview
- GTM → botón **Preview** → ingresa `https://webstorage.cl` → se abre Tag Assistant conectado.
- Interactúa (clicks, scroll, envío de prueba) y revisa la columna de eventos: cada acción debe listar su evento.
- Publica el contenedor solo cuando los triggers estén configurados en GTM.

### Revisar GA4 (una vez armado el puente GTM → GA4)
- **Realtime:** GA4 → *Informes* → *Tiempo real*: deberías ver usuarios y los eventos entrando.
- **DebugView:** activa el modo debug (extensión *GA Debugger* o el propio Preview de GTM lo habilita) → GA4 → *Administrar* → *DebugView*: verás cada evento (`click_cotiza`, `generate_lead`, etc.) en tiempo real con sus parámetros (`form_name`, `lead_source`, `page_location`).
- En GTM, crea las etiquetas GA4 (Event) que escuchen estos triggers de dataLayer y manda `generate_lead` como conversión.

> Recuerda: **no** configurar Google Ads todavía. Primero medición funcionando y validada.
