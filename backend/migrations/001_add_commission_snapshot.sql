ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS commission_rate_at_purchase DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS commission_amount_usd DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS commission_amount_ves DECIMAL(12,2) DEFAULT 0;

-- Comentario: Estos campos capturan la comisión en el momento de la compra
-- y no deben modificarse después, incluso si la comisión global cambia.

CREATE INDEX IF NOT EXISTS idx_orders_commission ON orders(commission_rate_at_purchase);
