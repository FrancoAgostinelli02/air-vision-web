# Air Vision — Notas técnicas

Documentación técnica para mantenimiento y modificaciones futuras.

---

## Stack técnico

- **HTML/CSS/JS vanilla** — sin frameworks, sin build step
- **CSS plano** con custom properties (variables CSS) — sin Tailwind, sin preprocesadores
- **Tipografía**: Google Fonts (Barlow Condensed + Sora) cargadas vía `<link>`
- **Backend funcional**: `core.js` (vanilla JS, sin dependencias)
- **Form**: Formspree (free tier, hasta 50 envíos/mes) — *actualmente desactivado*
- **Hosting**: cualquier static host (Netlify, Vercel, GitHub Pages, hosting tradicional)

## Arquitectura

```
proyecto-air-vision/
├── index.html           ← single-file: HTML + CSS + datos inline + JS local
├── core.js              ← backend infalible (NUNCA modificar)
├── proyecto.json        ← datos sueltos para edición no técnica
├── README-cliente.md    ← guía de uso para el cliente
├── README-dev.md        ← este archivo
└── portfolio-card.md    ← entrada de portfolio
```

`index.html` ya contiene `window.PROJECT_DATA` inline. `proyecto.json` es una copia editable; si se modifica, hay que reflejar el cambio en el `<script>` inline del HTML (o regenerar con la skill).

## Decisiones de diseño

**Sistema de estilos**: CSS plano con variables CSS (`:root { --primary, --bg, ... }`).

**Por qué CSS plano y no Tailwind**: el diseño tiene tipografía con tracking custom, layouts asimétricos (bento, split editorial), animaciones con easing custom y SVG procedural. Mantener todo en CSS plano da más control sobre cada unidad sin pelear con utility classes ni configuración de Tailwind. Single-file, sin build step.

**Paleta principal** (estrategia *committed* — un acento saturado cubriendo ~30% de la superficie):
- Background: `#0B0F17` (negro tinted azul, NO `#000`)
- Surface: `#131822` / `#1C2330`
- Texto: `#F1F5F9` con jerarquía a `#94A3B8` y `#475569`
- Primary: `#0EA5E9` (cielo cinematográfico)
- Primary dark: `#0369A1`
- Accent puntual: `#F97316` (presente solo en un punto del SVG del hero)

**Tipografía**:
- Display: **Barlow Condensed** (700, 800, 900) — condensada, evoca aviación y tech
- Body: **Sora** (300, 400, 500, 600, 700) — sans humanista distintiva
- Ninguna en lista de rechazo de IA-defaults (Inter, DM Sans, Outfit, etc. evitadas)
- Headers con `text-wrap: balance` y tracking negativo (`-0.035em`)
- Labels con tracking positivo (`0.16em`) y `text-transform: uppercase`

**Inspiración / referencias**: combinación del techno-minimalismo de DJI (acento azul + dark + alta densidad balanceada con whitespace) y la estructura institucional/aérea de af.mil (jerarquía clara, tipografía condensada, registro técnico).

**Layout** (anti-slop):
- Hero split asimétrico (texto izquierda 1.15fr, visual SVG derecha 1fr)
- Stats bar con 4 numbers grandes en escala fluida
- Servicios en bento asimétrico (4-2 / 6) — NO 3 cards iguales horizontales
- Sobre con split editorial + lista de "credenciales" estilo data
- FAQ en lista vertical con numeración (NO acordeón cliché)
- Contacto split form/canales

**Animaciones**:
- Custom easing `cubic-bezier(0.23, 1, 0.32, 1)` para entradas
- IntersectionObserver para scroll reveals (threshold 0.12, rootMargin -40px)
- `prefers-reduced-motion` respetado
- Hover guards con `@media (hover: hover)` para evitar comportamiento raro en touch
- SVG del hero con animación `sweep` infinita (radar) y `pulse` en glow
- NUNCA `transition: all` — siempre propiedades específicas

## SVG procedural del hero

El hero usa un SVG inline que simula un radar/HUD con:
- Anillos concéntricos (radar rings)
- Línea de barrido animada con gradiente
- Drone iconográfico al centro (4 motores + body)
- Coordenadas y labels HUD-style
- Puntos dispersos representando POIs

Esto reemplaza a una foto de stock genérica y mantiene la coherencia visual sin imágenes externas. Cuando el cliente tenga material propio, se puede reemplazar el `<div class="hero-visual">` por un `<video>` o `<img>` con tomas reales.

## Backend (`core.js`)

### Lo que hace

