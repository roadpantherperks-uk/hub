
-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins view all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Status enum
CREATE TYPE public.signup_status AS ENUM ('pending', 'approved', 'rejected');

-- Driver signups
CREATE TABLE public.driver_signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  driver_type TEXT NOT NULL,
  location TEXT NOT NULL,
  verification_file_url TEXT,
  status signup_status NOT NULL DEFAULT 'pending',
  admin_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.driver_signups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit signup" ON public.driver_signups FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins can view signups" ON public.driver_signups FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update signups" ON public.driver_signups FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete signups" ON public.driver_signups FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('verification', 'verification', false);

CREATE POLICY "Anyone can upload verification" ON storage.objects FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'verification');
CREATE POLICY "Admins can read verification" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'verification' AND public.has_role(auth.uid(), 'admin'));
