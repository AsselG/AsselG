# Kiddu Sant Cugat: agentic ATDD development plan

> Scope: a website with AI-gathered places, events and activities in Sant Cugat del Vallès and around, piloted with the Àgora AFA and our class families, then extended to colleagues' kids and their areas.
> Method: [phuryn/product-engineering](https://github.com/phuryn/product-engineering) skills + Claude Code + cheaper models for most work + ATDD (acceptance scenarios first).
> Confidence tags: **[Certain]** evidence · **[Likely]** strong inference · **[Guessing]** to validate.

---

## 0. The uncomfortable part first

1. **Data quality is the main risk, not code.** I found no Sant Cugat open-data portal or structured children's agenda. **[Likely]** Most events will come from scraping the Ajuntament and library pages, the Diputació de Barcelona agenda, and manual venue entries. One wrong date in the pilot costs more trust than a missing feature. That's why the review queue (feature 07) and the golden set (feature 11) are in the MVP.
2. **Check which "Àgora" and what you're allowed to do.** "Agora Sant Cugat International School" is a private Globeducate school with infant campuses (Patufet, Pipo). **[Certain]** I found no public AFA information for it. **[Guessing]** Before you invite families, ask the parents' association and the school whether using class contact channels for a pilot is OK, and get written consent for anything you collect.
3. **The linked method does not write tests first; you asked for ATDD.** Product-engineering says "tests land with the change; every fix with a test that failed before it" and contrasts that with test-first collections. **[Certain]** This plan combines them: **your acceptance scenarios come first** (they are the spec you control), and **unit tests land with the change** (the method's rule). That keeps your control without making agents write speculative unit tests.
4. **A cheaper model must not review its own work.** The method's rule is that the session that wrote the code never clears it: a fresh reviewer, never a subagent of the builder. **[Certain]** So "lower models" means cheaper *builders and checkers*, not cheaper *judges*.
5. **The pilot is small.** 2–3 classes means roughly 40–75 families. **[Guessing]** That's enough to learn *why* people return or not, not enough for percentages you can generalise. Treat metrics as signals.

---

## 1. One-time setup (day 1–2)

1. Create a new repo, e.g. `kiddu-santcugat` (not this profile repo).
2. In Claude Code in that repo: `Please install skills from phuryn/product-engineering on GitHub in this project only. Enable auto updates.`
   Packs: `product`, `ai-shipping`, `agent-teams`, `agent-harness`, `app-stack`.
3. Copy from this folder into the new repo:
   - `features/` (your use cases), `config/` (your behaviour knobs)
   - `agent-kit/CLAUDE.md`, `agent-kit/.claude/` (subagents + permission rules), `agent-kit/.github/CODEOWNERS`
4. Apply the `agent-instructions` skill once. It wires its router rows into `CLAUDE.md`; keep the ATDD section.
5. Optional: `guardrail-hooks` skill to turn "never edit features/ or config/" into a hook, on top of the permission deny rules.
6. Type `/product:start-here` and say: "Website MVP, spec in features/, start with milestone M1."

**Protection of your control:** `.claude/settings.json` denies agent edits to `features/**` and `config/**`, and `CODEOWNERS` makes your approval mandatory for any change there. **[Likely]** Check that the deny-path syntax matches your Claude Code version: run one session and confirm an edit to `features/` is refused.

---

## 2. Who does what (models and roles)

| Role | Who / model | Does | Never does |
|---|---|---|---|
| **Product owner** | **You** | Writes/edits `.feature` scenarios and `config/*.yaml`; accepts findings; clicks through previews; says "go" | Read code line by line |
| **Coordinator** | Main Claude Code session, **Opus 5.5** (or Sonnet 5.5 at high effort to save cost) | Plans the milestone, briefs subagents with the *why*, re-runs the gate itself, triages findings for you | Clear its own builders' work |
| **Acceptance-steps builder** | Subagent, **Sonnet 5.5** | Turns your scenario into failing step definitions | Edit `.feature` files |
| **Implementer** | Subagent, **Sonnet 5.5** | Smallest change to pass the scenario + unit tests | Deploy, migrate, edit specs |
| **Mechanical work** | Subagent or `claude -p --model haiku`, **Haiku 5.5** | Translations ca/es/en, copy, lint fixes, fixtures, data checks (`data-checker`) | Architecture, security decisions |
| **Independent reviewer** | Fresh session (`independent-review` skill): Grok by default, otherwise a fresh headless Claude | Reviews every push that deploys, round after round | See the build history |
| **Extraction (runtime)** | **Haiku 5.5** via Batch API | Nightly: page → item JSON | Publish without validation |
| **Escalation (runtime)** | **Sonnet 5.5** | Retry pages Haiku got wrong or invalid | — |

Rule of thumb from `delegation`: if the brief is nearly as long as the diff, the coordinator writes the diff itself.

---

## 3. The ATDD loop (per scenario)

```
YOU                          AGENTS                                         GATE
 │ write/adjust scenario      │                                              │
 │ (features/*.feature)       │                                              │
 │──────────────────────────► │ acceptance-steps (Sonnet): steps, run → RED  │
 │                            │ implementer (Sonnet): code + unit tests       │
 │                            │ coordinator: npm run gate ─────────────────► │ typecheck+unit+acceptance
 │                            │ independent review (fresh session) ────────► │ until nothing > Low
 │ ◄──── preview link + "what to try" (the scenario steps)                   │
 │ click through on phone: OK → merge / not OK → new or changed scenario     │
```

- **Red for the right reason:** the failing message must point to missing behaviour (e.g. "expected 0 expired events, got 1"), not a broken selector.
- **Your click-through = the scenario text.** The preview message lists each scenario as "action → what should happen".
- **Changing behaviour later:** edit the scenario or the config value → PR → the gate shows which scenarios go red → the same loop runs.

---

## 4. Milestones

| # | Weeks [Guessing] | Features | Done when |
|---|---|---|---|
| **M0 Data spike** | 1 | 11 (partly) | 50 real Sant Cugat pages hand-labelled = **golden set**; Haiku extraction ≥ 95% field accuracy on it, or we know which fields need Sonnet / manual |
| **M1 Browse** | 2 | 01, 02, 03, 08 | Map + list + filters + item pages in ca/es/en on a phone; seeded with reviewed items |
| **M2 Pipeline + editor** | 2 | 07, 11 | Nightly run, review queue, cost guard, run report; `auto_publish: false` |
| **M3 Pilot release** | 1 | 04, 06 | Plan-with-friends links + "something is wrong" + suggestions; `release-gate`; legal pages (`legal-pages` skill) |
| **Pilot** | 4–6 | — | Run with the AFA classes (§7) |
| **M4 Class groups** | 2 | 09 | Only if pilot families ask for it |
| **M5 Colleague areas** | 1–2 per area | 10 | New area added through `config/areas.yaml` + `sources.yaml` only |
| **M6 Ask in plain words** | 2 | 05 | Only after the catalogue is trusted |

---

## 5. Data pipeline (low-cost, agentic)

```
sources.yaml ─► fetch (polite, robots.txt) ─► changed? ─► Batch API: Haiku 5.5 + structured output (item schema)
     ─► zod validation ─► invalid/low confidence ─► Sonnet 5.5 retry ─► still bad → reject
     ─► dedupe (same place+time) ─► confidence ≥ threshold & auto_publish on? ─► publish : review queue
     ─► run report (counts + cost) ─► data-checker (Haiku) samples 20 items vs sources weekly
```

**Sources for Sant Cugat and around** (each to verify before enabling, see `config/sources.yaml`):
- OpenStreetMap (Overpass): playgrounds, parks, sports centres, libraries **[Certain]** OSM has these tags; coverage to check
- Diputació de Barcelona open data / agenda (library and cultural events by municipality) **[Likely]**
- Ajuntament de Sant Cugat agenda and municipal libraries' pages (scraping) **[Likely]**
- Manual venue entries: trampoline parks, climbing gyms, indoor play, museums, Collserola routes
- Family guides (Femturisme, Escapada amb nens) as hints only, after checking their terms **[Guessing]**

**Cost estimate** (from Anthropic list prices: Haiku 5.5 $0.10/M input, $0.50/M output; Batch API 50% off):
300 changed pages/night × ~5k input tokens + ~800 output tokens → 1.5M in + 0.24M out ≈ **$0.14/night ≈ $4–5/month**.
**[Likely]** Prompt caching of the shared system prompt + schema lowers it further. Sonnet escalations add cents. `monthly_budget_eur: 30` in config is a safety cap, not the expected cost.

---

## 6. How you control the webpage's behaviour

You have five levers, from strongest to lightest:

| Lever | What you change | Effect |
|---|---|---|
| **1. Scenarios** (`features/*.feature`) | Add/change/delete a scenario, or move its tag (`@mvp` → `@phase2`) | Defines *what* the site does; agents must make it pass |
| **2. Config** (`config/site.yaml`, `areas.yaml`, `sources.yaml`) | Numbers and switches: radius, freshness days, report threshold, auto-publish, models, budget, languages, themes, areas, sources | Changes behaviour without code; scenarios already test that the value is used |
| **3. Review queue** (editor page) | Approve / edit / reject items; blocklist a source | What families actually see |
| **4. Click-through** on each preview | Accept or send back | Nothing merges that you haven't seen |
| **5. Release go/no-go** (`release-gate`) | Say "go" | Nothing reaches families without your go |

### Use cases (index of `features/`)

| # | Use case | File | Tag | Your knobs in config |
|---|---|---|---|---|
| UC1 | See places/events/activities on a map and list around Sant Cugat | `01_browse_map_and_list.feature` | @mvp | `area.default`, `area.default_radius_km` |
| UC2 | Use my location only with consent | `01_…` | @mvp | — (privacy rule) |
| UC3 | Filter by theme, age, today/weekend, free, indoor (rainy day) | `02_filters.feature` | @mvp | `themes`, `weather.rainy_day_chip_min_rain_probability` |
| UC4 | Share a filtered view by link | `02_…` | @mvp | — |
| UC5 | Trustworthy item page with source and "last checked" | `03_item_details.feature` | @mvp | `freshness.warn_after_days`, `freshness.hide_after_days` |
| UC6 | Expired events disappear; AI text is labelled | `03_…` | @mvp | — |
| UC7 | Plan with friends via WhatsApp link, RSVP without account | `04_plan_with_friends.feature` | @mvp | `plans.delete_days_after_plan`, `plans.max_rsvps_per_plan` |
| UC8 | Report wrong info; suggest a place or event | `06_feedback_and_suggestions.feature` | @mvp | `feedback.hide_after_reports` |
| UC9 | Editor approves AI-gathered items; duplicates merged; sources blocklisted | `07_editor_review_queue.feature` | @mvp | `publishing.auto_publish`, `publishing.auto_publish_min_confidence`, `sources.blocklist` |
| UC10 | Catalan / Spanish / English; no tracking; no child data | `08_languages_and_privacy.feature` | @mvp | `languages`, `default_language` |
| UC11 | Nightly AI gathering with cost guard and golden-set check | `11_data_pipeline.feature` | @mvp | `ai.*` models, `ai.monthly_budget_eur`, `ai.golden_set_min_field_accuracy` |
| UC12 | AFA class group page with invite link | `09_pilot_class_groups.feature` | @pilot | — |
| UC13 | Add a colleague's area by config only | `10_areas_and_expansion.feature` | @phase2 | `areas.yaml`, `sources.yaml`, `area.min_items_to_show_area` |
| UC14 | Ask in plain words, answers only from catalogue | `05_ask_ai.feature` | @phase2 | `ai.ask_model`, `ai.ask_daily_limit_per_visitor` |

**How to write a good scenario yourself:** one behaviour per scenario; *Given* = situation, *When* = one action, *Then* = what a parent sees. Use values from config by name ("the freshness limit in site config"), not numbers, so changing config doesn't need a scenario edit.

---

## 7. Pilot with the AFA and our classes

| Step | What |
|---|---|
| Before | Permission from the AFA/school; short privacy note; 20 hand-checked "good weekend" items live |
| Week 0 | 10-minute intro message in class WhatsApp groups (ca/es/en), link + "plan with friends" demo |
| Weekly | Friday "this weekend near Sant Cugat" message with 5 items from the site (link, not copy) |
| Measure (cookieless, `product-analytics` skill) | Returning visitors week over week; plans created; RSVPs per plan; reports of wrong info; top searches with no results |
| Interviews | 5 parents at week 2 and week 5: what did you use, what was wrong, what would make you open it on Friday |
| Decide (end of pilot) | Continue if **≥ 25% of visiting families return in week 3+** and **≥ 1 plan with friends per class per week** **[Guessing]** thresholds; otherwise change the scenarios before extending |

**Extension to colleagues:** each colleague's town is an `areas.yaml` entry + its `sources.yaml` list + 20 hand-checked items, through UC13. Launch an area only when it reaches `min_items_to_show_area`.

---

## 8. Running costs (monthly, pilot)

| Item | Cost |
|---|---|
| AI extraction (Haiku 5.5 Batch) | ~$4–5 [Likely, calculated] |
| Hosting (Netlify) + Supabase | free tiers at pilot size [Likely] |
| Domain | ~€1/month |
| Claude Code for development | your existing plan |
| Independent reviewer (Grok CLI or fresh Claude) | depends on plan [Guessing] |

---

## Sources
- [phuryn/product-engineering](https://github.com/phuryn/product-engineering) (method, skills: start-here, test-harness, derive-tests, delegation, claude-agents, independent-review, release-gate, agent-instructions, guardrail-hooks, legal-pages, product-analytics)
- [Agora Sant Cugat International School (Globeducate)](https://www.globeducate.com/our-schools/spain/agora-sant-cugat-international-school)
- [Sant Cugat — Pla d'Infància i Joventut 2025–2030](https://imatges.cugat.cat/wp-content/uploads/2025/06/250616-pla-infancia-joventut-2025-2030.pdf)
- [Sant Cugat motion on children's parks and heat](https://imatges.cugat.cat/wp-content/uploads/2025/09/32.-MOCIO-INSTITUCIONAL-SOBRE-LA-PROTECCIO-DE-LA-INFANCIA-DAVANT-DELS-EPISODIS-DE-CALOR-EXTREMA-.docx.pdf)
- [Diputació de Barcelona events (example, library agenda)](https://genius.diba.cat/detall-esdeveniment/-/contingut/350560/animals-de-tots-colors) · [Diputació open data API example](https://do.diba.cat/api/tipus/acte/camp-acte_id/actesmuseus3356581/format/rdf-xml/)
- [Femturisme — families in Sant Cugat](https://femturisme.cat/pobles/sant-cugat-del-valles/ofertes/rutes-per-a-families-exploradores-a-sant-cugat-del-valles) · [Escapada amb nens — Nadal a Sant Cugat 2026](https://www.escapadaambnens.com/festival/695/nadal-a-sant-cugat-2026-programa-i-activitats/)
- Anthropic model pricing (Haiku 5.5, Sonnet 5.5, Opus 5.5) and Batch API discount: Claude API documentation
