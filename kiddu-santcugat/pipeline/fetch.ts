/** Polite fetching: our own user agent, robots.txt respected, a pause between requests to the same site, size and time limits. */
export interface FetchOptions { userAgent: string; delayMs: number; timeoutMs: number }

interface Rules { allow: string[]; disallow: string[] }

export function parseRobots(txt: string, agent: string): Rules {
  const groups: { agents: string[]; rules: Rules }[] = [];
  let cur: { agents: string[]; rules: Rules } | null = null;
  let lastWasAgent = false;
  for (const raw of txt.split(/\r?\n/)) {
    const line = raw.replace(/#.*/, '').trim();
    const m = line.match(/^([a-z-]+)\s*:\s*(.*)$/i);
    if (!m) continue;
    const [, field, value] = m;
    const f = field.toLowerCase();
    if (f === 'user-agent') {
      if (!cur || !lastWasAgent) { cur = { agents: [], rules: { allow: [], disallow: [] } }; groups.push(cur); }
      cur.agents.push(value.toLowerCase());
      lastWasAgent = true;
    } else if (cur && (f === 'allow' || f === 'disallow')) {
      if (value) cur.rules[f as 'allow' | 'disallow'].push(value);
      lastWasAgent = false;
    }
  }
  const a = agent.toLowerCase();
  return (groups.find((g) => g.agents.some((x) => x !== '*' && a.includes(x))) ?? groups.find((g) => g.agents.includes('*')))?.rules ?? { allow: [], disallow: [] };
}

/** Longest matching rule wins; allow wins a tie. */
export function allowed(rules: Rules, pathAndQuery: string): boolean {
  const best = (list: string[]) => Math.max(-1, ...list.filter((r) => pathAndQuery.startsWith(r.replace(/\*.*$/, ''))).map((r) => r.length));
  const d = best(rules.disallow), al = best(rules.allow);
  return d < 0 || al >= d;
}

export class PoliteFetcher {
  private robots = new Map<string, Rules>();
  private last = new Map<string, number>();
  constructor(private o: FetchOptions) {}

  private async wait(origin: string) {
    const t = this.last.get(origin);
    if (t != null) { const gap = Date.now() - t; if (gap < this.o.delayMs) await new Promise((r) => setTimeout(r, this.o.delayMs - gap)); }
    this.last.set(origin, Date.now());
  }

  private async get(url: string): Promise<Response> {
    const u = new URL(url);
    await this.wait(u.origin);
    return fetch(url, { headers: { 'user-agent': this.o.userAgent, accept: 'text/html,text/plain;q=0.9,*/*;q=0.1' }, redirect: 'follow', signal: AbortSignal.timeout(this.o.timeoutMs) });
  }

  async isAllowed(url: string): Promise<boolean> {
    const u = new URL(url);
    if (!this.robots.has(u.origin)) {
      let rules: Rules = { allow: [], disallow: [] };
      try {
        const r = await this.get(`${u.origin}/robots.txt`);
        if (r.ok) rules = parseRobots(await r.text(), this.o.userAgent);
        else if (r.status === 401 || r.status === 403) rules = { allow: [], disallow: ['/'] };
      } catch { /* no robots.txt reachable: allowed, like most crawlers */ }
      this.robots.set(u.origin, rules);
    }
    return allowed(this.robots.get(u.origin)!, u.pathname + u.search);
  }

  async page(url: string): Promise<{ ok: true; html: string } | { ok: false; error: string }> {
    try {
      const r = await this.get(url);
      if (!r.ok) return { ok: false, error: `HTTP ${r.status}` };
      const type = r.headers.get('content-type') ?? '';
      if (!/text\/html|text\/plain|application\/xhtml|xml/.test(type)) return { ok: false, error: `unsupported content type ${type}` };
      const html = await r.text();
      if (html.length > 3_000_000) return { ok: false, error: 'page too large' };
      return { ok: true, html };
    } catch (e) {
      return { ok: false, error: String((e as Error).message ?? e) };
    }
  }
}
