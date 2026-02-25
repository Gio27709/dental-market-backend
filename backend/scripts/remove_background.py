#!/usr/bin/env python3
import sys
import os
import json
from rembg import remove
from PIL import Image

def remove_background(input_path, output_path):
    try:
        if not os.path.exists(input_path):
            raise FileNotFoundError(f"Input file not found: {input_path}")
            
        original_size_bytes = os.path.getsize(input_path)
        
        # Procesar con rembg
        input_image = Image.open(input_path)
        # remove() genera una imagen RGBA
        output_image = remove(input_image)
        
        # WEBP soporta canal Alfa (transparencia) si la guardamos directamente
        output_image.save(output_path, 'WEBP', quality=100)
        
        current_size = os.path.getsize(output_path)
        
        print(json.dumps({
            "success": True,
            "original_size": original_size_bytes,
            "optimized_size": current_size,
            "format": "WEBP",
            "output_path": output_path,
            "bg_removed": True
        }))
        
    except Exception as e:
        print(json.dumps({
            "success": False,
            "error": str(e)
        }))
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(json.dumps({"success": False, "error": "Missing parameters. Usage: remove_background.py <input> <output>"}))
        sys.exit(1)
        
    input_path = sys.argv[1]
    output_path = sys.argv[2]
    
    remove_background(input_path, output_path)
