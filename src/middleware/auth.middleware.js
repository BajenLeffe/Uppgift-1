import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

export function authMiddleware(req, res, next) {
  const token = req.cookies?.auth_token;

  if (!token) {
    return res.status(401).type('html').send('<p>Fel: Du måste vara inloggad.</p><p><a href="/auth/login">Logga in</a></p>');
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).type('html').send('<p>Fel: Ogiltig token.</p><p><a href="/auth/login">Logga in igen</a></p>');
  }
}
