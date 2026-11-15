# charliezhang1999.github.io

The personal site of Qiuyang (Charlie) Zhang, live at **https://charliezhang1999.github.io/**. It is a Jekyll site served by GitHub Pages.

| Page | Source |
|---|---|
| Home: about, projects reel, writing | `index.html`, `_data/projects.yml`, `_includes/project-reel.html` |
| Experience, Projects | `sections/Experience.html`, `sections/Project.html` |
| Writing (posts) | `_posts/` |
| **flybrain** demos | `flybrain/`, `_data/flybrain_weeks.yml` (see below) |
| CV | `resources/` |

## flybrain

[**/flybrain/**](https://charliezhang1999.github.io/flybrain/) is a research project: a connectome-constrained leaky integrate-and-fire simulation of the fruit-fly brain with a trained readout, wired into a closed loop with a language model. Each week of the project has a tab with its interactive demo.

| Week | Status | What the tab shows |
|---|---|---|
| [Week 1](https://charliezhang1999.github.io/flybrain/#week-1) · A fly brain that tastes words | done 2026.10.24 | The Shiu et al. 2024 whole-brain model rebuilt in NumPy and checked against Brian2; pick a taste and watch the sugar → MN9 feeding circuit decide |
| [Week 2](https://charliezhang1999.github.io/flybrain/#week-2) · Connectome Graph Explorer | done 2026.11.03 | The male brain (MaleCNS) port, 17 sensory words, the odor-attractor fix and a word readout; every simulated trial on the wiring it used |
| [Week 3](https://charliezhang1999.github.io/flybrain/#week-3) · The fly talks to an LLM | done 2026.11.13 | The closed loop: words in, decoded words become a prompt, Claude picks an action, the action plays back into the same brain and is read off the descending neurons. Day tabs for each step, the loop video and player, a free-text box, and the full report |

Week 3 headline: with Claude choosing the actions, all 60 words and all 12 actions came back correctly over 4 runs of 3 rounds. A brain with shuffled wiring also passes; the real wiring shows in how the action reaches the brain's outputs (445 vs 24 descending neurons) and in confidence (0.96–1.00 vs 0.81–0.91), not in accuracy. Only the two linear readouts are trained; the connectome weights are never changed.

How the demos are laid out, and how to add a week: [flybrain/README.md](flybrain/README.md). The simulation code, results and the full write-ups live in the flybrain project folder, not in this repository.

## Local development

Install Ruby and Jekyll ([guide](https://jekyllrb.com/docs/installation/)), then run `bundle exec jekyll serve` from the root and open http://localhost:4000/.

## Credits and license

Built on the [Strata for Jekyll](https://github.com/davidforster/strata-jekyll) theme by David Forster, from the [Strata](http://html5up.net/strata) design by [HTML5 UP](http://html5up.net). The Jekyll theme is licensed under the [MIT](http://choosealicense.com/licenses/mit/) license, and the Strata design under [Creative Commons Attribution 3.0 Unported](http://creativecommons.org/licenses/by/3.0/).