1. Lee `window.PROJECT_DATA` y aplica las CSS variables `--wgp-*`.
2. Indexa `web_content` (servicios, FAQ, etc.) en items buscables.
3. Monta el chatbot widget al body.
4. Auto-pop del chat al 50% de scroll.
5. Crea el botón flotante de WhatsApp (visible solo en `≤768px`).
6. Conecta el `<form data-form="contact">` a Formspree vía AJAX, con honeypot anti-spam.
7. Inyecta el modal de éxito/error post-submit.

### Lógica del chatbot — scoring

```
match exacto de keyword: +3
match parcial: +1
threshold mínimo para considerar match válido: 2
```

Si la query es saludo (hola, buenas) o despedida (gracias, chau), responde con frases hardcodeadas. Si la query no llega al threshold, dispara fallback con botones de derivación a WhatsApp/formulario.

## Estado actual del Formspree

**El form está desactivado intencionalmente** (a pedido del cliente).

`formspree_id: "DESACTIVADO"` en `window.PROJECT_DATA` y `proyecto.json`.

Cuando el cliente quiera activarlo:
1. Crear cuenta en formspree.io con `agostinellifranco2002@gmail.com`
2. Crear un Form, copiar el ID
3. Reemplazar `"DESACTIVADO"` por el ID real en ambos lados (HTML + JSON)
4. Verificar email en Formspree

Mientras esté desactivado, el form igual se puede submittear pero el envío fallará silenciosamente (o mostrará error según cómo `core.js` maneje el ID inválido).

## Cómo extender

### Agregar una sección "Galería" con fotos reales

Crear sección con grid de imágenes:
```html
<section class="gallery container">
  <div class="gallery-grid">
    <img src="img/proyecto-1.jpg" alt="..." loading="lazy">
    <!-- ... -->
  </div>
</section>
```

Sumar al CSS un `.gallery-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem; }` con `aspect-ratio: 4/3` en las imágenes.

### Reemplazar el SVG del hero por un video

Cambiar el `<div class="hero-visual">` por:
```html
<div class="hero-visual">
  <video autoplay muted loop playsinline>
    <source src="hero.mp4" type="video/mp4">
  </video>
</div>
```

Mantener el aspect-ratio en CSS para que no rompa el grid.

### Agregar tracking de eventos

```javascript
// Hook en submit del form (después del response.ok en core.js):
window.gtag && gtag('event', 'form_submit');

// Hook en click de WhatsApp:
document.querySelectorAll('[data-cta="whatsapp"]').forEach(el => {
  el.addEventListener('click', () => {
    window.gtag && gtag('event', 'whatsapp_click');
  });
});
```

Agregar el script de GA4 en el `<head>`.

### Cambiar threshold del chatbot

`core.js > ChatEngine` → `this.threshold = 2`. Bajar para que el bot intente responder más; subir para que derive más rápido.

## Pendientes / consideraciones

- [ ] **Formspree**: configurar y verificar email (a cargo del cliente, ver README-cliente.md)
- [ ] **Imagen Open Graph**: actualmente solo hay meta tags básicos, falta una imagen real OG (1200x630px) para compartir en redes
- [ ] **Sitemap.xml / robots.txt**: si va a hosting con dominio propio, agregarlos
- [ ] **Analytics**: GA4, Plausible, etc. — no incluidos
- [ ] **Cookie banner / GDPR**: no incluido (no aplica para mercado AR pero si se expande a EU, agregarlo)
- [ ] **Galería real**: cuando el cliente tenga material propio, reemplazar SVG procedural del hero por video/imagen real
- [ ] **Logo**: actualmente usa SVG inline genérico (cruz + círculo). Si el cliente tiene logo propio, reemplazar en nav, footer y favicon

## Performance esperado

- **Lighthouse Performance**: 95-100 (single file, sin imágenes externas pesadas)
- **Lighthouse Accessibility**: 90+ (alt en imágenes, aria-labels, contraste WCAG AA, prefers-reduced-motion)
- **Lighthouse Best Practices**: 100
- **Lighthouse SEO**: 95+ (meta tags básicos, Open Graph, lang, viewport)
- **Page weight**: ~38 KB sin imágenes (HTML+CSS+JS inline) + Google Fonts (~80KB)

## Compatibilidad

- Navegadores modernos (últimas 2 versiones de Chrome, Firefox, Safari, Edge)
- Mobile: iOS Safari 14+, Android Chrome 90+
- Sin polyfills incluidos. No funciona en IE.
- Usa `min-height: 100dvh` (no `100vh`) para correcto sizing en mobile

---

*Generado el 2026-04-27 con `web-generator-pro` skill v1.0 + `design-pro-web` skill.*
