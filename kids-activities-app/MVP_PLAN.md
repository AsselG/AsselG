# Family Free-Time App — Research & MVP Plan

> Working name: **Kiddu** (from your Figma team name; placeholder). Date: 2026-11-07.
> Confidence tags: **[Certain]** = evidence, **[Likely]** = strong inference, **[Guessing]** = assumption to validate.

---

## 0. The uncomfortable part first

1. **"See other families around on a map" is not a novel MVP.** Kidbridge ("who's free now", distance-only), MomieGo ("Playdate Now" live for 15/30/45 min), Plah, Pairent and PlayDates.club already ship nearby-family discovery. **[Certain]** (App Store listings; feature claims themselves unverified.)
2. **A live map of where children are is a safety liability, not a feature.** Any design that lets a stranger — or a "friend" you met once — know that a 5-year-old is at a specific playground *right now* will get the app rejected by cautious parents, journalists and possibly regulators. **[Likely]**
3. **Empty map = dead app.** A friends-only map with 0–3 friends on it shows nothing on day one. The cold-start problem kills this category more than features do. **[Likely]**
4. **The MVP's real job is to test one question:** *Will parents share "we're at X until 17:00, come join" with friends, and will friends actually show up?* Not "can we draw pins on a map" — that is a weekend of work.

So the MVP below is deliberately narrower than "real-time map of families around": **opt-in, time-boxed, place-based check-ins visible to friends only.**

---

## 1. Problem & users

| Who | Job to be done | Current workaround |
|---|---|---|
| Parent of kids ~2–10 on a free afternoon/weekend | "Find something to do *now* and ideally with friends' kids" | WhatsApp group messages ("anyone at the park?"), Instagram stories, Google Maps |
| Parent planning ahead | "What sport/art/education activity or trial class fits my kid this week?" | Local Facebook groups, school newsletters, provider websites |
| Activity providers (later) | "Fill trial classes and events" | Ads, flyers, Instagram |

**[Likely]** The WhatsApp group is the real competitor, not other apps. The MVP must beat "type one message in the class group" on effort.

---

## 2. Product vision (full, not MVP)

- **Themes:** Sport · Art · Education · Fun/Outdoor · (later: Nature, Music, Indoor/rainy-day)
- **Map layers:** Friends checked-in · Public events · Activities/venues · Trial classes
- **Planning:** "Free Saturday 10–13, theme = Sport, kid age 6" → suggestions + which friends are going
- **Social:** invite friends, "join us" requests, small groups (class, neighbourhood)
- **Monetisation (later):** provider listings / featured trial classes, booking commission. **Not** ads targeted on family location. **[Likely]** that would be legally and reputationally toxic.

---

## 3. MVP scope — "Who's out playing?"

### In scope
1. **Sign up as a parent** (phone OTP or Apple/Google sign-in). Profile: first name, photo optional, neighbourhood, kids' **age ranges only** (e.g. "2–4", "5–7") — no child names, no child photos.
2. **Friends graph, invite-only.** Add friends via invite link / phone contacts match / QR code. **No discovery of strangers in the MVP.**
3. **Check-in ("We're out"):**
   - Pick a **place** (playground, park, sports centre, café — from a POI list or drop a pin)
   - Pick a **theme** (Sport / Art / Education / Fun)
   - Pick **duration** (30 min · 1 h · 2 h · until HH:MM) — auto-expires
   - Optional note: "bringing a football", "kids 4 & 6"
   - Audience: **all friends** or **selected group/friends**
