# flybrain demos

`/flybrain/` shows one tab per week of the flybrain project. Each tab loads a self-contained demo page into a frame.

```
_data/flybrain_weeks.yml     the list of tabs (one entry per week)
flybrain/index.html          the tab page (reads the list above)
flybrain/week1/index.html    Week 1: word demo + validation report
flybrain/week2/index.html    Week 2: Connectome Graph Explorer (+ data/)
flybrain/week3/index.html    Week 3: the fly ↔ LLM loop, one tab per step
flybrain/week3/loop/         Week 3 Day 6: interactive loop player (+ data/)
flybrain/week3/report.html   Week 3 Day 7: the full report
flybrain/week3/loop_poster.jpg  poster frame for the Day 6 YouTube video
```

## Week 3 page

`flybrain/week3/index.html` has its own day tabs, newest first:

| Tab | What it shows | Data |
|---|---|---|
| Day 7 · the report | Headline numbers and the Week 3 report in a frame | `report.html` (from `docs/week3_report.html`) |
| Day 6 · watch the loop | The loop video (YouTube `PkqWC-2eWS4`, loaded only on click via youtube-nocookie) and the interactive player | `loop/data/loop_*.json` (from `artifact/loop/`), replies from Claude (claude-sonnet-5-5) |
| Days 3–5 · the closed loop | The 4 three-round loop runs, action codes, Day 4 read-back table | inlined from `results/loop/w3d5_loop_*.json` (offline stand-in replies) |
| Day 2 · fly → LLM | The 16 logged runs, plus a free-text box: an LLM (with the visitor's own key) or a keyword table maps the text to the fly's 17 words, and recorded responses play back | inlined from `results/loop/w3d2_*.jsonl` and 262 recorded word windows |
| Day 1 · five words in a row | 40 five-word episodes, readout accuracy, lasting activity | inlined from `results/loop/w3d1_*` |

The page is generated from a template that has `/*DATA*/null`-style placeholders for the inlined data, so edit the template and regenerate rather than editing the 300 KB output by hand.

The "Ask a real LLM" and free-text features call Anthropic or OpenAI straight from the visitor's browser with the visitor's own key. The key is kept in the browser (sessionStorage, or localStorage if "Remember" is ticked) and is never sent anywhere else.

## Adding a week

1. Make a folder `flybrain/weekN/` with an `index.html` that works on its own (GitHub Pages serves static files only). Put any data it fetches next to it, with relative paths such as `data/x.json`. Start the file with `<!doctype html>`, a charset meta and a viewport meta, and don't add Jekyll front matter.
2. Add an entry at the end of `_data/flybrain_weeks.yml`:

   ```yaml
   - week: 4
     title: One line naming the result
     dates: Wrapped up 2026.11.17
     status: done            # or: in progress
     summary: One or two sentences shown above the demo.
     page: week4
   ```
3. Open a pull request. The page opens on the newest week by default, and `#week-N` links straight to a tab.

The frame grows to fit the demo's height, so a demo should not size its main content in `vh` without a cap. The tab page adds `?v=<build time>` to each demo's URL, so a new build is never hidden behind the browser's cached copy.

Source for the demos lives in the flybrain project folder (`artifact/`, `docs/`, `results/`), whose own README covers the science.
