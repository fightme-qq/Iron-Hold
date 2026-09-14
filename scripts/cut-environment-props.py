from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "art" / "source" / "environment-props-raw.png"
OUT = ROOT / "public" / "assets" / "spritesheets" / "environment-props.png"
PREVIEW = ROOT / "art" / "previews" / "environment-props-preview.png"
FRAME = 128
GRID = 3


def trim_to_content(image: Image.Image) -> Image.Image:
    alpha = image.split()[-1]
    bbox = alpha.getbbox()
    if bbox is None:
      return image
    return image.crop(bbox)


def fit_cell(image: Image.Image) -> Image.Image:
    cell = Image.new("RGBA", (FRAME, FRAME), (0, 0, 0, 0))
    trimmed = trim_to_content(image)
    trimmed.thumbnail((FRAME - 10, FRAME - 10), Image.Resampling.LANCZOS)
    x = (FRAME - trimmed.width) // 2
    y = (FRAME - trimmed.height) // 2
    cell.alpha_composite(trimmed, (x, y))
    return cell


def main() -> None:
    source = Image.open(SOURCE).convert("RGBA")
    cell_w = source.width // GRID
    cell_h = source.height // GRID
    sheet = Image.new("RGBA", (FRAME * GRID, FRAME * GRID), (0, 0, 0, 0))

    for row in range(GRID):
        for col in range(GRID):
            crop = source.crop((col * cell_w, row * cell_h, (col + 1) * cell_w, (row + 1) * cell_h))
            sheet.alpha_composite(fit_cell(crop), (col * FRAME, row * FRAME))

    OUT.parent.mkdir(parents=True, exist_ok=True)
    PREVIEW.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(OUT)

    checker = Image.new("RGBA", sheet.size, (44, 52, 48, 255))
    tile = 16
    for y in range(0, checker.height, tile):
        for x in range(0, checker.width, tile):
            if (x // tile + y // tile) % 2:
                checker.paste((72, 84, 78, 255), (x, y, x + tile, y + tile))
    checker.alpha_composite(sheet)
    checker.save(PREVIEW)


if __name__ == "__main__":
    main()
