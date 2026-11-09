import type { Lang, Localized } from './types';

export const LANGS: Lang[] = ['ca', 'es', 'en'];
export const LANG_NAMES: Record<Lang, string> = { ca: 'Català', es: 'Español', en: 'English' };
export const LOCALES: Record<Lang, string> = { ca: 'ca-ES', es: 'es-ES', en: 'en-GB' };

const en = {
  tagline: 'Things to do with kids in Sant Cugat and around',
  mission: 'It takes a village to raise a child. Sant Cugat families helping each other find good things to do together.',
  navExplore: 'Explore', navClass: 'My class',
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
  privacy: 'No tracking cookies. Your location never leaves your phone.',
  madeBy: 'Made by parents, for parents · Sant Cugat del Vallès',
  mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun',
  planWithFriends: 'Plan with friends',
  planIntro: 'Pick a day and share the link in your class WhatsApp group. Friends answer in one tap, no app or account needed.',
  fieldName: 'Your first name', fieldWhere: 'Where', fieldDay: 'Day', fieldTime: 'Time', fieldNote: 'Note',
  notePlaceholder: 'e.g. bringing a football', otherPlace: 'Another place (write it below)', otherPlaceLabel: 'Place name',
  createPlan: 'Create plan', organisingAs: 'Organising as {name}',
  planBy: 'Organised by {name}', going_one: '{n} family going', going_other: '{n} families going',
  whoIsGoing: 'Who is going', answerIn: "I'm in", answerMaybe: 'Maybe', answerNo: "Can't make it",
  joiningAs: 'Joining as {name}', statusGoing: 'Going', statusMaybe: 'Maybe', statusNo: "Can't make it",
  shareWhatsApp: 'Share on WhatsApp', shareText: 'Join us: {title}, {when}',
  planCancelled: 'Plan cancelled', cancelPlan: 'Cancel plan', organiserArea: 'You organise this plan',
  keepLink: 'Keep this organiser link to cancel the plan later:',
  planPrivate: 'Private plan: only people with the link can see it. It is deleted {days} days after the plan date.',
  needName: 'Please enter a first name.',
  groupNew: 'New class group', groupName: 'Group name', createGroup: 'Create group', groupCreated: 'Group created',
  inviteLink: 'Invite link', inviteHint: 'Send this link to the class parents. Only people with the link can join.',
  joinTitle: 'Join {name}', joinIntro: 'Only families in this class group see each other. We ask for a first name only.',
  kidAges: "Children's ages (optional)", kidAgesHelp: 'For example 4, 6. Helps other families find a match. Never names or photos.',
  joinButton: 'Join the class',
  myClass: 'My class', upcomingPlaydates: 'Upcoming playdates', noPlaydates: 'No playdates yet. Be the first to propose one.',
  proposePlaydate: 'Propose a playdate', popularTitle: 'Popular in your class',
  popularCount_one: '{n} family', popularCount_other: '{n} families',
  familiesTitle: 'Families in your class', you: 'you',
  kidsOne: 'Child aged {ages}', kidsMany: 'Children aged {ages}', agesNotShared: 'Ages not shared',
  showFamilies: 'Show families', showAll: 'Show all', noFamilies: 'No family matches that age.',
  familyNote: 'Only first names and the ages each family chose to share. No contact details.',
  leaveGroup: 'Leave group', leaveHelp: 'Leaving removes your name from the group and from every playdate.',
  privateNotice: 'This page is private. Ask your class rep for the invite link.',
  classLandingText: 'Class groups are private. Ask your class rep or the parents’ association for the invite link and open it on this phone.',
};
export type Key = keyof typeof en;

