# Third-party assets and tools

## Menu libraries

The campaign menu uses augmented-ui (BSD 2-Clause, `licenses/augmented-ui.txt`), Motion (MIT, `licenses/motion.md`) and Cyberpunk UI button CSS (MIT, `licenses/cyberpunk-ui.txt`).

## Animated Mech Pack — George

- Author: Quaternius; release March 2021.
- License: CC0 1.0 Universal (Public Domain Dedication). The package's `License.txt` states CC0 1.0; the author's official page also labels the pack CC0.
- Official page: https://quaternius.com/packs/animatedmech
- Source used when the author's Google Drive download returned quota exceeded: https://github.com/agentkaerf/FreeModels/tree/main/Animated%20Mech%20Pack%20-%20March%202021/Textured/glTF
- Package license file: https://raw.githubusercontent.com/agentkaerf/FreeModels/main/Animated%20Mech%20Pack%20-%20March%202021/License.txt
- Retrieved 2026-11-06/07; SHA-256 of source glTF: `eccc45d82701f32d67b4480346757b1656c649d9d40e4a1484f57d660596285e`. `tools/mech-bake/George.gltf` retains the source. `public/assets/quaternius-george-atlas.png` contains frames rendered from Idle, Shoot, HitRecieve_1, and Death, using a fixed orthographic camera and adapted lighting/material settings. The current gameplay uses a separately articulated original mech rig for Idle and Shoot; the George atlas and its source remain available for future use and are not used by the current gameplay renderer. Towers cannot take damage or die in the existing rules.

## Three.js

Three.js is a development dependency used by `tools/mech-bake` to render the model to an atlas; it is not included in the runtime bundle. MIT license: https://github.com/mrdoob/three.js/blob/dev/LICENSE

## Original assets

`public/assets/rig-parts.png` was created for this branch using the built-in image generator. The spider and octopus limbs are procedurally assembled and animated in `src/game/RiggedActors.ts`; this is a project-specific implementation, not Rigby2D.

## Generated artwork

`public/assets/rig-parts.png`, `tower-parts*.webp`, `machine-parts*.webp`, and `terrain-*.webp` are original project artwork generated with the built-in image generator and adapted for the game. The tower and machine part source sheets are preserved in `tools/source-art/`. The terrain artwork was generated using the project map guides and the user-provided industrial Zion reference. Game objects are assembled and animated in `src/game/RiggedActors.ts`.
## Map contrast and EMP dome artwork (2026-11)

The separate `terrain-*-cold.webp` maps and `emp-dome-{1,2,3}.webp` sprites were generated for this project with the built-in image generator, using the prior terrain and the user-supplied `references/underground-zion-five-maps.png` as visual references. The map route and existing pad IDs remain unchanged. The port and crystal-cavern panels in the reference are kept for future levels.
## Elite tower components (2026-11)

`public/assets/elite-{mech,tesla,emp,rail}*.webp` were generated for this project using the built-in image generator with the project's existing tower components as visual references. Full-resolution generated source layers are preserved in `tools/source-art/elite-*.png`; the four new layers are assembled with independently animated existing rig parts in `src/game/RiggedActors.ts`.
