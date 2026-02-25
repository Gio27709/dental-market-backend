import os
import glob
try:
    from PIL import Image
    import numpy as np
except ImportError:
    import sys
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow", "numpy"])
    from PIL import Image
    import numpy as np

# Find newest image
directory = 'c:/Users/GiovanyDev/.gemini/antigravity/brain/4fabfaa2-49c8-4842-b480-4618738c12bc'
files = glob.glob(os.path.join(directory, 'media__*.png'))
files.sort(key=os.path.getmtime, reverse=True)
newest_img = files[0]

print(f"Processing {newest_img}")
img = Image.open(newest_img).convert("RGBA")
data = np.array(img)

# Simple distance-based transparency for antialiasing
# Calculate euclidian distance from white
r, g, b = data[:,:,0].astype(int), data[:,:,1].astype(int), data[:,:,2].astype(int)
dist_from_white = np.sqrt((255 - r)**2 + (255 - g)**2 + (255 - b)**2)

# If dist <= 10 (almost pure white), alpha = 0
# If dist >= 100 (colors), alpha = 255
# Interpolate alpha in between
alpha = np.clip((dist_from_white - 10) / 90 * 255, 0, 255).astype(np.uint8)

# Replace alpha channel
data[:,:,3] = np.minimum(data[:,:,3], alpha)

# Make fully white pixels strictly transparent
mask = dist_from_white <= 5
data[:,:,3][mask] = 0

img = Image.fromarray(data)

out_dir = './src/assets'
if not os.path.exists(out_dir):
    os.makedirs(out_dir)

out_file = os.path.join(out_dir, 'logo.png')
img.save(out_file, "PNG")
print(f"Saved transparent logo to {out_file}")
