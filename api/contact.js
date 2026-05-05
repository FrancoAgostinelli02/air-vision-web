export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const formspreeId = process.env.FORMSPREE_ID;
  if (!formspreeId) {
    return res.status(500).json({ error: 'Formulario no configurado' });
  }

  try {
    const bodyToSend = JSON.stringify(req.body);
    console.log('[contact] body recibido:', bodyToSend);

    const response = await fetch(`https://formspree.io/f/${formspreeId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Origin': 'https://proyecto-air-vision.vercel.app',
        'Referer': 'https://proyecto-air-vision.vercel.app/',
      },
      body: bodyToSend,
    });

    const data = await response.json();
    console.log('[contact] formspree status:', response.status, JSON.stringify(data));

    if (response.ok) {
      return res.status(200).json({ ok: true });
    }

    const msg = data.errors ? data.errors.map(e => e.message).join(', ') : 'Error al enviar';
    return res.status(response.status).json({ error: msg });
  } catch (err) {
    console.error('[contact] error:', err.message);
    return res.status(500).json({ error: 'Error de red' });
  }
}
