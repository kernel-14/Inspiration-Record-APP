"""Test script to verify image loading and URL conversion."""

import sys
from pathlib import Path
import json

# Add app directory to path
sys.path.insert(0, str(Path(__file__).parent))

def test_image_loading():
    """Test that the latest image is loaded correctly."""
    print("Testing image loading...")
    
    # Check generated_images directory
    generated_images_dir = Path("generated_images")
    if not generated_images_dir.exists():
        print(f"❌ Directory not found: {generated_images_dir}")
        return False
    
    # Get all image files
    image_files = list(generated_images_dir.glob("character_*.jpeg"))
    print(f"\n📁 Found {len(image_files)} image(s) in {generated_images_dir}/")
    
    if not image_files:
        print("⚠️  No images found. Generate a character first.")
        return True
    
    # Sort by modification time
    image_files.sort(key=lambda p: p.stat().st_mtime, reverse=True)
    
    print("\n📸 Images (newest first):")
    for i, img in enumerate(image_files, 1):
        mtime = img.stat().st_mtime
        from datetime import datetime
        mtime_str = datetime.fromtimestamp(mtime).strftime("%Y-%m-%d %H:%M:%S")
        print(f"  {i}. {img.name} (modified: {mtime_str})")
    
    # Get latest image
    latest_image = image_files[0]
    print(f"\n✅ Latest image: {latest_image.name}")
    
    # Check user_config.json
    config_file = Path("data/user_config.json")
    if config_file.exists():
        with open(config_file, 'r', encoding='utf-8') as f:
            user_config = json.load(f)
        
        saved_image = user_config.get('character', {}).get('image_url', '')
        print(f"\n📋 Saved in config: {saved_image}")
        
        # Convert to Path for comparison
        if saved_image:
            saved_path = Path(saved_image)
            if saved_path.name == latest_image.name:
                print("✅ Config has the latest image!")
            else:
                print(f"⚠️  Config has different image: {saved_path.name}")
                print(f"   Latest is: {latest_image.name}")
    else:
        print(f"\n⚠️  Config file not found: {config_file}")
    
    # Test URL conversion
    print(f"\n🔗 URL conversion test:")
    print(f"   Local path: {latest_image}")
    print(f"   URL: http://localhost:8000/generated_images/{latest_image.name}")
    
    return True

if __name__ == "__main__":
    success = test_image_loading()
    sys.exit(0 if success else 1)
