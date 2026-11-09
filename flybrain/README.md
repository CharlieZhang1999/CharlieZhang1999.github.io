# flybrain demos

`/flybrain/` shows one tab per week of the flybrain project. Each tab loads a self-contained demo page into a frame.

```
_data/flybrain_weeks.yml     the list of tabs (one entry per week)
flybrain/index.html          the tab page (reads the list above)
flybrain/week1/index.html    Week 1: word demo + validation report
flybrain/week2/index.html    Week 2: Connectome Graph Explorer (+ data/)
flybrain/week3/index.html    Week 3: five-word episode player
```

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

The frame grows to fit the demo's height, so a demo should not size its main content in `vh` without a cap.

Source for the demos lives in the flybrain project folder (`artifact/`, `docs/`, `results/`). Week 3's data is inlined from `results/loop/w3d1_*`.
