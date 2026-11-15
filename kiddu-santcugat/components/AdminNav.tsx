export default function AdminNav({ lang, active, pending }: { lang: string; active: 'dashboard' | 'queue' | 'items' | 'runs'; pending?: number }) {
  const link = (k: typeof active, href: string, label: string) => (
    <a key={k} href={`/${lang}/admin${href}`} aria-current={active === k ? 'page' : undefined}>{label}</a>
  );
  return (
    <div className="tabs-row" style={{ marginBottom: 4 }}>
      <nav className="mainnav" aria-label="Admin" style={{ width: 'auto', margin: 0, order: 0 }}>
        {link('dashboard', '', 'Dashboard')}
        {link('queue', '/queue', `Review queue${pending != null ? ` (${pending})` : ''}`)}
        {link('items', '/items', 'Published')}
        {link('runs', '/runs', 'Runs')}
      </nav>
      <form method="post" action="/api/admin/logout"><input type="hidden" name="lang" value={lang} /><button className="btn secondary small" type="submit">Log out</button></form>
    </div>
  );
}
