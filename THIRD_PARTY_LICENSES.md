# Third-party assets and tools

## Animated Mech Pack — George

- Author: Quaternius; release March 2021.
- License: CC0 1.0 Universal (Public Domain Dedication). The package's `License.txt` states CC0 1.0; the author's official page also labels the pack CC0.
- Official page: https://quaternius.com/packs/animatedmech
- Source used when the author's Google Drive download returned quota exceeded: https://github.com/agentkaerf/FreeModels/tree/main/Animated%20Mech%20Pack%20-%20March%202021/Textured/glTF
- Package license file: https://raw.githubusercontent.com/agentkaerf/FreeModels/main/Animated%20Mech%20Pack%20-%20March%202021/License.txt
- Retrieved 2026-11-06/07; SHA-256 of source glTF: `eccc45d82701f32d67b4480346757b1656c649d9d40e4a1484f57d660596285e`. `tools/mech-bake/George.gltf` retains the source. `public/assets/quaternius-george-atlas.png` contains frames rendered from Idle, Shoot, HitRecieve_1, and Death, using a fixed orthographic camera and adapted lighting/material settings. The gameplay currently triggers Idle and Shoot; towers cannot take damage or die in the existing rules.

## Three.js

Three.js is a development dependency used by `tools/mech-bake` to render the model to an atlas; it is not included in the runtime bundle. MIT license: https://github.com/mrdoob/three.js/blob/dev/LICENSE

## Original assets

`public/assets/rig-parts.png` was created for this branch using the built-in image generator. The spider and octopus limbs are procedurally assembled and animated in `src/game/RiggedActors.ts`; this is a project-specific implementation, not Rigby2D.
