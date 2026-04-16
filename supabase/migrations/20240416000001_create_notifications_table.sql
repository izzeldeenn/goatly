-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('like', 'comment', 'follow', 'mention', 'group_invite', 'post_approved')),
  username TEXT NOT NULL,
  user_avatar TEXT NOT NULL DEFAULT 'User',
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  read BOOLEAN DEFAULT FALSE NOT NULL,
  related_post_id UUID REFERENCES public.social_posts(id) ON DELETE CASCADE,
  related_user_id UUID
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS notifications_read_idx ON public.notifications(read, user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policy for users to see their own notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy for users to update their own notifications
CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policy for users to insert notifications (system notifications)
CREATE POLICY "Users can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR 
    type = 'post_approved'
  );

-- Create policy for users to delete their own notifications
CREATE POLICY "Users can delete their own notifications" ON public.notifications
  FOR DELETE USING (auth.uid() = user_id);
