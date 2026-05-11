export function renderSignupPage() {
  return `<!doctype html>
<html lang="sv">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Skapa konto</title>
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
  <h1>Skapa konto</h1>
  <p class="hint">Välj ett användarnamn och lösenord för att skapa ett nytt konto.</p>

  <form method="POST" action="/auth/signup">
    <label>
      Användarnamn
      <input name="username" type="text" maxlength="50" required />
    </label>

    <label>
      Lösenord
      <input name="password" type="password" maxlength="100" required />
    </label>

    <button type="submit">Skapa konto</button>
  </form>

  <div class="links">
    <p>Har du redan ett konto? <a href="/auth/login">Logga in här</a></p>
    <p><a href="/">Tillbaka</a></p>
  </div>
</body>
</html>`;
}
