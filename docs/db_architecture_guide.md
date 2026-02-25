# Guía Arquitectónica del Backend y Base de Datos (Fase 1)

## Contexto de la Arquitectura E-commerce (DentalMarket)

Esta plataforma está configurada como un Marketplace multivendedor. Debido a esto, la seguridad financiera es crítica y no debe confiar en el frontend del cliente.

### Tecnologías Implicadas

- **Frontend**: React alojado en **Vercel**
- **Backend**: Node.js + Express alojado en **Render**
- **Base de Datos & Auth**: **Supabase** (PostgreSQL)

---

## 1. Diseño Seguro Financiero (Wallets & Transacciones)

Las tablas `store_wallets` y `wallet_transactions` son el corazón del sistema contable para los vendedores, manteniendo registro de los fondos bloqueados en _Escrow_ y los fondos liberados para retirar.

### Restricción Absoluta del Frontend

Haciendo uso de **Row Level Security (RLS)**:

1. Las tiendas únicamente poseen permisos de `SELECT` (lectura) visualizando su propio `store_id`.
2. **Ningún usuario en la plataforma**, por más que sea administrador de una tienda, tiene permisos de _INSERT_, _UPDATE_ o _DELETE_ en las transacciones de las billeteras ni en los saldos directamente a través del cliente Web (API Rest default asumiendo token JWT del cliente).

### ¿Cómo opera el Backend en Render?

Dado que las actualizaciones de saldo (`store_wallets`) ocurren tras un evento de éxito de pago (vía Webhook) o una orden entregada (liberación Escrow), el backend Express en Render debe utilizar el `SERVICE_ROLE_KEY` de Supabase.

El `SERVICE_ROLE_KEY` se "salta" estructuralmente todas las reglas de RLS, por tanto, este servidor (y solo este servidor) será capaz de:

- Afectar el balance (restar de pending, sumar a available).
- Generar el _log_ inmutable dentro de `wallet_transactions`.

Asegúrese de guardar en las variables de entorno de Render:
`SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` (❌ ¡Nunca enviarla al Frontend!).

---

## 2. Trigger de Integración Automática (Auth -> Profiles)

Para eliminar la fricción, alivianar peticiones red y mitigar posibles des-sincronizaciones, la arquitectura utiliza Postgres Triggers:
`on_auth_user_created` se activa automáticamente en el motor de base de datos después de cada inserción exitosa sobre la tabla de sistema `auth.users`.

### Flujo de Registro

1. El Frontend envía a Supabase Auth el `email`, `password`, y un metadata (ej: `{"role": "store", "business_name": "DentTools C.A."}`).
2. Supabase crea al usuario.
3. El **Trigger SQL** captura el objeto de metadata de la inserción.
4. Mapea la referencia contra la tabla pre-cargada `roles`.
5. Si detecta `"role": "store"`, automáticamente creará la entrada correspondiente en `store_profiles` marcándolo con status `is_verified = false`. Además, inicializará el wallet base para este storeid en `store_wallets`.
6. Si detecta rol profesional (odontólogo), creará su perfil profesional asíncronamente en la base de PostgreSQL de forma blindada, antes inclusive de que la respuesta HTTP del registro devuelva _Success_ al cliente.

---

## 3. Manejo de Storage

Se asumen tres _Buckets_:

- **products** (Público): El CDN de la portada y tienda.
- **proofs** (Privado): Comprobantes de transacción (capturas de transferencias manuales, Zelles, etc). No indexados y accedidos bajo llaves prefirmadas en backend.
- **licenses** (Privado): Documentación sensible (diplomas universitarios, registros fiscales RIF) donde los administradores confirmarán a los doctores o empresas. Solo validaciones en backend.
