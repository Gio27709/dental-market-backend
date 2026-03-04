-- ==========================================
-- Fase 1.3: Sistema de Carrito en Base de Datos
-- ==========================================

DROP TABLE IF EXISTS public.cart_items CASCADE;
DROP TABLE IF EXISTS public.carts CASCADE;

-- 1. Tabla: Carts (Una por usuario autenticado)
CREATE TABLE IF NOT EXISTS public.carts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabla: Cart Items (Los productos dentro del carrito)
CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cart_id UUID REFERENCES public.carts(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    variation_id UUID REFERENCES public.product_variations(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Restricción para no duplicar el mismo producto+variación en el mismo carrito.
-- Postgres considera NULL != NULL de forma nativa en UNIQUE, así que usamos un COALESCE en el íntex.
CREATE UNIQUE INDEX IF NOT EXISTS cart_items_unique_idx ON public.cart_items 
(cart_id, product_id, (COALESCE(variation_id, '00000000-0000-0000-0000-000000000000'::uuid)));

-- 3. Habilitar Seguridad a Nivel de Fila (RLS)
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- 4. Políticas para Carts
CREATE POLICY "Users can view their own cart"
ON public.carts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cart"
ON public.carts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cart"
ON public.carts FOR UPDATE
USING (auth.uid() = user_id);

-- 5. Políticas para Cart Items
CREATE POLICY "Users can view their own cart items"
ON public.cart_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.carts 
    WHERE carts.id = cart_items.cart_id 
    AND carts.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their own cart items"
ON public.cart_items FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.carts 
    WHERE carts.id = cart_id 
    AND carts.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own cart items"
ON public.cart_items FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.carts 
    WHERE carts.id = cart_items.cart_id 
    AND carts.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own cart items"
ON public.cart_items FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.carts 
    WHERE carts.id = cart_items.cart_id 
    AND carts.user_id = auth.uid()
  )
);

-- Note: Our Backend API uses Service Role to bypass these if needed, 
-- but having strict RLS protects the DB from direct Anon accesses.
