import { supabase } from '../lib/supabase.js';
import { clampString } from '../utils/sanitize.js';
import { escapeHtml } from '../utils/html.js';
import jwt from 'jsonwebtoken';

import { renderFormPage } from '../views/form.view.js';
import { renderReceivedPage } from '../views/received.view.js';
import { renderMessagesPage } from '../views/messages.view.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

function getUser(req) {
  const token = req.cookies?.auth_token;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch {
    return null;
  }
}

export async function showForm(req, res) {
  const user = getUser(req);
  res.type('html').send(renderFormPage({ 
    username: user?.username || null, 
    isLoggedIn: !!user 
  }));
}

export async function sendMessage(req, res) {
  const user = getUser(req);

  if (!user) {
    return res.status(401).type('html').send('<p>Fel: Du måste vara inloggad för att skicka meddelanden.</p><p><a href="/auth/login">Logga in</a></p>');
  }

  // 🔺 Här kommer användarens input in i servern
  const nameRaw = clampString(req.body?.name, 50);
  const messageRaw = clampString(req.body?.message, 500);

  if (!nameRaw || !messageRaw) {
    return res.status(400).type('html').send('<p>Fel: saknar namn eller meddelande.</p><p><a href="/">Tillbaka</a></p>');
  }

  const userAgent = clampString(req.get('user-agent'), 200);
  const ip = clampString(req.ip, 60);

  const { error: insertError } = await supabase
    .from('request_messages')
    .insert({
      name: nameRaw,
      message: messageRaw,
      user_id: user.userId,
      user_agent: userAgent,
      ip_address: ip
    });

  if (insertError) {
    console.error('[supabase] insert error:', insertError);
    return res.status(500).type('html').send('<p>Serverfel när vi skulle spara i databasen.</p><p><a href="/">Tillbaka</a></p>');
  }

  // 🧽 Escape innan vi stoppar in i HTML (XSS-säker visning)
  const safeName = escapeHtml(nameRaw);
  const safeMessage = escapeHtml(messageRaw).replaceAll('\n', '<br/>');

  res.type('html').send(
    renderReceivedPage({ name: safeName, message: safeMessage })
  );
}

export async function listMessages(req, res) {
  const user = getUser(req);

  const { data, error } = await supabase
    .from('request_messages')
    .select('id, created_at, name, message, user_id, users(username)')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('[supabase] select error:', error);
    return res.status(500).type('html').send('<p>Serverfel när vi skulle läsa från databasen.</p><p><a href="/">Tillbaka</a></p>');
  }

  const isAdmin = user?.username === 'admin';

  const itemsHtml = (data || []).map((row) => {
    const when = escapeHtml(new Date(row.created_at).toLocaleString('sv-SE'));
    const n = escapeHtml(row.name);
    const m = escapeHtml(row.message).replaceAll('\n', '<br/>');
    const username = row.users?.username ? escapeHtml(row.users.username) : 'Anonym';
    
    const isOwner = user && user.userId === row.user_id;
    let actionsHtml = '';
    
    if (isOwner) {
      actionsHtml = `<div style="margin-top: 12px;">
        <a href="/edit/${row.id}" style="color: #0066cc; text-decoration: none; margin-right: 12px;">Redigera</a>
        <form method="POST" action="/delete/${row.id}" style="display: inline;">
          <button type="submit" style="background: none; border: none; color: #cc0000; cursor: pointer; text-decoration: underline; padding: 0; font: inherit;">Ta bort</button>
        </form>
      </div>`;
    } else if (isAdmin) {
      actionsHtml = `<div style="margin-top: 12px;">
        <form method="POST" action="/delete/${row.id}" style="display: inline;">
          <button type="submit" style="background: none; border: none; color: #cc0000; cursor: pointer; text-decoration: underline; padding: 0; font: inherit;">Ta bort (Admin)</button>
        </form>
      </div>`;
    }
    
    return `<li>
      <div><strong>#${row.id}</strong> · ${when}</div>
      <div><strong>${n}</strong> (${username})</div>
      <div>${m}</div>
      ${actionsHtml}
    </li>`;
  }).join('');

  res.type('html').send(renderMessagesPage({ itemsHtml }));
}

