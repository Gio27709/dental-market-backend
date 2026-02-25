-- =========================================================================================
-- PROYECTO: DENTALMARKET - FASE 1.1 REFINAMIENTOS ARQUITECTÓNICOS
-- =========================================================================================

BEGIN;

-- 1. CREACIÓN DE LA TABLA `product_variations` 
-- -----------------------------------------------------------------------------------------
-- Asegurar que la tabla existe usando el esquema anterior
CREATE TABLE IF NOT EXISTS public.product_variations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    attribute_name TEXT NOT NULL, 
    value TEXT NOT NULL, 
    stock INTEGER DEFAULT 0,
    sku_modifier TEXT
);

-- Renombrar las columnas para que hagan match a los requerimientos V1.1
ALTER TABLE public.product_variations 
  RENAME COLUMN value TO attribute_value;

ALTER TABLE public.product_variations 
  RENAME COLUMN sku_modifier TO sku;

ALTER TABLE public.product_variations
  ADD COLUMN IF NOT EXISTS price_modifier NUMERIC(10,2) DEFAULT 0.00;

-- Asegurar permisos RLS congruentes con la tabla padre products
ALTER TABLE public.product_variations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Active Products Variations" ON public.product_variations 
    FOR SELECT USING (EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND p.is_active = true AND p.moderation_status = 'approved'));

CREATE POLICY "Store Manage Own Variations" ON public.product_variations 
    FOR ALL USING (EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND p.store_id = auth.uid()));

-- Migrar stock histórico a una variación Default antes de eliminar la columna en products
INSERT INTO public.product_variations (product_id, attribute_name, attribute_value, stock, sku)
SELECT id, 'Variante', 'Única', stock, id::text
FROM public.products
ON CONFLICT DO NOTHING;

-- Eliminar columna stock original de products para consolidar el origen de datos
ALTER TABLE public.products DROP COLUMN IF EXISTS stock;


-- 2. AUDITORÍA CAMBIARIA EN `orders`
-- -----------------------------------------------------------------------------------------
ALTER TABLE public.orders 
    ADD COLUMN IF NOT EXISTS exchange_rate_at_purchase NUMERIC(10,4),
    ADD COLUMN IF NOT EXISTS total_ves NUMERIC(12,2),
    ADD COLUMN IF NOT EXISTS total_usd NUMERIC(12,2);

-- Migrar datos de `total` original a `total_usd` si ya existe data, y fijar VES asumiendo tasa dummy de 45.12 si no existiera
UPDATE public.orders SET 
    total_usd = total,
    exchange_rate_at_purchase = 45.12,
    total_ves = total * 45.12
WHERE total_usd IS NULL;


-- 3. SUB-PEDIDOS MULTI-SELLER (LÓGICA LOGÍSTICA EN `order_items`)
-- -----------------------------------------------------------------------------------------
ALTER TABLE public.order_items
    ADD COLUMN IF NOT EXISTS delivery_status TEXT DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
    ADD COLUMN IF NOT EXISTS tracking_code TEXT,
    ADD COLUMN IF NOT EXISTS shipping_carrier TEXT;


-- 4. TRIGGER `decrement_stock_on_order` (VINCULADO A VARIATIONS)
-- -----------------------------------------------------------------------------------------
-- Al estar basado en variaciones, la tabla de order_items necesita apuntar a la variación adquirida
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS variation_id UUID REFERENCES public.product_variations(id) ON DELETE SET NULL;

-- Asignar la variación default para los order_items históricos existentes (No Data Loss)
UPDATE public.order_items oi
SET variation_id = pv.id
FROM public.product_variations pv
WHERE oi.product_id = pv.product_id AND pv.attribute_name = 'Variante' AND pv.attribute_value = 'Única'
AND oi.variation_id IS NULL;

-- Función PL/pgSQL
CREATE OR REPLACE FUNCTION public.decrement_stock_on_order()
RETURNS TRIGGER AS $$
DECLARE
    current_stock INTEGER;
BEGIN
    -- Ejecutar solo si el estado logístico pasa de pending a shipped o confirmed
    IF (NEW.delivery_status IN ('confirmed', 'shipped') AND OLD.delivery_status = 'pending') THEN
        
        -- Verificar que la variación exista (Safety Guard)
        IF NEW.variation_id IS NULL THEN
             RAISE EXCEPTION 'Item de orden no detecta ID de variación para deducir stock';
        END IF;

        -- Obtener el stock actual bloqueando el row (FOR UPDATE) para prevenir "Race Conditions" en compras simultáneas
        SELECT stock INTO current_stock FROM public.product_variations WHERE id = NEW.variation_id FOR UPDATE;

        IF current_stock < NEW.quantity THEN
            RAISE EXCEPTION 'Stock insuficiente para la variación (solicitado: %, disponible: %)', NEW.quantity, current_stock;
        END IF;

        -- Deducir el stock atómicamente
        UPDATE public.product_variations
        SET stock = stock - NEW.quantity,
            updated_at = NOW()
        WHERE id = NEW.variation_id;

    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Anclar el trigger a order_items
DROP TRIGGER IF EXISTS trg_decrement_stock ON public.order_items;
CREATE TRIGGER trg_decrement_stock
    AFTER UPDATE OF delivery_status ON public.order_items
    FOR EACH ROW EXECUTE PROCEDURE public.decrement_stock_on_order();

COMMIT;
