export function renderFormPage({ username, isLoggedIn }) {
  const authSection = isLoggedIn 
    ? `<p class="hint">Inloggad som <strong>${username}</strong> · <a href="/auth/logout">Logga ut</a></p>`
    : `<p class="hint"><a href="/auth/login">Logga in</a> eller <a href="/auth/signup">skapa konto</a> för att kunna redigera dina meddelanden.</p>`;
  
  return `<!doctype html>
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
    .auth-info { margin-bottom: 16px; padding: 12px; background: #f5f5f5; border-radius: 10px; }
    .links { margin-top: 12px; }
  </style>
</head>
<body>
  <h1>Request-resan (GET → POST → DB)</h1>
  
  <div class="auth-info">
    ${authSection}
  </div>

  <p class="hint">Skicka formuläret så hamnar texten i servern och kan sparas i databasen.</p>

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
</html>`;
}
