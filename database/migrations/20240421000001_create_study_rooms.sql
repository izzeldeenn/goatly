-- Create study_rooms table for collaborative study sessions
CREATE TABLE IF NOT EXISTS public.study_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  creator_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_study_rooms_creator_id ON public.study_rooms(creator_id);
CREATE INDEX IF NOT EXISTS idx_study_rooms_created_at ON public.study_rooms(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.study_rooms ENABLE ROW LEVEL SECURITY;

-- Create policy for viewing all rooms (public read access)
CREATE POLICY "Anyone can view study rooms" ON public.study_rooms
  FOR SELECT USING (true);

-- Create policy for creating rooms (allow anon/authenticated users)
CREATE POLICY "Anyone can create study rooms" ON public.study_rooms
  FOR INSERT WITH CHECK (true);

-- Create policy for updating rooms (allow creator or anyone)
CREATE POLICY "Anyone can update study rooms" ON public.study_rooms
  FOR UPDATE USING (true);

-- Create policy for deleting rooms (allow creator or anyone)
CREATE POLICY "Anyone can delete study rooms" ON public.study_rooms
  FOR DELETE USING (true);

-- Create room_members table to track users in study rooms
CREATE TABLE IF NOT EXISTS public.room_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.study_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  left_at TIMESTAMP WITH TIME ZONE,
  last_heartbeat TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(room_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_room_members_room_id ON public.room_members(room_id);
CREATE INDEX IF NOT EXISTS idx_room_members_user_id ON public.room_members(user_id);
CREATE INDEX IF NOT EXISTS idx_room_members_joined_at ON public.room_members(joined_at DESC);
CREATE INDEX IF NOT EXISTS idx_room_members_last_heartbeat ON public.room_members(last_heartbeat DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.room_members ENABLE ROW LEVEL SECURITY;

-- Create policy for viewing all room members (public read access)
CREATE POLICY "Anyone can view room members" ON public.room_members
  FOR SELECT USING (true);

-- Create policy for joining rooms (allow anon/authenticated users)
CREATE POLICY "Anyone can join rooms" ON public.room_members
  FOR INSERT WITH CHECK (true);

-- Create policy for updating room members (allow user or anyone)
CREATE POLICY "Anyone can update room members" ON public.room_members
  FOR UPDATE USING (true);

-- Create policy for leaving rooms (allow user or anyone)
CREATE POLICY "Anyone can leave rooms" ON public.room_members
  FOR DELETE USING (true);

-- Function to update last_heartbeat timestamp
CREATE OR REPLACE FUNCTION update_room_members_last_heartbeat()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_heartbeat = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update last_heartbeat
CREATE TRIGGER update_room_members_last_heartbeat_trigger 
  BEFORE UPDATE ON public.room_members
  FOR EACH ROW
  EXECUTE FUNCTION update_room_members_last_heartbeat();
