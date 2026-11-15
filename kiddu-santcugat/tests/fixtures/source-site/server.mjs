// Fake Sant Cugat sources for the pipeline tests. Pages may contain {ns} (scenario id) and {v} (page version).
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const dir = path.join(path.dirname(new URL(import.meta.url).pathname), 'pages');
const log = [];
const versions = new Map();

http.createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  const ns = url.searchParams.get('ns') ?? '';
  if (url.pathname === '/__log') {
    res.setHeader('content-type', 'application/json');
    return res.end(JSON.stringify(log.filter((e) => e.ns === url.searchParams.get('ns'))));
  }
  if (url.pathname === '/__bump') { versions.set(ns, (versions.get(ns) ?? 1) + 1); return res.end('ok'); }
  log.push({ host: req.headers.host, path: url.pathname, ns, ua: req.headers['user-agent'] ?? '' });
  if (url.pathname === '/robots.txt') {
    res.setHeader('content-type', 'text/plain');
    return res.end('User-agent: *\nDisallow: /private/\n');
  }
  const file = path.join(dir, path.normalize(url.pathname).replace(/^\/+/, ''));
  if (!file.startsWith(dir) || !fs.existsSync(file)) { res.statusCode = 404; return res.end('not found'); }
  const html = fs.readFileSync(file, 'utf8').replaceAll('{ns}', ns).replaceAll('{v}', String(versions.get(ns) ?? 1));
  res.setHeader('content-type', file.endsWith('.rss') ? 'application/rss+xml; charset=utf-8' : 'text/html; charset=utf-8');
  res.end(html);
}).listen(3101);
