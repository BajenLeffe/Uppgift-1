export function getForm(req, res) {
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
}
