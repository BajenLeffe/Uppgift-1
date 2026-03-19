import { escapeHtml } from '../utils/html.js';

export function renderMessages(data) {
  const items = (data || []).map(row => {
    const when = new Date(row.created_at).toLocaleString('sv-SE');
    return `<li>
      <div><strong>#${row.id}</strong> · ${escapeHtml(when)}</div>
      <div><strong>${escapeHtml(row.name)}</strong></div>
      <div>${escapeHtml(row.message).replaceAll('\n', '<br/>')}</div>
    </li>`;
  }).join('');

  return `<!doctype html>
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
</html>`;
}
