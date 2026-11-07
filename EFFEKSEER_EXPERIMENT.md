# Effekseer feasibility experiment

This branch is an opt-in experiment based on `codex/visual-balance-fixes`; it does not change or deploy `main`. Run `npm ci`, `npm run dev`, then open `/neo-zion-defense/?effekseer=1` to enable the exported-sprite overlays. The ordinary URL uses the baseline visuals and does not load the atlases. `/neo-zion-defense/experiments/effekseer.html` is a development-only capture page. It uses the official EffekseerForWebGL 1.80.8 runtime and official Laser01, Laser02 and Simple_Ring_Shape1 samples. The page produces 16-frame, 128×128 transparent WebP atlases; runtime/WebAssembly and three.js are used only by the capture tool, not by game playback. The shipped atlas images were captured from that runtime. Runtime MIT license is included in `experiments/vendor/`; official documentation identifies sample effect and texture data as CC0.

The rail overlay uses the Laser01 sample, Tesla uses Laser02 as an impact overlay over the existing chain, and the boss-death test uses Simple_Ring_Shape1 over the existing explosion. These are unmodified sample effects, not bespoke authored effects. The rail still needs a directionally aligned authored shot, the electricity needs a purpose-built multi-target lightning effect, and the white ring is not convincing boss destruction. In particular, do not promote this experiment to production as a finished visual redesign. The recording uses the browser WebGL output and is not the Effekseer editor Recorder; direct evaluation of the editor has not been done.

## Reproducible comparison

`node tests/effekseer-capture.mjs` exports the samples while the Vite development server is running on port 5178. `node tests/effekseer-compare.mjs` creates an identical synthetic stress scene with 24 persistent effects in baseline and experimental modes, each for 8 seconds at an emulated 390×844 viewport. It saves screenshots and `artifacts/effekseer/comparison.json`. This is a desktop Chrome measurement, not a physical iPhone or Telegram WebView. It is refresh-rate limited and cannot establish headroom or total/GPU memory. The measured JavaScript heap excludes image decoding and GPU resources and is noisy. The three compressed WebP atlases total 59,922 bytes (about 58.5 KiB), plus approximately 3 MiB for three fully decoded 512×512 RGBA images; the latter is an estimate, not an observed memory measurement. The capture tool requires a 168,668-byte JS runtime and 1,403,622-byte WebAssembly runtime plus effect assets, but game playback does not download them.

## Other tools

Material Maker is an offline Godot-based procedural texture editor; export textures for maps or sprites without introducing Godot into the game. It may improve consistent metal and industrial surfaces, but was not installed or tested in this experiment. https://github.com/RodZill4/material-maker

meshoptimizer reduces mesh geometry and glTF size and has a JavaScript interface. The current game ships pre-rendered sprites and Canvas 2D assets, so it will not compress its runtime image atlases or speed Canvas drawing; consider it only for a future real-time 3D/glTF pipeline or offline model preparation. It was not installed or tested. https://github.com/zeux/meshoptimizer

Effekseer docs: https://effekseer.github.io/Help_Tool/en/ToolReference/record.html and https://effekseer.github.io/Help_Tool/en/overview.html .
