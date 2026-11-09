import type { Lang, Localized } from './types';

export const LANGS: Lang[] = ['ca', 'es', 'en'];
export const LANG_NAMES: Record<Lang, string> = { ca: 'Català', es: 'Español', en: 'English' };
export const LOCALES: Record<Lang, string> = { ca: 'ca-ES', es: 'es-ES', en: 'en-GB' };

const en = {
  tagline: 'Things to do with kids in Sant Cugat and around',
  nearMe: 'Near me',
  nearMeRefused: 'Location not shared. Showing the area centre.',
  nearMeOn: 'Sorted by distance from you. Your location stays on this phone.',
  theme_all: 'All', theme_sport: 'Sport', theme_art: 'Art', theme_education: 'Education', theme_fun: 'Fun', theme_nature: 'Nature',
  childAge: 'Child age', anyAge: 'Any age',
  when_any: 'Any time', when_today: 'Today', when_tomorrow: 'Tomorrow', when_weekend: 'This weekend',
  freeOnly: 'Free only', rainyDay: 'Rainy day', indoorOnly: 'Indoor only',
  ages: 'Ages {min}–{max}', agesFrom: 'From {min} years', agesUpTo: 'Up to {max} years', ageNotSpecified: 'Age not specified',
  free: 'Free', priceUnknown: 'Price not specified',
  alwaysOpen: 'Always open', openOn: 'Open {day} {hours}', closedOn: 'Closed {day}', hoursUnknown: 'Hours not specified',
  todayWord: 'today',
  lastChecked: 'Last checked {date}',
  stale: 'Information may be out of date',
  aiLabel: 'AI summary - check the source',
  results: '{n} results', noResults: 'Nothing matches these filters. Try removing one.',
  demoBanner: 'Demo data: these are not real places or events yet.',
  address: 'Address', openingHours: 'Opening hours', ageRange: 'Age range', price: 'Price', setting: 'Indoor / outdoor',
  indoor: 'Indoor', outdoor: 'Outdoor', facilities: 'Facilities', source: 'Official source', directions: 'Directions',
  date: 'Date', time: 'Time', place: 'Place', booking: 'Booking', bookingLink: 'Book here', language: 'Language of the activity',
  finished: 'This event has finished', similar: 'Similar upcoming', back: 'Back to the map',
  hello_morning: 'Good morning!', hello_afternoon: 'Good afternoon!', hello_evening: 'Good evening!',
  heroQuestion: 'What shall we do with the kids today?',
  mission: 'It takes a village to raise a child. This one is ours: Sant Cugat families helping each other find good things to do together.',
  exploreThemes: 'Explore by theme', onTheMap: 'On the map', ideasForYou: 'Ideas for you',
  villageTitle: 'Our village is growing', villageText: 'Soon: make plans with families from your class, share tips, and tell us which places are missing.',
  comingSoon: 'Coming soon', madeBy: 'Made by parents, for parents · Sant Cugat del Vallès', details: 'See details',
  privacy: 'No tracking cookies. Your location never leaves your phone.',
  mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun',
};
export type Key = keyof typeof en;

const ca: Record<Key, string> = {
  tagline: 'Què fer amb nens a Sant Cugat i rodalies',
  nearMe: 'A prop meu',
  nearMeRefused: 'Ubicació no compartida. Es mostra el centre de la zona.',
  nearMeOn: 'Ordenat per distància des de tu. La teva ubicació es queda al mòbil.',
  theme_all: 'Tot', theme_sport: 'Esport', theme_art: 'Art', theme_education: 'Educació', theme_fun: 'Diversió', theme_nature: 'Natura',
  childAge: 'Edat del nen', anyAge: 'Qualsevol edat',
  when_any: 'Qualsevol moment', when_today: 'Avui', when_tomorrow: 'Demà', when_weekend: 'Aquest cap de setmana',
  freeOnly: 'Només gratuït', rainyDay: 'Dia de pluja', indoorOnly: 'Només interior',
  ages: 'De {min} a {max} anys', agesFrom: 'Des de {min} anys', agesUpTo: 'Fins a {max} anys', ageNotSpecified: 'Edat no indicada',
  free: 'Gratuït', priceUnknown: 'Preu no indicat',
  alwaysOpen: 'Sempre obert', openOn: 'Obert {day} {hours}', closedOn: 'Tancat {day}', hoursUnknown: 'Horari no indicat',
  todayWord: 'avui',
  lastChecked: 'Revisat el {date}',
  stale: 'La informació pot no estar actualitzada',
  aiLabel: 'Resum fet amb IA - comprova la font',
  results: '{n} resultats', noResults: 'Res no coincideix amb aquests filtres. Prova de treure’n un.',
  demoBanner: 'Dades de demostració: encara no són llocs ni activitats reals.',
  address: 'Adreça', openingHours: 'Horari', ageRange: 'Edats', price: 'Preu', setting: 'Interior / exterior',
  indoor: 'Interior', outdoor: 'Exterior', facilities: 'Serveis', source: 'Font oficial', directions: 'Com arribar-hi',
  date: 'Data', time: 'Hora', place: 'Lloc', booking: 'Reserva', bookingLink: 'Reserva aquí', language: 'Idioma de l’activitat',
  finished: 'Aquesta activitat ja ha acabat', similar: 'Activitats semblants properes', back: 'Tornar al mapa',
  hello_morning: 'Bon dia!', hello_afternoon: 'Bona tarda!', hello_evening: 'Bon vespre!',
  heroQuestion: 'Què fem avui amb els nens?',
  mission: 'Per educar un infant cal tot un poble. Aquest és el nostre: famílies de Sant Cugat que s’ajuden a trobar bons plans per fer junts.',
  exploreThemes: 'Explora per temes', onTheMap: 'Al mapa', ideasForYou: 'Idees per a vosaltres',
  villageTitle: 'El nostre poble creix', villageText: 'Aviat: fer plans amb les famílies de la classe, compartir consells i dir-nos quins llocs falten.',
  comingSoon: 'Properament', madeBy: 'Fet per famílies, per a famílies · Sant Cugat del Vallès', details: 'Veure detalls',
  privacy: 'Sense galetes de seguiment. La teva ubicació no surt del mòbil.',
  mon: 'dl.', tue: 'dt.', wed: 'dc.', thu: 'dj.', fri: 'dv.', sat: 'ds.', sun: 'dg.',
};

