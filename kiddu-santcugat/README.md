# Kiddu Sant Cugat

Website with places, events and activities for families in Sant Cugat del Vallès and around.
Built acceptance-first (ATDD): the scenarios in `features/` are the specification, owned by the product owner.

> Status: **M1 browse + class groups, playdates, family profiles, invited plans on the map, casal planner** (features 01–04, 08, 09, 12–15): 65 acceptance scenarios and 28 unit tests pass. Data is a **demo fixture**, not real places or casals yet.

| Explore + invitations | My family | Casals | My casal plan |
|---|---|---|---|
| <img src="docs/screenshots/home.png" width="170"> | <img src="docs/screenshots/me.png" width="170"> | <img src="docs/screenshots/casals.png" width="170"> | <img src="docs/screenshots/casal-plan.png" width="170"> |

## Test site

https://kiddu-santcugat.netlify.app (Netlify, free plan). Right now it is behind **Netlify team login**: only people logged into the owner's Netlify team can open it.

**Storage check after every deploy:** open `/api/health` on the site. It must show `{"store":"netlify-blobs","ok":true}`. Plans, class groups and families are stored in Netlify Blobs when hosted, and in `.data/` locally.

**Environment variable:** `KIDDU_ADMIN_KEY` (set in Netlify > Site configuration > Environment variables) protects class-group creation: `/en/groups/new?key=<KIDDU_ADMIN_KEY>` creates a group and shows its invite link.

Deploy (owner runs it; needs a Netlify token):

```bash
npx netlify-cli build --offline && npx netlify-cli deploy --no-build --dir .netlify/static --prod
# --dir .netlify/static matters: deploying .next leaves out CSS/JS and the site shows unstyled HTML
```

## Run it

```bash
npm install
npm run dev            # http://localhost:3000 → redirects to /ca, /es or /en from your browser language
npm run gate           # typecheck + unit tests + acceptance scenarios (builds the app, ~1 min)
```

Requires Node 22. Acceptance tests use Playwright 1.63 + playwright-bdd on a phone profile (Pixel 7).

## How you control the website

| Lever | File | Example |
|---|---|---|
| What the site does | `features/*.feature` | Change "Then I only see indoor items" or add a scenario; the gate shows what goes red |
| Behaviour values | `config/site.yaml` | `freshness.warn_after_days: 30` → cards older than 30 days show "Information may be out of date" |
| Area | `config/areas.yaml` | Centre and radius of Sant Cugat (verify the centre coordinates) |
| Data sources | `config/sources.yaml` | Used from milestone M2 (pipeline) |
| What runs in the gate | `tests/milestone.ts` | Add `features/05_ask_ai.feature` when that milestone starts |

Agents may not edit `features/` or `config/` (`.claude/settings.json` deny rules; `CODEOWNERS` requires your review).

## Structure

```
app/[lang]/page.tsx            home: filters, map, list (server-rendered, filters in the URL)
app/[lang]/item/[id]/page.tsx  item details, finished events, similar items
components/                    HomeClient (filters, list, "Near me"), MapView (Leaflet + OpenStreetMap), LangSwitch
lib/filters.ts                 the rules: radius, expiry, freshness, theme/age/time/free/indoor
lib/i18n.ts                    Català / Español / English texts
lib/social.ts, social-logic.ts   class groups, plans, RSVPs (rules in social-logic.ts, storage in social.ts + store.ts)
app/api/*                      form endpoints: groups, join, leave, plans, rsvp, cancel, profile, connect, casals, health
app/[lang]/me, f, restore      family profile, personal connect link, recovery link
app/[lang]/casals              casal browse + my casal plan; data in data/casals.json (tests: CASALS_PATH)
app/[lang]/p, g, class, plan   plan page, invite/join page, class page, plan form
lib/server-context.ts          clock, weather (Open-Meteo, no key), test hooks
app/route.ts                   "/" → /ca, /es or /en from the browser language
scripts/build-config.mjs       config/*.yaml → lib/generated/config.json (bundled; no file reads when hosted)
data/catalogue.json            demo catalogue (copy of the test fixture) until the pipeline exists
tests/fixtures/catalogue.json  fixed test data; fixed clock Wed 2026-11-11 10:00
tests/steps/*.ts               step definitions: the scenarios' words, executable
tests/unit/                    Vitest unit tests
```

## What the social features store (read before real families use it)
- **Family profile (one per phone, a cookie):** first name, optional children's ages (numbers), interests, languages, a personal connect link, a private recovery link, class memberships, connections, casal choices.
- **Class group:** name, invite token, member ids. **Connection:** both families agreed (personal link, or a request between families of the same class). Nobody sees friends of friends.
- **Plan:** place (catalogue or written), optional address (shown only to authorised families, never on the map), date and time, note (max 140 characters), audience (link, class or chosen friends), answers by first name. Deleted `plans.delete_days_after_plan` days after the plan date, on first access.
- **Casal plan:** which casal week each family picked and whether registered. Visible to connected families only if the family switches sharing on (default in `config/site.yaml`: off).
- **Delete my family** removes the profile, class memberships, connections, answers, and the plans it organised. Leaving a class removes the family from that class and its playdates.
- No children's names or photos, no phone numbers, no emails, no passwords.
- **Before the pilot:** privacy notice, consent wording and a data-retention statement for this data (GDPR; children's ages and the social graph are personal data). Not written yet.
- **Known gaps:** no admin removal of a family from a class; no reporting or blocking; no rate limiting on forms; recovery and connect links are bearer links (whoever holds them gets in); the store has no transactions and every list is a scan, so it is fine for dozens of families, not thousands; casal weeks are Monday–Friday turns (Christmas casals are daily); Catalan and Spanish texts are not reviewed by a native speaker.

## Privacy (features/08)
No cookies (except test-only hooks when `KIDDU_TEST_HOOKS=1`), no analytics yet, location used only on the phone after consent, no child data.
Map tiles come from OpenStreetMap's tile server; for a public launch, switch to a tile provider with an agreement (OSM's tile policy limits heavy use).

## Next milestones
- **M0 data spike**: 50 real Sant Cugat pages, hand-labelled golden set, Haiku extraction accuracy.
- **M2 pipeline + editor**: features 07, 11; Supabase (EU) replaces `data/catalogue.json`.
- **M3 pilot release**: features 04, 06; legal pages; deploy (Netlify, EU). Deploys and secrets are done by the owner.
