"""
Découpe automatique d'un spritesheet en détectant les sprites individuels.
Détecte les zones non-transparentes séparées par du vide.
Usage: python split_spritesheet.py <image> [nom_sortie]
"""
import sys
import os
from PIL import Image
import numpy as np

def find_sprites(img, min_gap=2, min_size=30):
    """Trouve les bounding boxes de chaque sprite en détectant les colonnes/lignes vides."""
    data = np.array(img)

    # Canal alpha (transparence)
    if data.shape[2] == 4:
        alpha = data[:, :, 3]
    else:
        # Pas de canal alpha, utiliser tout pixel non-blanc
        alpha = np.any(data[:, :, :3] > 0, axis=2).astype(np.uint8) * 255

    # Trouver les rangées horizontales (par bandes de lignes non-vides)
    row_has_pixels = np.any(alpha > 10, axis=1)
    row_bands = _find_bands(row_has_pixels, min_gap, min_size)

    sprites = []
    for row_start, row_end in row_bands:
        # Dans chaque bande, trouver les colonnes
        band_alpha = alpha[row_start:row_end, :]
        col_has_pixels = np.any(band_alpha > 10, axis=0)
        col_bands = _find_bands(col_has_pixels, min_gap, min_size)

        for col_start, col_end in col_bands:
            sprites.append((col_start, row_start, col_end, row_end))

    return sprites

def _find_bands(has_pixels, min_gap, min_size):
    """Trouve les bandes continues de pixels avec tolérance pour les petits gaps."""
    bands = []
    in_band = False
    start = 0
    gap_count = 0

    for i, v in enumerate(has_pixels):
        if v:
            if not in_band:
                start = i
                in_band = True
            gap_count = 0
        else:
            if in_band:
                gap_count += 1
                if gap_count >= min_gap:
                    end = i - gap_count + 1
                    if end - start >= min_size:
                        bands.append((start, end))
                    in_band = False
                    gap_count = 0

    if in_band:
        end = len(has_pixels)
        if end - start >= min_size:
            bands.append((start, end))

    return bands

def split(path, output_name=None):
    img = Image.open(path).convert('RGBA')
    name = output_name or os.path.splitext(os.path.basename(path))[0]
    output_dir = os.path.join(os.path.dirname(path), f"{name}_frames")
    os.makedirs(output_dir, exist_ok=True)

    print(f"Image: {img.width}x{img.height}")

    bboxes = find_sprites(img)

    # Trier: d'abord par Y (rangée), puis par X (colonne)
    bboxes.sort(key=lambda b: (b[1], b[0]))

    # Si une rangée a moins de sprites que l'autre, forcer le split
    # en utilisant les colonnes de la rangée qui a le plus de sprites
    rows_dict = {}
    for b in bboxes:
        row_key = b[1]  # y1
        # Grouper par rangée (tolérance 20px)
        found = False
        for k in rows_dict:
            if abs(k - row_key) < 20:
                rows_dict[k].append(b)
                found = True
                break
        if not found:
            rows_dict[row_key] = [b]

    row_keys = sorted(rows_dict.keys())
    if len(row_keys) >= 2:
        row1 = sorted(rows_dict[row_keys[0]], key=lambda b: b[0])
        row2 = sorted(rows_dict[row_keys[1]], key=lambda b: b[0])

        # Si row1 a plus de colonnes, forcer le split de row2
        if len(row1) > len(row2):
            col_starts = [b[0] for b in row1]
            new_row2 = []
            for b in row2:
                x1, y1, x2, y2 = b
                # Vérifier si ce bbox couvre plusieurs colonnes
                splits = [c for c in col_starts if x1 + 20 < c < x2 - 20]
                if splits:
                    prev = x1
                    for sx in splits:
                        new_row2.append((prev, y1, sx - 1, y2))
                        prev = sx
                    new_row2.append((prev, y1, x2, y2))
                else:
                    new_row2.append(b)
            bboxes = row1 + new_row2
            bboxes.sort(key=lambda b: (b[1], b[0]))

    print(f"Sprites détectés: {len(bboxes)}\n")

    for i, (x1, y1, x2, y2) in enumerate(bboxes):
        frame = img.crop((x1, y1, x2, y2))
        # Trim transparent
        bbox_trim = frame.getbbox()
        if bbox_trim:
            frame = frame.crop(bbox_trim)
        filename = f"{name}_{i + 1}.png"
        frame.save(os.path.join(output_dir, filename))
        print(f"  {filename} ({frame.width}x{frame.height}) @ ({x1},{y1})")

    print(f"\n{len(bboxes)} frames sauvegardées dans {output_dir}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python split_spritesheet.py <image> [nom_sortie]")
        sys.exit(1)

    path = sys.argv[1]
    name = sys.argv[2] if len(sys.argv) > 2 else None
    split(path, name)
