import { Volleyball, Palette, BookOpen, PartyPopper, TreePine, type LucideProps } from 'lucide-react';
import type { Theme } from '@/lib/types';

const ICONS: Record<Theme, React.ComponentType<LucideProps>> = {
  sport: Volleyball, art: Palette, education: BookOpen, fun: PartyPopper, nature: TreePine,
};

export function ThemeIcon({ theme, size = 20 }: { theme: Theme; size?: number }) {
  const I = ICONS[theme] ?? PartyPopper;
  return <I className="i" size={size} strokeWidth={1.8} aria-hidden />;
}
