# Visual and balance test report

The simulation starts with the normal 230 energy, without injected resources. Each strategy runs against deterministic waves in the actual game simulation, at accelerated speed; it automatically uses EMP on groups and the shield when enemies approach the exit. This is a sampling tool, not a substitute for human playtesting. Raw results are in `artifacts/visual-fixes/balance-final-map*.jsonl`.

| Strategy | Gates (15 waves) | Energy (15 waves) | Core (20 waves) |
|---|---|---|---|
| Mixed, rail emphasis | Win, 30.2 health | Win, 49.9 | Win, 22.1 |
| Mixed, Tesla emphasis | Win, 33.7 | Win, 46.7 | Defeat, wave 10 |
| Mixed, early upgrades | Win, 22.8 | Defeat, wave 10 | Win, 13.8 |
| Mixed, late upgrades | Win, 10.0 | Win, 65.7 | Defeat, wave 10 |
| Mech only | Defeat, wave 10 | Defeat, wave 14 | Defeat, wave 11 |
| Tesla only | Defeat, wave 9 | Defeat, wave 10 | Defeat, wave 9 |
| EMP only | Defeat, wave 7 | Defeat, wave 7 | Defeat, wave 6 |
| Rail only | Defeat, wave 8 | Defeat, wave 8 | Defeat, wave 8 |
| Random seeds 11 / 23 / 47 | Defeat, waves 7 / 8 / 7 | Defeat, waves 9 / 8 / 8 | Defeat, waves 8 / 8 / 7 |
| Hoarding | Defeat, wave 10 | Defeat, wave 8 | Defeat, wave 9 |

Mechs are efficient against weak fast enemies, Tesla chains damage through groups, EMP slows while contributing less damage, and railguns prioritize armor and bypass it. Mechs and Tesla are less efficient against heavy units. Rewards and wave bonuses were reduced, and level III upgrades cost more. New kill and wave rewards fill an energy capacitor up to 900; existing save balances above 900 are preserved and tower sales still return their value even above the cap. Several winning runs reached the cap, so the cap does not by itself establish that the economy is finely tuned. Further manual playtesting and tuning on real devices are necessary.

The test suite uses injected energy for exhaustive pad interaction and injected completion states for transition checks; neither is used for the balance simulations above. Mobile tests emulate Chrome at 360×740, 390×844 and 430×932. The performance report measures browser JavaScript heap, not total process or device memory; it is not an iPhone or Telegram measurement.
