-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('principal', 'hod', 'faculty', 'lab_assistant');

-- Create departments table
CREATE TABLE public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  avatar TEXT,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create function to get user's primary role (highest privilege)
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS public.app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  ORDER BY CASE role
    WHEN 'principal' THEN 1
    WHEN 'hod' THEN 2
    WHEN 'faculty' THEN 3
    WHEN 'lab_assistant' THEN 4
  END
  LIMIT 1
$$;

-- Create labs table
CREATE TABLE public.labs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  lab_code TEXT NOT NULL UNIQUE,
  block TEXT NOT NULL,
  hall_no TEXT NOT NULL,
  floor TEXT,
  capacity INTEGER,
  department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
  in_charge_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.labs ENABLE ROW LEVEL SECURITY;

-- Create equipment table
CREATE TABLE public.equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  make TEXT NOT NULL,
  serial_no TEXT NOT NULL,
  model_no TEXT,
  purchase_date DATE NOT NULL,
  cost DECIMAL(12,2) NOT NULL,
  funding_source TEXT NOT NULL,
  stock_page_no TEXT NOT NULL,
  stock_serial_no TEXT NOT NULL,
  block TEXT NOT NULL,
  hall_no TEXT NOT NULL,
  physical_presence BOOLEAN NOT NULL DEFAULT true,
  working_status TEXT NOT NULL CHECK (working_status IN ('WORKING', 'NOT_WORKING', 'REPAIRABLE', 'TO_BE_SCRAPPED')),
  remarks TEXT,
  lab_id UUID NOT NULL REFERENCES public.labs(id) ON DELETE CASCADE,
  faculty_in_charge_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;

-- Create verifications table
CREATE TABLE public.verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id UUID NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE,
  verified_by_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  status TEXT NOT NULL CHECK (status IN ('VERIFIED', 'PENDING', 'MISSING', 'DAMAGED')),
  physical_presence BOOLEAN NOT NULL,
  working_status TEXT NOT NULL CHECK (working_status IN ('WORKING', 'NOT_WORKING', 'REPAIRABLE', 'TO_BE_SCRAPPED')),
  remarks TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  verified_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.verifications ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX idx_profiles_department ON public.profiles(department_id);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_labs_department ON public.labs(department_id);
CREATE INDEX idx_labs_in_charge ON public.labs(in_charge_id);
CREATE INDEX idx_equipment_lab ON public.equipment(lab_id);
CREATE INDEX idx_equipment_faculty ON public.equipment(faculty_in_charge_id);
CREATE INDEX idx_equipment_qr_code ON public.equipment(qr_code);
CREATE INDEX idx_verifications_equipment ON public.verifications(equipment_id);
CREATE INDEX idx_verifications_verified_by ON public.verifications(verified_by_id);

-- RLS Policies for departments
CREATE POLICY "Everyone can view departments"
  ON public.departments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only principals and HODs can manage departments"
  ON public.departments FOR ALL
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'principal') OR 
    public.has_role(auth.uid(), 'hod')
  );

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Only principals can manage all profiles"
  ON public.profiles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'principal'));

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Only principals can manage user roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'principal'));

-- RLS Policies for labs
CREATE POLICY "Everyone can view labs"
  ON public.labs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Principals and HODs can manage labs"
  ON public.labs FOR ALL
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'principal') OR 
    public.has_role(auth.uid(), 'hod')
  );

-- RLS Policies for equipment
CREATE POLICY "Everyone can view equipment"
  ON public.equipment FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Principals and HODs can add equipment"
  ON public.equipment FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'principal') OR 
    public.has_role(auth.uid(), 'hod')
  );

CREATE POLICY "Principals and HODs can update equipment"
  ON public.equipment FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'principal') OR 
    public.has_role(auth.uid(), 'hod')
  );

CREATE POLICY "Only principals can delete equipment"
  ON public.equipment FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'principal'));

-- RLS Policies for verifications
CREATE POLICY "Everyone can view verifications"
  ON public.verifications FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Faculty and lab assistants can create verifications"
  ON public.verifications FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'principal') OR
    public.has_role(auth.uid(), 'hod') OR
    public.has_role(auth.uid(), 'faculty') OR
    public.has_role(auth.uid(), 'lab_assistant')
  );

-- Create trigger function for updating updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_departments_updated_at
  BEFORE UPDATE ON public.departments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_labs_updated_at
  BEFORE UPDATE ON public.labs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_equipment_updated_at
  BEFORE UPDATE ON public.equipment
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();