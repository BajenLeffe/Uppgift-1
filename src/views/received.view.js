import { escapeHtml } from '../utils/html.js';

export function renderReceived(name, message) {
  return `<!doctype html>
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
</html>`;
}
