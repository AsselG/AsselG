'use client';
import { usePathname } from 'next/navigation';
import { Compass, Users } from 'lucide-react';

export default function MainNav({ lang, classHref, labels }: { lang: string; classHref: string; labels: { explore: string; cls: string } }) {
  const path = usePathname() ?? '';
  const inClass = /^\/(ca|es|en)\/(class|g|groups)(\/|$)/.test(path);
  return (
    <nav className="mainnav" aria-label="Main">
      <a href={`/${lang}`} aria-current={!inClass && !/\/(p|plan)(\/|$)/.test(path) ? 'page' : undefined}><Compass className="i" size={17} aria-hidden />{labels.explore}</a>
      <a href={classHref} aria-current={inClass ? 'page' : undefined}><Users className="i" size={17} aria-hidden />{labels.cls}</a>
    </nav>
  );
}