const ca: Record<Key, string> = {
  tagline: 'Què fer amb nens a Sant Cugat i rodalies',
  mission: 'Per educar un infant cal tot un poble. Famílies de Sant Cugat que s’ajuden a trobar bons plans per fer juntes.',
  navExplore: 'Explora', navClass: 'La meva classe',
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
  privacy: 'Sense galetes de seguiment. La teva ubicació no surt del mòbil.',
  madeBy: 'Fet per famílies, per a famílies · Sant Cugat del Vallès',
  mon: 'dl.', tue: 'dt.', wed: 'dc.', thu: 'dj.', fri: 'dv.', sat: 'ds.', sun: 'dg.',
  planWithFriends: 'Fer pla amb amics',
  planIntro: 'Tria un dia i comparteix l’enllaç al grup de WhatsApp de la classe. Els amics responen amb un toc, sense app ni compte.',
  fieldName: 'El teu nom', fieldWhere: 'On', fieldDay: 'Dia', fieldTime: 'Hora', fieldNote: 'Nota',
  notePlaceholder: 'p. ex. porto una pilota', otherPlace: 'Un altre lloc (escriu-lo a sota)', otherPlaceLabel: 'Nom del lloc',
  createPlan: 'Crear el pla', organisingAs: 'Organitzes com a {name}',
  planBy: 'Organitza {name}', going_one: '{n} família hi va', going_other: '{n} famílies hi van',
  whoIsGoing: 'Qui hi va', answerIn: 'Hi vinc', answerMaybe: 'Potser', answerNo: 'No puc',
  joiningAs: 'Respons com a {name}', statusGoing: 'Hi va', statusMaybe: 'Potser', statusNo: 'No pot',
  shareWhatsApp: 'Compartir per WhatsApp', shareText: 'Veniu amb nosaltres: {title}, {when}',
  planCancelled: 'Pla cancel·lat', cancelPlan: 'Cancel·lar el pla', organiserArea: 'Organitzes aquest pla',
  keepLink: 'Guarda aquest enllaç d’organitzador per cancel·lar el pla més endavant:',
  planPrivate: 'Pla privat: només el veu qui té l’enllaç. S’esborra {days} dies després de la data del pla.',
  needName: 'Escriu un nom.',
  groupNew: 'Nou grup de classe', groupName: 'Nom del grup', createGroup: 'Crear el grup', groupCreated: 'Grup creat',
  inviteLink: 'Enllaç d’invitació', inviteHint: 'Envia aquest enllaç a les famílies de la classe. Només s’hi pot unir qui tingui l’enllaç.',
  joinTitle: 'Uneix-te a {name}', joinIntro: 'Només les famílies d’aquest grup de classe es veuen entre elles. Només demanem un nom.',
  kidAges: 'Edats dels fills (opcional)', kidAgesHelp: 'Per exemple 4, 6. Ajuda altres famílies a trobar coincidències. Mai noms ni fotos.',
  joinButton: 'Unir-me a la classe',
  myClass: 'La meva classe', upcomingPlaydates: 'Propers jocs conjunts', noPlaydates: 'Encara no hi ha jocs conjunts. Proposa’n el primer.',
  proposePlaydate: 'Proposar un joc conjunt', popularTitle: 'Popular a la teva classe',
  popularCount_one: '{n} família', popularCount_other: '{n} famílies',
  familiesTitle: 'Famílies de la teva classe', you: 'tu',
  kidsOne: 'Fill/a de {ages} anys', kidsMany: 'Fills/es de {ages} anys', agesNotShared: 'Edats no compartides',
  showFamilies: 'Mostrar famílies', showAll: 'Mostrar-les totes', noFamilies: 'Cap família coincideix amb aquesta edat.',
  familyNote: 'Només noms i les edats que cada família ha volgut compartir. Sense dades de contacte.',
  leaveGroup: 'Sortir del grup', leaveHelp: 'En sortir s’esborra el teu nom del grup i de tots els jocs conjunts.',
  privateNotice: 'Aquesta pàgina és privada. Demana l’enllaç d’invitació al delegat o delegada de classe.',
  classLandingText: 'Els grups de classe són privats. Demana l’enllaç d’invitació al delegat de classe o a l’AFA i obre’l en aquest mòbil.',
};

