-- ==========================================
-- Fase 1.3 Fix: Campos de Checkout en Orders
-- ==========================================
-- Este script agrega las columnas necesarias para persistir
-- los datos del formulario de checkout (dirección, teléfono, método de pago, notas)
-- y corrige el CHECK constraint de payment_status que no contemplaba los estados del flujo Escrow.

BEGIN;

-- 1. Agregar columnas de datos de envío y contacto
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS shipping_address TEXT,
  ADD COLUMN IF NOT EXISTS contact_phone TEXT,
  ADD COLUMN IF NOT EXISTS payment_method TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- 2. Agregar columna para la URL del comprobante de pago (usada por uploadPaymentProof)
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_proof_url TEXT;

-- 3. Corregir el CHECK constraint de payment_status
--    El constraint original solo permite: 'pending', 'paid', 'failed', 'refunded'
--    Pero el flujo Escrow necesita también: 'under_review', 'approved', 'rejected'
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_payment_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_payment_status_check
  CHECK (payment_status IN ('pending', 'under_review', 'approved', 'rejected', 'paid', 'failed', 'refunded'));

COMMIT;
