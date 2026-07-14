# Puente GTM → GA4 · Contenedor GTM-T9X9MB (webstorage.cl / WSG)

> Todo se configura **dentro de GTM y GA4**. No se toca el sitio, ni gtag.js, ni Google Ads.
> El sitio ya empuja los eventos al `dataLayer` (ver `wsg-landing/js/tracking.js`), **enriquecidos con parámetros**.

## Estado de los parámetros
✅ **`link_url` y `cta_text` ya están disponibles en el `dataLayer`** para los eventos de clic (`tracking.js` ya está enriquecido). No requieren ningún cambio adicional en el sitio.
- `page_location`: viaja en el dataLayer de cada evento **y** GA4 lo recolecta automáticamente.

---

## 0) PRE-FLIGHT — Confirmar el Measurement ID (un solo ID)

1. **En GTM** (`GTM-T9X9MB`) → **Etiquetas (Tags)**: busca una etiqueta tipo **"Google tag"** (o antigua "Configuración de GA4"). Ábrela y anota su **Tag ID / Measurement ID** (formato `G-XXXXXXXXXX`).
   - Si NO existe ninguna Google tag → hay que crearla (paso 2 del bloque C).
2. **En GA4** → **Administrar (⚙)** → **Flujos de datos (Data streams)** → abre el **flujo web de webstorage.cl** → arriba a la derecha verás el **Measurement ID** `G-XXXXXXXXXX`.
3. **Compara**: el ID de la Google tag en GTM debe ser **idéntico** al del flujo web de GA4.
4. **Regla:** usar **un solo Measurement ID**. Si en GTM aparece uno distinto al del stream, corrige la Google tag para que use el del stream de GA4. No crear un segundo Google tag.

> Cuando lo confirmes, pásame el `G-XXXXXXXXXX` para dejar todo cerrado. Igual la guía funciona tal cual.

---

## Tabla de eventos y parámetros (ya enviados al dataLayer)

| Evento | Tipo | Parámetros que envía |
|---|---|---|
| `generate_lead` | Conversión principal | `form_name`, `lead_source`, `page_location` |
| `click_whatsapp` | Conversión secundaria / contacto | `link_url`, `cta_text`, `page_location` |
| `click_email` | Conversión secundaria / contacto | `link_url`, `cta_text`, `page_location` |
| `click_cotiza` | Microconversión | `link_url`, `cta_text`, `page_location` |
| `click_izi_demo` | Microconversión / interés IZI | `link_url`, `cta_text`, `page_location` |
| `view_izi_section` | Engagement | `page_location` (auto GA4) |
| `view_form_section` | Engagement | `page_location` (auto GA4) |
| `scroll_75` | Engagement | `page_location` (auto GA4) |

> En `click_cotiza` / `click_izi_demo`, `link_url` puede venir `null` cuando el elemento es un `<button>` sin href (p. ej. "Enviar cotización"). Es esperado.

---

## A) VARIABLES (Variables → Definidas por el usuario → Nueva)

**A1. Constante (fuente única de verdad del ID)**
- Nombre: `CONST - GA4 Measurement ID`
- Tipo: **Constante**
- Valor: `G-XXXXXXXXXX`  ← el confirmado en el paso 0

**A2. Variables de capa de datos** (Tipo: **Variable de capa de datos**)
| Nombre en GTM | Data Layer Variable Name | Data Layer Version |
|---|---|---|
| `DLV - link_url` | `link_url` | Version 2 |
| `DLV - cta_text` | `cta_text` | Version 2 |
| `DLV - page_location` | `page_location` | Version 2 |
| `DLV - form_name` | `form_name` | Version 2 |
| `DLV - lead_source` | `lead_source` | Version 2 |

---

## B) TRIGGERS (Activadores → Nuevo → Evento personalizado)

Para cada uno: Tipo **Evento personalizado**, "Se activa en **Todos los eventos personalizados**", **Nombre del evento** EXACTO (case-sensitive):

| Trigger (nómbralo así) | Nombre del evento (campo) |
|---|---|
| `CE_generate_lead` | `generate_lead` |
| `CE_click_whatsapp` | `click_whatsapp` |
| `CE_click_email` | `click_email` |
| `CE_click_cotiza` | `click_cotiza` |
| `CE_click_izi_demo` | `click_izi_demo` |
| `CE_view_izi_section` | `view_izi_section` |
| `CE_view_form_section` | `view_form_section` |
| `CE_scroll_75` | `scroll_75` |

> `scroll_75` se dispara una sola vez porque el sitio lo empuja una sola vez (bandera booleana en tracking.js). No necesitas límite adicional en el trigger.

---

## C) TAGS

