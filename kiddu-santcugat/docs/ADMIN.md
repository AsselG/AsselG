# Kiddu admin: AI gathering of events and activities (pilot: Sant Cugat del Vallès)

## How it works
```
config/sources.yaml ──► pipeline (npm run pipeline) ──► store (Netlify Blobs) ──► admin console (/en/admin) ──► public site
   which pages            fetch politely, clean,          drafts, published        review, edit, publish,      families see only
                          AI extracts, WE verify          items, runs, cache       reject, unpublish           published items
```
1. **Fetch:** only enabled sources; identifies as KidduBot; obeys robots.txt; pauses between requests; skips blocklisted domains.
2. **Change detection:** a page whose text did not change since the last run is not sent to the AI (no cost). Its published items are marked "checked today".
3. **Extraction:** Claude Haiku 5.5 (config `ai.extraction_model`) returns a strict JSON structure. If the output is broken, the page is retried once with Claude Sonnet 5.5 (`ai.escalation_model`), then given up.
4. **Our own checks (the AI is never trusted on its word):** every fact must come with a short quote that we find on the page; past events are dropped; impossible ages and prices are dropped; the venue must match a known place (data/places.json) to get map coordinates. The result is a confidence score and a list of issues.
5. **Dedupe:** the same title + start + place from two websites becomes one draft with two sources. Rejected drafts are remembered and never queued again.
6. **Publishing:** with `publishing.auto_publish: false` (pilot default) everything waits in the review queue. With it on, only drafts with confidence ≥ `auto_publish_min_confidence`, no issues and a known place publish themselves (marked "auto").
7. **Cost guard:** when this month's AI spend reaches `ai.monthly_budget_eur`, the pipeline stops calling the AI and only does freshness checks; the dashboard shows an alert.

## Two kinds of sources
- **Official structured feeds (`type: rss`)**, e.g. the town hall's children's agenda feed: date, time, venue and map coordinates are used as given. **No AI, no cost, no key needed.** Age and price are read from the description with fixed patterns; themes are guessed from keywords (check them in the review queue). The town hall's own description text is not copied: families see the facts and a link to the official page.
- **Web pages (`type: web`)**: the AI extracts events and our checks verify every fact against the page. Needs `ANTHROPIC_API_KEY`.

First real run (2026-11-15): the town hall's "Infantils" feed gave 22 upcoming events, 20 with coordinates, at €0.

## The Anthropic API key
- You only need it for `type: web` sources. The town hall feed does not need it.
- Create it in the Anthropic Console in a separate workspace (e.g. "kiddu") with a monthly spend limit, so a leaked key cannot cost more than that.
- Keep it only where the pipeline runs: in your terminal (`export ANTHROPIC_API_KEY=...`) or as a GitHub Actions secret. Never in chat, never in a committed file, never in Netlify (the website does not use it).
- If it leaks: delete it in the Console and create a new one.

## Admin console
`https://<site>/en/admin/login` with `KIDDU_ADMIN_KEY` (Netlify > Site configuration > Environment variables).
- **Dashboard:** queue size, AI spend vs budget, last run, every source's status (OK, unchanged, blocked by robots.txt, error...).
- **Review queue:** lowest confidence first. Each draft shows the fields next to the source text, with the AI's quotes highlighted. Publish, save, or reject with a reason.
- **Published:** what families see from the pipeline, with "auto" or "editor"; unpublish puts it back in the queue.
- **Runs:** counts and cost of every run.

## Running the pipeline
The hosted site cannot run it (Netlify functions stop after seconds). Run it from a computer or GitHub Actions; it writes to the same store.
```bash
cd kiddu-santcugat && npm ci
export ANTHROPIC_API_KEY=...            # console.anthropic.com
export KIDDU_BLOBS_SITE_ID=cb8a0a64-2c6c-4df5-8378-971c2ded0fb2   # the Netlify site
export KIDDU_BLOBS_TOKEN=...            # Netlify personal access token
npm run pipeline -- --area sant-cugat                 # all enabled sources
npm run pipeline -- --area sant-cugat --source ajuntament-agenda   # one source
```
Without the two KIDDU_BLOBS_* variables it writes to a local `.data/` folder (good for trying it out with `npm run dev`).
Nightly: see `docs/github-workflow-pipeline.yml`.

## Before the first real run (pilot checklist)
- [ ] Set real URLs in config/sources.yaml and enable 2–3 official sources (town hall agenda, library agenda).
- [ ] For each: robots.txt allows it, terms of use do not forbid it; note it in `note`.
- [ ] Add the venues of those sources to data/places.json (name, aliases, address, coordinates from OpenStreetMap).
- [ ] Set `catalogue.include_demo_data: false` so families see only real items.
- [ ] Run once by hand, review everything, then consider nightly runs.
- [ ] Build the golden set (tests/golden/README.md) before changing prompt or model.

## Cost (estimate)
Per changed page about 6k input + 1.5k output tokens on Haiku 5.5 ($0.10 / $0.50 per million): about $0.0014. Thirty changed pages a night is about €1 a month. Unchanged pages cost nothing. The budget cap in config is the safety net.
