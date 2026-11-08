# Tower asset inventory (before integration)

| Type | I | II | III | IV | V |
|---|---|---|---|---|---|
| Mech | Shared legacy `rig-parts.webp`; no dedicated approved stage atlas | Same shared legacy parts; no dedicated stage atlas | Same shared legacy parts; no dedicated stage atlas | `evolution-mech-iv.webp`, ready | `evolution-mech-v.webp`, ready |
| Tesla | Shared legacy coil in `rig-parts.webp`; no dedicated approved stage atlas | Same shared coil; no dedicated stage atlas | Same shared coil; no dedicated stage atlas | `evolution-tesla-iv.webp`, ready | `evolution-tesla-v.webp`, ready |
| EMP | `emp-dome-1.webp` + base in `tower-parts-lit.webp`, available | `emp-dome-2.webp` + base, available | `emp-dome-3.webp` + base, available | `evolution-emp-iv.webp`, ready | `evolution-emp-v.webp`, ready |
| Railgun | `tower-parts-lit.webp`: base + first gun part, available | `tower-parts-lit.webp`: base + second gun part, available | `tower-parts-lit.webp`: base + third gun part, available | `evolution-rail-iv.webp`, ready | `evolution-rail-v.webp`, ready |

`towers.png` contains old composite images, not the new approved component rigs. `artifacts/tower-evolution/*-five.png` are approved concept sheets, not separated ready-to-animate game sprites. `tools/source-art/evolution-*-iv/v.png` contain the source component sheets for the eight IV/V WebP atlases. `artifacts/evolution2/towers-grid.png` is a historical screenshot of the real renderer. No generated images from this task are included.

The existing III rail sprite is a distinct gun component, but its exact fidelity to the newer approved concept requires visual review; the existing I–III artwork cannot be represented as new dedicated approved rigs for mech or Tesla.

The eight files provided in Downloads on 8 November at 17:50–17:51 were compared pixel-for-pixel with `tools/source-art`: all eight are exact matches to the eight existing IV/V source sheets. They do not contain additional I–III source atlases.

After the user's explicit authorization, six new component sheets were prepared from the approved early mech and Tesla concepts. They are stored in `tools/source-art/early-towers/` and packed as `public/assets/early-{mech,tesla}-{1,2,3}*.webp`. `EarlyTowerRig` renders these six stages; existing EMP/rail I–III and `EvolutionRig` IV–V remain in use. Arsenal thumbnails are drawn by the actual level-I renderer, not the legacy `towers.png` sheet.
