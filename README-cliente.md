# Air Vision — Guía de uso de tu web

¡Hola! Esta es la guía para usar y mantener tu web. Es simple y no necesitás conocimientos técnicos para la operación diaria.

---

## 📦 ¿Qué te entregamos?

Un sitio web profesional con tres funcionalidades clave:

1. **Asistente virtual (chatbot)** que responde preguntas frecuentes a tus visitantes 24/7 (zonas, tiempos, formato de entrega, etc.).
2. **Botón de WhatsApp** que abre una conversación directa con tu número (+54 9 11 3108-3110).
3. **Formulario de contacto** que te llega por email cada vez que alguien lo completa — *requiere configurar Formspree primero (ver más abajo).*

---

## 🚀 Cómo subir tu web a internet

Tenés tres archivos importantes: `index.html`, `core.js`, `proyecto.json`.

### Opción A — Hosting gratis (recomendado para empezar)

1. Entrá a https://app.netlify.com/drop
2. Arrastrá la carpeta completa `proyecto-air-vision` al recuadro
3. Te genera una URL pública en segundos. Después podés conectar un dominio propio.

### Opción B — Vercel

1. Entrá a https://vercel.com → New Project → Import
2. Subí los archivos
3. Deploy automático.

### Opción C — Hosting tradicional (Hostinger, GoDaddy, etc.)

1. Panel de tu hosting → **Administrador de archivos** o **File Manager**
2. Andá a la carpeta `public_html`
3. Subí los 3 archivos: `index.html`, `core.js`, `proyecto.json`
4. Listo. Tu web ya está online en tu dominio.

---

## ⚠️ IMPORTANTE: Configurar el formulario antes de dar la web a clientes

El formulario de contacto está **desactivado** por defecto. Si alguien lo completa hoy, no te llega el mensaje. Para activarlo:

### Pasos (5 minutos):

1. Andá a https://formspree.io y creá una cuenta gratis con `agostinellifranco2002@gmail.com`.
2. Creá un nuevo "Form".
3. Te dan un ID que se ve así: `xqkrrnbe` o `mvgqnzwa`.
4. Abrí `index.html` con cualquier editor (Bloc de notas, VS Code, etc.).
5. Buscá la línea que dice:
   ```
   formspree_id: "DESACTIVADO"
   ```
6. Reemplazalo por:
   ```
   formspree_id: "TU_ID_DE_FORMSPREE"
   ```
7. Hacé lo mismo en el archivo `proyecto.json`.
8. Guardá los archivos y volvé a subirlos al hosting.
9. **Verificá tu email cuando Formspree te lo pida** (sino los mensajes no llegan).

Mientras tanto, el botón de WhatsApp y el chatbot funcionan perfectamente como canales principales de contacto.

---

## ✏️ Cómo modificar el contenido de la web

Toda la información (textos, servicios, FAQ, número, email) está en el archivo **`proyecto.json`**. No necesitás programar — abrís el archivo con cualquier editor de texto y editás lo que esté entre comillas.

### Ejemplos comunes

**Cambiar el número de WhatsApp:**
```json
"whatsapp_numero": "5491131083110"
```
Cambialo por el nuevo. Mantené el formato sin `+` y sin espacios.

**Agregar un servicio nuevo:**
Buscá la sección `"servicios"` y duplicá un bloque, después editá título, descripción y keywords.

**Agregar una pregunta frecuente:**
Dentro de `"faq"`, copiá un bloque entero y editá la pregunta + respuesta + keywords. Las **keywords** son las palabras clave que el chatbot busca para responder esa pregunta.

> **Importante:** después de modificar `proyecto.json`, también tenés que actualizar el bloque `window.PROJECT_DATA` que está dentro de `index.html` (es una copia idéntica del JSON). Si te resulta difícil, pedí que la web se regenere con la skill.

---

## 🤖 Cómo entender el chatbot

El chatbot busca palabras clave en la información que cargaste y responde con eso. **No inventa información** — si una visita pregunta algo que no está cargado, el bot le ofrece automáticamente:
- Hablar por WhatsApp
- Llenar el formulario

Esto es a propósito: en vez de dar una respuesta inventada, deriva al humano. Mejor para el cliente, mejor para vos.

### Para mejorar las respuestas del bot

Sumá más preguntas al `"faq"` con sus respuestas y keywords. Cuantas más cargues, más cosas responde solo.

**Ejemplo de keywords:** para la pregunta *"¿Cuánto tarda la entrega?"*, las keywords útiles son: `tiempo`, `demora`, `tardan`, `entrega`, `plazo`, `cuando`, `rapido`. Cuanto más variantes pongas, más natural se siente la búsqueda.

---

## 📱 Botón de WhatsApp

- En **mobile** aparece un botón flotante abajo a la izquierda.
- En **desktop** los botones de WhatsApp están integrados en el diseño (en el hero, en las cards de servicios, en la sección de contacto y en el footer).

Todos abren un chat con tu número y un mensaje precargado: *"Hola Air Vision, quería consultar por una filmación aérea"*. Lo podés cambiar editando `whatsapp_mensaje_default` en `proyecto.json`.

Algunos botones tienen mensajes específicos por sección (ej: el botón "Consultar" de Inmobiliaria envía un mensaje contextual sobre ese servicio). Eso ya viene preconfigurado.

---

## 🆘 Problemas frecuentes

| Síntoma | Causa probable | Solución |
|---------|----------------|----------|
| El form no envía | Formspree no configurado o sin verificar email | Seguir los pasos de "Configurar el formulario" arriba |
| El bot dice "no tengo info" para todo | Faltan keywords en el JSON | Agregá keywords más variadas a las FAQs |
| WhatsApp no abre | Número con formato incorrecto | Tiene que ser `5491131083110` (sin `+`, sin espacios) |
| Cambié el JSON y no veo cambios | Caché del navegador | Recargá con `Ctrl+F5` o `Cmd+Shift+R` |
| La web se ve desordenada | Las fuentes de Google no cargaron | Verificá que el dispositivo tenga internet |

---

## 📞 Soporte

Para cualquier modificación, ampliación o duda técnica, contactanos.

---

*Web entregada el 2026-04-27.*
