-- Add full_name column to public.users if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'users' 
                   AND column_name = 'full_name') THEN
        ALTER TABLE public.users ADD COLUMN full_name TEXT;
    END IF;
END $$;

-- Update the trigger function to capture full_name from auth.users metadata during registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role_id)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    (SELECT id FROM public.roles WHERE name = COALESCE(new.raw_user_meta_data->>'role', 'buyer'))
  );
  RETURN new;
END;
$$;
