# Family Free-Time App — Research & MVP Plan

> Working name: **Playground** (placeholder). Date: 2026-11-07.
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

1. **Launch city / country?** Changes legal frame and POI quality. *(Assumed EU/Spain.)*
2. **Friends-only forever, or stranger discovery in Phase 2?** Huge difference in safety investment and positioning.
3. **Social-first or catalogue-first?** My recommendation: build the MVP social layer as specified, but have the catalogue (Phase 3) ready as the fallback if network density proves too low.
4. **Build team:** solo/no-code prototype (FlutterFlow/Expo + Supabase) vs. hired devs.

---

## Sources
- [Kidbridge (App Store)](https://apps.apple.com/app/id6503090560)
- [MomieGo (App Store)](https://apps.apple.com/app/id1091154054)
- [Plah: Plan Kids Playdates (App Store)](https://apps.apple.com/us/app/id6755757284)
- [Pairent (App Store)](https://apps.apple.com/gb/app/pairent/id1575806820)
- [PlayDates.club (Product Hunt)](https://www.producthunt.com/p/playdates-find-your-family-s-village/playdates-club-find-your-next-playdate)
- [Inside the Shutdown of Zenly — Pragmatic Engineer](https://blog.pragmaticengineer.com/zenly/)
