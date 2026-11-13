'use client';
import { usePathname } from 'next/navigation';
import { Compass, HeartHandshake, Tent, Users } from 'lucide-react';

export interface NavLabels { explore: string; casals: string; cls: string; family: string }

export default function MainNav({ lang, classHref, labels }: { lang: string; classHref: string; labels: NavLabels }) {
  const path = usePathname() ?? '';
  const sec = (re: string) => new RegExp(`^/(ca|es|en)/(${re})(/|$)`).test(path);
  const inClass = sec('class|g|groups');
  const inCasals = sec('casals');
  const inFamily = sec('me|f|restore');
  const inExplore = !inClass && !inCasals && !inFamily;
  const cur = (on: boolean) => (on ? ('page' as const) : undefined);
  return (
    <nav className="mainnav" aria-label="Main">
      <a href={`/${lang}`} aria-current={cur(inExplore)}><Compass className="i" size={17} aria-hidden />{labels.explore}</a>
      <a href={`/${lang}/casals`} aria-current={cur(inCasals)}><Tent className="i" size={17} aria-hidden />{labels.casals}</a>
      <a href={classHref} aria-current={cur(inClass)}><Users className="i" size={17} aria-hidden />{labels.cls}</a>
      <a href={`/${lang}/me`} aria-current={cur(inFamily)}><HeartHandshake className="i" size={17} aria-hidden />{labels.family}</a>
    </nav>
  );
}
