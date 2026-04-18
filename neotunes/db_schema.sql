-- NeoTunes Library Schema
-- Run this inside your Supabase SQL Editor!

CREATE TABLE public.saved_tracks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    track_id TEXT NOT NULL,
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    artwork TEXT NOT NULL,
    color TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Turn on Row Level Security (RLS)
ALTER TABLE public.saved_tracks ENABLE ROW LEVEL SECURITY;

-- Create policy so users can only see and add their own tracks
CREATE POLICY "Users can only see their own saved tracks"
    ON public.saved_tracks
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved tracks"
    ON public.saved_tracks
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved tracks"
    ON public.saved_tracks
    FOR DELETE
    USING (auth.uid() = user_id);
