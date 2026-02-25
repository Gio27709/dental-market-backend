-- =========================================================================================
-- PROYECTO: DENTALMARKET - FASE 1 BASE DE DATOS Y AUTENTICACIÓN
-- =========================================================================================

-- Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================================================================
-- 1. TABLAS CORE Y PERFILES
-- =========================================================================================

-- Tabla de Roles
CREATE TABLE public.roles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    permissions JSONB DEFAULT '{}'::jsonb
);

-- Insertar roles básicos
INSERT INTO public.roles (name, permissions) VALUES 
('owner', '{"all": true}'),
('admin', '{"manage_users": true, "manage_stores": true, "manage_catalog": true}'),
('store', '{"manage_own_products": true, "manage_own_orders": true}'),
('professional', '{"buy_products": true, "view_special_content": true}'),
('buyer', '{"buy_products": true}')
ON CONFLICT (name) DO NOTHING;

-- Extensión de la tabla de usuarios auth.users
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role_id UUID REFERENCES public.roles(id) ON DELETE SET NULL,
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Perfiles de Tienda (Vendedores)
CREATE TABLE public.store_profiles (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    rif TEXT UNIQUE,
    rating_avg NUMERIC(3,2) DEFAULT 0.0,
    is_verified BOOLEAN DEFAULT false,
    verification_docs JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Perfiles de Profesionales (Odontólogos)
CREATE TABLE public.professional_profiles (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    license_number TEXT UNIQUE,
    specialty TEXT,
    is_verified BOOLEAN DEFAULT false,
    verification_docs JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================================================
-- 2. MARKETPLACE & COMPRAS
-- =========================================================================================

-- Tabla de Productos
CREATE TABLE public.products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    store_id UUID REFERENCES public.store_profiles(user_id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(12,2) NOT NULL, -- Siempre en USD
    stock INTEGER DEFAULT 0,
    images JSONB DEFAULT '[]'::jsonb,
    moderation_status TEXT DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'rejected')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Órdenes (Cabecera)
CREATE TABLE public.orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    total NUMERIC(12,2) NOT NULL, -- Total en USD
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    order_status TEXT DEFAULT 'pending' CHECK (order_status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
    escrow_status TEXT DEFAULT 'held' CHECK (escrow_status IN ('held', 'released', 'refunded')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ítems de la Orden (Detalle por Tienda)
CREATE TABLE public.order_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    store_id UUID REFERENCES public.store_profiles(user_id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================================================
-- 3. SISTEMA FINANCIERO PROTEGIDO (Sólo manipulable vía Backend/Service Role)
-- =========================================================================================

-- Wallets de Tienda
CREATE TABLE public.store_wallets (
    store_id UUID PRIMARY KEY REFERENCES public.store_profiles(user_id) ON DELETE CASCADE,
    balance_available NUMERIC(12,2) DEFAULT 0.0,
    balance_pending NUMERIC(12,2) DEFAULT 0.0,
    currency TEXT DEFAULT 'USD',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL -- Para auditoría
);

-- Transacciones de la Wallet (Historial Inmutable)
CREATE TABLE public.wallet_transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    store_id UUID REFERENCES public.store_profiles(user_id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('credit', 'debit', 'payout', 'escrow_release', 'fee')),
    amount NUMERIC(12,2) NOT NULL,
    reference_order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL -- Auditoría
);

-- Solicitudes de Retiro (Payouts)
CREATE TABLE public.payout_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    store_id UUID REFERENCES public.store_profiles(user_id) ON DELETE CASCADE NOT NULL,
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    method TEXT NOT NULL, -- ej. 'zelle', 'tarjeta_nacional', 'pago_movil'
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    processed_by UUID REFERENCES public.users(id) ON DELETE SET NULL
);

-- Configuración Global
CREATE TABLE public.global_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL
);
-- Inicializar tasa BCV y comisiones
INSERT INTO public.global_settings (key, value) VALUES 
('bcv_rate', '{"rate": 45.12, "currency_from": "USD", "currency_to": "VES"}'::jsonb),
('commission_percent', '{"dental": 5.0, "default": 10.0}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Notificaciones
CREATE TABLE public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    link_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================================================
-- 4. TRIGGERS AUTORREFERENCIALES (AUTH -> PUBLIC)
-- =========================================================================================

-- Función para manejar nuevos usuarios y crear la fila en users, store_profiles o professional_profiles
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
DECLARE
    role_record RECORD;
    assigned_role_id UUID;
    user_role_name TEXT;
BEGIN
    -- Obtener el nombre del rol desde la metadata (o 'buyer' por defecto)
    user_role_name := COALESCE(NEW.raw_user_meta_data->>'role', 'buyer');
    
    -- Encontrar el ID del rol
    SELECT id INTO assigned_role_id FROM public.roles WHERE name = user_role_name;
    
    -- Insertar en public.users
    INSERT INTO public.users (id, email, role_id, is_active, is_verified)
    VALUES (NEW.id, NEW.email, assigned_role_id, true, false);
    
    -- Insertar perfiles extendidos si aplica
    IF (user_role_name = 'store') THEN
        INSERT INTO public.store_profiles (user_id, business_name, is_verified)
        VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'business_name', 'Nueva Tienda'), false);
        
        -- Inicializar wallet vacía para la tienda
        INSERT INTO public.store_wallets (store_id, balance_available, balance_pending)
        VALUES (NEW.id, 0.0, 0.0);
        
    ELSIF (user_role_name = 'professional' OR user_role_name = 'dentist') THEN
        INSERT INTO public.professional_profiles (user_id, specialty, is_verified)
        VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'specialty', 'Odontología General'), false);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger anclado a auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- =========================================================================================
