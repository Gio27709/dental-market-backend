# Deploy en Render.com - Guía Paso a Paso

Esta guía explica detalladamente cómo realizar el despliegue del backend de Dental Market (Node.js/Express) en Render.com.

## Paso 1: Subir a GitHub

Abre la terminal en la carpeta raíz del backend (`backend/`):

```bash
cd backend
git init
git add .
git commit -m "Initial commit - Ready for Render"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/dental-market-backend.git
git push -u origin main
```

## Paso 2: Crear Web Service en Render

1. Ve a [https://render.com](https://render.com) e inicia sesión o regístrate con GitHub.
2. Haz clic en el botón **"New +"** (arriba a la derecha) y selecciona **"Web Service"**.
3. Conecta tu cuenta de GitHub y selecciona el repositorio **`dental-market-backend`**.
4. Render leerá automáticamente el archivo `render.yaml` y configurará la instancia. Confirma dándole nombre al proyecto y asegurándote de usar el plan `Free`.

## Paso 3: Configurar Variables de Entorno (Environment)

Al haber especificado `sync: false` en tu archivo de configuración, debes proveer claves privadas obligatoriamente desde el Dashboard de Render.
Ve a la opción **"Environment"** de tu Web Service y agrega las siguientes variables (usando "Add Environment Variable"):

- **Variable**: `SUPABASE_URL`
  **Valor**: _https://<tu_proyecto>.supabase.co_

- **Variable**: `SUPABASE_SERVICE_ROLE_KEY`
  **Valor**: _(tu service_role key de Supabase - encuéntrala en Supabase > Project Settings > API)_

- **Variable**: `SUPABASE_ANON_KEY`
  **Valor**: _(tu anon/public public key de Supabase)_

- **Variable**: `CORS_ORIGIN`
  **Valor**: _http://localhost:5173_ (Luego deberás cambiar esto por el dominio real en producción, por ejemplo la URL de Vercel de tu frontend).

## Paso 4: Realice el Deploy

1. Haz clic en el botón verde **"Create Web Service"** al final de esa página.
2. Espera de **3 a 5 minutos** a que termine la ventana de _Build & Deploy_. No cierres la ventana.
3. Copia la URL pública que te facilitará Render (Ejemplo: `https://dental-market-api.onrender.com`) que aparece debajo del nombre.

## Paso 5: Probar API

Finalizado el Deploy, usa tu navegador o herramientas como Postman para probar el enlace remoto:

- Health Check Remoto:
  `GET https://tu-url.onrender.com/health` **→ ¡Debe responder con Status "HEALTHY"!**
- Comprobar Catálogo de Productos Abierto:
  `GET https://tu-url.onrender.com/api/products` **→ Debe listar en formato JSON los productos activos.**
