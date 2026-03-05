# Investigación de Arquitectura Backend y Plan de Implementación para el MVP Frontend

Este documento detalla todas las capacidades técnicas existentes implementadas en tu servidor de Node.js (Backend) mediante Express y Supabase, desglosando posteriormente las **fases exactas paso a paso** para conectar magistralmente dichas capacidades en tu nuevo Frontend MVP Vite+React.

---

## 1. Mapeo de Capacidades del Backend

El backend se encuentra dividido perfectamente en 7 módulos especializados. A continuación, te resumo de manera digerida el poder que ya tienes programado y operando en tu servidor de Render:

1. **Gestión de Sesiones (Auth Middleware)**
   - Tu backend protege las rutas automáticamente utilizando el JWT (JSON Web Token) proveniente de Supabase. Posee guardianes (`roleMiddleware.js`) para limitar acciones basado en si el usuario es `user`, `store`, u `owner`.
2. **Products & Inventory (`productRoutes.js`)**
   - Consulta pública de catálogo.
   - Creación de un producto asignando sus "Variation" iniciales (Ej. Talla/Sabor). Ya incluye la inyección del `store_id` automáticamente mediante el token del creador.
   - **Carga Masiva (Bulk Import):** Poderosísimo módulo que procesa archivos CSV completos para subir 1000 productos a la vez de un plumazo.

3. **Cesta y Escrow (Checkouts) (`orderRoutes.js`)**
   - Recibe la orden de compra y aplica el complejo sistema de _Escrow_.
   - Lee la tasa actual oficial del Dólar BCV guardada, congela la tasa de cambio en la factura de la orden (para seguridad contable en bolívares) y le resta la comisión automática de la plataforma (`platform_fee`).
   - Marcar órdenes como enviadas, lo cual **descuenta el inventario automáticamente** utilizando desencadenadores (Triggers) internos de la base de datos PostgreSQL.

4. **Billetera Electrónica / Wallets (`walletRoutes.js`)**
   - Permite a las tiendas (`store`) consultar inmediatamente la diferencia entre su **Saldo Disponible** vs **Saldo Pendiente** (el dinero de las órdenes que aún no han sido marcadas como entregadas).
   - Sistema de "Retiros" (`payout requests`) para que la tienda exija que sus ganancias se transfieran a su banco.

5. **Configuración Central (`settingsRoutes.js`)**
   - Panel exclusivo para dueños (`owner`) que permite editar o sobre-escribir la tasa de cambio actual autorizada del BCV que el sitio entero utilizará de allí en adelante.

6. **Lista de Deseos / Favoritos (`wishlistRoutes.js`)**
   - Agrega, chequea o elimina productos guardados por un cliente para consulta de seguimiento.

7. **Acreditación Profesional (`professionalRoutes.js`)**
   - Subida local de documentos (licencias médicas) almacenados en `buckets` exclusivos de Supabase.
   - Administradores pueden revisar, aceptar o rechazar solicitudes para convertir a ciertos compradores en perfiles Profesionales avalados.

---

## 2. Plan Maestro de Implementación para el MVP Frontend

Para que este MVP esté completamente conectado y operativo en el menor tiempo posible, te sugiero dividamos las iteraciones en el siguiente orden estricto de **5 Fases**. Actualmente la **Fase 0** ya está completa (Autenticación Google/Local y vista básica de Cart).

### Fase 1: Sellado Operativo del Carrito (Checkouts Inmediatos)

- **Objetivo:** Lograr la validación de punta-a-punta de la primera venta de un producto.
- **Pasos:**
  1. Integrar formalmente la petición POST en la pantalla del Checkout llamando a `/api/orders` enviando la estructura del JSON solicitada (`product_id`, `variation_id`, `unit_price`, `quantity`, `store_id`).
  2. Redirigir al usuario al recién creado `Account.jsx` donde se renderizará su historial de compras consumiendo el endpoint GET `/api/orders`.

### Fase 2: El Panel de Vendedor (`Store Dashboard`)

- **Objetivo:** Que las tiendas puedan gestionar su vitrina autónomamente.
- **Pasos:**
  1. Crear un layout protegido (`StoreLayout`) verificando mediante el `AuthContext` si el usuario tiene rol `store`.
  2. Construir la pantalla **"Mis Productos"** donde la tienda ve su galería de ítems actual (usando GET `/api/products` con el filtro interno de su ID).
  3. Formulario para creación unitaria (POST `/api/products`).
  4. Botón táctico de "Importar desde CSV" consumiendo el poderoso endpoint de `/api/products/bulk-import`.

### Fase 3: Portal Financiero de Cierre (`Wallet & Escrows`)

- **Objetivo:** Transparencia monetaria del negocio.
- **Pasos:**
  1. Construir dentro del Dashboard de Tienda la pestaña **"Finanzas / Billetera"**.
  2. Implementar tarjetas que muestren "Disponible" y "En Espera" jalando datos de `GET /api/store/wallet`.
  3. Configurar la tabla de "Mis Órdenes Recibidas", con un botón interactivo "Marcar Enviado" (ejecutando `PUT /api/orders/:id/ship` para transferir fondos de 'En Espera' a 'Disponible').
  4. Formulario de "Solicitar Retiro" a cuenta bancaria (`POST /api/store/payout`).

### Fase 4: Modulo Administrativo Top Level (`Admin Dashboard`)

- **Objetivo:** Panel de control máximo para gobernanza sobre el Market de todos.
- **Pasos:**
  1. Construir ruta superior para el usuario dueño / `owner`.
  2. Visualizador Global Central: Casilla simple para actualizar manualmente el **Indicador BCV Cambiario Oficial** (`PUT /api/admin/settings/bcv-rate`).
  3. Visualizador de la cola de acreditaciones de **Licencias Profesionales** que esperan ser aprobadas/denegadas.

### Fase 5: Acabados Estéticos de E-Commerce Moderno (Wishlists)

- **Objetivo:** Subir de Nivel UX.
- **Pasos:**
  1. Colocar el Icono del tradicional Corazón sobre los Box Arts de `ProductCard.jsx`.
  2. Ligar el estado reactivo del corazón a las operaciones de la Base de datos mediante la ruta del Wishlist de la API.

---

**NOTA:** Esta hoja de ruta es secuencial. Al estar basada al 100% sobre tecnología que ya escribiste en el backend, nuestra ejecución en el frontend va a ser puramente el diseño con Tailwind (pintar) y Axios (agarrar y pegar).
