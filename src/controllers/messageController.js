import { supabase } from '../lib/supabase.js';
import { clampString, escapeHtml } from '../utils/validators.js';

export async function sendMessage(req, res) {
  // 🔺 RÖD TRIANGEL I RITNINGEN: här kommer input in (opålitlig!)
  const name = clampString(req.body?.name, 50);
  const message = clampString(req.body?.message, 500);

  // Minimal validering
  if (!name || !message) {
    return res.status(400).type('html').send('<p>Fel: saknar namn eller meddelande.</p><p><a href="/">Tillbaka</a></p>');
  }

  const userAgent = clampString(req.get('user-agent'), 200);
  const ip = clampString(req.ip, 60);

  const { error } = await supabase
    .from('request_messages')
    .insert([{ name, message, user_agent: userAgent, ip }]);

  if (error) {
    console.error('[supabase] insert error:', error);
    return res.status(500).type('html').send('<p>Serverfel när vi skulle spara i databasen.</p><p><a href="/">Tillbaka</a></p>');
  }

  // Svar: "jag tog emot din input" + (säkert) visar tillbaka input
  res.type('html').send(`<!doctype html>
<html lang="sv">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Mottaget</title>
  <style>
    body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial; padding: 24px; max-width: 720px; margin: 0 auto; }
    .card { padding: 16px; border: 1px solid #ddd; border-radius: 12px; }
    .hint { color: #555; font-size: 14px; }
  </style>
</head>
<body>
  <h1>✅ Jag tog emot din input</h1>
  <p class="hint">Input är opålitlig → vi validerar, begränsar längd och escape:ar innan visning.</p>

  <div class="card">
    <p><strong>Namn:</strong> ${escapeHtml(name)}</p>
    <p><strong>Meddelande:</strong><br/>${escapeHtml(message).replaceAll('\n', '<br/>')}</p>
  </div>

  <p><a href="/">Skicka ett till</a> · <a href="/messages">Se listan</a></p>
</body>
</html>`);
}

export async function getMessages(req, res) {
  const { data, error } = await supabase
    .from('request_messages')
    .select('id, created_at, name, message')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('[supabase] select error:', error);
    return res.status(500).type('html').send('<p>Serverfel när vi skulle läsa från databasen.</p><p><a href="/">Tillbaka</a></p>');
  }

  const items = (data || []).map(row => {
    const when = new Date(row.created_at).toLocaleString('sv-SE');
    return `<li>
      <div><strong>#${row.id}</strong> · ${escapeHtml(when)}</div>
      <div><strong>${escapeHtml(row.name)}</strong></div>
      <div>${escapeHtml(row.message).replaceAll('\n', '<br/>')}</div>
    </li>`;
  }).join('');

  res.type('html').send(`<!doctype html>
<html lang="sv">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Senaste meddelanden</title>
  <style>
    body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial; padding: 24px; max-width: 720px; margin: 0 auto; }
    ul { list-style: none; padding: 0; display: grid; gap: 12px; }
    li { padding: 12px; border: 1px solid #ddd; border-radius: 12px; }
    a { display: inline-block; margin-bottom: 12px; }
  </style>
</head>
<body>
  <h1>Alla meddelanden</h1>
  <a href="/">← Till formuläret</a>
  <ul>${items || '<li>Inga meddelanden än.</li>'}</ul>
</body>
</html>`);
}
