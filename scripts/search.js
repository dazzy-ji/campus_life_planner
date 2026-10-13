export function compileRegex(query, flags = 'gi') {
  if (!query) return null;
  let cleanQuery = query.trim();
  if (cleanQuery.startsWith('@tag:')) {
    cleanQuery = cleanQuery.replace('@tag:', '').trim();
  }
  try {
    return new RegExp(cleanQuery, flags);
  } catch (e) {
    const escaped = cleanQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(escaped, flags);
  }
}

export function highlight(text, regex) {
  if (!regex || !text) return text;
  return String(text).replace(regex, (match) => `<mark>${match}</mark>`);
}