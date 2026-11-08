# Main menu verification

The scene and three operation thumbnails are separate artwork. Mission cards, settings and launch button are HTML controls. Screenshots and video were captured in desktop Chrome mobile emulation, not on a physical iPhone. `tests/cinematic-menu.mjs` checks 360×740, 390×844, 430×932 and a simulated 480px Telegram viewport, mission unlocks, settings, save continuation and entry to battle. The same checks were run against the Vite production preview.

Before/after sample using the same local Vite development server and emulated 390×844: requestAnimationFrame sampling over three seconds measured 60.55 and 60.20 callbacks/second respectively. This is display-limited and is not a device performance benchmark. Before: two loaded menu artwork files totalled 888,644 encoded bytes. After: background and three thumbnails totalled 150,506 encoded bytes (about 83% less). JavaScript heap snapshots were about 2.93 MB and 3.02 MB respectively; they exclude decoded image and GPU memory and are not reliable total-memory comparisons. Network/cache, desktop CPU/GPU and development-mode overhead affect these figures.

Reduced motion and low-quality modes disable the decorative animation. An actual Telegram client, iOS Safari and physical-device memory have not been tested.
