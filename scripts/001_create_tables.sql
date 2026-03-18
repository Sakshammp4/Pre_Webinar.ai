-- Create webinars table
CREATE TABLE IF NOT EXISTS public.webinars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  hashtags TEXT,
  shareable_slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create post_templates table
CREATE TABLE IF NOT EXISTS public.post_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webinar_id UUID NOT NULL REFERENCES public.webinars(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create attendee_submissions table
CREATE TABLE IF NOT EXISTS public.attendee_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webinar_id UUID NOT NULL REFERENCES public.webinars(id) ON DELETE CASCADE,
  attendee_name TEXT NOT NULL,
  photo_url TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  selected_template_id UUID REFERENCES public.post_templates(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.webinars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendee_submissions ENABLE ROW LEVEL SECURITY;

-- Webinars policies: anyone can view (for attendee landing page), but only hosts can modify
CREATE POLICY "Anyone can view webinars" 
  ON public.webinars FOR SELECT 
  USING (true);

CREATE POLICY "Users can create their own webinars" 
  ON public.webinars FOR INSERT 
  WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Users can update their own webinars" 
  ON public.webinars FOR UPDATE 
  USING (auth.uid() = host_id);

CREATE POLICY "Users can delete their own webinars" 
  ON public.webinars FOR DELETE 
  USING (auth.uid() = host_id);

-- Post templates policies
CREATE POLICY "Hosts can view their webinar templates" 
  ON public.post_templates FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.webinars 
    WHERE webinars.id = post_templates.webinar_id 
    AND webinars.host_id = auth.uid()
  ));

CREATE POLICY "Anyone can view approved templates" 
  ON public.post_templates FOR SELECT 
  USING (is_approved = true);

CREATE POLICY "Hosts can create templates for their webinars" 
  ON public.post_templates FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.webinars 
    WHERE webinars.id = post_templates.webinar_id 
    AND webinars.host_id = auth.uid()
  ));

CREATE POLICY "Hosts can update templates for their webinars" 
  ON public.post_templates FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.webinars 
    WHERE webinars.id = post_templates.webinar_id 
    AND webinars.host_id = auth.uid()
  ));

CREATE POLICY "Hosts can delete templates for their webinars" 
  ON public.post_templates FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM public.webinars 
    WHERE webinars.id = post_templates.webinar_id 
    AND webinars.host_id = auth.uid()
  ));

-- Attendee submissions policies
CREATE POLICY "Hosts can view submissions for their webinars" 
  ON public.attendee_submissions FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.webinars 
    WHERE webinars.id = attendee_submissions.webinar_id 
    AND webinars.host_id = auth.uid()
  ));

CREATE POLICY "Anyone can create submissions" 
  ON public.attendee_submissions FOR INSERT 
  WITH CHECK (true);

-- Create storage bucket for attendee photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('attendee-photos', 'attendee-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policy for attendee photos
CREATE POLICY "Anyone can upload attendee photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'attendee-photos');

CREATE POLICY "Anyone can view attendee photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'attendee-photos');
