'use client';
import { usePathname, useSearchParams } from 'next/navigation';
import { LANGS, LANG_NAMES } from '@/lib/i18n';
import type { Lang } from '@/lib/types';

export default function LangSwitch({ current }: { current: Lang }) {
  const path = usePathname() ?? `/${current}`;
  const qs = useSearchParams()?.toString();
  const rest = path.replace(/^\/(ca|es|en)/, '');
  return (
    <nav className="langs" aria-label="Language">
      {LANGS.map((l) => (
        <a key={l} href={`/${l}${rest}${qs ? `?${qs}` : ''}`} hrefLang={l} lang={l} aria-current={l === current}>
          {LANG_NAMES[l]}
        </a>
      ))}
    </nav>
  );
}
