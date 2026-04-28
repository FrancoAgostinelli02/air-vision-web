/**
 * Web Generator Pro - Core Backend
 * ─────────────────────────────────────────────────────────────
 * Backend infalible para webs generadas con la skill.
 * NO MODIFICAR. Este archivo se copia tal cual a cada proyecto.
 *
 * Lee window.PROJECT_DATA (inyectado en index.html) y conecta:
 *   - Chatbot con búsqueda local + derivación a contacto
 *   - WhatsApp (botón flotante mobile + CTAs desktop)
 *   - Formulario AJAX a Formspree + modal de éxito
 *
 * Contrato (ver CONTRACT.md):
 *   - <form data-form="contact"> con campos name/email/phone/message
 *   - cualquier elemento [data-cta="whatsapp"] abre WhatsApp
 *   - <div data-mount="chatbot"> opcional (si no existe, se crea al body)
 * ─────────────────────────────────────────────────────────────
 */
(function () {
  'use strict';

  // ════════════════════════════════════════════════════════════
  // 0. UTILIDADES
  // ════════════════════════════════════════════════════════════

  /** Normaliza texto: lowercase, sin acentos, sin signos */
  function normalize(text) {
    return String(text || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[¿?¡!.,;:()"']/g, '')
      .trim();
  }

  /** Tokeniza una frase quitando stopwords */
  const STOPWORDS = new Set([
    'el','la','los','las','de','del','a','en','y','o','que','para','con','por',
    'un','una','es','se','me','mi','tu','su','lo','al','cual','como','mas','pero',
    'si','no','este','esta','estos','estas','sus','les','le','muy','mas','tan'
  ]);
  function tokenize(text) {
    return normalize(text)
      .split(/\s+/)
      .filter(w => w.length > 2 && !STOPWORDS.has(w));
  }

  /** Detecta saludos */
  const GREETINGS = ['hola','buenas','buen dia','buenos dias','buenas tardes','buenas noches','holis','que tal','qué tal'];
  function isGreeting(text) {
    const n = normalize(text);
    return GREETINGS.some(g => n === g || n.startsWith(g + ' ') || n.endsWith(' ' + g));
  }

  /** Detecta agradecimientos/despedidas */
  const FAREWELLS = ['gracias','muchas gracias','chau','adios','hasta luego','listo','perfecto','ok'];
  function isFarewell(text) {
    const n = normalize(text);
    return FAREWELLS.some(f => n === f || n.startsWith(f + ' ') || n.includes(' ' + f));
  }

  // ════════════════════════════════════════════════════════════
  // 1. MOTOR DEL CHATBOT (búsqueda local en web_content)
  // ════════════════════════════════════════════════════════════

  class ChatEngine {
    constructor(webContent) {
      this.webContent = webContent || {};
      this.items = this._indexContent();
      this.threshold = 2; // score mínimo para considerar match válido
    }

    /** Indexa todo el contenido de web_content en items buscables */
    _indexContent() {
      const items = [];
      const wc = this.webContent;

      // FAQ
      if (Array.isArray(wc.faq)) {
        wc.faq.forEach(f => {
          items.push({
            tipo: 'faq',
            titulo: f.pregunta,
            respuesta: f.respuesta,
            keywords: this._extractKeywords(f, [f.pregunta]),
          });
        });
      }

      // Servicios
      if (Array.isArray(wc.servicios)) {
        wc.servicios.forEach(s => {
          items.push({
            tipo: 'servicio',
            titulo: s.titulo,
            respuesta: `${s.titulo}: ${s.descripcion}`,
            keywords: this._extractKeywords(s, [s.titulo, s.descripcion]),
          });
        });
      }

      // Precios / planes
      if (wc.precios && Array.isArray(wc.precios.planes)) {
        wc.precios.planes.forEach(p => {
          const incluye = Array.isArray(p.incluye) ? p.incluye.join(', ') : '';
          items.push({
            tipo: 'precio',
            titulo: `Precio ${p.nombre}`,
            respuesta: `${p.nombre}: ${p.rango}${incluye ? '. Incluye: ' + incluye : ''}.`,
            keywords: ['precio','precios','cuesta','cuanto','vale','valor','plan',
                       'planes','presupuesto','cotizacion','tarifa', normalize(p.nombre)],
          });
        });
      }

      // Quiénes somos / Sobre nosotros
      if (wc.quienes_somos && wc.quienes_somos.texto) {
        items.push({
          tipo: 'institucional',
          titulo: 'Sobre nosotros',
          respuesta: wc.quienes_somos.texto,
          keywords: ['quienes','somos','empresa','equipo','historia','experiencia',
                     'trayectoria','sobre','ustedes','nosotros'],
        });
      }

      // Hero / propuesta de valor
      if (wc.hero && wc.hero.subtitulo) {
        items.push({
          tipo: 'overview',
          titulo: 'Qué hacemos',
          respuesta: wc.hero.subtitulo,
          keywords: ['hacen','ofrecen','servicios','producto','que','propuesta'],
        });
      }

      return items;
    }

    /** Extrae keywords de un item (explícitas o inferidas del texto) */
    _extractKeywords(item, fallbackTexts) {
      if (Array.isArray(item.keywords) && item.keywords.length) {
        return item.keywords.map(k => normalize(k));
      }
      const allText = fallbackTexts.filter(Boolean).join(' ');
      return Array.from(new Set(tokenize(allText)));
    }

    /** Busca el mejor match para una query */
    search(query) {
      const tokens = tokenize(query);
      if (!tokens.length) return null;

      let best = { score: 0, item: null };

      for (const item of this.items) {
        let score = 0;
        for (const token of tokens) {
          for (const kw of item.keywords) {
            if (kw === token) score += 3;
            else if (kw.length > 3 && (kw.includes(token) || token.includes(kw))) score += 1;
          }
        }
        if (score > best.score) best = { score, item };
      }

      return best.score >= this.threshold ? best.item : null;
    }

    /** Genera la respuesta para una query */
    respond(query) {
      // Saludos
      if (isGreeting(query)) {
        return {
          type: 'greeting',
          text: '¡Hola! Estoy acá para ayudarte. ¿Qué te gustaría saber?',
        };
      }

      // Despedidas / agradecimientos
      if (isFarewell(query)) {
        return {
          type: 'farewell',
          text: '¡Un gusto! Si necesitás algo más, escribime cuando quieras.',
        };
      }

      // Búsqueda en contenido
      const match = this.search(query);
      if (match) {
        return {
          type: 'answer',
          text: match.respuesta,
          meta: match.tipo,
        };
      }

      // Fallback con derivación
      return {
        type: 'fallback',
        text: 'No tengo esa información específica, pero puedo conectarte con un asesor.',
        actions: [
          { type: 'whatsapp', label: 'Hablar por WhatsApp' },
          { type: 'form', label: 'Enviar formulario' },
        ],
      };
    }

    /** Devuelve sugerencias iniciales (3-4 atajos al abrir el chat) */
    getSuggestions() {
      const suggestions = [];

      // Servicios primero
      const wc = this.webContent;
      if (Array.isArray(wc.servicios) && wc.servicios.length) {
        suggestions.push('¿Qué servicios ofrecen?');
      }

      // Precios
      if (wc.precios && Array.isArray(wc.precios.planes) && wc.precios.planes.length) {
        suggestions.push('¿Cuánto cuestan los servicios?');
      }

      // FAQ destacadas (las primeras 2)
      if (Array.isArray(wc.faq)) {
        wc.faq.slice(0, 2).forEach(f => suggestions.push(f.pregunta));
      }

      // Si quedó corto, fallback genéricos
      if (suggestions.length < 3 && wc.quienes_somos) {
        suggestions.push('¿Quiénes son ustedes?');
      }

      return suggestions.slice(0, 4);
    }
  }

  // ════════════════════════════════════════════════════════════
  // 2. UI DEL CHATBOT (widget flotante)
  // ════════════════════════════════════════════════════════════

  class ChatUI {
    constructor(engine, projectData) {
      this.engine = engine;
      this.config = projectData.config || {};
      this.chatbotConfig = projectData.chatbot || {};
      this.isOpen = false;
      this.hasAutoOpened = false;

      this.mount = document.querySelector('[data-mount="chatbot"]');
      if (!this.mount) {
        this.mount = document.createElement('div');
        this.mount.setAttribute('data-mount', 'chatbot');
        document.body.appendChild(this.mount);
      }

      this._render();
      this._bindEvents();
      // Auto-pop desactivado por el cliente: el chat se abre solo al click del usuario.
      // this._setupAutoPop();
    }

    _render() {
      this.mount.innerHTML = `
        <div class="wgp-chat" data-state="closed">
          <button class="wgp-chat__bubble" type="button" aria-label="Abrir chat" data-chat-toggle>
            <svg class="wgp-chat__icon-open" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <svg class="wgp-chat__icon-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
          <div class="wgp-chat__panel" role="dialog" aria-label="Asistente">
            <header class="wgp-chat__header">
              <div class="wgp-chat__header-info">
                <strong>${this._escape(this.chatbotConfig.nombre || 'Asistente')}</strong>
                <span class="wgp-chat__status">En línea</span>
              </div>
            </header>
            <div class="wgp-chat__messages" data-chat-messages aria-live="polite"></div>
            <form class="wgp-chat__form" data-chat-form>
              <input type="text"
                     class="wgp-chat__input"
                     placeholder="Escribí tu pregunta…"
                     aria-label="Escribí tu pregunta"
                     data-chat-input
                     autocomplete="off"
                     required>
              <button type="submit" class="wgp-chat__send" aria-label="Enviar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m22 2-7 20-4-9-9-4z"/>
                </svg>
              </button>
            </form>
          </div>
        </div>
      `;
    }

    _bindEvents() {
      this.mount.querySelector('[data-chat-toggle]')
        .addEventListener('click', () => this.toggle());

      this.mount.querySelector('[data-chat-form]')
        .addEventListener('submit', (e) => {
          e.preventDefault();
          const input = this.mount.querySelector('[data-chat-input]');
          const text = input.value.trim();
          if (text) {
            this.send(text);
            input.value = '';
          }
        });
    }

    /** Auto-pop al hacer scroll del 50% (decisión Ronda 1) */
    _setupAutoPop() {
      const onScroll = () => {
        if (this.hasAutoOpened || this.isOpen) return;
        const scrolled = window.scrollY + window.innerHeight;
        const total = document.documentElement.scrollHeight;
        const ratio = scrolled / total;
        if (ratio >= 0.5) {
          this.hasAutoOpened = true;
          this.open();
          window.removeEventListener('scroll', onScroll);
        }
      };
      window.addEventListener('scroll', onScroll, { passive: true });
    }

    open() {
      this.isOpen = true;
      this.mount.querySelector('.wgp-chat').dataset.state = 'open';
      // Si está vacío, mostrar saludo + sugerencias
      const messages = this.mount.querySelector('[data-chat-messages]');
      if (!messages.children.length) this._showWelcome();
    }

    close() {
      this.isOpen = false;
      this.mount.querySelector('.wgp-chat').dataset.state = 'closed';
    }

    toggle() {
      this.isOpen ? this.close() : this.open();
    }

    /** Bienvenida + 3-4 botones FAQ (decisión Ronda 1) */
    _showWelcome() {
      const greeting = this.chatbotConfig.saludo
        || `Hola, soy ${this.chatbotConfig.nombre || 'el asistente'} de ${this.config.empresa_nombre || 'la empresa'}. ¿En qué puedo ayudarte?`;
      this._appendMessage('bot', greeting);

      const suggestions = this.engine.getSuggestions();
      if (suggestions.length) {
        this._appendSuggestions(suggestions);
      }
    }

    /** Procesa el mensaje del usuario */
    send(text) {
      this._appendMessage('user', text);
      this._removeSuggestions();
      this._appendTyping();

      setTimeout(() => {
        this._removeTyping();
        const res = this.engine.respond(text);
        this._appendMessage('bot', res.text, res.actions);

        // Re-mostrar sugerencias después de cada interacción del bot
        const suggestions = this.engine.getSuggestions();
        if (suggestions.length) this._appendSuggestions(suggestions);
      }, 600);
    }

    _appendMessage(role, text, actions) {
      const messages = this.mount.querySelector('[data-chat-messages]');
      const msg = document.createElement('div');
      msg.className = `wgp-chat__msg wgp-chat__msg--${role}`;
      msg.innerHTML = `<div class="wgp-chat__bubble-msg">${this._escape(text)}</div>`;

      if (Array.isArray(actions) && actions.length) {
        const wrap = document.createElement('div');
        wrap.className = 'wgp-chat__msg-actions';
        actions.forEach(a => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'wgp-chat__action';
          btn.textContent = a.label;
          btn.addEventListener('click', () => this._handleAction(a.type));
          wrap.appendChild(btn);
        });
        msg.appendChild(wrap);
      }

      messages.appendChild(msg);
      messages.scrollTop = messages.scrollHeight;
    }

    _appendSuggestions(suggestions) {
      const messages = this.mount.querySelector('[data-chat-messages]');
      const wrap = document.createElement('div');
      wrap.className = 'wgp-chat__suggestions';
      wrap.dataset.chatSuggestions = '';
      suggestions.forEach(s => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'wgp-chat__suggestion';
        btn.textContent = s;
        btn.addEventListener('click', () => this.send(s));
        wrap.appendChild(btn);
      });
      messages.appendChild(wrap);
      messages.scrollTop = messages.scrollHeight;
    }

    _removeSuggestions() {
      const sugg = this.mount.querySelector('[data-chat-suggestions]');
      if (sugg) sugg.remove();
    }

    _appendTyping() {
      const messages = this.mount.querySelector('[data-chat-messages]');
      const typ = document.createElement('div');
      typ.className = 'wgp-chat__msg wgp-chat__msg--bot';
      typ.dataset.chatTyping = '';
      typ.innerHTML = `<div class="wgp-chat__bubble-msg wgp-chat__typing"><span></span><span></span><span></span></div>`;
      messages.appendChild(typ);
      messages.scrollTop = messages.scrollHeight;
    }

    _removeTyping() {
      const typ = this.mount.querySelector('[data-chat-typing]');
      if (typ) typ.remove();
    }

    _handleAction(type) {
      if (type === 'whatsapp') {
        WhatsAppHandler.open(this.config);
      } else if (type === 'form') {
        const form = document.querySelector('[data-form="contact"]');
        if (form) {
          form.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setTimeout(() => {
            const firstField = form.querySelector('input:not([type="hidden"]), textarea');
            if (firstField) firstField.focus();
          }, 600);
          this.close();
        }
      }
    }

    _escape(html) {
      const div = document.createElement('div');
      div.textContent = html;
      return div.innerHTML;
    }
  }

  // ════════════════════════════════════════════════════════════
  // 3. WHATSAPP (botón flotante mobile + CTAs desktop)
  // ════════════════════════════════════════════════════════════

  const WhatsAppHandler = {
    open(config, customMessage) {
      const cfg = config || (window.PROJECT_DATA && window.PROJECT_DATA.config) || {};
      const number = (cfg.whatsapp_numero || '').replace(/[^0-9]/g, '');
      if (!number) {
        console.warn('[WebGenPro] whatsapp_numero no configurado');
        return;
      }
      const message = customMessage || cfg.whatsapp_mensaje_default || 'Hola, quería hacer una consulta';
      const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank', 'noopener');
    },

    setupFloatingButton(config) {
      // Solo en mobile (decisión Ronda 2)
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'wgp-wa-fab';
      btn.setAttribute('aria-label', 'Contactar por WhatsApp');
      btn.setAttribute('data-cta', 'whatsapp');
      btn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0 0 20.464 3.488"/>
        </svg>
      `;
      btn.addEventListener('click', () => WhatsAppHandler.open(config));
      document.body.appendChild(btn);
    },

    bindCTAs(config) {
      // Cualquier elemento con [data-cta="whatsapp"]
      document.querySelectorAll('[data-cta="whatsapp"]').forEach(el => {
        // Evitar doble-bind si ya tiene listener nuestro
        if (el.dataset.wgpBound === '1') return;
        el.dataset.wgpBound = '1';
        el.addEventListener('click', (e) => {
          e.preventDefault();
          const customMsg = el.dataset.message;
          WhatsAppHandler.open(config, customMsg);
        });
      });
    }
  };

  // ════════════════════════════════════════════════════════════
  // 4. FORMULARIO + MODAL DE ÉXITO
  // ════════════════════════════════════════════════════════════

  const ContactForm = {
    setup(config) {
      const forms = document.querySelectorAll('[data-form="contact"]');
      forms.forEach(form => this._bindForm(form, config));
    },

    _bindForm(form, config) {
      // Inyectar honeypot anti-spam si no existe
      if (!form.querySelector('[name="_gotcha"]')) {
        const honey = document.createElement('input');
        honey.type = 'text';
        honey.name = '_gotcha';
        honey.style.cssText = 'position:absolute;left:-9999px;width:1px;height:1px;opacity:0;pointer-events:none';
        honey.setAttribute('tabindex', '-1');
        honey.setAttribute('aria-hidden', 'true');
        honey.setAttribute('autocomplete', 'off');
        form.appendChild(honey);
      }

      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formspreeId = config.formspree_id;
        if (!formspreeId) {
          console.error('[WebGenPro] formspree_id no configurado');
          this._showModal('error', 'Configuración pendiente. Contactanos por WhatsApp.', config);
          return;
        }

        // Honeypot check
        if (form.querySelector('[name="_gotcha"]').value) return;

        const submitBtn = form.querySelector('[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando…';

        try {
          const formData = new FormData(form);
          const response = await fetch(`https://formspree.io/f/${formspreeId}`, {
            method: 'POST',
            body: formData,
            headers: { 'Accept': 'application/json' },
          });

          if (response.ok) {
            form.reset();
            this._showModal('success', '¡Mensaje enviado! Te contactamos a la brevedad.', config);
          } else {
            const data = await response.json().catch(() => ({}));
            const msg = data.errors ? data.errors.map(e => e.message).join(', ') : 'Hubo un error.';
            throw new Error(msg);
          }
        } catch (err) {
          this._showModal('error', 'No pudimos enviar el mensaje. Probá por WhatsApp.', config);
        } finally {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        }
      });
    },

    /** Modal de éxito superpuesto (decisión Ronda 2) */
    _showModal(type, message, config) {
      // Asegurar que solo haya un modal
      const existing = document.querySelector('[data-wgp-modal]');
      if (existing) existing.remove();

      const modal = document.createElement('div');
      modal.dataset.wgpModal = '';
      modal.className = `wgp-modal wgp-modal--${type}`;
      modal.innerHTML = `
        <div class="wgp-modal__overlay" data-modal-close></div>
        <div class="wgp-modal__box" role="dialog" aria-modal="true" aria-labelledby="wgp-modal-title">
          <div class="wgp-modal__icon">
            ${type === 'success'
              ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>'
              : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>'
            }
          </div>
          <h3 id="wgp-modal-title" class="wgp-modal__title">${type === 'success' ? '¡Listo!' : 'Algo salió mal'}</h3>
          <p class="wgp-modal__text">${message}</p>
          <div class="wgp-modal__actions">
            ${type === 'error'
              ? '<button type="button" class="wgp-modal__btn wgp-modal__btn--alt" data-cta="whatsapp">Abrir WhatsApp</button>'
              : ''
            }
            <button type="button" class="wgp-modal__btn" data-modal-close>Cerrar</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
      requestAnimationFrame(() => modal.classList.add('is-open'));

      // Bind close
      modal.querySelectorAll('[data-modal-close]').forEach(el => {
        el.addEventListener('click', () => {
          modal.classList.remove('is-open');
          setTimeout(() => modal.remove(), 250);
        });
      });

      // Bind WhatsApp si está
      const wa = modal.querySelector('[data-cta="whatsapp"]');
      if (wa) wa.addEventListener('click', () => WhatsAppHandler.open(config));

      // ESC para cerrar
      const onKey = (e) => {
        if (e.key === 'Escape') {
          modal.querySelector('[data-modal-close]').click();
          document.removeEventListener('keydown', onKey);
        }
      };
      document.addEventListener('keydown', onKey);
    }
  };

  // ════════════════════════════════════════════════════════════
  // 5. INYECCIÓN DE ESTILOS DEL CORE
  // ════════════════════════════════════════════════════════════

  function injectStyles(config) {
    const colors = (config.config && config.config.colors) || {};
    const root = document.documentElement;
    Object.entries(colors).forEach(([key, val]) => {
      root.style.setProperty(`--wgp-${key.replace(/_/g, '-')}`, val);
    });

    if (document.querySelector('[data-wgp-styles]')) return;

    const css = `
      :root {
        --wgp-primary: var(--wgp-primary, #0EA5E9);
        --wgp-primary-dark: var(--wgp-primary-dark, #0369A1);
        --wgp-text-on-primary: #fff;
        --wgp-success: #10B981;
        --wgp-danger: #EF4444;
        --wgp-surface: #ffffff;
        --wgp-surface-alt: #F8FAFC;
        --wgp-border: rgba(0,0,0,0.08);
        --wgp-text: #0F172A;
        --wgp-text-muted: #64748B;
        --wgp-shadow: 0 10px 40px -8px rgba(0,0,0,0.18);
      }

      /* ─── CHATBOT ─────────────────────────────────────── */
      .wgp-chat {
        position: fixed; bottom: 20px; right: 20px;
        z-index: 999998;
        font-family: system-ui, -apple-system, sans-serif;
      }
      .wgp-chat__bubble {
        width: 60px; height: 60px; border-radius: 50%;
        background: var(--wgp-primary); color: var(--wgp-text-on-primary);
        border: none; cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        box-shadow: var(--wgp-shadow);
        transition: transform .2s ease, background .2s ease;
      }
      .wgp-chat__bubble:hover { transform: scale(1.06); background: var(--wgp-primary-dark); }
      .wgp-chat__bubble svg { width: 26px; height: 26px; }
      .wgp-chat__icon-close { display: none; }
      .wgp-chat[data-state="open"] .wgp-chat__icon-open { display: none; }
      .wgp-chat[data-state="open"] .wgp-chat__icon-close { display: block; }

      .wgp-chat__panel {
        position: absolute; bottom: 76px; right: 0;
        width: 360px; max-width: calc(100vw - 40px);
        height: 520px; max-height: calc(100vh - 120px);
        background: var(--wgp-surface);
        border-radius: 16px; overflow: hidden;
        box-shadow: var(--wgp-shadow);
        display: flex; flex-direction: column;
        opacity: 0; transform: translateY(10px) scale(.96);
        pointer-events: none;
        transition: opacity .25s ease, transform .25s ease;
      }
      .wgp-chat[data-state="open"] .wgp-chat__panel {
        opacity: 1; transform: translateY(0) scale(1); pointer-events: auto;
      }

      .wgp-chat__header {
        background: var(--wgp-primary); color: var(--wgp-text-on-primary);
        padding: 16px 20px;
      }
      .wgp-chat__header-info { display: flex; flex-direction: column; gap: 2px; }
      .wgp-chat__header-info strong { font-size: 15px; font-weight: 600; }
      .wgp-chat__status {
        font-size: 12px; opacity: .85;
        display: flex; align-items: center; gap: 6px;
      }
      .wgp-chat__status::before {
        content: ''; width: 7px; height: 7px; border-radius: 50%;
        background: #34D399;
      }

      .wgp-chat__messages {
        flex: 1; overflow-y: auto;
        padding: 16px; display: flex; flex-direction: column; gap: 10px;
        background: var(--wgp-surface-alt);
      }
      .wgp-chat__msg { display: flex; }
      .wgp-chat__msg--user { justify-content: flex-end; }
      .wgp-chat__bubble-msg {
        max-width: 80%; padding: 10px 14px; border-radius: 14px;
        font-size: 14px; line-height: 1.45; word-wrap: break-word;
      }
      .wgp-chat__msg--bot .wgp-chat__bubble-msg {
        background: var(--wgp-surface); color: var(--wgp-text);
        border: 1px solid var(--wgp-border);
        border-bottom-left-radius: 4px;
      }
      .wgp-chat__msg--user .wgp-chat__bubble-msg {
        background: var(--wgp-primary); color: var(--wgp-text-on-primary);
        border-bottom-right-radius: 4px;
      }

      .wgp-chat__suggestions {
        display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px;
      }
      .wgp-chat__suggestion {
        background: var(--wgp-surface); color: var(--wgp-text);
        border: 1px solid var(--wgp-border);
        padding: 8px 12px; border-radius: 100px;
        font-size: 12.5px; cursor: pointer;
        transition: all .15s ease;
      }
      .wgp-chat__suggestion:hover {
        border-color: var(--wgp-primary); color: var(--wgp-primary);
      }

      .wgp-chat__msg-actions {
        display: flex; flex-direction: column; gap: 6px;
        margin-top: 8px; align-items: flex-start;
      }
      .wgp-chat__action {
        background: var(--wgp-primary); color: var(--wgp-text-on-primary);
        border: none; padding: 9px 14px; border-radius: 8px;
        font-size: 13px; font-weight: 500; cursor: pointer;
        transition: background .15s ease;
      }
      .wgp-chat__action:hover { background: var(--wgp-primary-dark); }

      .wgp-chat__typing { display: flex; gap: 4px; align-items: center; padding: 12px 14px; }
      .wgp-chat__typing span {
        width: 6px; height: 6px; border-radius: 50%;
        background: var(--wgp-text-muted);
        animation: wgp-bounce 1.2s infinite ease-in-out;
      }
      .wgp-chat__typing span:nth-child(2) { animation-delay: .15s; }
      .wgp-chat__typing span:nth-child(3) { animation-delay: .3s; }
      @keyframes wgp-bounce {
        0%, 60%, 100% { transform: translateY(0); opacity: .5; }
        30% { transform: translateY(-5px); opacity: 1; }
      }

      .wgp-chat__form {
        display: flex; gap: 8px; padding: 12px;
        border-top: 1px solid var(--wgp-border);
        background: var(--wgp-surface);
      }
      .wgp-chat__input {
        flex: 1; padding: 10px 14px;
        border: 1px solid var(--wgp-border); border-radius: 100px;
        font-size: 14px; outline: none;
        font-family: inherit;
      }
      .wgp-chat__input:focus { border-color: var(--wgp-primary); }
      .wgp-chat__send {
        width: 40px; height: 40px; border-radius: 50%;
        background: var(--wgp-primary); color: var(--wgp-text-on-primary);
        border: none; cursor: pointer;
        display: flex; align-items: center; justify-content: center;
      }
      .wgp-chat__send:hover { background: var(--wgp-primary-dark); }
      .wgp-chat__send svg { width: 18px; height: 18px; }

      /* ─── WHATSAPP FAB (mobile only) ──────────────────── */
      .wgp-wa-fab {
        position: fixed; bottom: 20px; left: 20px;
        width: 56px; height: 56px; border-radius: 50%;
        background: #25D366; color: #fff;
        border: none; cursor: pointer;
        display: none; align-items: center; justify-content: center;
        box-shadow: var(--wgp-shadow);
        z-index: 999997;
        transition: transform .2s ease;
      }
      .wgp-wa-fab:hover { transform: scale(1.06); }
      .wgp-wa-fab svg { width: 28px; height: 28px; }
      @media (max-width: 768px) { .wgp-wa-fab { display: flex; } }

      /* ─── MODAL DE ÉXITO/ERROR ────────────────────────── */
      .wgp-modal {
        position: fixed; inset: 0; z-index: 999999;
        display: flex; align-items: center; justify-content: center;
        opacity: 0; pointer-events: none;
        transition: opacity .25s ease;
        font-family: system-ui, -apple-system, sans-serif;
      }
      .wgp-modal.is-open { opacity: 1; pointer-events: auto; }
      .wgp-modal__overlay {
        position: absolute; inset: 0;
        background: rgba(15,23,42,0.6);
        backdrop-filter: blur(4px);
      }
      .wgp-modal__box {
        position: relative;
        background: var(--wgp-surface); color: var(--wgp-text);
        padding: 32px 28px; border-radius: 20px;
        max-width: 400px; width: calc(100vw - 40px);
        text-align: center;
        box-shadow: var(--wgp-shadow);
        transform: scale(.92);
        transition: transform .25s ease;
      }
      .wgp-modal.is-open .wgp-modal__box { transform: scale(1); }
      .wgp-modal__icon {
        width: 64px; height: 64px; border-radius: 50%;
        margin: 0 auto 16px;
        display: flex; align-items: center; justify-content: center;
      }
      .wgp-modal__icon svg { width: 32px; height: 32px; }
      .wgp-modal--success .wgp-modal__icon {
        background: rgba(16,185,129,0.12); color: var(--wgp-success);
      }
      .wgp-modal--error .wgp-modal__icon {
        background: rgba(239,68,68,0.12); color: var(--wgp-danger);
      }
      .wgp-modal__title { font-size: 20px; font-weight: 600; margin: 0 0 8px; }
      .wgp-modal__text { color: var(--wgp-text-muted); margin: 0 0 20px; line-height: 1.5; font-size: 15px; }
      .wgp-modal__actions { display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; }
      .wgp-modal__btn {
        padding: 10px 20px; border-radius: 8px;
        background: var(--wgp-primary); color: var(--wgp-text-on-primary);
        border: none; cursor: pointer; font-size: 14px; font-weight: 500;
        font-family: inherit;
      }
      .wgp-modal__btn:hover { background: var(--wgp-primary-dark); }
      .wgp-modal__btn--alt {
        background: #25D366;
      }
      .wgp-modal__btn--alt:hover { background: #1FB855; }

      /* ─── RESPONSIVE ──────────────────────────────────── */
      @media (max-width: 480px) {
        .wgp-chat { bottom: 16px; right: 16px; }
        .wgp-chat__bubble { width: 56px; height: 56px; }
        .wgp-chat__panel {
          width: calc(100vw - 32px);
          height: calc(100vh - 100px);
          bottom: 72px;
        }
      }
    `;

    const style = document.createElement('style');
    style.dataset.wgpStyles = '';
    style.textContent = css;
    document.head.appendChild(style);
  }

  // ════════════════════════════════════════════════════════════
  // 6. INIT
  // ════════════════════════════════════════════════════════════

  function init() {
    if (!window.PROJECT_DATA) {
      console.error('[WebGenPro] window.PROJECT_DATA no encontrado. Asegurate de definirlo antes de cargar core.js');
      return;
    }

    const projectData = window.PROJECT_DATA;
    const config = projectData.config || {};

    // 1. Inyectar estilos
    injectStyles(projectData);

    // 2. Chatbot
    const engine = new ChatEngine(projectData.web_content);
    new ChatUI(engine, projectData);

    // 3. WhatsApp
    WhatsAppHandler.setupFloatingButton(config);
    WhatsAppHandler.bindCTAs(config);

    // 4. Form
    ContactForm.setup(config);

    // Exponer API mínima para uso externo
    window.WebGenPro = {
      openWhatsApp: (msg) => WhatsAppHandler.open(config, msg),
      version: '1.0.0',
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
