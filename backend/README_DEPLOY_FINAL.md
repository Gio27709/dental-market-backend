# GUÍA DEFINITIVA DE DEPLOYMENT A RENDER.COM

_Fase 2, 2.1 y 2.2 Completadas - Backend Dental Market_

---

## === PASO 1: SUBIR A GITHUB ===

Abre la terminal de Comandos en la carpeta de tu backend (`backend/`):

```bash
cd backend
git init
git add .
git commit -m "Production ready - All phases complete"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/dental-market-backend.git
git push -u origin main
```

> _(Sustituye TU_USUARIO por el nombre de tu cuenta de GitHub)_

---

## === PASO 2: OBTENER KEYS DE SUPABASE ===

1. Ir a [https://supabase.com](https://supabase.com).
2. Entrar al proyecto `dental-market`.
3. Navegar en el menú izquierdo hacia **Settings -> API**.
4. En la sección **Project URL** o **API URL**, copia y guarda esa URL (`https://xxxxx.supabase.co`).
5. En la sección **Project API Keys**, ubica estas dos llaves (Guárdalas en un archivo local seguro, como Bloc de Notas):
   - **`anon` / `public`**: _(Pública)_
   - **`service_role` / `secret`**: _(SECRETA, NUNCA COMPARTIRLA, permite bypasear bases de datos)_

---

## === PASO 3: CREAR WEB SERVICE EN RENDER ===

1. Ve a [https://render.com](https://render.com).
2. Haz click en el botón superior derecho **"New +"** y luego selecciona **"Web Service"**.
3. Autoriza y conecta tu cuenta de GitHub.
4. Selecciona tu nuevo repositorio: `dental-market-backend`.
5. Render leerá automáticamente el archivo interno `render.yaml` precargando toda tu configuración.
6. **Verifica visualmente** que el formulario de Render ahora muestre:
   - **Environment:** Node
   - **Build Command:** `npm install && pip3 install -r scripts/requirements.txt && mkdir -p uploads/temp`
   - **Start Command:** `node src/server.js`

---

## === PASO 4: CONFIGURAR VARIABLES DE ENTORNO ===

Desliza hacia abajo hasta la sección **Environment** (O hazlo desde el menú izquierdo del Dashboard una vez creado).
Da clic en "Add Environment Variable" y carga **MANUALMENTE** _(por seguridad les colocamos `sync: false`)_ las siguientes keys:

| Variable                    | Valor                             | ¿Es Sensible?         |
| :-------------------------- | :-------------------------------- | :-------------------- |
| `SUPABASE_URL`              | *https://tu-proyecto.supabase.co* | No                    |
| `SUPABASE_SERVICE_ROLE_KEY` | _(tu service role key)_           | **SÍ**                |
| `SUPABASE_ANON_KEY`         | _(tu anon key)_                   | No                    |
| `CORS_ORIGIN`               | _http://localhost:5173_           | No _(luego cambiará)_ |
| `PYTHON_COMMAND`            | `python3`                         | No                    |
| `TZ`                        | `America/Caracas`                 | No                    |

---

## === PASO 5: DEPLOY ===

1. Haz click en el botón verde inferior **"Create Web Service"**.
2. **Espera de 5 a 10 minutos**. Render descargará los paquetes de React, la capa de AI de Python (`rembg`, `onnxruntime`, `Pillow`) y los enlazará.
3. Observa los logs en vivo en caso de trabarse.
4. Finalizado, copia tu nueva URL Pública verde. Por ejemplo: `https://dental-market-api.onrender.com`.

---

## === PASO 6: VERIFICAR API POST-DEPLOYMENT ===

Con tu URL Pública provista por Render, revisa escribiéndola directo en el Navegador web o Postman:

1. **Test del Sistema:** `GET https://tu-url.onrender.com/health`

   > _Salida Esperada:_ `{"status": "HEALTHY", "environment": "production"}`

2. **Test de Diagnóstico Intensivo (Nuevo):** `GET https://tu-url.onrender.com/api/diagnostic`

   > _Salida Esperada:_ Indicará flags validando si NodeJS y Python pudieron vincularse a Supabase en la memoria del Servidor correctamente.

3. **Ver Productos:** `GET https://tu-url.onrender.com/api/products`

---

## === SOLUCIÓN DE PROBLEMAS FRECUENTES ===

Si el deploy falla en ROJO en la consola, revisa los logs y ataca el problema:

- **"Module not found":** A Node le falta una dependencia en package.json.
- **"Python not found":** Variable `PYTHON_COMMAND` mal configurada, usa `python3`.
- **"Supabase connection error":** Copiaste las credenciales de Supabase del Paso 2 quebrando un caracter extra.
- **"CORS error":** El `CORS_ORIGIN` no hace Match con tu Localhost.
- **Solucionarlo:** Corrige localmente el File, haz un `git commit` y un `git push`. Render escuchará el evento GitHub y **redeployará automáticamente**.

---

## === CHECKLIST PRE-DEPLOY PARA EL USUARIO ===

- [ ] Ejecuté `git push` con todo el código local de mi máquina hacia mi Repo.
- [ ] Obtuve y copié claramente las **3 keys** de Supabase (URL, service_role, anon).
- [ ] Mi cuenta de Render.com está loggeada y enlazada con Github.
- [ ] Entiendo que el primer deploy será pesado (+8 minutos) por las Redes Neuronales en Python al descargar.
- [ ] Localicé la pestaña "Logs" del Dashboard por si rompe.

🔥 ¡SUERTE INGENIERO! Una vez levantado el entorno podremos dedicarnos en la FASE 3 puramente a conectar el Frontend Vercel de React consumiendo esta infraestructura robusta de la Nube.
