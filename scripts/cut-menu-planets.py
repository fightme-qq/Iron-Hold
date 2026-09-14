from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "art" / "source" / "menu-planets-raw.png"
OUT = ROOT / "public" / "assets" / "spritesheets" / "menu-planets.png"
PREVIEW = ROOT / "art" / "previews" / "menu-planets-preview.png"
FRAME = 384
COUNT = 3


def trim_to_content(image: Image.Image) -> Image.Image:
    alpha = image.split()[-1]
    bbox = alpha.getbbox()
    return image.crop(bbox) if bbox else image


def main() -> None:
    source = Image.open(SOURCE).convert("RGBA")
    source_frame_width = source.width // COUNT
    sheet = Image.new("RGBA", (FRAME * COUNT, FRAME), (0, 0, 0, 0))

    for index in range(COUNT):
        crop = source.crop((index * source_frame_width, 0, (index + 1) * source_frame_width, source.height))
        crop = trim_to_content(crop)
        crop.thumbnail((FRAME - 18, FRAME - 18), Image.Resampling.LANCZOS)
        x = index * FRAME + (FRAME - crop.width) // 2
        y = (FRAME - crop.height) // 2
        sheet.alpha_composite(crop, (x, y))

    OUT.parent.mkdir(parents=True, exist_ok=True)
    PREVIEW.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(OUT)

    checker = Image.new("RGBA", sheet.size, (14, 18, 30, 255))
    tile = 24
    for y in range(0, checker.height, tile):
        for x in range(0, checker.width, tile):
            if (x // tile + y // tile) % 2:
                checker.paste((25, 31, 48, 255), (x, y, x + tile, y + tile))
    checker.alpha_composite(sheet)
    checker.save(PREVIEW)


if __name__ == "__main__":
    main()