export async function showEditForm(req, res) {
  const user = getUser(req);

  if (!user) {
    return res.status(401).type('html').send('<p>Fel: Du måste vara inloggad för att redigera meddelanden.</p><p><a href="/auth/login">Logga in</a></p>');
  }

  const messageId = clampString(req.params?.id, 50);

  const { data: message, error } = await supabase
    .from('request_messages')
    .select('id, name, message, user_id')
    .eq('id', messageId)
    .single();

  if (error || !message) {
    return res.status(404).type('html').send('<p>Fel: Meddelandet hittades inte.</p><p><a href="/messages">Tillbaka</a></p>');
  }

  if (message.user_id !== user.userId) {
    return res.status(403).type('html').send('<p>Fel: Du kan bara redigera dina egna meddelanden.</p><p><a href="/messages">Tillbaka</a></p>');
  }

  const editHtml = `<!doctype html>
<html lang="sv">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Redigera meddelande</title>
  <style>
    body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial; padding: 24px; max-width: 720px; margin: 0 auto; }
    form { display: grid; gap: 12px; padding: 16px; border: 1px solid #ddd; border-radius: 12px; }
    label { display: grid; gap: 6px; }
    input, textarea { font: inherit; padding: 10px; border: 1px solid #ccc; border-radius: 10px; }
    button { font: inherit; padding: 10px 14px; border: 0; border-radius: 10px; cursor: pointer; background: #111; color: #fff; }
    .links { margin-top: 12px; }
  </style>
</head>
<body>
  <h1>Redigera meddelande</h1>
  
  <form method="POST" action="/edit/${message.id}">
    <label>
      Namn
      <input name="name" value="${escapeHtml(message.name)}" maxlength="50" required />
    </label>

    <label>
      Meddelande
      <textarea name="message" rows="4" maxlength="500" required>${escapeHtml(message.message)}</textarea>
    </label>

    <button type="submit">Spara ändringar</button>
  </form>

  <div class="links">
    <a href="/messages">Tillbaka</a>
  </div>
</body>
</html>`;

  res.type('html').send(editHtml);
}

export async function updateMessage(req, res) {
  const user = getUser(req);

  if (!user) {
    return res.status(401).type('html').send('<p>Fel: Du måste vara inloggad.</p><p><a href="/auth/login">Logga in</a></p>');
  }

  const messageId = clampString(req.params?.id, 50);
  const nameRaw = clampString(req.body?.name, 50);
  const messageRaw = clampString(req.body?.message, 500);

  if (!nameRaw || !messageRaw) {
    return res.status(400).type('html').send('<p>Fel: saknar namn eller meddelande.</p><p><a href="/messages">Tillbaka</a></p>');
  }

  // Check ownership
  const { data: message, error: fetchError } = await supabase
    .from('request_messages')
    .select('user_id')
    .eq('id', messageId)
    .single();

  if (fetchError || !message) {
    return res.status(404).type('html').send('<p>Fel: Meddelandet hittades inte.</p><p><a href="/messages">Tillbaka</a></p>');
  }

  if (message.user_id !== user.userId) {
    return res.status(403).type('html').send('<p>Fel: Du kan bara redigera dina egna meddelanden.</p><p><a href="/messages">Tillbaka</a></p>');
  }

  // Update message
  const { error: updateError } = await supabase
    .from('request_messages')
    .update({ name: nameRaw, message: messageRaw })
    .eq('id', messageId);

  if (updateError) {
    console.error('[supabase] update error:', updateError);
    return res.status(500).type('html').send('<p>Serverfel när vi skulle uppdatera meddelandet.</p><p><a href="/messages">Tillbaka</a></p>');
  }

  res.type('html').send(`
    <h1>✅ Meddelandet uppdaterat</h1>
    <p><a href="/messages">Tillbaka till meddelanden</a></p>
  `);
}

export async function deleteMessage(req, res) {
  const user = getUser(req);

  if (!user) {
    return res.status(401).type('html').send('<p>Fel: Du måste vara inloggad.</p><p><a href="/auth/login">Logga in</a></p>');
  }

  const messageId = clampString(req.params?.id, 50);

  // Check ownership
  const { data: message, error: fetchError } = await supabase
    .from('request_messages')
    .select('user_id')
    .eq('id', messageId)
    .single();

  if (fetchError || !message) {
    return res.status(404).type('html').send('<p>Fel: Meddelandet hittades inte.</p><p><a href="/messages">Tillbaka</a></p>');
  }

  const isOwner = message.user_id === user.userId;
  const isAdmin = user.username === 'admin';

  if (!isOwner && !isAdmin) {
    return res.status(403).type('html').send('<p>Fel: Du kan bara ta bort dina egna meddelanden.</p><p><a href="/messages">Tillbaka</a></p>');
  }

  // Delete message
  const { error: deleteError } = await supabase
    .from('request_messages')
    .delete()
    .eq('id', messageId);

  if (deleteError) {
    console.error('[supabase] delete error:', deleteError);
    return res.status(500).type('html').send('<p>Serverfel när vi skulle ta bort meddelandet.</p><p><a href="/messages">Tillbaka</a></p>');
  }

  res.type('html').send(`
    <h1>✅ Meddelandet borttaget</h1>
    <p><a href="/messages">Tillbaka till meddelanden</a></p>
  `);
}
