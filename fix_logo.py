from PIL import Image
import os

source_file = "/home/amazing/.gemini/antigravity/brain/fefff04f-ac17-4b2b-a552-351644bc4ff5/kashminds_logo_45_scale_retry_1768045621512.png"
target_file = "/home/amazing/.gemini/antigravity/brain/fefff04f-ac17-4b2b-a552-351644bc4ff5/kashminds_logo_45_fixed.png"

try:
    with Image.open(source_file) as img:
        img.save(target_file, "PNG")
    print(f"Successfully converted {source_file} to {target_file}")
except Exception as e:
    print(f"Error converting image: {e}")
