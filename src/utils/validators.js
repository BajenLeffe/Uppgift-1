// Hjälpfunktion: begränsa längd på input
export function clampString(value, maxLen) {
  const v = String(value ?? '').trim();
  return v.length > maxLen ? v.slice(0, maxLen) : v;
}

// Viktigt: om vi visar input i HTML, escapea!
export function escapeHtml(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