const es: Record<Key, string> = {
  tagline: 'Qué hacer con niños en Sant Cugat y alrededores',
  mission: 'Para educar a un niño hace falta toda una tribu. Familias de Sant Cugat que se ayudan a encontrar buenos planes para hacer juntas.',
  navExplore: 'Explorar', navClass: 'Mi clase',
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
  privacy: 'Sin cookies de seguimiento. Tu ubicación no sale del móvil.',
  madeBy: 'Hecho por familias, para familias · Sant Cugat del Vallès',
  mon: 'lun', tue: 'mar', wed: 'mié', thu: 'jue', fri: 'vie', sat: 'sáb', sun: 'dom',
  planWithFriends: 'Hacer plan con amigos',
  planIntro: 'Elige un día y comparte el enlace en el grupo de WhatsApp de la clase. Los amigos responden con un toque, sin app ni cuenta.',
  fieldName: 'Tu nombre', fieldWhere: 'Dónde', fieldDay: 'Día', fieldTime: 'Hora', fieldNote: 'Nota',
  notePlaceholder: 'p. ej. llevo un balón', otherPlace: 'Otro lugar (escríbelo abajo)', otherPlaceLabel: 'Nombre del lugar',
  createPlan: 'Crear el plan', organisingAs: 'Organizas como {name}',
  planBy: 'Organiza {name}', going_one: '{n} familia va', going_other: '{n} familias van',
  whoIsGoing: 'Quién va', answerIn: 'Me apunto', answerMaybe: 'Quizá', answerNo: 'No puedo',
  joiningAs: 'Respondes como {name}', statusGoing: 'Va', statusMaybe: 'Quizá', statusNo: 'No puede',
  shareWhatsApp: 'Compartir por WhatsApp', shareText: 'Venid con nosotros: {title}, {when}',
  planCancelled: 'Plan cancelado', cancelPlan: 'Cancelar el plan', organiserArea: 'Organizas este plan',
  keepLink: 'Guarda este enlace de organizador para cancelar el plan más adelante:',
  planPrivate: 'Plan privado: solo lo ve quien tiene el enlace. Se borra {days} días después de la fecha del plan.',
  needName: 'Escribe un nombre.',
  groupNew: 'Nuevo grupo de clase', groupName: 'Nombre del grupo', createGroup: 'Crear el grupo', groupCreated: 'Grupo creado',
  inviteLink: 'Enlace de invitación', inviteHint: 'Envía este enlace a las familias de la clase. Solo puede unirse quien tenga el enlace.',
  joinTitle: 'Únete a {name}', joinIntro: 'Solo las familias de este grupo de clase se ven entre sí. Solo pedimos un nombre.',
  kidAges: 'Edades de los hijos (opcional)', kidAgesHelp: 'Por ejemplo 4, 6. Ayuda a otras familias a encontrar coincidencias. Nunca nombres ni fotos.',
  joinButton: 'Unirme a la clase',
  myClass: 'Mi clase', upcomingPlaydates: 'Próximos juegos conjuntos', noPlaydates: 'Aún no hay juegos conjuntos. Propón el primero.',
  proposePlaydate: 'Proponer un juego conjunto', popularTitle: 'Popular en tu clase',
  popularCount_one: '{n} familia', popularCount_other: '{n} familias',
  familiesTitle: 'Familias de tu clase', you: 'tú',
  kidsOne: 'Hijo/a de {ages} años', kidsMany: 'Hijos/as de {ages} años', agesNotShared: 'Edades no compartidas',
  showFamilies: 'Mostrar familias', showAll: 'Mostrar todas', noFamilies: 'Ninguna familia coincide con esa edad.',
  familyNote: 'Solo nombres y las edades que cada familia ha querido compartir. Sin datos de contacto.',
  leaveGroup: 'Salir del grupo', leaveHelp: 'Al salir se borra tu nombre del grupo y de todos los juegos conjuntos.',
  privateNotice: 'Esta página es privada. Pide el enlace de invitación al delegado o delegada de clase.',
  classLandingText: 'Los grupos de clase son privados. Pide el enlace de invitación al delegado de clase o a la AMPA y ábrelo en este móvil.',
};

export const DICTS: Record<Lang, Record<Key, string>> = { en, ca, es };

export function tn(lang: Lang, base: string, n: number, vars: Record<string, string | number> = {}): string {
  const key = `${base}_${n === 1 ? 'one' : 'other'}` as Key;
  return t(lang, key, { n, ...vars });
}

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
