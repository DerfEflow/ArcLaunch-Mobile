#!/usr/bin/env python3
"""Generate minimal placeholder PNG images for Expo app assets."""

from PIL import Image, ImageDraw

def create_image(size, color, text, filename):
    """Create a simple PNG image with text."""
    img = Image.new('RGB', size, color)
    draw = ImageDraw.Draw(img)

    # Calculate text position (center)
    text_bbox = draw.textbbox((0, 0), text)
    text_width = text_bbox[2] - text_bbox[0]
    text_height = text_bbox[3] - text_bbox[1]
    x = (size[0] - text_width) // 2
    y = (size[1] - text_height) // 2

    # Draw text
    draw.text((x, y), text, fill=(255, 255, 255))

    # Save
    img.save(filename, 'PNG')
    print(f"Created {filename} ({size[0]}x{size[1]})")

# ArcLaunch brand color (blue)
ARCLAUNCH_BLUE = (30, 144, 255)

# Create placeholder images
create_image((1024, 1024), ARCLAUNCH_BLUE, "Arc", "icon.png")
create_image((1242, 2208), ARCLAUNCH_BLUE, "ArcLaunch", "splash.png")
create_image((108, 108), ARCLAUNCH_BLUE, "A", "adaptive-icon.png")
create_image((96, 96), ARCLAUNCH_BLUE, "A", "notification-icon.png")
create_image((192, 192), ARCLAUNCH_BLUE, "Arc", "favicon.png")

print("\nAll placeholder images created successfully!")
