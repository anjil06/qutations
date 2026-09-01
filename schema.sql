-- =========================================================
-- QuoteNest - Complete Supabase Database Schema
-- Copy and run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql
-- =========================================================

-- 1. Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    company_name TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    pincode TEXT,
    gstin TEXT,
    website TEXT,
    tagline TEXT,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create quotations table
CREATE TABLE IF NOT EXISTS public.quotations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    quotation_number TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    company_name TEXT,
    email TEXT,
    phone TEXT,
    quotation_date DATE DEFAULT CURRENT_DATE,
    valid_until DATE,
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0,
    gst NUMERIC(12, 2) NOT NULL DEFAULT 0,
    total NUMERIC(12, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create quotation_items table
CREATE TABLE IF NOT EXISTS public.quotation_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    quotation_id UUID REFERENCES public.quotations(id) ON DELETE CASCADE NOT NULL,
    product_name TEXT NOT NULL,
    quantity NUMERIC(10, 2) NOT NULL DEFAULT 1,
    unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
    discount NUMERIC(5, 2) NOT NULL DEFAULT 0,
    amount NUMERIC(12, 2) NOT NULL DEFAULT 0
);

-- 4. Enable Row Level Security (RLS) on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotation_items ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for profiles (Allow users full management of their own row)
DROP POLICY IF EXISTS "Users can manage their own profile" ON public.profiles;
CREATE POLICY "Users can manage their own profile"
    ON public.profiles FOR ALL
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- 6. RLS Policies for quotations
DROP POLICY IF EXISTS "Users can manage their own quotations" ON public.quotations;
CREATE POLICY "Users can manage their own quotations"
    ON public.quotations FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 7. RLS Policies for quotation_items
DROP POLICY IF EXISTS "Users can manage their own quotation items" ON public.quotation_items;
CREATE POLICY "Users can manage their own quotation items"
    ON public.quotation_items FOR ALL
    USING (
        quotation_id IN (
            SELECT id FROM public.quotations WHERE user_id = auth.uid()
        )
    )
    WITH CHECK (
        quotation_id IN (
            SELECT id FROM public.quotations WHERE user_id = auth.uid()
        )
    );
