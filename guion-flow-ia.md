# Guión de producción para Flow IA — Reel "El Efecto Dominó" (WSG / webstorage)
### De la ficha roja al logo oficial. Formato 9:16.

> **Cómo trabaja Flow (clave para este guión):**
> 1. Cada clip es un plano corto (~8 s). Se genera con un **frame inicial** (imagen) + **prompt de movimiento**.
> 2. Para encadenar sin cortes, usa **"Extender"** o toma el **último frame** de un clip como **frame inicial** del siguiente.
> 3. Para la transición al logo usa **"Frames to Video" (keyframes)**: defines **frame inicial** y **frame final**, y Flow interpola. Así el logo entra perfecto (es una imagen real, no texto generado).
> 4. Un solo movimiento por clip. Describe siempre la cámara. Mantén el rojo como único color vivo.
> 5. Los prompts van en español; si notas que Flow no obedece bien, usa la **versión EN** (Veo/Flow suele adherir mejor en inglés). Ambas incluidas en los clips clave.

---

## Assets que necesitas cargar en Flow

| ID | Qué es | Estado |
|----|--------|--------|
| **IMG_A** | Frame héroe aprobado: ficha roja WSG + pasillo de dominós negros + láser rojo | ✅ ya generado |
| **IMG_END** | Endframe: wordmark rojo "WSG" con glow + hilo de neón al pie | ✅ ya generado |
| **IMG_LOGO** | Card final negra: logo **"webstorage"** en blanco + subrayado rojo #E30613 + "store&ship" + "webstorage.cl" | ⛳ **hay que prepararlo** (PNG del logo oficial invertido a blanco, sobre fondo negro puro, centrado, con aire arriba) |

> El único que falta es **IMG_LOGO**: exporta tu logo oficial en blanco sobre negro (misma composición que quieres ver al final) y súbelo. Es el frame final de la transición.

---

## CLIP 1 · "El disparo + génesis del orden"  (~8 s)
- **Frame inicial:** IMG_A
- **Cámara:** dolly-in lento y bajo, casi a ras del suelo pulido.
- **Prompt (ES):**
```
La ficha de dominó roja WSG en primer plano se inclina y cae lentamente hacia la
cámara. En lugar de derribar a las demás, las fichas negras del pasillo se levantan,
giran y se alinean solas en filas perfectamente paralelas, formando pasillos nítidos.
Un hilo de luz roja acelera por el corredor central hacia el fondo. Cámara: dolly-in
lento y bajo, casi a ras del suelo oscuro reflectante, muy estable. Iluminación de
estudio suave, negros profundos, reflejos físicamente correctos. El rojo es el único
color saturado de la escena. Atmósfera minimalista y premium, cinematográfico, 9:16.
```
- **Prompt (EN):**
```
The red WSG domino in the foreground slowly tips and falls toward the camera. Instead
of knocking the others down, the black dominoes in the aisle rise, rotate and align by
themselves into perfectly parallel rows, forming clean corridors. A thread of red light
accelerates down the central corridor toward the back. Camera: slow low dolly-in, near
the dark reflective floor, very stable. Soft studio lighting, deep blacks, physically
correct reflections. Red is the only saturated color. Minimal premium mood,
cinematic, 9:16.
```
- **Al terminar:** guarda el **último frame** → será el inicio del Clip 2.

---

