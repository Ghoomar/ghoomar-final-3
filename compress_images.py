import os
from PIL import Image

# This scans EVERY folder inside your assets directory
base_assets_path = r"C:\Ghoomar final 3\elements used in the website\assets"

# Compression settings
basewidth = 1200  # Resize width to 1200px
quality = 75      # JPEG Quality

print(f"🚀 Starting deep-scan compression in: {base_assets_path}")

count = 0
for root, dirs, files in os.walk(base_assets_path):
    for filename in files:
        # Match images and ignore ones already ending in -web.jpg
        if filename.lower().endswith(('.png', '.jpg', '.jpeg')) and not filename.lower().endswith('-web.jpg'):
            file_path = os.path.join(root, filename)
            
            try:
                # Get file size in MB
                file_size_mb = os.path.getsize(file_path) / (1024 * 1024)
                
                # Only compress if larger than 0.5 MB
                if file_size_mb < 0.5:
                    continue

                print(f"📸 Compressing {filename} ({file_size_mb:.1f} MB)...")
                
                img = Image.open(file_path)
                img = img.convert('RGB')
                
                # Maintain aspect ratio
                wpercent = (basewidth / float(img.size[0]))
                if wpercent < 1.0:
                    hsize = int((float(img.size[1]) * float(wpercent)))
                    img = img.resize((basewidth, hsize), Image.Resampling.LANCZOS)
                
                # Create the -web version
                new_filename = os.path.splitext(filename)[0] + "-web.jpg"
                new_path = os.path.join(root, new_filename)
                
                img.save(new_path, "JPEG", optimize=True, quality=quality)
                count += 1
                
                new_size_kb = os.path.getsize(new_path) / 1024
                print(f"   ✅ Done! Saved as {new_filename} ({new_size_kb:.1f} KB)")
                
            except Exception as e:
                print(f"   ❌ Error skipping {filename}: {e}")

print(f"\n✨ Finished! Compressed {count} images. Your website will be much faster now.")
