from PIL import Image, ImageFilter
import os

def process_image(input_path, output_path):
    try:
        img = Image.open(input_path)
        
        # 1. Resize to 1280x800 (Store requirement)
        img = img.resize((1280, 800), Image.Resampling.LANCZOS)
        
        # 2. Blur sensitive content
        # User reported that the buttons were blurred in image 2.
        # This means the buttons are located lower than 320px.
        # Let's increase the safe top margin significantly to ensure buttons are visible.
        
        blur_left = 240   # Sidebar width
        blur_top = 450    # Increased from 320 to 450 to protect buttons
        blur_right = 1280
        blur_bottom = 800
        
        blur_box = (blur_left, blur_top, blur_right, blur_bottom)
        
        # Crop the region to blur
        region = img.crop(blur_box)
        
        # Apply Gaussian Blur
        blurred_region = region.filter(ImageFilter.GaussianBlur(radius=8))
        
        # Paste the blurred region back
        img.paste(blurred_region, blur_box)
        
        # Save
        img.save(output_path)
        print(f"Processed {input_path} -> {output_path}")
        
    except Exception as e:
        print(f"Error processing {input_path}: {e}")

def main():
    base_dir = '/Users/redrain/Documents/kuaishou/extension'
    
    files = ['1.png', '2.png']
    
    for f in files:
        input_path = os.path.join(base_dir, f)
        output_path = os.path.join(base_dir, f"processed_{f}")
        
        if os.path.exists(input_path):
            process_image(input_path, output_path)
        else:
            print(f"File not found: {input_path}")

if __name__ == "__main__":
    main()
