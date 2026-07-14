# Puente GTM → GA4 · Contenedor GTM-T9X9MB (webstorage.cl / WSG)

> Todo se configura **dentro de GTM y GA4**. No se toca el sitio, ni gtag.js, ni Google Ads.
> El sitio ya empuja los eventos al `dataLayer` (ver `wsg-landing/js/tracking.js`).

## Nota de alcance sobre parámetros
- `page_location`: **GA4 lo recolecta automáticamente** en todos los eventos (viene del Google tag base). No hay que enviarlo como parámetro custom. Para `generate_lead` además viaja en el dataLayer.
- `link_url` y `cta_text`: **NO están en el dataLayer hoy** (tracking.js solo empuja `{event: '...'}` en los clicks). Para capturarlos hay que enriquecer `tracking.js` con ~3 líneas (tocar el sitio → tarea aparte). Mientras tanto, las tags funcionan sin esos 2 parámetros.

---

## 0) PRE-FLIGHT — Confirmar el Measurement ID (un solo ID)

1. **En GTM** (`GTM-T9X9MB`) → **Etiquetas (Tags)**: busca una etiqueta tipo **"Google tag"** (o antigua "Configuración de GA4"). Ábrela y anota su **Tag ID / Measurement ID** (formato `G-XXXXXXXXXX`).
   - Si NO existe ninguna Google tag → hay que crearla (paso 2 del bloque C).
2. **En GA4** → **Administrar (⚙)** → **Flujos de datos (Data streams)** → abre el **flujo web de webstorage.cl** → arriba a la derecha verás el **Measurement ID** `G-XXXXXXXXXX`.
3. **Compara**: el ID de la Google tag en GTM debe ser **idéntico** al del flujo web de GA4.
4. **Regla:** usar **un solo Measurement ID**. Si en GTM aparece uno distinto al del stream, corrige la Google tag para que use el del stream de GA4. No crear un segundo Google tag.

> Cuando lo confirmes, pásame el `G-XXXXXXXXXX` para dejar todo cerrado. Igual la guía funciona tal cual.

---

## A) VARIABLES (Variables → Definidas por el usuario → Nueva)

**A1. Constante (fuente única de verdad del ID)**
- Nombre: `CONST - GA4 Measurement ID`
- Tipo: **Constante**
- Valor: `G-XXXXXXXXXX`  ← el confirmado en el paso 0

**A2. Variables de capa de datos** (Tipo: **Variable de capa de datos**, versión 2)
| Nombre de variable en GTM | Nombre de variable de capa de datos | Uso |
|---|---|---|
| `DLV - form_name` | `form_name` | generate_lead |
| `DLV - lead_source` | `lead_source` | generate_lead |
| `DLV - page_location` | `page_location` | generate_lead (opcional; GA4 ya lo auto-recolecta) |

**A3. (PENDIENTE — solo si enriquecemos tracking.js)**
| `DLV - link_url` | `link_url` | click_whatsapp / click_email |
| `DLV - cta_text` | `cta_text` | click_cotiza / click_izi_demo |
> Créalas cuando poblemos esos valores en el sitio. Hoy quedarían `undefined`.

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

| Tag (nómbrala así) | Nombre de evento | Parámetros del evento | Trigger |
|---|---|---|---|
| `GA4 Event - generate_lead` | `generate_lead` | `form_name` = `{{DLV - form_name}}` · `lead_source` = `{{DLV - lead_source}}` · (opc.) `page_location` = `{{DLV - page_location}}` | `CE_generate_lead` |
| `GA4 Event - click_whatsapp` | `click_whatsapp` | (pendiente) `link_url` = `{{DLV - link_url}}` | `CE_click_whatsapp` |
| `GA4 Event - click_email` | `click_email` | (pendiente) `link_url` = `{{DLV - link_url}}` | `CE_click_email` |
| `GA4 Event - click_cotiza` | `click_cotiza` | (pendiente) `cta_text` = `{{DLV - cta_text}}` | `CE_click_cotiza` |
| `GA4 Event - click_izi_demo` | `click_izi_demo` | (pendiente) `cta_text` = `{{DLV - cta_text}}` | `CE_click_izi_demo` |
| `GA4 Event - view_izi_section` | `view_izi_section` | — (page_location auto) | `CE_view_izi_section` |
| `GA4 Event - view_form_section` | `view_form_section` | — (page_location auto) | `CE_view_form_section` |
| `GA4 Event - scroll_75` | `scroll_75` | — (page_location auto) | `CE_scroll_75` |

