# charliezhang1999.github.io

Personal site of Charlie (Qiuyang) Zhang: selected work, plus a door into memory (photos, vlogs, music, writing).

Plain HTML/CSS/JS. No build step, no dependencies. GitHub Pages serves it straight from the default branch (`.nojekyll` turns Jekyll off).

## Editing content

Almost everything lives in **`content/site.js`**:

| What | Where |
| --- | --- |
| Bio, intro, facts, links | top of `content/site.js` |
| Projects & experience | `projects`, `experience` |
| Photos | `photos` (put files in `assets/img/photos/`) |
| Vlogs | `vlogs` (`url` = YouTube or Bilibili link; empty shows "Coming soon") |
| Music | `music` (`link` = Spotify/Apple/NetEase; optional `audio` = mp3 in `assets/audio/`) |
| Ideal-world lines | `idealWorld` |
| Posts | add `content/posts/<slug>.md`, then add an entry to `posts` with the same `slug` |

Anything labelled PLACEHOLDER in `site.js` is sample content.

## Preview locally

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

(Posts load with `fetch`, so open the site through a local server rather than double-clicking the file.)
