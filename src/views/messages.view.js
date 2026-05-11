export function renderMessagesPage({ itemsHtml }) {
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
  <h1>Senaste 10</h1>
  <a href="/">← Till formuläret</a>
  <ul>${itemsHtml || '<li>Inga meddelanden än.</li>'}</ul>
</body>
</html>`;
}