**C1. (Base) Google tag — solo si no existe ya**
- Tipo: **Google tag**
- Tag ID: `{{CONST - GA4 Measurement ID}}`
- Activador: **Initialization - All Pages** (o All Pages)
> Si ya existe una Google tag con el ID correcto en All Pages, NO crees otra. Reúsala.

**C2. Ocho tags GA4 Event** (Tipo: **Google Analytics: evento de GA4**)
En cada una:
- **Measurement ID / Google tag**: selecciona la Google tag existente, o pon `{{CONST - GA4 Measurement ID}}`.
- **Nombre del evento**: el string exacto.
- **Parámetros del evento**: los de la tabla.
- **Activación**: el trigger correspondiente.

| Tag | Nombre de evento | Parámetros del evento | Trigger |
|---|---|---|---|
| `GA4 Event - generate_lead` | `generate_lead` | `form_name` = `{{DLV - form_name}}` · `lead_source` = `{{DLV - lead_source}}` · `page_location` = `{{DLV - page_location}}` | `CE_generate_lead` |
| `GA4 Event - click_whatsapp` | `click_whatsapp` | `link_url` = `{{DLV - link_url}}` · `cta_text` = `{{DLV - cta_text}}` · `page_location` = `{{DLV - page_location}}` | `CE_click_whatsapp` |
| `GA4 Event - click_email` | `click_email` | `link_url` = `{{DLV - link_url}}` · `cta_text` = `{{DLV - cta_text}}` · `page_location` = `{{DLV - page_location}}` | `CE_click_email` |
| `GA4 Event - click_cotiza` | `click_cotiza` | `link_url` = `{{DLV - link_url}}` · `cta_text` = `{{DLV - cta_text}}` · `page_location` = `{{DLV - page_location}}` | `CE_click_cotiza` |
| `GA4 Event - click_izi_demo` | `click_izi_demo` | `link_url` = `{{DLV - link_url}}` · `cta_text` = `{{DLV - cta_text}}` · `page_location` = `{{DLV - page_location}}` | `CE_click_izi_demo` |
| `GA4 Event - view_izi_section` | `view_izi_section` | `page_location` = `{{DLV - page_location}}` | `CE_view_izi_section` |
| `GA4 Event - view_form_section` | `view_form_section` | `page_location` = `{{DLV - page_location}}` | `CE_view_form_section` |
| `GA4 Event - scroll_75` | `scroll_75` | `page_location` = `{{DLV - page_location}}` | `CE_scroll_75` |

---

## D) VALIDACIÓN EN GTM PREVIEW

1. GTM → **Vista previa (Preview)** → URL: `https://webstorage.cl` (o `https://ntpaswsg-claude.github.io/wsg.cl/wsg-landing/index.html`).
2. Se abre **Tag Assistant**. Interactúa en el sitio y verifica en la **columna izquierda (Summary)** que aparecen los eventos: `click_cotiza`, `click_whatsapp`, `click_email`, `click_izi_demo`, `view_izi_section`, `view_form_section`, `scroll_75`.
3. Al seleccionar cada evento, en **"Tags Fired"** debe aparecer su `GA4 Event - ...` correspondiente, y en el detalle del evento (o en las variables) los valores de `link_url`, `cta_text` y `page_location`.
4. **generate_lead**: haz un **envío real y exitoso** del formulario → debe aparecer `generate_lead` con su `GA4 Event - generate_lead` disparada. Verifica que **NO** aparece al enviar con errores de validación ni en un envío fallido.
5. **scroll_75**: baja hasta el 75% → aparece **una sola vez** (aunque sigas scrolleando).

---

## E) VALIDACIÓN EN GA4

- **Realtime (Tiempo real):** GA4 → Informes → Tiempo real → usuarios activos + tarjeta de "Recuento de eventos por nombre de evento" mostrando tus eventos.
- **DebugView:** con GTM Preview activo (habilita debug), GA4 → Administrar → **DebugView** → verás cada evento en la línea de tiempo con sus parámetros (`link_url`, `cta_text`, `form_name`, `lead_source`, `page_location`).
- **generate_lead:** confirma que aparece en DebugView tras una prueba real del formulario, con `form_name = cotizacion_wsg` y `lead_source = webstorage_cl`.

---

## E-bis) DIMENSIONES PERSONALIZADAS EN GA4

Para poder **analizar estos parámetros en los informes** de GA4 (no solo en Realtime/DebugView), hay que registrarlos como dimensiones personalizadas:

**GA4 → Administrar → Definiciones personalizadas → Crear dimensión personalizada.**

Crea:
| Nombre de la dimensión | Scope (Alcance) | Event parameter (Parámetro del evento) |
|---|---|---|
| `CTA Text` | Event (Evento) | `cta_text` |
| `Link URL` | Event (Evento) | `link_url` |
| `Lead Source` | Event (Evento) | `lead_source` |
| `Form Name` | Event (Evento) | `form_name` |

