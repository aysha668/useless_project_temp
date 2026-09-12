"""Generate synthetic broken-display demo images."""

from pathlib import Path

import cv2
import numpy as np

DEMO_DIR = Path(__file__).resolve().parents[2] / "demo_images"
DEMO_DIR.mkdir(parents=True, exist_ok=True)


def create_vertical_lines():
    img = np.ones((600, 400, 3), dtype=np.uint8) * 30
    for x in range(40, 360, 25):
        color = np.random.randint(0, 255, 3).tolist()
        cv2.line(img, (x, 0), (x + np.random.randint(-3, 3), 600), color, np.random.randint(2, 5))
    cv2.imwrite(str(DEMO_DIR / "vertical_bars.png"), img)


def create_rainbow_damage():
    img = np.ones((500, 700, 3), dtype=np.uint8) * 20
    colors = [(255, 0, 0), (0, 255, 0), (0, 0, 255), (255, 255, 0), (255, 0, 255), (0, 255, 255)]
    for i, c in enumerate(colors):
        y = 80 + i * 60
        cv2.line(img, (50, y), (650, y + np.random.randint(-20, 20)), c, 4)
    for _ in range(15):
        cx, cy = np.random.randint(50, 650), np.random.randint(50, 450)
        cv2.circle(img, (cx, cy), np.random.randint(3, 15), colors[np.random.randint(0, len(colors))], -1)
    cv2.imwrite(str(DEMO_DIR / "rainbow_chaos.png"), img)


def create_grid_pattern():
    img = np.ones((480, 640, 3), dtype=np.uint8) * 15
    for y in range(0, 480, 30):
        cv2.line(img, (0, y), (640, y), (100, 100, 255), 2)
    for x in range(0, 640, 40):
        cv2.line(img, (x, 0), (x, 480), (255, 100, 100), 2)
    cv2.imwrite(str(DEMO_DIR / "grid_damage.png"), img)


def create_diagonal_cracks():
    img = np.ones((550, 400, 3), dtype=np.uint8) * 25
    for _ in range(20):
        x1, y1 = np.random.randint(0, 400), np.random.randint(0, 550)
        angle = np.random.uniform(20, 70)
        length = np.random.randint(100, 300)
        x2 = int(x1 + length * np.cos(np.radians(angle)))
        y2 = int(y1 + length * np.sin(np.radians(angle)))
        cv2.line(img, (x1, y1), (x2, y2), (200, 200, 200), np.random.randint(1, 4))
    cv2.imwrite(str(DEMO_DIR / "diagonal_cracks.png"), img)


if __name__ == "__main__":
    create_vertical_lines()
    create_rainbow_damage()
    create_grid_pattern()
    create_diagonal_cracks()
    print(f"Demo images created in {DEMO_DIR}")
