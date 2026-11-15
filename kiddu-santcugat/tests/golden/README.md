# Golden set (feature 11, "Golden set accuracy")

50 real Sant Cugat pages, checked by a person, that every prompt or model change must pass.

For each page:
- `<name>.html`: the page as saved from the browser (File > Save page as > HTML only), on the day you labelled it.
- `<name>.expected.json`: what a careful person finds on it, for example
  `[{"title": "Hora del conte", "start": "2027-06-12T11:00", "price": 0, "ageMin": 3, "ageMax": 6, "placeName": "Biblioteca Central Gabriel Ferrater"}]`

Run: `ANTHROPIC_API_KEY=... KIDDU_GOLDEN_TODAY=<date you saved the pages> npm run pipeline:golden`.
It fails when there are fewer than 50 pages or field accuracy is below `ai.golden_set_min_field_accuracy` in config/site.yaml.
