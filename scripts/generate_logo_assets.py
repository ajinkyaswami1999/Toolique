import os
from PIL import Image, ImageDraw

def draw_emblem(size=2048):
    # Create high-res image with transparent background
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    NAVY = (11, 58, 104, 255) # #0B3A68 Deep Navy Blue matching reference image
    
    scale = size / 512.0
    
    def s(coords):
        return [(x * scale, y * scale) for x, y in coords]

    # Outer emblem body contour
    # Outer Wrench & Stem & Outer Hexagon
    outer_points = s([
        (256, 104),   # Top center bridge notch
        (336, 76),    # Right top arm shoulder
        (448, 136),   # Right top jaw outer tip
        (396, 164),   # Right jaw inner upper corner
        (376, 200),   # Right jaw inner back flat
        (396, 236),   # Right jaw inner lower corner
        (448, 264),   # Right bottom jaw outer tip
        (320, 264),   # Right throat/neck junction to stem
        (320, 344),   # Right stem bottom junction
        (340, 376),   # Outer hex right vertex
        (256, 448),   # Outer hex bottom vertex (pointing DOWN)
        (172, 376),   # Outer hex left vertex
        (192, 344),   # Left stem bottom junction
        (192, 264),   # Left throat/neck junction to stem
        (64, 264),    # Left bottom jaw outer tip
        (116, 236),   # Left jaw inner lower corner
        (136, 200),   # Left jaw inner back flat
        (116, 164),   # Left jaw inner upper corner
        (64, 136),    # Left top jaw outer tip
        (176, 76),    # Left top arm shoulder
    ])
    
    draw.polygon(outer_points, fill=NAVY)
    
    # Cutouts (Draw with transparent color using mask / compositing)
    mask = Image.new("L", (size, size), 0)
    mask_draw = ImageDraw.Draw(mask)
    
    # 1. Center Vertical Slot
    slot_points = s([
        (242, 184),
        (256, 164),
        (270, 184),
        (270, 344),
        (242, 344)
    ])
    mask_draw.polygon(slot_points, fill=255)
    
    # 2. Inner Hexagon Hole
    hex_hole_points = s([
        (256, 348),
        (288, 366),
        (288, 404),
        (256, 422),
        (224, 404),
        (224, 366)
    ])
    mask_draw.polygon(hex_hole_points, fill=255)
    
    # Apply cutout mask
    img.paste((0, 0, 0, 0), (0, 0), mask)
    
    return img

def export_all_favicons():
    output_dir = "public"
    os.makedirs(output_dir, exist_ok=True)
    
    high_res_img = draw_emblem(2048)
    
    # Sizes to export
    sizes = {
        "favicon-512x512.png": 512,
        "apple-touch-icon.png": 180,
        "favicon-48x48.png": 48,
        "favicon-32x32.png": 32,
        "favicon-16x16.png": 16,
    }
    
    for filename, sz in sizes.items():
        resized = high_res_img.resize((sz, sz), Image.Resampling.LANCZOS)
        resized.save(os.path.join(output_dir, filename), "PNG")
        print(f"Saved {output_dir}/{filename}")

    # Generate favicon.ico (multi-resolution ICO containing 16x16, 32x32, 48x48)
    ico_img = high_res_img.resize((32, 32), Image.Resampling.LANCZOS)
    ico_16 = high_res_img.resize((16, 16), Image.Resampling.LANCZOS)
    ico_48 = high_res_img.resize((48, 48), Image.Resampling.LANCZOS)
    ico_img.save(os.path.join(output_dir, "favicon.ico"), format="ICO", sizes=[(16, 16), (32, 32), (48, 48)])
    print("Saved public/favicon.ico")

if __name__ == "__main__":
    export_all_favicons()
