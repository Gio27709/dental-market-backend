#!/usr/bin/env python3
import sys
import os
import json
import subprocess

def process_optimization(input_path, final_output_path, remove_bg, max_size_mb):
    tmp_bg_path = input_path + "_nobg.webp"
    
    try:
        current_input = input_path
        info = {
            "bg_removed": False,
            "compressed": False,
            "original_size": os.path.getsize(input_path),
            "final_size": 0,
            "format": "WEBP",
            "output_path": final_output_path
        }
        
        # 1. Remover fondo si es solicitado
        if remove_bg.lower() == 'true':
            script_path = os.path.join(os.path.dirname(__file__), "remove_background.py")
            result = subprocess.run(
                ["python3", script_path, current_input, tmp_bg_path],
                capture_output=True,
                text=True
            )
            
            try:
                bg_data = json.loads(result.stdout)
                if bg_data.get("success"):
                    current_input = tmp_bg_path
                    info["bg_removed"] = True
                else:
                    raise Exception(bg_data.get("error", result.stderr))
            except json.JSONDecodeError:
                raise Exception(f"Fallo script de remover fondo: {result.stdout} {result.stderr}")

        # 2. Comprimir la imagen resultante
        compress_script_path = os.path.join(os.path.dirname(__file__), "compress_image.py")
        c_result = subprocess.run(
            ["python3", compress_script_path, current_input, final_output_path, str(max_size_mb)],
            capture_output=True,
            text=True
        )
        
        try:
            c_data = json.loads(c_result.stdout)
            if c_data.get("success"):
                info["compressed"] = True
                info["final_size"] = c_data.get("optimized_size")
            else:
                raise Exception(c_data.get("error", c_result.stderr))
        except json.JSONDecodeError:
            raise Exception(f"Fallo script de compresion: {c_result.stdout} {c_result.stderr}")

        # Limpieza de temporales creados aqui
        if os.path.exists(tmp_bg_path):
            os.remove(tmp_bg_path)
            
        print(json.dumps({
            "success": True,
            "data": info
        }))
        
    except Exception as e:
        if os.path.exists(tmp_bg_path):
            os.remove(tmp_bg_path)
            
        print(json.dumps({
            "success": False,
            "error": str(e)
        }))
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 5:
        print(json.dumps({"success": False, "error": "Usage: optimize_image.py <input> <output> <remove_bg> <max_size_mb>"}))
        sys.exit(1)
        
    i_path = sys.argv[1]
    o_path = sys.argv[2]
    rem_bg = sys.argv[3]
    max_mb = sys.argv[4]
    
    process_optimization(i_path, o_path, rem_bg, max_mb)
