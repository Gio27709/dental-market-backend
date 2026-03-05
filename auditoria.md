# AUDITORÍA COMPLETA DEL BACKEND Y REQUERIMIENTOS DEL FRONTEND MVP

**Proyecto:** DentalMarket
**Endpoints Backend (Render):** `https://dental-market-backend.onrender.com`

---

## 1. MAPEO COMPLETO DE ENDPOINTS

### 1.1 Autenticación y Usuarios _(Supabase Native Handle)_

_Nota: El backend en Node delega la autenticación principal nativamente a Supabase (AuthContext)._

- **POST `/api/auth/login` (Reemplazado nativamente en Frontend `signInWithEmail`)**
- **POST `/api/auth/register` (Reemplazado nativamente `signUpWithEmail`)**
- **POST `/api/auth/logout` (Reemplazado nativamente `signOut`)**

### 1.2 Productos (`productRoutes.js`)

- **GET `/api/products`**
  - **Auth:** Ninguna (Público)
  - **Descripción:** Lista productos activos y aprobados con filtros/paginación.
  - **Respuesta:** `{ count: integer, data: [ProductObjects] }`
- **GET `/api/products/:id`**
  - **Auth:** Ninguna (Público)
  - **Descripción:** Obtiene el detalle de un producto específico, variaciones de stock, imágenes.
- **POST `/api/products`**
  - **Auth:** `store`, `admin`, `owner`
  - **Descripción:** Crea un nuevo producto inyectando automáticamente el ID de tienda.
  - **Body:** `{ name, description, category_id, price, variations: [...] }`
- **PUT `/api/products/:id`**
  - **Auth:** `store` (dueño), `owner`
  - **Descripción:** Actualiza un producto.
- **DELETE `/api/products/:id`**
  - **Auth:** `store` (dueño), `owner`
  - **Descripción:** Soft delete (`is_active = false`).
- **GET `/api/products/bulk-import/template`**
  - **Auth:** `store`, `admin`, `owner`
  - **Descripción:** Descarga el formato CSV para la plantilla de importación.
- **POST `/api/products/bulk-import`**
  - **Auth:** `store`, `admin`, `owner`
  - **Descripción:** Procesa un archivo CSV con límite de 500 productos mediante Multer.

### 1.3 Órdenes / Compras (`orderRoutes.js`)

- **POST `/api/orders`**
  - **Auth:** `user`, `professional`
  - **Descripción:** Procesa el carrito de compras a través de la pasarela **Escrow**, leyendo tasa BCV actual.
  - **Body:** `{ items: [{product_id, variation_id, store_id, quantity, unit_price}] }`
- **GET `/api/orders`**
  - **Auth:** Require Token JWT
  - **Descripción:** Si el rol es cliente, devuelve sus órdenes completas. Si el rol es tienda, devuelve el sub-conjunto (order_items) correspondientes.
- **GET `/api/orders/:id`**
  - **Auth:** Token JWT
  - **Descripción:** Profundiza en una orden (sólo participantes de esa orden pueden verla).
- **PUT `/api/orders/:item_id/ship`**
  - **Auth:** `store`, `owner`
  - **Descripción:** Marca un sub-ítem específico como `shipped` descontando stock por trigger en BD.
  - **Body:** `{ tracking_code, shipping_carrier }`
- **PUT `/api/user/orders/:item_id/confirm-delivery`**
  - **Auth:** `user` _[Lógica Frontend planificada]_
  - **Descripción:** Confirmación de recepción. Libera fondos de Escrow a Wallet de tienda.

### 1.4 Favoritos (`wishlistRoutes.js`)

- **GET `/api/wishlist`**
  - **Auth:** Requiere Token JWT
  - **Descripción:** Lista los productos guardados del usuario logueado.
- **GET `/api/wishlist/check/:product_id`**
  - **Auth:** Requiere Token JWT
  - **Descripción:** Checa estatus (devuelve booleano)
- **POST `/api/wishlist/:product_id`**
  - **Auth:** Requiere Token JWT
  - **Descripción:** Almacena producto en el array.
- **DELETE `/api/wishlist/:product_id`**
  - **Auth:** Requiere Token JWT
  - **Descripción:** Elimina del array de favoritos.

### 1.5 Wallets y Finanzas (`walletRoutes.js`)

- **GET `/api/store/wallet`**
  - **Auth:** `store`
  - **Descripción:** Retorna `balance_available` y `balance_pending`.
- **GET `/api/store/wallet/transactions`**
  - **Auth:** `store`
  - **Descripción:** Últimos movimientos históricos de abonos/retiros.
- **POST `/api/store/payout`**
  - **Auth:** `store`
  - **Descripción:** Pide retirar saldos del Disponible. Resta fondos automáticamente y crea ticket para el admin.
  - **Body:** `{ amount }`

### 1.6 Tiendas (Store Service Middleware)

- **GET `/api/stores/:id`** _(A través de DB direct / RPC public)_
  - **Descripción:** Acceso a perfil base (nombre negocio, logo, rating, rif validado).

### 1.7 Profesionales (`professionalRoutes.js`)

- **POST `/api/professional/license-upload`**
  - **Auth:** `professional`
  - **Descripción:** Sube licencia (PDF/JPG) a bucket privado en Supabase.
- **GET `/api/professional/status`**
  - **Auth:** `professional`
  - **Descripción:** Retorna `is_verified` o `pending`.
