# Air Vision

> Una nueva perspectiva para tus proyectos.

## Ficha

- **Cliente**: Air Vision (servicio de fotografía y video aéreo)
- **Rubro**: Drones / fotografía y video aéreo profesional
- **Año**: 2026
- **URL**: *pendiente de deploy*
- **Tipo**: Landing page con chatbot + WhatsApp + form

## El brief

Un piloto de drones con 2 años de experiencia operando en Buenos Aires necesitaba presencia profesional online para atraer proyectos de construcción, inmobiliaria y cobertura deportiva. Los referentes visuales (DJI, US Air Force) sugerían un registro técnico-cinemático: la marca tenía que comunicar precisión y calidad de material aéreo desde el primer scroll.

## La solución

Landing dark cinemática con jerarquía editorial fuerte. Tipografía condensada en headers (Barlow Condensed) para evocar aviación y registro técnico, sans humanista (Sora) para body. SVG procedural en el hero (radar HUD con drone iconográfico animado) en lugar de stock photography genérica — la marca no tenía material visual propio listo, así que se construyó identidad visual sin depender de fotos.

## Decisiones de diseño

- **Estética**: dark cinemático-técnico, registro brand
- **Paleta**: Background `#0B0F17` (tinted blue, no pure black) + acento `#0EA5E9` (cielo cinematográfico, evita el AI-purple-blue) + naranja sunset `#F97316` como punto de tensión
- **Tipografía**: Barlow Condensed (display, 700-900) + Sora (body, 300-700) — ninguna en lista de rechazo
- **Layout**: hero split asimétrico, bento asimétrico (4-2-6) en servicios, FAQ vertical numerado, sobre con split editorial + lista de credenciales estilo data-spec

## Funcionalidades

- ✓ Chatbot con búsqueda local (sin API externa, costo cero)
- ✓ Auto-pop al 50% de scroll
- ✓ Derivación inteligente a WhatsApp/form cuando no hay match
- ✓ Formulario AJAX a Formspree con modal de éxito (a configurar por el cliente)
- ✓ Botón flotante WhatsApp en mobile + 6 CTAs contextuales en desktop
- ✓ Mobile-first responsive
- ✓ Reveals con IntersectionObserver, easing custom
- ✓ `prefers-reduced-motion` respetado

## Stack

HTML/CSS plano + vanilla JS. Sin frameworks, sin build step. Single-file deploy. Google Fonts para tipografía. SVG inline para iconografía y hero visual.

## Stats

- **Page weight**: ~38 KB (HTML+CSS+JS inline) + ~80 KB Google Fonts
- **Lighthouse esperado**: Performance 95+ / A11y 90+ / SEO 95+
- **Tiempo de generación**: ~25 minutos (brief conversacional + diseño + render)

## Capturas

> Recomendado tomar:
> - Hero desktop (1440x900)
> - Sección de servicios mostrando bento asimétrico
> - Chatbot abierto con conversación de ejemplo
> - Vista mobile con WhatsApp FAB + hero
> - Detalle de FAQ con tipografía editorial

---

## Texto sugerido para el portfolio (corto)

> Landing cinemática para servicio de filmación aérea con drones en Buenos Aires. Diseño dark con tipografía condensada técnica (Barlow Condensed) y acento azul cielo. SVG procedural radar/HUD en el hero reemplaza stock photography. Chatbot integrado con búsqueda local, derivación inteligente a WhatsApp y form AJAX. ~25 min de generación, single-file deploy.

## Texto sugerido para post de redes (Instagram/LinkedIn)

> ¿Cómo le hacés una landing a una marca que vuela drones pero todavía no tiene un portfolio visual armado?
>
> Para Air Vision, en lugar de tirarle stock photography genérica, construí el hero alrededor de un SVG procedural: un radar HUD animado con un drone iconográfico al centro y coordenadas reales de Buenos Aires. La marca queda con identidad visual propia desde el día uno, y cuando llegue material real (que va a llegar), se reemplaza sin tocar el resto del diseño.
>
> Stack: HTML/CSS plano + JS vanilla. Tipografía Barlow Condensed + Sora. Dark cinemático con un azul cielo que evita el típico "AI purple-blue". Chatbot con búsqueda local — costo cero por mensaje, deriva al WhatsApp cuando no encuentra match.
>
> #webdesign #landingpage #drones #branding #frontend
