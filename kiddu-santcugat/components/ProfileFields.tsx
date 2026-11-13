import { DICTS, LANGS, LANG_NAMES } from '@/lib/i18n';
import type { Lang, Theme } from '@/lib/types';
import type { Profile } from '@/lib/social-logic';

/** The family profile form fields: first name, children's ages, interests, languages. Nothing else, by design. */
export default function ProfileFields({ lang, themes, profile }: { lang: Lang; themes: string[]; profile?: Profile }) {
  const d = DICTS[lang];
  return (
    <>
      <div className="field"><label htmlFor="firstName">{d.fieldName}</label><input id="firstName" name="firstName" type="text" required maxLength={30} autoComplete="given-name" defaultValue={profile?.firstName} /></div>
      <div className="field">
        <label htmlFor="ages">{d.kidAges}</label>
        <input id="ages" name="ages" type="text" inputMode="numeric" maxLength={30} placeholder="4, 6" defaultValue={profile?.kidAges.join(', ')} />
        <span className="help">{d.kidAgesHelp}</span>
      </div>
      <fieldset className="checks"><legend>{d.interests}</legend>
        {themes.map((th) => (
          <label key={th}><input type="checkbox" name="interests" value={th} defaultChecked={profile?.interests.includes(th as Theme)} />{d[`theme_${th}` as keyof typeof d]}</label>
        ))}
      </fieldset>
      <fieldset className="checks"><legend>{d.languagesLabel}</legend>
        {LANGS.map((l) => (
          <label key={l}><input type="checkbox" name="languages" value={l} defaultChecked={profile?.languages.includes(l)} />{LANG_NAMES[l]}</label>
        ))}
      </fieldset>
    </>
  );
}
