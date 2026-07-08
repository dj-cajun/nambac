/** Insert a friend's name into copy with correct Vietnamese grammar. */
export function interpolateName(text, name) {
  const raw = String(text || '');
  const n = String(name || '').trim();
  const subject = n || 'đứa này';
  const Subject = n ? subject.charAt(0).toUpperCase() + subject.slice(1) : 'Đứa này';
  return raw.replace(/\{name\}/g, subject).replace(/\{Name\}/g, Subject);
}
