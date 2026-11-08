"""Pack the approved early tower component sheets into two mobile resolutions."""
from pathlib import Path
from PIL import Image

for source in Path('tools/source-art/early-towers').glob('*.png'):
    original = Image.open(source).convert('RGBA')
    tw, th = original.width // 2, original.height // 2
    sheet = Image.new('RGBA', (512, 512))
    for i in range(4):
        cell = original.crop((i % 2 * tw, i // 2 * th, (i % 2 + 1) * tw, (i // 2 + 1) * th))
        alpha = cell.getchannel('A').point(lambda a: 0 if a < 45 else min(255, int((a - 45) * 255 / 180)))
        cell.putalpha(alpha)
        box = alpha.getbbox()
        if not box:
            raise ValueError(f'Empty component {i} in {source}')
        cell = cell.crop(box)
        cell.thumbnail((238, 238), Image.Resampling.LANCZOS)
        sheet.alpha_composite(cell, (i % 2 * 256 + (256 - cell.width) // 2, i // 2 * 256 + (256 - cell.height) // 2))
    out = Path('public/assets') / f'early-{source.stem}.webp'
    sheet.save(out, 'WEBP', quality=88, method=6)
    sheet.resize((256, 256), Image.Resampling.LANCZOS).save(out.with_stem(out.stem+'-low'), 'WEBP', quality=82, method=6)
