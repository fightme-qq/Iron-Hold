from pathlib import Path

from PIL import Image


def main() -> None:
    source = Path("art/source/defense-objects-raw.png")
    output = Path("public/assets/spritesheets/defense-objects.png")
    preview = Path("art/previews/defense-objects-preview.png")
    image = Image.open(source).convert("RGBA")
    width, height = image.size
    cols = rows = 3
    frame_size = 96
    chroma = (255, 0, 255)
    sheet = Image.new("RGBA", (cols * frame_size, rows * frame_size), (0, 0, 0, 0))

    for row in range(rows):
        for col in range(cols):
            cell = image.crop(
                (
                    round(col * width / cols),
                    round(row * height / rows),
                    round((col + 1) * width / cols),
                    round((row + 1) * height / rows),
                ),
            ).convert("RGBA")
            pixels = cell.load()
            for y in range(cell.height):
                for x in range(cell.width):
                    red, green, blue, alpha = pixels[x, y]
                    if abs(red - chroma[0]) + abs(green - chroma[1]) + abs(blue - chroma[2]) < 90:
                        pixels[x, y] = (red, green, blue, 0)

            bounds = cell.getchannel("A").getbbox()
            if bounds is None:
                continue

            cropped = cell.crop(bounds)
            cropped.thumbnail((frame_size - 8, frame_size - 8), Image.Resampling.LANCZOS)
            frame = Image.new("RGBA", (frame_size, frame_size), (0, 0, 0, 0))
            frame.alpha_composite(cropped, ((frame_size - cropped.width) // 2, (frame_size - cropped.height) // 2))
            sheet.alpha_composite(frame, (col * frame_size, row * frame_size))

    output.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(output)

    checker = Image.new("RGBA", sheet.size, (35, 45, 42, 255))
    for y in range(0, sheet.height, 16):
        for x in range(0, sheet.width, 16):
            if (x // 16 + y // 16) % 2 == 0:
                for yy in range(y, min(y + 16, sheet.height)):
                    for xx in range(x, min(x + 16, sheet.width)):
                        checker.putpixel((xx, yy), (73, 91, 80, 255))
    checker.alpha_composite(sheet)
    preview.parent.mkdir(parents=True, exist_ok=True)
    checker.save(preview)
    print(f"wrote {output} {sheet.size}; preview {preview}")


if __name__ == "__main__":
    main()
