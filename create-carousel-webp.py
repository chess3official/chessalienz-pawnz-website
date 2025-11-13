#!/usr/bin/env python3
"""
Create animated WebP from NFT images
Displays 3 images per second in random order
"""

import os
import random
from pathlib import Path
from PIL import Image

def create_animated_webp():
    """Create animated WebP from NFT images"""
    
    # Paths
    images_dir = Path("output/images")
    output_file = "nft-carousel.webp"
    
    # Get all PNG files
    image_files = sorted(images_dir.glob("*.png"), key=lambda x: int(x.stem))
    
    if not image_files:
        print("❌ No PNG files found in output/images/")
        return
    
    print(f"✅ Found {len(image_files)} images")
    
    # Create a shuffled list for random order
    shuffled_files = image_files.copy()
    random.shuffle(shuffled_files)
    
    print("🎬 Creating animated WebP...")
    print("   - Frame rate: 3 images/second")
    print("   - Duration per image: 333ms")
    print("   - Loading images...")
    
    # Load all images
    images = []
    for i, img_path in enumerate(shuffled_files):
        if (i + 1) % 10 == 0:
            print(f"   Loading: {i + 1}/{len(shuffled_files)}")
        
        img = Image.open(img_path)
        # Convert to RGB if necessary
        if img.mode != 'RGB':
            img = img.convert('RGB')
        images.append(img)
    
    print("   - Saving animated WebP...")
    
    # Save as animated WebP
    # duration=333 means 333ms per frame (3 fps)
    # loop=0 means infinite loop
    # quality=80 is good balance between size and quality
    images[0].save(
        output_file,
        save_all=True,
        append_images=images[1:],
        duration=333,
        loop=0,
        quality=80,
        method=6  # Best compression
    )
    
    # Get file size
    file_size = os.path.getsize(output_file) / (1024 * 1024)  # MB
    duration = len(image_files) * 0.333
    
    print(f"\n✅ Animated WebP created successfully!")
    print(f"   📁 File: {output_file}")
    print(f"   📊 Size: {file_size:.2f} MB")
    print(f"   ⏱️  Duration: {duration:.1f} seconds")
    print(f"   🔄 Images: {len(image_files)} frames")
    print(f"   🌐 Browser support: 95%+ (all modern browsers)")
    print(f"\n💡 To use in your website:")
    print(f'   Replace the carousel <img> with:')
    print(f'   <img src="{output_file}" alt="NFT Preview" />')
    print(f'\n   Or keep as <img> and just change src to "{output_file}"')

if __name__ == "__main__":
    print("🎨 NFT Carousel Animated WebP Creator")
    print("=" * 50)
    create_animated_webp()
