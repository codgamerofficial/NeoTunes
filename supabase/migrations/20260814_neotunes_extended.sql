-- NeoTunes Database Schema Extensions
-- Adds Queue Snapshots, Listening Rooms (NeoTunes Jam), Room Members, and RLS policies

-- 1. Queue Snapshots Table for Session/Crash Persistence
CREATE TABLE IF NOT EXISTS public.queue_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    device_id TEXT NOT NULL,
    current_track_id TEXT REFERENCES public.tracks(id) ON DELETE SET NULL,
    position_ms INTEGER DEFAULT 0,
    queue_track_ids TEXT[] DEFAULT '{}',
    shuffle_enabled BOOLEAN DEFAULT false,
    repeat_mode TEXT DEFAULT 'off',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Listening Rooms Table (NeoTunes Jam)
CREATE TABLE IF NOT EXISTS public.listening_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_name TEXT NOT NULL,
    host_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    invite_code TEXT UNIQUE NOT NULL,
    current_track_id TEXT REFERENCES public.tracks(id) ON DELETE SET NULL,
    position_ms INTEGER DEFAULT 0,
    is_playing BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Room Members Table
CREATE TABLE IF NOT EXISTS public.room_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES public.listening_rooms(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    is_host BOOLEAN DEFAULT false,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (room_id, user_id)
);

-- Enable RLS
ALTER TABLE public.queue_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listening_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage own queue snapshots"
    ON public.queue_snapshots FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view listening rooms by invite code"
    ON public.listening_rooms FOR SELECT
    USING (true);

CREATE POLICY "Hosts can manage listening rooms"
    ON public.listening_rooms FOR ALL
    USING (auth.uid() = host_id);

CREATE POLICY "Room members can view room members"
    ON public.room_members FOR SELECT
    USING (true);

CREATE POLICY "Users can join rooms"
    ON public.room_members FOR INSERT
    WITH CHECK (auth.uid() = user_id);
