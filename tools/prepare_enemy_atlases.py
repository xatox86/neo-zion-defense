"""Pack generated enemy turnaround and mechanical-part sheets for Canvas."""
from pathlib import Path
from PIL import Image

for source in Path('tools/source-art/enemy-machines').glob('*.png'):
    name, kind = source.stem.rsplit('-', 1)
    src = Image.open(source).convert('RGBA')
    tile_w, tile_h = src.width // 2, src.height // 2
    sheet = Image.new('RGBA', (512, 512))
    for i in range(4):
        cell = src.crop(((i % 2) * tile_w, (i // 2) * tile_h,
                         (i % 2 + 1) * tile_w, (i // 2 + 1) * tile_h))
        # Remove weak background haze, retaining the generated machine silhouette.
        alpha = cell.getchannel('A').point(lambda a: 0 if a < 45 else min(255, int((a - 45) * 255 / 180)))
        cell.putalpha(alpha)
        box = alpha.getbbox()
        if not box:
            raise ValueError(f'Empty tile {i}: {source}')
        cell = cell.crop(box)
        cell.thumbnail((238, 238), Image.Resampling.LANCZOS)
        sheet.alpha_composite(cell, ((i % 2) * 256 + (256 - cell.width) // 2,
                                     (i // 2) * 256 + (256 - cell.height) // 2))
    suffix = '-parts' if kind == 'parts' else ''
    out = Path(f'public/assets/enemy2-{name}{suffix}.webp')
    sheet.save(out, 'WEBP', quality=88, method=6)
    sheet.resize((256, 256), Image.Resampling.LANCZOS).save(out.with_stem(out.stem + '-low'), 'WEBP', quality=82, method=6)
