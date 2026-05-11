export function renderLoginPage() {
  return `<!doctype html>
<html lang="sv">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Logga in</title>
  <style>
    body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial; padding: 24px; max-width: 720px; margin: 0 auto; }
    form { display: grid; gap: 12px; padding: 16px; border: 1px solid #ddd; border-radius: 12px; }
    label { display: grid; gap: 6px; }
    input { font: inherit; padding: 10px; border: 1px solid #ccc; border-radius: 10px; }
    button { font: inherit; padding: 10px 14px; border: 0; border-radius: 10px; cursor: pointer; background: #111; color: #fff; }
    .hint { color: #555; font-size: 14px; }
    .links { margin-top: 12px; }
  </style>
</head>
<body>
  <h1>Logga in</h1>
  <p class="hint">Ange ditt användarnamn och lösenord för att logga in.</p>

  <form method="POST" action="/auth/login">
    <label>
      Användarnamn
      <input name="username" type="text" maxlength="50" required />
    </label>

    <label>
      Lösenord
      <input name="password" type="password" maxlength="100" required />
    </label>

    <button type="submit">Logga in</button>
  </form>

  <div class="links">
    <p>Har du inget konto? <a href="/auth/signup">Skapa ett här</a></p>
    <p><a href="/">Tillbaka</a></p>
  </div>
</body>
</html>`;
}
