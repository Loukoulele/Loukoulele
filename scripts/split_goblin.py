"""
Découpe le spritesheet gobelin avec colonnes ajustées.
"""
from PIL import Image
import os

img = Image.open(r'C:\Users\ilan7\Downloads\Gemini_Generated_Image_6h7xt76h7.png').convert('RGBA')
out = r'C:\Users\ilan7\Desktop\Loukoulele\public\sprites'
os.makedirs(out, exist_ok=True)

# Adjusted columns to avoid sparkle overlap
col_cuts = [0, 270, 525, 775, 1024]
row_cuts = [0, 341, 682, 1024]

print(f"Image: {img.width}x{img.height}")

count = 0
for r in range(len(row_cuts) - 1):
    for c in range(len(col_cuts) - 1):
        x1, x2 = col_cuts[c], col_cuts[c + 1]
        y1, y2 = row_cuts[r], row_cuts[r + 1]
        frame = img.crop((x1, y1, x2, y2))

        # Remove checkered bg
        pixels = frame.load()
        for py in range(frame.height):
            for px in range(frame.width):
                r_val, g_val, b_val, a_val = pixels[px, py]
                if a_val < 230:
                    pixels[px, py] = (0, 0, 0, 0)
                    continue
                if min(r_val, g_val, b_val) > 170 and max(r_val, g_val, b_val) - min(r_val, g_val, b_val) < 30:
                    pixels[px, py] = (0, 0, 0, 0)

        bbox = frame.getbbox()
        if bbox:
            frame = frame.crop(bbox)

        count += 1
        path = os.path.join(out, f'goblin_{count}.png')
        frame.save(path)
        print(f"goblin_{count}.png ({frame.width}x{frame.height})")

print(f"\n{count} frames dans {out}")
