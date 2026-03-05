# DentalMarket MVP

Plataforma de E-Commerce B2B para insumos odontológicos, construida con React (Vite) en el Frontend y Node.js/Supabase en el Backend.

## Estructura de Fases

### Fase 1.1 y 1.2: Catálogo y Carrito Básico

- Autenticación manejada por Supabase (Login, Registro).
- Renderizado de Catálogo de Productos y Vista Detallada (`ProductContext`).
- Sistema Robusto de Carrito de Compras en Base de Datos (`CartContext`) con optimizaciones de Interfaz de Usuario Optimista.

### Fase 1.3: Checkout y Creación de Órdenes (Escrow)

Se implementó un flujo de Checkout seguro, diseñado bajo un esquema Escrow manual donde el dinero entra mediante métodos verificables (Transferencia, Pago Móvil, Zelle) antes de despachar la mercancía.

#### Características Clave del Flujo de Checkout

1. **Rutas Protegidas (`ProtectedRoute.jsx`)**: El cajero (`/checkout`) exige estar autenticado. Si el usuario pierde sesión, se le redirige a login preservando su intención de compra mediante query params (`?redirect=/checkout`).
2. **Contexto de Órdenes (`OrderContext.jsx`)**: Despacha la creación atómica de órdenes (`POST /api/orders`) y maneja la subida de comprobantes (`POST /api/orders/:id/payment-proof`). Incluye funciones exclusivas para Administradores.
3. **Formulario Modular (`CheckoutForm.jsx`)**:
   - Solicita y valida estrictamente Tlf (formato Venezolano) y Dirección.
   - Selector dinámico de Métodos de Pago (`PaymentMethodSelector.jsx`).
   - Muestra instantáneamente los datos bancarios a transar (`PaymentInstructions.jsx`).
4. **Carga de Comprobantes (`PaymentProofUploader.jsx`)**: Input de subida de archivos restringido a `5MB` (Imágenes y PDFs), con pre-visualización in-line gracias al `FileReader` de JS.
5. **Autolimpieza**: Al crear una orden exitosa, el sistema vacía automáticamente el Carrito (`DELETE /api/cart`) tanto localmente como en la base de datos de Render.
6. **Panel Administrativo (`/admin/payment-approvals`)**: Vista EXCLUSIVA para roles `admin` u `owner`.
   - Lee métricas y órdenes atascadas en `pending_approval`.
   - Incorpora tabla visual (`PaymentApprovalQueue.jsx`).
   - Visor de recibos integrado (`PaymentProofViewer.jsx`).
   - Cierres de ciclo (`approvePayment` y `rejectPayment`).

### Endpoints Oficiales (Render API Backend)

- `GET /api/orders`
- `POST /api/orders`
- `GET /api/orders/:id`
- `POST /api/orders/:id/payment-proof`
- `PUT /api/admin/orders/:id/approve-payment` (Requiere Rol Admin)
- `PUT /api/admin/orders/:id/reject-payment` (Requiere Rol Admin)

## Scripts Disponibles

- `npm run dev`: Inicia el servidor de desarrollo Vite.
- `npm run build`: Compila la app para producción.
