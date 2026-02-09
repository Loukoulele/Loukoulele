"""
Découpe le spritesheet wizard avec des positions fixes.
"""
from PIL import Image
import os

img = Image.open(r'C:\Users\ilan7\Downloads\sans-fond.png').convert('RGBA')
out = r'C:\Users\ilan7\Desktop\Loukoulele\public\sprites'
os.makedirs(out, exist_ok=True)

# Colonnes (X) basées sur les gaps détectés
# Gap 1-2: ~160-212, Gap 2-3: ~353-412, Gap 3-4: ~615-616
col_cuts = [0, 186, 382, 616, img.width]

# Rangées (Y)
row_cuts = [0, 330, img.height]

count = 0
for r in range(len(row_cuts) - 1):
    for c in range(len(col_cuts) - 1):
        x1, x2 = col_cuts[c], col_cuts[c + 1]
        y1, y2 = row_cuts[r], row_cuts[r + 1]

        frame = img.crop((x1, y1, x2, y2))

        # Trim les pixels transparents
        bbox = frame.getbbox()
        if bbox:
            frame = frame.crop(bbox)

        count += 1
        path = os.path.join(out, f'wizard_{count}.png')
        frame.save(path)
        print(f'wizard_{count}.png  {frame.width}x{frame.height}')

print(f'\n{count} frames dans {out}')