> No agregues `page_location` como parámetro manual salvo en generate_lead (opcional): GA4 ya lo recolecta en todos los eventos. Los "(pendiente)" quedan vacíos hasta enriquecer el sitio; puedes crear las tags sin esos parámetros y agregarlos después.

---

## D) VALIDACIÓN EN GTM PREVIEW

1. GTM → **Vista previa (Preview)** → URL: `https://webstorage.cl` (o `https://ntpaswsg-claude.github.io/wsg.cl/wsg-landing/index.html`).
2. Se abre **Tag Assistant**. Interactúa en el sitio y verifica en la **columna izquierda (Summary)** que aparecen los eventos: `click_cotiza`, `click_whatsapp`, `click_email`, `click_izi_demo`, `view_izi_section`, `view_form_section`, `scroll_75`.
3. Al seleccionar cada evento, en **"Tags Fired"** debe aparecer su `GA4 Event - ...` correspondiente.
4. **generate_lead**: haz un **envío real y exitoso** del formulario → debe aparecer `generate_lead` con su `GA4 Event - generate_lead` disparada. Verifica que **NO** aparece al enviar con errores de validación ni en un envío fallido.
5. **scroll_75**: baja hasta el 75% → aparece **una sola vez** (aunque sigas scrolleando).

---

## E) VALIDACIÓN EN GA4

- **Realtime (Tiempo real):** GA4 → Informes → Tiempo real → usuarios activos + tarjeta de "Recuento de eventos por nombre de evento" mostrando tus eventos.
- **DebugView:** con GTM Preview activo (habilita debug), GA4 → Administrar → **DebugView** → verás cada evento en la línea de tiempo con sus parámetros (`form_name`, `lead_source`, etc.).
- **generate_lead:** confirma que aparece en DebugView tras una prueba real del formulario, con `form_name = cotizacion_wsg` y `lead_source = webstorage_cl`.

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

## CHECKLIST FINAL ANTES DE PUBLICAR EL CONTENEDOR

- [ ] Measurement ID confirmado y **único** (GTM Google tag == GA4 web stream).
- [ ] Variable `CONST - GA4 Measurement ID` creada con el `G-XXXX` correcto.
- [ ] `DLV - form_name`, `DLV - lead_source` (y `DLV - page_location` opcional) creadas.
- [ ] 8 triggers `CE_*` creados con el nombre de evento exacto.
- [ ] 8 tags `GA4 Event - *` creadas, cada una con su trigger.
- [ ] (Si aplica) Google tag base con el ID correcto en All Pages, sin duplicados.
- [ ] GTM Preview: los 8 eventos aparecen y disparan su tag.
- [ ] `generate_lead` solo tras envío exitoso; `scroll_75` una sola vez.
- [ ] GA4 Realtime + DebugView muestran los eventos con parámetros.
- [ ] Key events marcados: `generate_lead` (principal), `click_whatsapp`, `click_email`, `click_cotiza`.
- [ ] **Publicar** el contenedor (Enviar → Versión con nombre "Puente GA4 + eventos de conversión").
- [ ] Google Ads: **no tocar todavía**.

---

## Entrega final (resumen)
1. **Measurement ID:** `G-XXXXXXXXXX` (confirmar en paso 0; pásamelo para cerrar).
2. **Variables:** `CONST - GA4 Measurement ID`, `DLV - form_name`, `DLV - lead_source`, `DLV - page_location` (+ `DLV - link_url`, `DLV - cta_text` pendientes de enriquecer sitio).
3. **Triggers:** `CE_generate_lead`, `CE_click_whatsapp`, `CE_click_email`, `CE_click_cotiza`, `CE_click_izi_demo`, `CE_view_izi_section`, `CE_view_form_section`, `CE_scroll_75`.
4. **Tags GA4 Event:** una por cada evento (8) + Google tag base.
5. **Key events:** `generate_lead` (principal), `click_whatsapp`, `click_email` (secundarios), `click_cotiza` (microconversión).
6. **No usar como objetivo principal de Ads todavía:** `click_cotiza`, `click_izi_demo`, y ningún evento de engagement; el único objetivo primario será `generate_lead` cuando se active Ads.
7. **Checklist final:** ver arriba.