4. **Map + list view** of active check-ins from friends, filterable by theme and distance. List view matters as much as the map (accessibility, one-handed use).
5. **"Join" button** → notifies the parent who checked in ("Ana is coming, ~15 min"). One tap, no chat in MVP (or a minimal 1:1 thread if testing shows it's needed).
6. **Push notification:** "2 friends are at Retiro Park now" — only when a friend checks in within a user-set radius, with daily cap.
7. **Privacy controls:** pause all sharing, delete account + data instantly, see who can see you.

### Explicitly out of MVP
- Continuous background GPS tracking (battery, App Store review, privacy) **[Certain]** that Apple/Google require strong justification for "Always" location.
- Discovery of non-friend families (Phase 2, with verification)
- Events / activities / trial classes catalogue (Phase 2 — it's a separate supply-side business)
- Payments, bookings, reviews, group chat

### Why place-based check-ins instead of live location
| Live GPS dot | Place check-in |
|---|---|
| Reveals home, school, routines | Reveals only a public place, by choice |
| Needs background location permission | Needs "while using" only |
| Drains battery | Zero background cost |
| Hard to explain to anxious parents | "Like posting in the group chat, but on a map" |
| Stale/ambiguous ("are they still there?") | Explicit end time |

---

## 4. Safety, privacy & legal (do this *before* building)

**[Likely]** Assuming launch in the EU/Spain (GDPR applies). Validate with a privacy lawyer — this section is not legal advice.

- **Data subjects:** users are adults; children's data is minimised to age ranges. Still treat the product under a "children-adjacent" standard (UK Age Appropriate Design Code / EU DSA minor-protection mindset). **[Likely]**
- **Location = sensitive in practice.** Precise location of where children are is high-risk data → DPIA (Data Protection Impact Assessment) is effectively mandatory. **[Likely]**
- **Defaults:** sharing off by default; friends-only; auto-expire; no location history kept beyond the check-in + short retention (e.g. 24 h, then aggregated/deleted).
- **No home location stored.** If neighbourhood is needed, store coarse geohash (~1 km).
- **Abuse handling:** block/report, remove friend silently, rate-limit invites, ban on report thresholds.
- **Phase 2 stranger discovery requires:** verified identity (phone + ID or community vouching), distance-only/fuzzed display (Kidbridge's approach), and never exact location to non-friends.
- **COPPA (US)** — not triggered if the app is not directed at children under 13 and collects no data from them; parents are the users. **[Likely]**

---

## 5. Competitive landscape (quick scan)

| App | What it does | Gap / lesson |
|---|---|---|
| Kidbridge | Map-style "who's free now", distance only, meetup group chat | Validates privacy-by-distance approach |
| MomieGo | "Playdate Now" live window 15–45 min; paid tier ~$14.99 | Validates **time-boxed** availability; paid friend-matching |
| Plah | Browse nearby families by kid age & interests | Stranger-matching model (dating-app style) |
| PlayDates.club / Pairent | Match families by age + zip, SMS verification | Matching, not real-time |
| Peanut (moms) | Social network for mothers | Shows the community model; not activity-focused |
| Zenly (Snap, shut down Feb 2023) | Friends live-location map, ~40M MAU | Live-map for friends can work at scale for teens; it was killed by its owner, not by users |
| Life360 | Family live location | Shows parents accept tracking *of their own family*, not of other families |

**Differentiation hypothesis [Guessing]:** the gap is **themes + "what to do now" + friends**, i.e. combining the activity catalogue with the friend layer. But the catalogue is Phase 2, so the MVP alone is *not* differentiated — it is a validation tool.

---

## 6. MVP success metrics (decide before launch)

Test with **2–3 tight seed communities** (e.g. one school class, one kindergarten, one neighbourhood WhatsApp group) — 30–80 families each.

| Metric | Target (4–6 weeks) | Why |
|---|---|---|
| % invited parents who activate | ≥ 40% | Measures invite friction |
| Check-ins per active family / week | ≥ 1 | Core behaviour |
| % check-ins that get ≥ 1 "Join" | ≥ 20% | Core value: meetups actually happen |
| Real meetups reported (post-check-in prompt "did anyone come?") | ≥ 10% of check-ins | Ground truth |
| Week-4 retention | ≥ 25% | Habit |

**Kill/pivot signal:** parents use it, but check-ins get no joins → network density too low → pivot toward the activities/events catalogue (single-player value) before the social layer.

---

## 7. Technical plan

### Stack recommendation
| Layer | Choice | Rationale |
|---|---|---|
| Mobile | **React Native + Expo** (TypeScript) | One codebase iOS/Android, OTA updates, fast iteration. Flutter is an equal alternative if the team prefers Dart. |
| Maps | **MapLibre** (react-native-maplibre) + MapTiler/Stadia tiles, or Mapbox | Avoid Google Maps pricing lock-in; MapLibre is open source |
| POIs (playgrounds, parks) | **OpenStreetMap** via Overpass extract (`leisure=playground`, `leisure=park`, `leisure=sports_centre`) cached in DB | Free, good playground coverage in EU cities **[Likely]** |
| Backend | **Supabase** (Postgres + **PostGIS** + Auth + Realtime + Row Level Security) | Geo queries, realtime updates and per-user access control out of the box; small team friendly |
| Push | Expo Notifications (APNs/FCM) | |
| Analytics | PostHog (EU cloud) | Funnels + feature flags; EU hosting for GDPR |
| Hosting region | EU | GDPR data residency simplicity |

Alternative if you want to practise **DDD / hexagonal** (Java/Kotlin + Spring Boot + PostGIS): good fit for Phase 2 when the domain grows (bookings, providers). For the MVP it's slower to market. **[Likely]**

### Bounded contexts (for later growth)
- **Identity & Family** — parent account, kids' age ranges, verification
- **Social Graph** — friendships, groups, blocks
- **Presence** — check-ins, expiry, visibility rules ← *MVP core*
- **Discovery/Catalogue** — places, events, activities, trial classes (Phase 2)
- **Notifications**
- **Booking & Providers** (Phase 3)

### Core data model (MVP)
```
parent(id, display_name, photo_url?, coarse_area_geohash, created_at)
child_profile(id, parent_id, age_range)           -- no name, no photo
friendship(parent_a, parent_b, status, created_at) -- status: pending|accepted|blocked
group(id, name, owner_id) / group_member(group_id, parent_id)
place(id, osm_id?, name, category, geom geography(Point))
check_in(id, parent_id, place_id?, geom geography(Point),
         theme enum(sport,art,education,fun),
         starts_at, ends_at, note, audience enum(all_friends,group,custom))
check_in_audience(check_in_id, parent_id|group_id)
join_intent(id, check_in_id, parent_id, eta_minutes, created_at)
report(id, reporter_id, target_id, reason, created_at)
```

### Key queries / rules
- **Visible check-ins:** RLS policy → `check_in.ends_at > now()` AND viewer is accepted friend (or in audience) AND not blocked; spatial filter `ST_DWithin(geom, :viewer_point, :radius)`.
- **Expiry:** filter by `ends_at`; nightly job hard-deletes check-ins older than 24 h (keep only anonymised counts).
- **Realtime:** Supabase Realtime channel on `check_in` inserts, filtered client-side by friendship (or via a server function broadcasting per-user).

### Screens (MVP)
1. Onboarding (sign in → name → kids' age ranges → location permission "while using" → invite friends)
2. **Map** (default) with theme chips + bottom sheet list
3. **"We're out" button** → place → theme → duration → audience → post
4. Check-in detail → "Join" / "On my way (ETA)"
5. Friends & groups (invite link, QR, contacts match)
6. Settings: pause sharing, notification radius, delete account

---

## 8. Roadmap

| Phase | Duration (1–2 devs) [Guessing] | Content |
|---|---|---|
| **0. Discovery** | 2 weeks | 15–20 parent interviews; clickable Figma prototype; DPIA draft; pick seed communities |
| **1. MVP build** | 6–8 weeks | Scope in §3; TestFlight / Play internal testing |
| **2. Pilot** | 4–6 weeks | 2–3 seed communities; measure §6; weekly iteration |
| **3. Activities layer** | 6–8 weeks | Themed catalogue: public events (city open data, OSM), manually curated trial classes in one city; "plan my Saturday" filter |
| **4. Providers & discovery** | later | Provider self-listing, trial-class booking, verified stranger discovery with fuzzed distance |

### Phase 0 interview questions (sample)
- Last time you went to a park/activity with your kids — how did you decide where? Did you tell anyone?
- Have you ever messaged a group "anyone around?" What happened?
- Who would you be comfortable knowing where you and your kids are right now? Who not?
- How do you find trial classes today? What made you book (or not)?

---

## 9. Open decisions for you

1. ~~Launch city / country?~~ **Decided: Barcelona, Spain** → see §10.
2. **Friends-only forever, or stranger discovery in Phase 2?** Huge difference in safety investment and positioning.
3. **Social-first or catalogue-first?** ~~Social-first~~ → **Revised: AI-built catalogue + friends check-ins together** (see §11.3). AI makes the catalogue cheap enough to ship in the MVP, which fixes the empty-map problem.
4. **Build team:** solo/no-code prototype (FlutterFlow/Expo + Supabase) vs. hired devs.

---

## 10. Barcelona launch specifics

| Factor | Implication | Confidence |
|---|---|---|
| **Open Data BCN** publishes a children's play-areas dataset (`AreesJocsInfantils`, CSV/JSON, CC BY 4.0, published 2023) | Seed the `place` table with every official playground on day one, no OSM scraping needed. Check freshness & columns first. | [Certain] dataset exists; [Guessing] on completeness |
| City play policy counted **~878 play areas** (2018), unevenly distributed by neighbourhood | Map won't be empty of *places*; "less-crowded playground nearby" is a real feature | [Likely] |
| City's **children's activities agenda** (barcelona.cat "Amb nens i nenes") is a web listing, not clearly an open dataset | Needs AI extraction (§11.1), with attribution and respect for terms of use | [Likely] |
| **Trilingual**: Catalan, Spanish, English (large expat/international-family community) | UI in ca/es/en from day one. Content in Catalan must be readable by newcomers → AI translation | [Certain] languages; [Likely] expat size matters |
| **Extraescolars & casals** culture; schools' parent associations (**AFA/AMPA**) organise them | AFAs are the ideal seed communities: an existing, trusted, dense group of 50–400 families per school | [Likely] |
| **Newly arrived international families** lack the WhatsApp-group network locals have | Strongest initial segment: highest pain, English-speaking, early adopters | [Guessing] — validate in Phase 0 interviews |
| Climate: outdoor use year-round; summer heat; rainy days rarer but painful | Weather-aware suggestions (shade, indoor fallback) are high value | [Likely] |
| Regulator: **AEPD** (Spanish DPA) is among the most active GDPR enforcers in the EU; Spanish age of digital consent is **14** (LOPDGDD) | Budget for a privacy lawyer + DPIA before pilot; parents-only accounts | [Likely] / [Certain] on age 14 |
| City structure: 10 districts, 73 neighbourhoods | Use *barri* as the coarse-location unit instead of geohash — users understand it | [Certain] counts |

**Recommended pilot:** 2 school AFAs in one district (e.g. Gràcia or Eixample, dense + many families) + 1 international-family community (English-speaking parents' group).

---

## 11. Leveraging AI — and making the product AI-friendly

**Uncomfortable truth first:** AI does not solve the core risk (will friends join check-ins?). No model creates network density. Where AI *does* change the plan is **supply cost**: it makes the activities catalogue cheap to build, which turns the app useful for a single family with zero friends on it. That is the real leverage.

### 11.1 AI inside the product (ranked by value / effort)

| # | Feature | What AI does | Value | Risk / guardrail |
|---|---|---|---|---|
| 1 | **Catalogue ingestion** | LLM reads messy sources — city agenda pages, provider websites, Instagram captions, AFA extraescolars PDFs, flyers (photo → vision) — in ca/es/en and outputs structured records: `title, theme, age_min/max, date/time, recurrence, price, language, address, trial_class, booking_url` | **Highest.** Replaces a human curation team; enables catalogue in MVP | Hallucinated dates/prices → schema validation, confidence score, human review queue for low-confidence items, always link to source |
| 2 | **"Plan my free time" assistant** | Natural language → plan: *"Saturday 10–13, kids 4 and 7, Gràcia, rainy, under €20, something artsy"* → 2–3 options combining catalogue + playgrounds + weather + friends' check-ins | High — the "theme" vision in one interaction | Never send exact location or friend identities to the LLM; resolve those server-side and pass anonymised candidates |
| 3 | **Frictionless check-in** | Voice/text: *"At Parc de l'Estació del Nord till 6, football"* → place + theme + duration parsed | Medium-high — reduces check-in effort below a WhatsApp message | Confirm screen before posting (never auto-share location) |
| 4 | **Translation & summarisation** | Catalan provider page → 2-line English summary for expats | Medium | Keep original text accessible |
| 5 | **Trust & safety moderation** | Classify notes, profile text and reports for abuse/grooming signals; prioritise human review | Medium, essential at scale | AI flags, humans decide; log for audit |
| 6 | **Personalised ranking** | Learn which themes/places a family likes | Low in MVP (no data yet) | Do later; avoid profiling children |
| ✗ | AI matching strangers, inferring kids' traits from photos, predicting where families will be | — | — | **Don't.** Privacy-hostile and likely to trip GDPR/AI Act transparency expectations |

### 11.2 Making the product AI-friendly (agents & AI search can use it)

Parents increasingly ask ChatGPT/Claude/Gemini "what can I do with kids in Barcelona this weekend?" **[Likely]**. Be the source those assistants use.

1. **Public, structured catalogue on the web** — every activity/event/trial class gets a public page with **schema.org `Event` / `Course` / `Place` JSON-LD** (age range, price, location, dates, `inLanguage`). AI search engines and Google both consume it. **[Certain]** schema.org is the standard; **[Likely]** it improves AI citation.
2. **`llms.txt`** + clean sitemap describing the catalogue and API. **[Likely]** low effort, emerging convention.
3. **MCP server** (Model Context Protocol) exposing *public* tools: `search_activities(theme, age, area, date)`, `get_activity(id)`, `list_playgrounds(barri)`. Lets any MCP-capable assistant plan with your data → acquisition channel.
4. **Private data only via OAuth, scoped to the user's own account** — e.g. `create_check_in`, `list_my_friends_out_now` behind explicit consent. **Never** expose other families' presence to third-party agents in the MVP. **[Likely]** this is the line regulators and parents will draw.
5. **Clean public REST/OpenAPI spec** — same reason; also lets providers push listings automatically.
6. **Provider self-service via AI**: a provider pastes their URL or Instagram handle → AI drafts their listing → provider confirms. Cuts onboarding friction for the supply side.

### 11.3 Revised MVP (Barcelona + AI)

The earlier plan said "social-first, catalogue later". **I'm changing that recommendation** — not because AI is fashionable, but because AI ingestion + Open Data BCN make a decent catalogue cost weeks, not a curation team.

**MVP = three layers on one map:**
1. **Places** — all official playgrounds (Open Data BCN) + parks/sports centres (OSM)
2. **Activities & trial classes** — AI-ingested from ~30–50 sources in the pilot districts, human-reviewed
3. **Friends out now** — the check-in feature from §3, unchanged (friends-only, time-boxed)

Plus: **"Plan my free time"** assistant (11.1 #2) as the headline AI feature, and public activity pages with JSON-LD (11.2 #1). MCP server = Phase 2 (cheap once the API exists).

Day-one value without friends = catalogue + planner. Retention/virality = friends layer. Metrics in §6 still apply, plus: *% of sessions using the planner* and *catalogue accuracy (sampled human audit ≥ 95%)*.

### 11.4 AI architecture notes

- **Pipeline:** sources → fetcher (respect robots.txt/terms) → LLM extraction with strict JSON schema → validation (dates in future, geocodable address, price sane) → dedupe (embedding similarity + same place/time) → review queue → publish.
- **Planner:** retrieval over your own catalogue (Postgres + PostGIS filters first, `pgvector` for semantic "artsy"/"calm" matching) → LLM composes the answer from retrieved items only, citing item IDs. No free-form invention of activities.
- **Models:** small/fast model for bulk extraction and parsing; stronger model for the planner. Choose a provider offering an EU data-processing agreement and zero data retention. **[Likely]**
- **Privacy:** LLM calls receive no names, no friend graph, no precise coordinates — only barri-level area and anonymised candidates. Document this in the DPIA.
- **EU AI Act:** a planner chatbot is not high-risk, but transparency duties apply (users must know they're talking to AI; AI-generated summaries labelled). **[Likely]** — confirm with counsel.
- **Cost:** extraction runs in batch (nightly) and is cheap per item; the planner is the variable cost — cap free usage, cache common queries. **[Guessing]** on magnitude until measured.

### 11.5 Updated roadmap

| Phase | Duration [Guessing] | Content |
|---|---|---|
| 0. Discovery | 2 wks | Interviews with AFA parents + expat parents; prototype planner with a hand-made catalogue to test demand; DPIA |
| 1. Catalogue pipeline | 3–4 wks | Open Data BCN import, AI ingestion of pilot-district sources, review tool, public JSON-LD pages |
| 2. App MVP | 6–8 wks | Map (3 layers), planner, check-ins, friends, ca/es/en |
| 3. Pilot | 4–6 wks | 2 AFAs + 1 international community |
| 4. AI-friendly distribution | 2–3 wks | MCP server, OpenAPI, provider self-service listing |
| 5. Monetisation | later | Featured trial classes / booking commission with providers |

---

## 12. Figma prototype

**File:** [Kiddu — MVP Prototype](https://www.figma.com/design/KpH6WDbecx424dZV7tfVst) (team *Kiddu*). Press ▶ Present to click through the flow "Kiddu MVP flow", which starts at 01 Welcome.

| # | Screen | Validates |
|---|---|---|
| 01 | Welcome | Value proposition, ca/es/en, "only friends you invite can see you" |
| 02 | Map: friends out now | 3 layers (friends' pins, activity/trial pins, playgrounds), theme chips, bottom sheet |
| 03 | "We're out" check-in | AI voice input → form, place-based (not GPS), duration, audience (e.g. AFA class group), privacy copy |
| 04 | Friend check-in → Join | "On my way · 15 min" one-tap join, who else is going |
| 05 | AI planner | Natural-language plan, labelled as AI, cites sources, free quota → upsell |
| 06 | Trial class → Book | Verified provider, slots, "friends booked this", **provider pays on enrolment** |
| 07 | Kiddu Plus paywall | Free vs. Plus, €4.99/mo or €34.99/yr (prices are placeholders to test) |
| 08 | AFA school board | Peachjar-style approved flyers for extraescolars/casals, sign-up deadline, friends' choices (§14) |
| 09 | Go together | Book a trial and invite friends' families; bring-a-friend offer (§14) |

Main clickable paths: Welcome → Map → (We're out → Map) · (Anna card → Join → Map) · (Plan tab → planner → plan card → Trial → Book) · (planner upsell → Plus).

Known gaps: map is a stylised drawing, not real tiles; Friends/Me tabs not designed; no onboarding steps for kids' ages, invites or permissions yet.

---

## 13. Monetisation and Barcelona competitors

### 13.1 The uncomfortable truth first
- **You can't charge for the friends map.** It only works if everyone in the group is on it, and a paywall breaks that. It brings people in; it doesn't earn. **[Likely]**
- **Spanish families pay little for parenting apps.** Peanut (the best-known mum-social app, with active Barcelona groups) is criticised for a paywall on basic features. Expect a low single-digit % to subscribe. **[Guessing]** Test it, but don't build the business on it.
- **The money is with providers**: after-school classes (*extraescolars*), summer camps (*casals d'estiu*) and workshops, which need to fill places. A family that enrols in a weekly class is worth months of fees to them. **[Likely]**
- **Main risk: the trial happens offline, so does the enrolment.** If providers have to report enrolments themselves, some won't. Design the fee so it doesn't depend on that (see 13.3).

### 13.2 Competitors and alternatives in Barcelona

| Player | What it is | How it makes money | Threat / lesson | Confidence |
|---|---|---|---|---|
| **WhatsApp / Facebook parent groups** (class, barri, AFA) | Where "anyone at the park?" happens today | Free | **The real competitor** for the friends layer. Your app must take less effort than one message | [Certain] they exist |
| **Peanut** | Social network for mums; Barcelona groups exist (e.g. single mums' group) | Freemium subscription, paywall criticised | Shows parents will join for connection, but paywalls annoy; mum-only positioning leaves dads/couples out | [Certain] Barcelona groups; [Likely] model |
| **Kidbridge, MomieGo, Plah** | Nearby-family / playdate apps (mostly US/global) | Paid tiers (MomieGo shows a ~$14.99 tier) | Nobody owns Barcelona; same idea, no local catalogue | [Certain] listings; [Guessing] Barcelona usage is low |
| **BuscaExtraescolares** | Spanish after-school activity finder + booking; academies get a panel to confirm requests | Provider-side tools (pricing not public); online payments "coming" per their blog | **Closest competitor** for the trial-class layer. No friends layer, no "free time now" | [Likely] |
| **Atrápalo** (Barcelona HQ) | Leisure/tickets marketplace with a kids' activities section | Commission on bookings | Owns one-off paid activities and tickets; don't compete on tickets | [Certain] category; [Likely] commission |
| **Celebrae** | Experience booking incl. family plans | Commission on bookings | Same as Atrápalo, gift/experience focus | [Likely] |
| **City media**: Barcelona Secreta, Time Out Barcelona, Mammaproof Barcelona, Hoy Barcelona, Un Buen Día en Barcelona | Editorial "what to do with kids" guides and agendas | Ads, sponsored articles, affiliate links | They own discovery via Google/Instagram. Possible **partners** (content syndication) more than rivals | [Likely] |
| **barcelona.cat agenda + Open Data BCN** | Official children's agenda, play areas, sports facilities | Free public service | Free supply for your catalogue; you can't charge for this data itself | [Certain] |
| **Providers' own booking** (e.g. Little Makers, TBKids) | Workshops/academies with their own online booking, bonos, monthly plans | Direct | They are **customers**, not competitors. They want more trial bookings | [Certain] they exist |
| **Global references**: KidPass, ActivityHero, Sawyer (US) | Activity marketplaces | KidPass: family credit subscription + provider commission. ActivityHero: free listing, provider pays only per paid registration; $9.99/mo family subscription. Sawyer: provider SaaS tiers + ~15–30% marketplace commission | Proven models to borrow; all US, no friends layer | [Likely]; third-party sources, verify |

**Gap Kiddu fills [Likely]:** nobody in Barcelona combines *friends who are out now* with a *themed catalogue of activities and trials* and an *AI planner*, in ca/es/en.

### 13.3 Recommended revenue model (in order)

| # | Stream | Who pays | Price idea [Guessing — test] | When | Why |
|---|---|---|---|---|---|
| 1 | **Pay-per-trial-booking** | Provider | €5–10 per confirmed trial attendee (no-shows free) | Pilot onward | Doesn't depend on providers reporting enrolment; risk-free for them ("pay only for families who came") |
| 2 | **Enrolment bonus (optional)** | Provider | ~50% of first month's fee if the family enrols, verified via in-app "We enrolled 🎉" prompt to the family | After pilot | Bigger upside; family confirmation reduces reliance on provider honesty |
| 3 | **Provider Pro (SaaS)** | Provider | €19–39/month: trial calendar, waitlist, auto-reminders, AI-written listing in ca/es/en, stats | Phase 4 | Recurring revenue; replaces Excel/WhatsApp for small academies. BuscaExtraescolares and Sawyer show demand |
| 4 | **Summer camps (casals) season** | Provider | Featured placement + per-booking fee, Mar–Jun | First spring | Bookings worth hundreds of euros each, all in one season [Likely] |
| 5 | **Kiddu Plus** | Family | €4.99/mo, €34.99/yr: unlimited AI plans, weekend/rainy-day digest, early camp access, partner discounts | Test in pilot | Only charge for *extras*, never for the friends map or basic catalogue |
| 6 | **Clearly labelled sponsored listings** | Provider / brands | CPM or fixed weekly slot per barri | With scale | Only "Sponsored" items in lists; **no ads targeted by live location** |
| 7 | **Free tool for AFAs (B2B2C)** | — (or revenue share) | AFA gets free tool to publish its extraescolars and class groups; optional share of trial fees | Pilot | Gets you dense groups of families from the same school, which the friends map needs; AFAs become distribution partners |

**Never:** sell or share location data; charge to see friends; take money to rank a provider without a "Sponsored" label. Any of these would lose parents' trust and attract scrutiny from the Spanish data-protection authority (AEPD). **[Likely]**

### 13.4 Reality check on the numbers (illustrative, all [Guessing])

| Assumption | Value |
|---|---|
| Active families (end of pilot) | 500 |
| Trials booked / active family / month | 0.1 → 50 trials |
| Fee per attended trial (80% show) | €7 → **€280/month** |
| Enrolment rate after trial × bonus | 30% × €20 → **€300/month** |
| Plus conversion 3% × €4.99 | **€75/month** |

≈ €650/month at 500 families, so this only works at scale: roughly **10k+ active families in Barcelona metro** before it covers 1–2 salaries. Plan funding for the build and pilot, and track **trial bookings per active family** as the money metric from day one.

### 13.5 Pricing experiments for the pilot
1. Offer 20 pilot providers in 2 districts **free listings for 3 months** in exchange for confirming trial attendance in the app. This tells you the real show-up and enrolment rates.
2. Show families the Plus paywall (fake-door test: "coming soon, join waitlist") to measure intent before building it.
3. Ask each provider what they pay today to get a new enrolment (flyers, Instagram ads, Atrápalo). That's your price ceiling.

---

## 14. Lessons from US competitors → improved idea

### 14.1 The uncomfortable part first
- **No US company won with a family-paid activity subscription.** KidPass (credits subscription + provider commission) was acquired by edtech company BEGiN in 2021, and BEGiN's parent later went through Chapter 11 restructuring. **[Likely]** Families stop paying when routines settle; providers stay.
- **The US businesses that last own a channel that already exists** (school flyers, local newsletters, licensed-childcare search), not a new social habit. Kiddu's friends map *is* a new habit, so it needs one of these existing channels to reach families.
- **Stranger playdate apps (MomieGo, Kidbridge, Plah) are crowded and look like dating apps.** **[Guessing]** Retention is weak once the novelty passes. Don't copy that.

### 14.2 What each US player teaches

| US player | Model | What to copy | What to do better in Barcelona | Confidence |
|---|---|---|---|---|
| **Peachjar** | Schools pay a small one-time fee; **community organisations pay to distribute digital flyers** to chosen schools; district approves every flyer; free tier for free events | Pay-per-distribution + school approval gate. Turns paper flyers in backpacks into revenue | Do it through **AFAs**, add a **revenue share for the AFA**, and link flyers to friends ("4 class friends signed up") and one-tap trial booking. Peachjar is just a flyer, with no social layer or booking | [Certain] model; [Guessing] exact prices |
| **Macaroni KID** | Network of 500+ local "publishers" (mostly parents) running a free weekly family newsletter; they sell local partnerships and keep the revenue, paying a small hosting fee. Acquired by CertifiKID (2020) | **Local human curators**: trusted parents who know their barri | **Barri hosts**: one parent per neighbourhood curates the weekly digest with AI doing 80% of the work (ingestion, translation, layout), and earns from local partnerships. Scales curation and trust without staff | [Likely] — company's own claims |
| **Winnie** | Free for parents; **providers pay** to fill spaces and waitlists; started with licensed daycare, expanded to camps and au pairs; recently added AI search | Start where the need is **urgent and recurring**, then expand. Providers pay, parents use it free | Kiddu's urgent moments: **September extraescolars sign-up** and **spring casals (summer camps) booking**. Build the app around those two seasons, not just "free afternoon" | [Likely] |
| **ActivityHero** | Free listing; provider pays **only when a paid registration happens**; $9.99/mo family on-demand subscription | Results-based fee lowers provider risk | Same, plus **family confirms the enrolment** in the app ("We enrolled 🎉") so providers can't under-report | [Likely] |
| **Sawyer** | Booking/management **SaaS for providers** + marketplace commission | The provider tool is the sticky asset; the marketplace sits on top | Give small Barcelona academies a **free trial-and-waitlist tool** (AI writes the listing in ca/es/en). Supply joins for the tool, then gets demand through Kiddu | [Likely] (third-party pricing) |
| **KidPass** | Credits subscription for families across many activities | — (cautionary) | Don't make a family subscription the core revenue | [Likely] |
| **Peanut** | Mum-focused social network; freemium | Community and groups work | Include **dads and all caregivers**; never paywall basic connection | [Certain] model; [Likely] criticism |
| **Life360 / Zenly** | Live location sharing (family / friends) | Location sharing can reach mass scale | Keep the **opt-in, time-boxed, place-based** check-in; parents accept tracking their own family, not others | [Certain] |
| **Nextdoor** | Neighbourhood network with address verification | Verification builds trust in a hyperlocal network | Verify through the **school group (AFA vouching / class invite)** instead of address or ID: stronger trust, less friction | [Likely] |

### 14.3 What Kiddu does better: the improved concept

**One-liner:** *Kiddu is the school-and-barri network where Barcelona families see which friends are out now, find activities their kids' friends do, and book trials together.*

1. **School-first social graph (AFA).** Families join through their school class group, not by matching with strangers. Trust and density come together: a class of 25 families fills a map. *(Better than Peanut, Plah, Kidbridge.)*
2. **AFA school board (Peachjar-style, social).** Providers pay to publish extraescolars and casals on approved school boards; AFAs earn a share; families see "4 class friends signed up". *(Prototype screen 08.)*
3. **"Go together" booking.** Book a trial and invite friends' families in one tap; provider-funded bring-a-friend discount if both enrol. Kids want to go where their friends go, and providers get two enrolments from one booking. **No US competitor has both the friend graph and booking.** *(Prototype screen 09.)*
4. **Seasonal peaks.** Build the app around the **September extraescolars** and **March–June casals** booking seasons (deadlines, reminders, "what your class chose"), plus everyday "who's out now".
5. **Barri hosts (Macaroni-style), AI-assisted.** Local parents curate a weekly digest in ca/es/en with AI; they earn from local partnerships; Kiddu takes a platform share.
6. **Free provider tool (Sawyer/Winnie-style).** Trial calendar, waitlist, AI-written listings, so the catalogue grows without a sales team.
7. **Results-based pricing.** Providers pay for attended trials and confirmed enrolments; families pay nothing for the core.

### 14.4 Revised revenue priority (replaces §13.3 order)

| # | Stream | Payer | Why it moved |
|---|---|---|---|
| 1 | **AFA board distribution** (pay per school/season, AFA revenue share) | Provider | Proven by Peachjar; money arrives at sign-up seasons; AFAs become your sales channel |
| 2 | **Pay per attended trial + enrolment bonus** (family-confirmed) | Provider | ActivityHero model, with less under-reporting |
| 3 | **"Go together" bundles** (Kiddu fee per extra family enrolled) | Provider | Unique to Kiddu; ties revenue to the friend graph |
| 4 | **Provider Pro SaaS** | Provider | Sawyer model; recurring |
| 5 | **Barri host partnerships** (platform share) | Local businesses | Macaroni model; local ad revenue without a sales team |
| 6 | **Kiddu Plus** | Family | Nice-to-have only (KidPass lesson) |

### 14.5 Impact on the pilot
- Pick **2 schools with active AFAs in one district**, and launch **in early September** (extraescolars season) or **March** (casals season), not in a random month.
- The first sales conversation is with the **AFA board**, not with families: "free digital board + revenue share + fewer WhatsApp messages."
- New metrics: % of class families joined per school (target ≥ 40%), flyers published per AFA, "Go together" invites per booking, trial→enrolment rate.

### Sources (US)
- [Peachjar — how it works for community orgs](https://info.peachjar.com/community-orgs/how-it-works) · [Peachjar pricing for community partners](https://blog.peachjar.com/all-about-peachjar-pricing-for-community-partners) · [Peachjar FAQ](https://peachjar.com/faq)
- [Macaroni KID — publisher model](https://lowell.macaronikid.com/articles/58b718278416d7417cafeae9/could-you-be-a-macaroni-kid-publisher) · [About Macaroni KID / CertifiKID](https://denton.macaronikid.com/about-us)
- [Winnie (Wikipedia)](https://en.wikipedia.org/wiki/Winnie_(website)) · [Marketplace: AI and childcare search (2026)](https://www.marketplace.org/episode/2026/05/05/can-ai-improve-your-odds-of-finding-good-childcare) · [Winnie App Store](https://apps.apple.com/us/app/winnie-find-child-care-nearby/id1066620030)
- [KidPass acquired by BEGiN](https://www.siliconlegal.com/sls-client-kidpass-is-acquired-by-begin/) · [BEGiN parent Chapter 11](https://elevenflo.com/blog/conscious-content-media-chapter-11-bankruptcy)

---

## 15. Option evaluated: catalogue-first MVP (map of all kids' events, activities and places)

Proposal (2026-11-08): MVP = map of every kids' event, activity and place (trampoline parks, climbing gyms, playgrounds…). Later: personal events organizer, then spontaneous playdate finder.

### 15.1 Verdict
**Right order, wrong format and too broad.** Catalogue first fixes the empty-map problem: one family gets value on day one with no friends on the app. But "a map of everything" on its own is a **commodity**: Google Maps, Time Out, Barcelona Secreta, Atrápalo, the city agenda and ChatGPT already answer "what to do with kids this weekend". **[Likely]**

### 15.2 Risks of catalogue-only
| Risk | Why | Confidence |
|---|---|---|
| **No reason to install an app** | Parents search Google/Instagram/ChatGPT for "plans amb nens"; nobody downloads an app for listings they can google | [Likely] |
| **Low frequency** | Weekly at best, so it's easily forgotten; no network effect protects you | [Likely] |
| **Events go stale** | "All events" means hundreds of expiring items per week; one wrong date and parents stop trusting it. Places (trampoline park, climbing gym) are stable; events aren't | [Likely] |
| **Hard to add social later** | People who installed a listings app are not a friend network. Foursquare split check-ins into a separate app (Swarm) in 2014: discovery and social are hard to keep in one product | [Certain] split; [Likely] lesson |

### 15.3 What I'd do instead (same idea, changed)
1. **Web first, not an app.** Build the catalogue as a fast mobile website/PWA with one public page per place/event (schema.org markup, see §11.2). It gets found on Google and by AI assistants, costs less, and needs no install. **Build the native app only when the social features arrive** (they need push notifications and location).
2. **Narrow and reliable, not "all".** Launch with:
   - **Places** (stable): playgrounds (Open Data BCN), trampoline parks, climbing gyms, indoor play, museums with kids' programmes, beaches, with filters for age, indoor/outdoor, price, shade.
   - **This weekend + rainy day** curated events (AI-ingested, human-checked).
   - **Free trials** (the revenue hook from §13–14).
   Rule: **better 300 correct items than 3,000 half-wrong ones.**
3. **Ship the organizer within weeks, as a share link.** "Plan → invite friends" sends a WhatsApp link; friends answer *I'm in / maybe* **without installing anything**. This is the bridge: it uses the WhatsApp groups parents already have, and every invite brings new parents and builds the friend graph you need for playdates later.
4. **Spontaneous playdates only when the graph is dense enough**, e.g. a parent has ≥ 5 connected families, or ≥ 30% of a class is on the app. Before that, the feature shows an empty map.

### 15.4 Revised sequence
| Phase | Product | Goal / metric |
|---|---|---|
| **1. Catalogue (web/PWA)** ~6–8 wks | Map + list of places, weekend/rainy-day events, free trials; filters by age, theme, distance; ca/es/en | Weekly returning visitors; Google/AI-search traffic; trial bookings |
| **2. Organizer (share links)** +3–4 wks | "Plan this with friends" → WhatsApp link → RSVP without install; saved plans | **Invites per plan, % of invitees who sign up** (this builds the friend graph) |
| **3. Native app + "We're out"** | Push, check-ins, friends map, Go together booking | Check-ins per week, % check-ins with a join |
| **4. Spontaneous playdates** | "Who's free now" among friends/class groups | Meetups that actually happen |

### 15.5 Money in the catalogue phase
- **Venues pay** (trampoline parks, climbing gyms, indoor play): featured placement and **booking/ticket referral fees**. These are commercial businesses that already pay for ads. **[Likely]**
- Free trials (pay per attended trial, §13–14).
- No family subscription in this phase.

### 15.6 Decision test before building
Hand-make the catalogue for one district (Gràcia), about 150 items, as a simple web page. Share it in 5 parent WhatsApp groups for 3 weeks. Continue if **≥ 25% of visitors return the next week** and **≥ 10% use "plan with friends"**. If not, the catalogue is a commodity and you go back to the school-group-first approach (§14). **[Guessing]** on thresholds.

---

## Sources
- [Kidbridge (App Store)](https://apps.apple.com/app/id6503090560)
- [MomieGo (App Store)](https://apps.apple.com/app/id1091154054)
- [Plah: Plan Kids Playdates (App Store)](https://apps.apple.com/us/app/id6755757284)
- [Pairent (App Store)](https://apps.apple.com/gb/app/pairent/id1575806820)
- [PlayDates.club (Product Hunt)](https://www.producthunt.com/p/playdates-find-your-family-s-village/playdates-club-find-your-next-playdate)
- [Inside the Shutdown of Zenly — Pragmatic Engineer](https://blog.pragmaticengineer.com/zenly/)
- [Open Data BCN — Children's play areas dataset (CC BY 4.0)](https://opendata-ajuntament.barcelona.cat/data/en/dataset/culturailleure-espaisinfantils/resource/c3ed4130-0cbb-4f7d-96b4-45dc43cd7353)
- [barcelona.cat — Amb nens i nenes (agenda, sports, casals)](https://barcelona.cat/ca/viure-a-bcn/amb-nens-i-nenes)
- [Barcelona Pla del Joc (play policy)](https://bcnroc.ajuntament.barcelona.cat/jspui/bitstream/11703/122994/1/PlaJOC_resum_web-IIAB.pdf)
- [Peanut — Mamis Monomarentales Barcelona group](https://www.peanut-app.io/groups/e8ly-apb/mamis-monomarentales-barcelona)
- [Peanut app review (paywall criticism)](https://www.whistleout.com/CellPhones/Apps/peanut-app-for-mom-friends)
- [BuscaExtraescolares — product announcement](https://www.buscaextraescolares.com/blog/presentamos-buscaextraescolares/)
- [Atrápalo — kids activities Barcelona](https://www.atrapalo.com/actividades/barcelona/barcelona/actividades-infantiles/)
- [Celebrae — family plans Barcelona](https://www.celebrae.com/blog/planes-familia-barcelona-ninos)
- [Little Makers Barcelona](https://www.littlemakers.es/barcelona)
- [Barcelona Secreta — kids](https://barcelonasecreta.com/en/things-to-do-with-kids-in-barcelona/)
- [Time Out Barcelona — kids](https://www.timeout.com/barcelona/kids/activities/barcelona-for-kids)
- [KidPass subscription model — TechCrunch (2017)](https://techcrunch.com/2017/05/26/kidpass-raises-5-1-million-for-its-childrens-activity-subscription-service/)
- [ActivityHero on-demand subscription](https://help.activityhero.com/hc/en-us/articles/360056950192-on-demand-subscription-service)
- [ActivityHero provider listing](https://business.activityhero.com/new/)
- [Sawyer fees (third-party review)](https://tutoringplatforms.com/platform/sawyer)
