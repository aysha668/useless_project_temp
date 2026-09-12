"""Generate synthetic broken-screen sample images for demo mode."""

from pathlib import Path
import numpy as np
import cv2

DEMO_DIR = Path(__file__).resolve().parents[1] / "demo_images"
DEMO_DIR.mkdir(parents=True, exist_ok=True)


def create_vertical_lines_sample():
    h, w = 600, 400
    img = np.zeros((h, w, 3), dtype=np.uint8)
    img[:] = (20, 20, 25)

    # Screen border
    cv2.rectangle(img, (20, 20), (w - 20, h - 20), (50, 50, 60), 2)

    # Vertical lines of various colors and widths
    lines_info = [
        (60, (255, 0, 255), 4),
        (64, (255, 100, 255), 2),
        (120, (0, 255, 255), 3),
        (123, (100, 255, 255), 1),
        (210, (0, 255, 0), 5),
        (216, (150, 255, 150), 2),
        (280, (255, 255, 0), 3),
        (310, (255, 255, 255), 6),
        (316, (200, 200, 200), 2),
        (350, (0, 0, 255), 4),
    ]

    for x, color, width in lines_info:
        cv2.line(img, (x, 30), (x, h - 30), color, width)

    # Add horizontal cross line
    cv2.line(img, (30, 250), (w - 30, 250), (255, 255, 255), 2)
    cv2.line(img, (30, 420), (w - 30, 420), (0, 255, 255), 3)

    # Dead pixel clusters (bright & dark spots)
    cv2.circle(img, (210, 250), 8, (0, 0, 0), -1)
    cv2.circle(img, (120, 420), 12, (255, 255, 255), -1)
    cv2.circle(img, (280, 150), 5, (255, 0, 0), -1)

    cv2.imwrite(str(DEMO_DIR / "vertical_lines.png"), img)
    print("Created vertical_lines.png")


def create_rainbow_matrix_sample():
    h, w = 500, 700
    img = np.zeros((h, w, 3), dtype=np.uint8)
    img[:] = (15, 15, 20)

    # Display bezel
    cv2.rectangle(img, (15, 15), (w - 15, h - 15), (40, 40, 50), 3)

    # Rainbow horizontal lines
    colors = [
        (255, 0, 0), (255, 127, 0), (255, 255, 0),
        (0, 255, 0), (0, 255, 255), (0, 0, 255), (139, 0, 255)
    ]
    for i, color in enumerate(colors):
        y = 60 + i * 55
        cv2.line(img, (20, y), (w - 20, y), color, 4)
        cv2.line(img, (20, y + 6), (w - 20, y + 6), (color[0]//2, color[1]//2, color[2]//2), 2)

    # Diagonal fracture lines
    cv2.line(img, (100, 30), (500, 450), (255, 255, 255), 2)
    cv2.line(img, (150, 450), (600, 50), (200, 250, 255), 3)
    cv2.line(img, (50, 200), (450, 480), (255, 0, 255), 2)

    # Intersections & dead pixel patch
    pts = np.array([[300, 200], [350, 180], [380, 230], [320, 260]], np.int32)
    cv2.fillPoly(img, [pts], (10, 10, 10))

    cv2.imwrite(str(DEMO_DIR / "rainbow_matrix.png"), img)
    print("Created rainbow_matrix.png")


def create_cracked_oled_sample():
    h, w = 650, 400
    img = np.zeros((h, w, 3), dtype=np.uint8)
    img[:] = (10, 10, 12)

    # Impact point
    cx, cy = 180, 220
    # Black ink bleed (bleeding OLED display)
    cv2.circle(img, (cx, cy), 45, (0, 0, 0), -1)
    cv2.circle(img, (cx + 20, cy - 15), 30, (0, 0, 0), -1)

    # Radial fracture lines
    for angle_deg in range(0, 360, 25):
        rad = np.radians(angle_deg)
        dist = np.random.randint(120, 250)
        ex = int(cx + np.cos(rad) * dist)
        ey = int(cy + np.sin(rad) * dist)
        # Curved/jagged line
        mid_x = int((cx + ex) / 2 + np.random.randint(-20, 20))
        mid_y = int((cy + ey) / 2 + np.random.randint(-20, 20))
        pts = np.array([[cx, cy], [mid_x, mid_y], [ex, ey]], np.int32)
        cv2.polylines(img, [pts], False, (220, 240, 255), 2)

    # Green vertical line extending down
    cv2.line(img, (cx, cy), (cx, h - 20), (0, 255, 0), 4)
    # Magenta line extending right
    cv2.line(img, (cx, cy), (w - 20, cy), (255, 0, 255), 3)

    cv2.imwrite(str(DEMO_DIR / "cracked_oled.png"), img)
    print("Created cracked_oled.png")


def create_barcode_glitch_sample():
    h, w = 550, 750
    img = np.zeros((h, w, 3), dtype=np.uint8)
    img[:] = (30, 30, 35)

    np.random.seed(42)
    # Dense vertical barcode-like lines
    for x in range(30, w - 30, 8):
        if np.random.rand() > 0.4:
            col = int(np.random.choice([255, 200, 150, 100]))
            c_tuple = (col, col, col)
            width = int(np.random.choice([1, 2, 3, 5]))
            cv2.line(img, (x, 30), (x, h - 30), c_tuple, width)

    # A few colored accent lines
    cv2.line(img, (150, 30), (150, h - 30), (0, 255, 255), 4)
    cv2.line(img, (420, 30), (420, h - 30), (255, 0, 255), 5)
    cv2.line(img, (600, 30), (600, h - 30), (0, 255, 0), 3)

    # Horizontal noise bar
    cv2.line(img, (30, 180), (w - 30, 180), (255, 255, 255), 3)
    cv2.line(img, (30, 380), (w - 30, 380), (255, 100, 100), 2)

    cv2.imwrite(str(DEMO_DIR / "barcode_glitch.png"), img)
    print("Created barcode_glitch.png")


if __name__ == "__main__":
    create_vertical_lines_sample()
    create_rainbow_matrix_sample()
    create_cracked_oled_sample()
    create_barcode_glitch_sample()
    print("All demo samples generated successfully!")
