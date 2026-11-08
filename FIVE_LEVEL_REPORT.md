# Five-level combat report

Current `main` was backed up before development at `backup/main-before-five-levels-20261108`. Towers have five levels; upgrade costs are 0.9×, 1.8×, 2.4× and 3.1× the base price. Damage multipliers are 1, 1.8, 2.6, 3.4 and 4.3; rate and range also vary by level. Existing levels I–III and invested amounts remain readable; level IV/V saves survive reload and sale. Rendering uses new separate elite layers and existing articulated parts; level IV and V are not standalone 3D models. The direction system mirrors units left/right with a limited pitch and interpolated headings. It does not generate eight independent directional sprite sets.

## Simulations

The scripts use normal initial resources, accelerated engine updates, automatic EMP and shield activation, and predefined strategies and deterministic random placements. They are not human playthroughs. Numbers show final wave and health; 15/20 is a completed campaign, zero health is a loss. Full per-wave results and tower levels are in `artifacts/five-level/balance-map*.jsonl`.

| Strategy | Gates | Energy | Core |
|---|---:|---:|---:|
| Mixed rail | 15 / 40.7 | 15 / 52.9 | 20 / 47.4 |
| Mixed Tesla | 15 / 52.8 | 15 / 56.5 | 20 / 48.4 |
| Early mixed | 15 / 19.2 | 10 / 0 | 20 / 2.1 |
| Late mixed | 15 / 8.1 | 15 / 69.4 | 10 / 0 |
| Mech only | 10 / 0 | 15 / 15.5 | 11 / 0 |
| Tesla only | 10 / 0 | 10 / 0 | 9 / 0 |
| EMP only | 7 / 0 | 7 / 0 | 6 / 0 |
| Rail only | 8 / 0 | 8 / 0 | 20 / 1.7 |

Random placements lost between waves 7–9; hoarding lost at waves 10, 8 and 9 respectively. All successful sampled strategies ended at the 900 energy cap, so these runs do not prove that late-game economy is fully tuned. The one-type victories have only 15.5 and 1.7 health remaining, respectively. Human testing remains necessary.

## Validation and evidence

`tests/five-level-ui.mjs` tests old level III checkpoint recovery, upgrades through V, max state, V save/reload and sale on all four towers; it injects energy for the interaction test. `tests/five-bounds.mjs` covers 80 poses, `tests/compact-boss.mjs` measures 24 boss poses, `tests/enemy-heading.mjs` checks seven enemy types, and `tests/rail-geometry.mjs` checks shared muzzle geometry at levels I and V. The video `boss-battle.webm` records wave 5 after four simulated waves using normal energy; the `actors.webm` clip and `towers-grid.png` are isolated renderer showcases with test-only setups. The browser emulates mobile; no physical iPhone or real Telegram WebView test was performed. The existing visual concern where the route approaches the last pad on map 3 is unchanged.