## CLIP 2 · "Emerge la estructura + resuelve a marca"  (~8 s)
- **Frame inicial:** último frame del Clip 1
- **Frame final (opcional, recomendado):** IMG_END  *(así el clip aterriza exacto en el endframe WSG)*
- **Cámara:** el avance desacelera hasta detenerse.
- **Prompt (ES):**
```
La cámara continúa avanzando por el corredor; del suelo de los pasillos emergen
estructuras de racks metálicos y se deslizan pallets encajando en los niveles, formando
una operación logística perfecta y ordenada. Luces rojas recorren los caminos. Luego
todo se oscurece hacia el fondo y el rojo se concentra al centro; la escena resuelve en
un wordmark rojo 'WSG' con glow suave sobre negro y un delgado hilo de neón rojo al pie
del cuadro. La cámara desacelera hasta detenerse por completo. Cinematográfico, premium,
el rojo es el único color vivo, 9:16.
```
- **Prompt (EN):**
```
The camera keeps moving down the corridor; metal rack structures rise from the floor of
the aisles and pallets slide into place across the levels, forming a perfect, orderly
logistics operation. Red lights run along the paths. Then everything darkens toward the
back and the red concentrates at the center; the scene resolves into a red glowing 'WSG'
wordmark on black with a thin red neon thread at the bottom of the frame. The camera
decelerates to a full stop. Cinematic, premium, red is the only living color, 9:16.
```
- **Resultado:** termina en IMG_END (tu endframe actual). ✅

---

## CLIP 3 · "Transición al logo webstorage"  (~3–4 s)  → modo **Frames to Video (keyframes)**
- **Frame inicial:** IMG_END  (WSG rojo + hilo de neón)
- **Frame final:** IMG_LOGO  (webstorage blanco + subrayado rojo)
- **Cámara:** fija.
- **Prompt (ES):**
```
Transición cinematográfica premium sobre fondo negro puro. El wordmark rojo 'WSG' con
glow se atenúa y se disuelve suavemente hacia adentro con un leve desenfoque. El hilo de
neón rojo del pie se endereza en una única línea horizontal roja limpia y se desplaza.
La escena resuelve en el logotipo blanco 'webstorage' con su subrayado rojo; un pequeño
destello recorre el subrayado de izquierda a derecha. Cámara fija, movimiento elegante y
minimalista, respiración sutil. El rojo es el único color saturado. Estilo Apple, 9:16.
```
- **Prompt (EN):**
```
Premium cinematic transition on pure black background. The red glowing 'WSG' wordmark
dims and dissolves softly inward with a slight blur. The red neon thread at the bottom
straightens into a single clean horizontal red line and shifts. The scene resolves into
the white 'webstorage' logo with its red underline; a small glint travels along the
underline left to right. Static camera, elegant minimal motion, subtle breathing. Red is
the only saturated color. Apple-like style, 9:16.
```
- **Nota de fiabilidad:** Flow interpola entre las dos imágenes, así que el logo entra fiel (viene de IMG_LOGO, no lo "escribe" el modelo). Si la interpolación deforma el texto a mitad de camino, baja la duración a ~2,5 s o monta esta transición en editor (After Effects/CapCut) usando IMG_END → IMG_LOGO.

---

## Montaje final (orden de clips)
```
[Clip 1: génesis 8s] → [Clip 2: estructura + WSG 8s] → [Clip 3: transición a logo 3-4s]
```
- **Loop (opcional):** al final del Clip 3, un fundido corto a negro que reconecte con el primer frame de IMG_A (ficha roja en quietud).
- **Textos en pantalla (sobreimpresos en edición, no en Flow):**
  - Principal (aparece ~seg 1–3): *Cuando tu logística está bien diseñada, todo lo demás también se ordena.*
  - Subtexto (~seg 4–6): *Orden que se diseña. Crecimiento que se acelera.*
  - CTA (sobre el logo): *Ordena hoy. Crece mañana.*  ·  webstorage.cl

## Ajustes finos en Flow (si algo no sale)
- Si el rojo se "esparce": añade al prompt *"solo la ficha WSG y el hilo/láser son rojos; todo lo demás en escala de grises fría"*.
- Si la caída de la ficha es muy brusca: *"la ficha roja cae lenta y pesada, con peso, cámara lenta sutil"*.
- Si Flow topa la duración en 5 s: parte el Clip 1 en dos (1a: cae la ficha + onda inicial / 1b: se completan los pasillos).
- Mantén el MISMO lenguaje de cámara (dolly-in bajo) para que los 3 clips se sientan un solo plano.
