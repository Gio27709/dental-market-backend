#!/usr/bin/env python3
import sys
import os
import json
from PIL import Image

def compress_image(input_path, output_path, max_size_mb):
    try:
        # Validar archivos
        if not os.path.exists(input_path):
            raise FileNotFoundError(f"Input file not found: {input_path}")
            
        original_size_bytes = os.path.getsize(input_path)
        max_size_bytes = float(max_size_mb) * 1024 * 1024
        
        # Abrir imagen
        img = Image.open(input_path)
        
        # Convertir a RGB si es PNG (para asegurar que si quitamos alfa lo haga bien)
        # O preservar RGBA si se necesita transparencia y la guardamos como WebP
        if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
            # Mantener transparencia en WebP
            pass
        elif img.mode != 'RGB':
            img = img.convert('RGB')
            
        # Parámetros iniciales
        quality = 90
        resize_ratio = 1.0
        current_img = img.copy()
        
        # Guardar inicialmente a quality 90 como WebP
        current_img.save(output_path, 'WEBP', quality=quality)
        current_size = os.path.getsize(output_path)
        
        # Loop de compresión agresiva si excede tamaño
        while current_size > max_size_bytes and (quality > 10 or resize_ratio > 0.2):
            if quality > 30:
                quality -= 10
            else:
                # Si quality ya es bajo, bajamos la resolución
                resize_ratio -= 0.1
                new_width = int(img.width * resize_ratio)
                new_height = int(img.height * resize_ratio)
                current_img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
                
            current_img.save(output_path, 'WEBP', quality=quality)
            current_size = os.path.getsize(output_path)
            
        # Si de alguna forma sigue gigante (imposible normalmente con ratios tan bajos), forzar fuerte
        if current_size > max_size_bytes:
            current_img.save(output_path, 'WEBP', quality=10)
            current_size = os.path.getsize(output_path)
            
        reduction = ((original_size_bytes - current_size) / original_size_bytes) * 100
            
        print(json.dumps({
            "success": True,
            "original_size": original_size_bytes,
            "optimized_size": current_size,
            "reduction_percentage": round(reduction, 2),
            "format": "WEBP",
            "output_path": output_path
        }))
        
    except Exception as e:
        print(json.dumps({
            "success": False,
            "error": str(e)
        }))
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print(json.dumps({"success": False, "error": "Missing parameters. Usage: compress_image.py <input> <output> <max_size_mb>"}))
        sys.exit(1)
        
    input_path = sys.argv[1]
    output_path = sys.argv[2]
    max_mb = sys.argv[3]
    
    compress_image(input_path, output_path, max_mb)
