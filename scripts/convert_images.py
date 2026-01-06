import os
from PIL import Image

def convert_to_webp():
    target_dirs = [
        'src/assets/programs',
        'src/assets/alumni',
        'src/assets/gallery',
        'src/assets/newphotos',
        'src/assets/teams',
        'src/assets/ubatech_testimonials',
        'src/assets'
    ]
    
    for dir_path in target_dirs:
        abs_path = os.path.abspath(dir_path)
        if not os.path.exists(abs_path):
            continue
            
        print(f"Processing directory: {dir_path}")
        for filename in os.listdir(abs_path):
            if filename.lower().endswith(('.png', '.jpg', '.jpeg')):
                file_path = os.path.join(abs_path, filename)
                img = Image.open(file_path)
                
                webp_filename = os.path.splitext(filename)[0] + '.webp'
                webp_path = os.path.join(abs_path, webp_filename)
                
                print(f"Converting {filename} to {webp_filename}...")
                img.save(webp_path, 'WEBP', quality=85)

if __name__ == "__main__":
    try:
        convert_to_webp()
        print("Conversion complete!")
    except ImportError:
        print("Error: Pillow library is required. Run 'pip install pillow' first.")
    except Exception as e:
        print(f"An error occurred: {e}")