const es: Record<Key, string> = {
  tagline: 'Qué hacer con niños en Sant Cugat y alrededores',
  nearMe: 'Cerca de mí',
  nearMeRefused: 'Ubicación no compartida. Se muestra el centro de la zona.',
  nearMeOn: 'Ordenado por distancia desde ti. Tu ubicación se queda en el móvil.',
  theme_all: 'Todo', theme_sport: 'Deporte', theme_art: 'Arte', theme_education: 'Educación', theme_fun: 'Diversión', theme_nature: 'Naturaleza',
  childAge: 'Edad del niño', anyAge: 'Cualquier edad',
  when_any: 'Cualquier momento', when_today: 'Hoy', when_tomorrow: 'Mañana', when_weekend: 'Este fin de semana',
  freeOnly: 'Solo gratis', rainyDay: 'Día de lluvia', indoorOnly: 'Solo interior',
  ages: 'De {min} a {max} años', agesFrom: 'Desde {min} años', agesUpTo: 'Hasta {max} años', ageNotSpecified: 'Edad no indicada',
  free: 'Gratis', priceUnknown: 'Precio no indicado',
  alwaysOpen: 'Siempre abierto', openOn: 'Abierto {day} {hours}', closedOn: 'Cerrado {day}', hoursUnknown: 'Horario no indicado',
  todayWord: 'hoy',
  lastChecked: 'Revisado el {date}',
  stale: 'La información puede no estar actualizada',
  aiLabel: 'Resumen hecho con IA - comprueba la fuente',
  results: '{n} resultados', noResults: 'Nada coincide con estos filtros. Prueba a quitar uno.',
  demoBanner: 'Datos de demostración: todavía no son lugares ni actividades reales.',
  address: 'Dirección', openingHours: 'Horario', ageRange: 'Edades', price: 'Precio', setting: 'Interior / exterior',
  indoor: 'Interior', outdoor: 'Exterior', facilities: 'Servicios', source: 'Fuente oficial', directions: 'Cómo llegar',
  date: 'Fecha', time: 'Hora', place: 'Lugar', booking: 'Reserva', bookingLink: 'Reserva aquí', language: 'Idioma de la actividad',
  finished: 'Esta actividad ya ha terminado', similar: 'Actividades parecidas próximas', back: 'Volver al mapa',
  hello_morning: '¡Buenos días!', hello_afternoon: '¡Buenas tardes!', hello_evening: '¡Buenas noches!',
  heroQuestion: '¿Qué hacemos hoy con los niños?',
  mission: 'Para educar a un niño hace falta toda una tribu. Esta es la nuestra: familias de Sant Cugat que se ayudan a encontrar buenos planes para hacer juntos.',
  exploreThemes: 'Explora por temas', onTheMap: 'En el mapa', ideasForYou: 'Ideas para vosotros',
  villageTitle: 'Nuestra tribu crece', villageText: 'Pronto: hacer planes con las familias de la clase, compartir consejos y decirnos qué sitios faltan.',
  comingSoon: 'Próximamente', madeBy: 'Hecho por familias, para familias · Sant Cugat del Vallès', details: 'Ver detalles',
  privacy: 'Sin cookies de seguimiento. Tu ubicación no sale del móvil.',
  mon: 'lun', tue: 'mar', wed: 'mié', thu: 'jue', fri: 'vie', sat: 'sáb', sun: 'dom',
};

export const DICTS: Record<Lang, Record<Key, string>> = { en, ca, es };

export function isLang(x: string): x is Lang {
  return (LANGS as string[]).includes(x);
}

export function t(lang: Lang, key: Key, vars: Record<string, string | number> = {}): string {
  return DICTS[lang][key].replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''));
}

/** Text in the chosen language, else the original language, else any available. */
export function pick(text: Localized | undefined, lang: Lang, original?: Lang): string {
  if (!text) return '';
  return text[lang] ?? (original ? text[original] : undefined) ?? text.ca ?? text.es ?? text.en ?? '';
}

export function pickLang(acceptLanguage: string | null, allowed: Lang[] = LANGS): Lang {
  const prefs = (acceptLanguage ?? '')
    .split(',')
    .map((p) => {
      const [tag, q] = p.trim().split(';q=');
      return { lang: tag.toLowerCase().split('-')[0], q: q ? Number(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);
  for (const p of prefs) if ((allowed as string[]).includes(p.lang)) return p.lang as Lang;
  return allowed[0];
}
