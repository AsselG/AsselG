/** Turns a web page into plain text: no scripts, styles, navigation or footers; one block per line. */
export function htmlToText(html: string, maxChars: number): string {
  let s = html
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<(script|style|noscript|svg|nav|footer|iframe|template)\b[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<(br|\/p|\/div|\/li|\/h[1-6]|\/article|\/section|\/tr|\/dd|\/dt)\b[^>]*>/gi, '\n')
    .replace(/<[^>]+>/g, ' ');
  s = decodeEntities(s);
  s = s.split('\n').map((l) => l.replace(/[ \t\u00a0]+/g, ' ').trim()).filter(Boolean).join('\n');
  return s.length > maxChars ? s.slice(0, maxChars) : s;
}

const NAMED: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', euro: '€', middot: '·', laquo: '«', raquo: '»', ndash: '–', mdash: '—', rsquo: '’', lsquo: '‘', ldquo: '“', rdquo: '”', ccedil: 'ç', agrave: 'à', egrave: 'è', eacute: 'é', iacute: 'í', ograve: 'ò', oacute: 'ó', uacute: 'ú', iuml: 'ï', uuml: 'ü', ntilde: 'ñ' };
export function decodeEntities(s: string): string {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&([a-z]+);/gi, (m, n) => NAMED[n.toLowerCase()] ?? m);
}
