import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { supabase } from '../lib/supabase.js';
import { clampString } from '../utils/sanitize.js';
import { escapeHtml } from '../utils/html.js';
import { renderLoginPage } from '../views/login.view.js';
import { renderSignupPage } from '../views/signup.view.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

// Show login page
export async function showLogin(req, res) {
  const token = req.cookies?.auth_token;
  if (token) {
    try {
      jwt.verify(token, JWT_SECRET);
      return res.redirect('/');
    } catch {
      // Token invalid, show login
    }
  }
  res.type('html').send(renderLoginPage());
}

// Show signup page
export async function showSignup(req, res) {
  res.type('html').send(renderSignupPage());
}

// Create account
export async function signup(req, res) {
  const usernameRaw = clampString(req.body?.username, 50);
  const passwordRaw = clampString(req.body?.password, 100);

  if (!usernameRaw || !passwordRaw) {
    return res.status(400).type('html').send('<p>Fel: användarnamn och lösenord krävs.</p><p><a href="/auth/signup">Tillbaka</a></p>');
  }

  if (passwordRaw.length < 1) {
    return res.status(400).type('html').send('<p>Fel: lösenord måste vara minst 1 tecken.</p><p><a href="/auth/signup">Tillbaka</a></p>');
  }

  // Check if user exists
  const { data: existingUser, error: checkError } = await supabase
    .from('users')
    .select('id')
    .eq('username', usernameRaw)
    .single();

  if (!checkError && existingUser) {
    return res.status(400).type('html').send('<p>Fel: användarnamnet finns redan.</p><p><a href="/auth/signup">Tillbaka</a></p>');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(passwordRaw, 10);

  // Insert user
  const { data, error } = await supabase
    .from('users')
    .insert({ username: usernameRaw, password: hashedPassword })
    .select('id');

  if (error) {
    console.error('[supabase] signup error:', error);
    return res.status(500).type('html').send('<p>Serverfel när vi skulle skapa kontot.</p><p><a href="/auth/signup">Tillbaka</a></p>');
  }

  // Redirect to login
  res.status(200).type('html').send(`
    <h1>Konto skapat!</h1>
    <p>Ditt konto har skapats. Logga in nu.</p>
    <p><a href="/auth/login">Gå till login</a></p>
  `);
}

// Login
export async function login(req, res) {
  const usernameRaw = clampString(req.body?.username, 50);
  const passwordRaw = clampString(req.body?.password, 100);

  if (!usernameRaw || !passwordRaw) {
    return res.status(400).type('html').send('<p>Fel: användarnamn och lösenord krävs.</p><p><a href="/auth/login">Tillbaka</a></p>');
  }

  // Get user
  const { data: user, error } = await supabase
    .from('users')
    .select('id, username, password')
    .eq('username', usernameRaw)
    .single();

  if (error || !user) {
    return res.status(401).type('html').send('<p>Fel: användarnamn eller lösenord är fel.</p><p><a href="/auth/login">Tillbaka</a></p>');
  }

  // Check password
  const passwordMatch = await bcrypt.compare(passwordRaw, user.password);

  if (!passwordMatch) {
    return res.status(401).type('html').send('<p>Fel: användarnamn eller lösenord är fel.</p><p><a href="/auth/login">Tillbaka</a></p>');
  }

  // Create JWT token
  const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });

  // Set cookie
  res.cookie('auth_token', token, {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    path: '/'
  });

  res.status(200).type('html').send(`
    <h1>Inloggad!</h1>
    <p>Du är nu inloggad som ${escapeHtml(user.username)}.</p>
    <p><a href="/">Gå till formulär</a></p>
  `);
}

// Logout
export async function logout(req, res) {
  res.clearCookie('auth_token', { path: '/' });
  res.type('html').send(`
    <h1>Utloggad</h1>
    <p>Du har loggat ut.</p>
    <p><a href="/auth/login">Logga in igen</a></p>
  `);
}

// Initialize admin user (run once)
export async function initializeAdmin() {
  // Check if admin exists
  const { data: admin } = await supabase
    .from('users')
    .select('id')
    .eq('username', 'admin')
    .single();

  if (admin) {
    console.log('[auth] Admin user already exists');
    return;
  }

  // Create admin user
  const hashedPassword = await bcrypt.hash('1', 10);
  const { error } = await supabase
    .from('users')
    .insert({ username: 'admin', password: hashedPassword });

  if (error) {
    console.error('[auth] Failed to create admin user:', error);
    return;
  }

  console.log('[auth] Admin user created (username: admin, password: 1)');
}
