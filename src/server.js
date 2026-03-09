import express from 'express';
import helmet from 'helmet';
import { createClient } from '@supabase/supabase-js';

const app = express();

// --- Basic server hardening (enkelt men bra vana)
app.use(helmet());
app.use(express.urlencoded({ extended: false })); // för HTML-form (application/x-www-form-urlencoded)

const PORT = Number(process.env.PORT || 3000);

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('[env] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

// --- Helpers: input = opålitlig
function clampString(value, maxLen) {
  const v = String(value ?? '').trim();
  return v.length > maxLen ? v.slice(0, maxLen) : v;
}

// Viktigt: om vi visar input i HTML, escapea!
function escapeHtml(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

// --- GET /: visar formulär (dynamisk sida kan vara "servern bygger HTML")
app.get('/', (req, res) => {
  res.type('html').send(`<!doctype html>
<html lang="sv">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Request-resan</title>
  <style>
    body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial; padding: 24px; max-width: 720px; margin: 0 auto; }
    form { display: grid; gap: 12px; padding: 16px; border: 1px solid #ddd; border-radius: 12px; }
    label { display: grid; gap: 6px; }
    input, textarea { font: inherit; padding: 10px; border: 1px solid #ccc; border-radius: 10px; }
    button { font: inherit; padding: 10px 14px; border: 0; border-radius: 10px; cursor: pointer; }
    button { background: #111; color: #fff; }
    .hint { color: #555; font-size: 14px; }
    .links { margin-top: 12px; }
  </style>
</head>
<body>
  <h1>Request-resan (GET → POST → DB)</h1>
  
  <form method="POST" action="/send">
    <label>
      Namn
      <input name="name" autocomplete="name" maxlength="50" required />
    </label>

    <label>
      Meddelande
      <textarea name="message" rows="4" maxlength="500" required></textarea>
    </label>

    <button type="submit">Skicka (POST /send)</button>
  </form>

  <div class="links">
    <a href="/messages">Se senaste meddelanden (GET /messages)</a>
  </div>
</body>
</html>`);
});

// --- POST /send: tar emot input + sparar i Supabase + svarar "jag tog emot din input"
app.post('/send', async (req, res) => {
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
});

// --- Extra: GET /messages (dynamisk sida som läser från DB)
app.get('/messages', async (req, res) => {
  const { data, error } = await supabase
    .from('request_messages')
    .select('id, created_at, name, message')
    .order('created_at', { ascending: false })
    .limit(10);

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
  <h1>Senaste 10</h1>
  <a href="/">← Till formuläret</a>
  <ul>${items || '<li>Inga meddelanden än.</li>'}</ul>
</body>
</html>`);
});

app.listen(PORT, () => {
  console.log(`[server] http://localhost:${PORT}`);
});
