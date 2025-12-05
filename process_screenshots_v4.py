from PIL import Image, ImageFilter
import os

def process_image(input_path, output_path, blur_top_y):
    try:
        img = Image.open(input_path)
        
        # 1. Resize to 1280x800
        img = img.resize((1280, 800), Image.Resampling.LANCZOS)
        
        # 2. Blur sensitive content
        # Sidebar width
        blur_left = 240
        blur_right = 1280
        blur_bottom = 800
        
        # Use the specific top Y for this image
        blur_box = (blur_left, blur_top_y, blur_right, blur_bottom)
        
        # Crop and blur
        region = img.crop(blur_box)
        blurred_region = region.filter(ImageFilter.GaussianBlur(radius=8))
        img.paste(blurred_region, blur_box)
        
        img.save(output_path)
        print(f"Processed {input_path} -> {output_path} (Blur starting at Y={blur_top_y})")
        
    except Exception as e:
        print(f"Error processing {input_path}: {e}")

def main():
    base_dir = '/Users/redrain/Documents/kuaishou/extension'
    
    # Configuration: filename -> blur start Y coordinate
    # Image 1: Standard header, buttons likely higher.
    # Image 2: Buttons reported lower, so we start blur lower to preserve them.
    config = {
        '1.png': 300,  # Try 300 for image 1
        '2.png': 400   # Try 400 for image 2 (since 320 blurred buttons, and 450 was too low)
    }
    
    for filename, blur_y in config.items():
        input_path = os.path.join(base_dir, filename)
        output_path = os.path.join(base_dir, f"processed_{filename}")
        
        if os.path.exists(input_path):
            process_image(input_path, output_path, blur_y)
        else:
            print(f"File not found: {input_path}")

if __name__ == "__main__":
    main()
