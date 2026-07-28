import os
import sys
from huggingface_hub import HfApi

TOKEN = os.environ.get("HF_TOKEN") or __import__("secrets_local", fromlist=["HF_TOKEN"]).HF_TOKEN if os.path.exists(os.path.join(os.path.dirname(__file__), "secrets_local.py")) else os.environ.get("HF_TOKEN", "")
REPO_NAME = "bruno-fit"

def check_bundle():
    """El navegador ejecuta app.bundle.js, no app.js. Si el bundle quedó atrás,
    se desplegaría código viejo sin que nada avise: mejor abortar aquí."""
    import hashlib
    base = os.path.dirname(os.path.abspath(__file__))
    src = os.path.join(base, "app.js")
    bundle = os.path.join(base, "app.bundle.js")
    if not os.path.exists(bundle):
        print("Falta app.bundle.js. Ejecutá:  npm run build")
        sys.exit(1)
    with open(src, "rb") as f:
        esperado = hashlib.sha1(f.read()).hexdigest()
    with open(bundle, "r", encoding="utf-8") as f:
        cabecera = f.read(400)
    if "fuente:" + esperado not in cabecera:
        print("app.bundle.js está desactualizado respecto a app.js. Ejecutá:  npm run build")
        sys.exit(1)
    print("Bundle al día con app.js.")


def main():
    print("Iniciando despliegue en Hugging Face Spaces...")
    check_bundle()
    api = HfApi(token=TOKEN)
    
    # 1. Obtener información del usuario
    try:
        user_info = api.whoami()
        username = user_info["name"]
        print(f"Token válido. Usuario identificado: {username}")
    except Exception as e:
        print(f"Error al verificar el token: {e}")
        sys.exit(1)
        
    repo_id = f"{username}/{REPO_NAME}"
    
    # 2. Crear el espacio estático si no existe
    try:
        print(f"Creando/Verificando repositorio del Espacio: {repo_id}...")
        api.create_repo(
            repo_id=repo_id,
            repo_type="space",
            space_sdk="static",
            private=False,
            exist_ok=True
        )
        print("Espacio estático listo en Hugging Face.")
    except Exception as e:
        print(f"Error al crear el repositorio: {e}")
        sys.exit(1)
        
    # 3. Subir los archivos de la app
    # app.bundle.js es el que ejecuta el navegador (generado por `npm run build`).
    # app.js se sigue subiendo: es el fuente y el respaldo si el bundle falla.
    files_to_upload = [
        "index.html", "style.css", "app.bundle.js", "app.js",
        "manifest.json", "sw.js",
        "icon-192.png", "icon-512.png", "README.md"
    ]
    
    for filename in files_to_upload:
        if not os.path.exists(filename):
            print(f"Error: No se encontró el archivo local: {filename}")
            sys.exit(1)
            
        print(f"Subiendo {filename} a {repo_id}...")
        try:
            api.upload_file(
                path_or_fileobj=filename,
                path_in_repo=filename,
                repo_id=repo_id,
                repo_type="space"
            )
            print(f"OK: {filename} subido correctamente.")
        except Exception as e:
            print(f"Error al subir {filename}: {e}")
            sys.exit(1)
            
    space_url = f"https://huggingface.co/spaces/{repo_id}"
    app_url = f"https://{username.lower()}-{REPO_NAME.lower()}.static.hf.space"
    
    print("\n" + "="*50)
    print("DESPLIEGUE COMPLETADO EXITOSAMENTE!")
    print(f"Enlace de gestión del Space: {space_url}")
    print(f"Enlace de tu aplicación web (Pantalla Completa PWA): {app_url}")
    print("="*50)

if __name__ == "__main__":
    main()