> **Nota:** `page_location` normalmente ya existe como **dimensión estándar** de GA4, por lo que **no** es necesario crearla como personalizada, salvo que haya una razón específica.
> Las dimensiones personalizadas aplican desde su creación hacia adelante y pueden tardar hasta ~24-48 h en poblarse en los informes; en **DebugView/Realtime** los parámetros se ven de inmediato sin registrarlas.

---

## F) KEY EVENTS (conversiones) EN GA4

> En GA4 las conversiones = **"eventos clave" (key events)**. Un evento debe **recibirse al menos una vez** para poder marcarlo. Camino: GA4 → Administrar → **Eventos clave** → "Marcar como clave" el evento ya recibido; o **"Crear evento clave"** escribiendo el nombre exacto si aún no aparece (luego se activa al llegar el primer hit).

| Evento | Marcar como key event | Rol |
|---|---|---|
| `generate_lead` | ✅ **SÍ** | Evento clave **principal** (lead) |
| `click_whatsapp` | ✅ Sí | Evento clave **secundario** (contacto) |
| `click_email` | ✅ Sí | Evento clave **secundario** (contacto) |
| `click_cotiza` | ✅ Sí (microconversión) | **NO** usar como objetivo principal de puja en Ads |
| `click_izi_demo` | ⚪ Opcional | Microconversión / interés IZI |
| `view_izi_section` | ❌ No | Engagement |
| `view_form_section` | ❌ No | Engagement |
| `scroll_75` | ❌ No | Engagement |

**Para Google Ads (más adelante, NO ahora):**
- Objetivo principal de puja/optimización: **solo `generate_lead`**.
- `click_whatsapp` / `click_email`: conversiones secundarias (observación / valor de apoyo), no primarias.
- `click_cotiza`, `click_izi_demo`: microconversiones — útiles para señal temprana, **nunca** como objetivo principal de puja.

---

## CHECKLIST FINAL DE VALIDACIÓN

- [ ] GTM Preview detecta el contenedor **GTM-T9X9MB**.
- [ ] Measurement ID confirmado y **único** (GTM Google tag == GA4 web stream).
- [ ] Variables creadas: `CONST - GA4 Measurement ID`, `DLV - link_url`, `DLV - cta_text`, `DLV - page_location`, `DLV - form_name`, `DLV - lead_source`.
- [ ] 8 triggers `CE_*` creados con el nombre de evento exacto.
- [ ] 8 tags `GA4 Event - *` creadas con sus parámetros y trigger.
- [ ] `click_whatsapp` dispara con `link_url` + `cta_text`.
- [ ] `click_email` dispara con `link_url` + `cta_text`.
- [ ] `click_cotiza` dispara con `cta_text` correcto.
- [ ] `click_izi_demo` dispara con `cta_text` correcto.
- [ ] `generate_lead` dispara **solo** después de un envío exitoso.
- [ ] `scroll_75` dispara una sola vez.
- [ ] GA4 **DebugView** muestra los eventos.
- [ ] GA4 **DebugView** muestra los parámetros (`link_url`, `cta_text`, etc.).
- [ ] Dimensiones personalizadas creadas: `CTA Text`, `Link URL`, `Lead Source`, `Form Name`.
- [ ] Key events marcados: `generate_lead` (principal), `click_whatsapp` + `click_email` (secundarios), `click_cotiza` (microconversión).
- [ ] **Publicar** el contenedor (Enviar → versión "Puente GA4 + eventos enriquecidos").
- [ ] **Google Ads: sin tocar** hasta validar la medición completa.

---

## Entrega final (resumen)
1. **Archivo actualizado:** `gtm-ga4-bridge.md`.
2. **Measurement ID:** `G-XXXXXXXXXX` (confirmar en paso 0; pásamelo para cerrar).
3. **Variables:** `CONST - GA4 Measurement ID`, `DLV - link_url`, `DLV - cta_text`, `DLV - page_location`, `DLV - form_name`, `DLV - lead_source`.
4. **Triggers:** `CE_generate_lead`, `CE_click_whatsapp`, `CE_click_email`, `CE_click_cotiza`, `CE_click_izi_demo`, `CE_view_izi_section`, `CE_view_form_section`, `CE_scroll_75`.
5. **Tags GA4 Event:** una por cada evento (8), con parámetros enriquecidos, + Google tag base.
6. **Dimensiones personalizadas GA4:** `CTA Text` (cta_text), `Link URL` (link_url), `Lead Source` (lead_source), `Form Name` (form_name).
7. **Key events:** `generate_lead` (principal), `click_whatsapp` + `click_email` (secundarios), `click_cotiza` (microconversión).
8. **Estado:** `tracking.js` ya está enriquecido (`link_url`, `cta_text`, `page_location`); los parámetros **ya no están pendientes**. Google Ads sin tocar hasta validar la medición.
