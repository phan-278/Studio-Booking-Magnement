-- Supabase Schema Migration v3
-- Run this in Supabase SQL Editor

-- ==========================================
-- 1. EXTENSIONS
-- ==========================================
-- Bật extension pgcrypto để sinh UUID
CREATE EXTENSION IF NOT EXISTS pgcrypto;
-- Bật extension btree_gist để dùng EXCLUDE USING gist với UUID và Range
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- ==========================================
-- 2. ENUMS
-- ==========================================
-- Tạo enum cho role
CREATE TYPE user_role AS ENUM ('customer', 'admin');
-- Tạo enum cho status master data (studios, equipments)
CREATE TYPE master_status AS ENUM ('active', 'inactive');
-- Tạo enum cho loại studio
CREATE TYPE studio_type AS ENUM ('zone', 'full');
-- Tạo enum cho mã studio
CREATE TYPE studio_code AS ENUM ('O', 'C', 'FULL');
-- Tạo enum cho trạng thái booking
CREATE TYPE booking_status AS ENUM ('pending_payment', 'confirmed', 'completed', 'cancelled', 'no_show');
-- Tạo enum cho trạng thái thanh toán (v3)
CREATE TYPE payment_status AS ENUM ('unpaid', 'deposit_paid', 'fully_paid', 'forfeited');
-- Tạo enum cho phương thức thanh toán còn lại
CREATE TYPE payment_method AS ENUM ('cash', 'transfer');
-- Tạo enum cho lý do hủy
CREATE TYPE cancellation_reason_type AS ENUM ('user_cancelled', 'no_show', 'studio_fault', 'system_timeout');

-- ==========================================
-- 3. TABLES
-- ==========================================

-- Bảng profiles (Liên kết 1-1 với auth.users của Supabase)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    phone TEXT,
    role user_role DEFAULT 'customer',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Bảng studios
CREATE TABLE IF NOT EXISTS public.studios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code studio_code UNIQUE NOT NULL,
    type studio_type NOT NULL,
    price_per_hour NUMERIC NOT NULL CHECK (price_per_hour >= 0),
    capacity INT,
    description TEXT,
    images JSONB,
    status master_status DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Bảng equipments
CREATE TABLE IF NOT EXISTS public.equipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    total_quantity INT NOT NULL CHECK (total_quantity >= 0),
    price NUMERIC NOT NULL CHECK (price >= 0),
    status master_status DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Bảng bookings
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_code TEXT UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES public.profiles(id),
    studio_id UUID NOT NULL REFERENCES public.studios(id),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status booking_status DEFAULT 'pending_payment',
    payment_status payment_status DEFAULT 'unpaid',
    payment_proof_submitted BOOLEAN DEFAULT false,
    payment_claimed_at TIMESTAMPTZ,
    awaiting_manual_review BOOLEAN DEFAULT false,
    studio_price NUMERIC NOT NULL CHECK (studio_price >= 0),
    equipment_price NUMERIC NOT NULL CHECK (equipment_price >= 0),
    total_price NUMERIC NOT NULL CHECK (total_price >= 0),
    deposit_amount NUMERIC NOT NULL CHECK (deposit_amount >= 0),
    remaining_amount NUMERIC NOT NULL CHECK (remaining_amount >= 0),
    deposit_deadline TIMESTAMPTZ NOT NULL,
    checked_in_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    remaining_payment_method payment_method,
    cancelled_reason TEXT,
    cancelled_by TEXT, -- Lưu user_id, admin_id, hoặc 'system'
    cancellation_reason cancellation_reason_type,
    verified_by UUID REFERENCES public.profiles(id),
    verified_at TIMESTAMPTZ,
    qr_code_data TEXT,
    reject_reason TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Constraint chống overlap trực tiếp trên bảng bookings (Lớp bảo vệ cuối)
-- Chỉ áp dụng khi status không phải là cancelled, no_show, completed
ALTER TABLE public.bookings
ADD CONSTRAINT exclude_overlapping_bookings
EXCLUDE USING gist (
    studio_id WITH =, 
    tsrange(start_time, end_time) WITH &&
)
WHERE (status IN ('pending_payment', 'confirmed'));

-- Bảng booking_equipments
CREATE TABLE IF NOT EXISTS public.booking_equipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    equipment_id UUID NOT NULL REFERENCES public.equipments(id),
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC NOT NULL CHECK (unit_price >= 0)
);

-- Bảng payment_logs
CREATE TABLE IF NOT EXISTS public.payment_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    from_status TEXT,
    to_status TEXT,
    amount NUMERIC,
    changed_by TEXT, -- Lưu user_id, admin_id, hoặc 'system'
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Bảng monthly_reports (v4)
CREATE TABLE IF NOT EXISTS public.monthly_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    year INT NOT NULL,
    month INT NOT NULL,
    gross_revenue NUMERIC DEFAULT 0,
    studio_revenue NUMERIC DEFAULT 0,
    equipment_revenue NUMERIC DEFAULT 0,
    forfeited_amount NUMERIC DEFAULT 0, 
    total_bookings_completed INT DEFAULT 0,
    forfeited_count INT DEFAULT 0,
    no_show_count INT DEFAULT 0,
    cancelled_after_deposit_count INT DEFAULT 0,
    cancelled_before_deposit_count INT DEFAULT 0,
    on_hold_count INT DEFAULT 0,
    is_finalized BOOLEAN DEFAULT false,
    generated_at TIMESTAMPTZ,
    generated_by UUID REFERENCES public.profiles(id),
    UNIQUE (year, month)
);

-- ==========================================
-- 4. TRIGGERS (Auto update updated_at)
-- ==========================================

CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_studios_modtime
BEFORE UPDATE ON public.studios
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_equipments_modtime
BEFORE UPDATE ON public.equipments
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_bookings_modtime
BEFORE UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- Trigger tự động tạo profile khi user đăng ký qua Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', 'customer');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- 5. RLS (Row Level Security)
-- ==========================================
-- Vì backend dùng Service Role Key, ta có thể bỏ qua RLS hoặc bật RLS nhưng backend vẫn vượt qua được.
-- Khuyến nghị bật RLS để chặn truy cập trực tiếp từ anon/authenticated client (nếu app không gọi trực tiếp API Supabase).
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.studios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_equipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_reports ENABLE ROW LEVEL SECURITY;

-- Tạo policy cho phép Service Role Key được bypass RLS (Supabase tự động cho phép Service Role).
-- Khách hàng không thể query trực tiếp.