-- 5. ROW LEVEL SECURITY (RLS) - PROTECCIÓN CRÍTICA
-- =========================================================================================

-- Activación RLS en todas las tablas
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------------------
-- Políticas de Lectura Pública (Catálogo)
-- -----------------------------------------------------------------------------------------
CREATE POLICY "Public Read Roles" ON public.roles FOR SELECT USING (true);
CREATE POLICY "Public Read Store Profiles" ON public.store_profiles FOR SELECT USING (true);
CREATE POLICY "Public Read Professional Profiles" ON public.professional_profiles FOR SELECT USING (true);
CREATE POLICY "Public Read Global Settings" ON public.global_settings FOR SELECT USING (true);

-- Productos: Lectura pública solo si están activos y aprobados
CREATE POLICY "Public Read Active Products" ON public.products FOR SELECT USING (is_active = true AND moderation_status = 'approved');

-- -----------------------------------------------------------------------------------------
-- Políticas de Usuario Propio
-- -----------------------------------------------------------------------------------------
CREATE POLICY "Users Read Own Record" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users Read Own Notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users Update Own Notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------------------
-- Políticas de Vendedor (Stores)
-- -----------------------------------------------------------------------------------------
-- Productos: Tiendas gestionan (Insert, Update, Delete) sus propios productos
CREATE POLICY "Store Manage Own Products" ON public.products FOR ALL USING (auth.uid() = store_id);

-- Órdenes: Usuarios ven sus compras, Tiendas ven compras hacia ellos (vía el backend, pero con RLS a nivel order_items se restringe)
CREATE POLICY "Users Read Own Orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Stores Read Orders Containing Their Items" ON public.order_items FOR SELECT USING (auth.uid() = store_id);

-- -----------------------------------------------------------------------------------------
-- SEGURIDAD FINANCIERA (BLOQUEO DE CLIENTE)
-- -----------------------------------------------------------------------------------------
-- Las transacciones financieras, wallets y solicitudes de pago están 100% bloqueadas para escritura desde el cliente.
-- Solo lectura para su propio ID en la billetera y estado del payout.
CREATE POLICY "Stores View Own Wallet" ON public.store_wallets FOR SELECT USING (auth.uid() = store_id);
CREATE POLICY "Stores View Own Txs" ON public.wallet_transactions FOR SELECT USING (auth.uid() = store_id);
CREATE POLICY "Stores View Own Payouts" ON public.payout_requests FOR SELECT USING (auth.uid() = store_id);
-- Insert de solicitudes de payout permitido solo a owner de la tienda
CREATE POLICY "Stores Insert Payout Request" ON public.payout_requests FOR INSERT WITH CHECK (auth.uid() = store_id);

-- IMPORTANTE:
-- No se otorgan permisos INSERT/UPDATE/DELETE sobre store_wallets ni wallet_transactions a usuarios (auth.uid).
-- El backend en Render con SERVICE_ROLE_KEY saltará el RLS para aplicar la lógica contable acoplada a Stripe/Pasarela de Pagos.

-- =========================================================================================
-- 6. CONFIGURACIÓN DE STORAGE & POLÍTICAS
-- =========================================================================================

-- Inserción de Buckets (Si se ejecuta como Superuser/Postgres en la GUI de Supabase)
INSERT INTO storage.buckets (id, name, public) VALUES 
('products', 'products', true),
('proofs', 'proofs', false),
('licenses', 'licenses', false)
ON CONFLICT (id) DO NOTHING;

-- Políticas de Storage para 'products'
-- (Para ejecutar esto correctamente desde CLI en `migration`, se asume acceso al schema storage)
CREATE POLICY "Public Read Products Images" ON storage.objects FOR SELECT USING (bucket_id = 'products');
CREATE POLICY "Stores Upload Product Images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'products' AND auth.role() = 'authenticated');
CREATE POLICY "Stores Update/Delete Product Images" ON storage.objects FOR UPDATE USING (bucket_id = 'products' AND auth.uid() = owner);
CREATE POLICY "Stores Delete Product Images" ON storage.objects FOR DELETE USING (bucket_id = 'products' AND auth.uid() = owner);