- **GET `/api/admin/professional-licenses`**
  - **Auth:** `admin`, `owner`
  - **Descripción:** Cola de usuarios requiriendo validación, genera un Signed URL para ver la licencia expirado en 1h.
- **PUT `/api/admin/professionals/:id/verify`**
  - **Auth:** `admin`, `owner`
  - **Descripción:** Aprueba la licencia.
  - **Body:** `{ is_verified: true, notes: "..." }`

### 1.8 Configuración Global (`settingsRoutes.js`)

- **PUT `/api/admin/settings/bcv-rate`**
  - **Auth:** `owner`
  - **Descripción:** Setter centralizado que regirá las próximas ventas.
  - **Body:** `{ rate: 36.5 }`

---

## 2. FLUJOS DE USUARIO COMPLETOS

### 2.1 Flujo de Compra (Cliente)

1. Navega `/` por productos activos.
2. Filtra por categoría/clínica dental.
3. Visualiza `/product/:id` analizando las variaciones activas (Tono A2).
4. Agrega al Carrito (Context Global en `CartContext`).
5. Va al `/cart` (Checkout), validación auth.
6. Pulsa completar compra lanzando `POST /api/orders` con todos los `variation_id` y `store_id`.
7. Fondos quedan retenidos en Escrow (Saldo Pending de Vendedor).
8. Tienda envía. El cliente recibe guía.
9. El cliente entra a `/account` y marca recepción.
10. Backend procesa trigger, libera Comisión de la plataforma e inyecta Saldo Final Disponible.

### 2.2 Flujo de Vendedor (Tienda)

1. Selecciona `store` en el registro. Se inyecta `role=store` en los metadatos de su JWT.
2. Entra al dashboard privado `/store/dashboard` y recibe `GET /api/store/wallet`.
3. Para vender masivo usa el "Bulk Import" descargando la plantilla del backend.
4. Si alguien le compra, recibe orden `/orders`.
5. Procesa su despacho marcando `"Shipped"` con MRW.
6. Al día siguiente el cliente confirma, su `pending` baja pero el `available` incrementa.
7. Requiere Payout y la plataforma congela fondos y transfiere a banco de tienda.

## 3. MODELOS DE DATOS Y RELACIONES CLAVES

- **User:** Genuinamente manejado por `auth.users` global. El nodo de roles está en su `raw_user_meta_data`.
- **Product & ProductVariation:** One-To-Many. El control de stock no está en producto maestro sino en cada variación (Tono Azul, Tono Blanco).
- **Order & OrderItem:** Escrow. En `Order` se fija el tipo de cambio oficial perpetuamente (`exchange_rate_at_purchase`), y al procesarlo, cada `OrderItem` calcula su aportación a la comisión congelada global.
- **StoreProfile & Wallet:** Relación intrínseca. `StoreWallet` almacena dinero. `WalletTransaction` actúa como auditor contable de cada retiro o venta.

## 4. REGLAS DE NEGOCIO CRÍTICAS

1. **Comisión Retroactiva Cero:** El porcentaje `platform_fee` de comisión que se cobre al momento X en `global_settings` queda congelado perpetuo sobre las órdenes en curso. Si el Admin luego sube la tasa BCV, esta no muta las ordenes pasadas.
2. **Sistema Escrow Aislado:** El dinero nunca pertenece a la tienda local hasta la confirmación de envío/llegada.

---

## 5. REQUERIMIENTOS FRONTEND MVP ESTRUCTURADOS (PÁGINAS)

**5.1 Front Público**

- `Home` (`/`): Malla de cartas de reactividad en tiempo real con Zustand o Context.
- `Cart` (`/cart`): Grid final del checkout. Listar montos en dólares (referencia) al mismo tiempo que BCV leyendo tabla settings.
- `Login` & `Register` (Enlazados correctamente a Context MetaData).

**5.2 Dashboard de Perfil (Cliente Normal)**

- `/account`: Tabla resumen orders (`orderService`).

**5.3 Central Tienda (Store)**

- `/store`: Metricas básicas.
- `/store/products`: Botón azul inmenso de Importación Bulk CSV.
- `/store/orders`: Modal interactivo exigiendo código tracking si se marca enviado.
- `/store/wallet`: Barra lateral de fondos bloqueados y botón Retirar a "Zelle/Binance/Bs".

**5.4 Configuración Maestría (Admin/Owner)**

- `/admin`: Centralizador. Una card visual única que exponga Rate del BCV de hoy en letra grande.
- Cajas de aprobaciones de Doctores (`/admin/professionals`) para rechazar licencias falsas (Generando URLs firmadas en frontend `href`).

---

## 6. LIBRERÍA DE COMPONENTES REUTILIZABLES

- `ProductCard.jsx`: Requerido con `add_to_cart` inyectado.
- `CartItem.jsx`: Contador (+ y -) ligado a `ProductVariation.stock` límite.
- `DynamicPrice.jsx`: Módulo global que consuma Contexto general del BCV y transforme montos en Dólares instantáneamente a local.
- `RoleRoute.jsx` (Basado en el Guard actual): Requerimientos de UI donde bloquea `/admin` mostrando un warning rojo 403.

## 12. ENTREGABLES

Este MVP unificado dentro de `auditoria.md` engloba el entendimiento exacto entre las 7 rutas especializadas construidas previamente en `node_modules`.

_Plan Ejecutable Propuesto para ti: Arrancar inmediatamente tras la limpieza iterando Componente tras Componente en el siguiente pull según este mismo documento._
