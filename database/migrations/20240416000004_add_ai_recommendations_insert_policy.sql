-- Add policy to allow authenticated users to insert AI recommendations

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can insert recommendations" ON ai_recommendations;
DROP POLICY IF EXISTS "Authenticated users can insert AI recommendations" ON ai_recommendations;

-- Add new policy that allows authenticated users to insert AI recommendations
CREATE POLICY "Authenticated users can insert AI recommendations"
  ON ai_recommendations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);
