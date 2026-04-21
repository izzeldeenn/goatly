-- Create AI recommendations table for storing AI-generated insights
CREATE TABLE IF NOT EXISTS ai_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_role TEXT NOT NULL CHECK (agent_role IN ('developer', 'user_behavior_analyst', 'sales_manager', 'strategic_analyst')),
  type TEXT NOT NULL CHECK (type IN ('improvement', 'bug_fix', 'feature', 'strategy', 'warning')),
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  action_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  estimated_impact TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'dismissed')),
  implemented_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_ai_recommendations_role ON ai_recommendations(agent_role);
CREATE INDEX idx_ai_recommendations_priority ON ai_recommendations(priority);
CREATE INDEX idx_ai_recommendations_status ON ai_recommendations(status);
CREATE INDEX idx_ai_recommendations_created_at ON ai_recommendations(created_at DESC);

-- Create a function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_ai_recommendations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update updated_at
CREATE TRIGGER ai_recommendations_updated_at_trigger
  BEFORE UPDATE ON ai_recommendations
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_recommendations_updated_at();

-- Add RLS (Row Level Security) policies
ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;

-- Allow admins to read all recommendations
CREATE POLICY "Admins can read all recommendations"
  ON ai_recommendations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.account_id = auth.uid()::text
      AND users.role = 'admin'
    )
  );

-- Allow admins to insert recommendations
CREATE POLICY "Admins can insert recommendations"
  ON ai_recommendations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.account_id = auth.uid()::text
      AND users.role = 'admin'
    )
  );

-- Allow authenticated users to insert AI recommendations (for AI-generated insights)
CREATE POLICY "Authenticated users can insert AI recommendations"
  ON ai_recommendations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow admins to update recommendations
CREATE POLICY "Admins can update recommendations"
  ON ai_recommendations
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.account_id = auth.uid()::text
      AND users.role = 'admin'
    )
  );

-- Allow admins to delete recommendations
CREATE POLICY "Admins can delete recommendations"
  ON ai_recommendations
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.account_id = auth.uid()::text
      AND users.role = 'admin'
    )
  );
