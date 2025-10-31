-- Migration: setup_rls_policies
-- Created at: 1761898473

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assumptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_trails ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON profiles
  FOR SELECT
  USING (auth.role() IN ('anon', 'service_role', 'authenticated'));

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT
  WITH CHECK (auth.role() IN ('anon', 'service_role', 'authenticated') AND auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE
  USING (auth.role() IN ('anon', 'service_role', 'authenticated') AND auth.uid() = id);

-- Versions policies
CREATE POLICY "Users can view all versions" ON versions
  FOR SELECT
  USING (auth.role() IN ('anon', 'service_role', 'authenticated'));

CREATE POLICY "Authenticated users can create versions" ON versions
  FOR INSERT
  WITH CHECK (auth.role() IN ('anon', 'service_role', 'authenticated'));

CREATE POLICY "Users can update their own versions" ON versions
  FOR UPDATE
  USING (auth.role() IN ('anon', 'service_role', 'authenticated') AND created_by = auth.uid());

CREATE POLICY "Users can delete their own versions" ON versions
  FOR DELETE
  USING (auth.role() IN ('anon', 'service_role', 'authenticated') AND created_by = auth.uid());

-- Assumptions policies
CREATE POLICY "Users can view all assumptions" ON assumptions
  FOR SELECT
  USING (auth.role() IN ('anon', 'service_role', 'authenticated'));

CREATE POLICY "Authenticated users can create assumptions" ON assumptions
  FOR INSERT
  WITH CHECK (auth.role() IN ('anon', 'service_role', 'authenticated'));

CREATE POLICY "Authenticated users can update assumptions" ON assumptions
  FOR UPDATE
  USING (auth.role() IN ('anon', 'service_role', 'authenticated'));

CREATE POLICY "Authenticated users can delete assumptions" ON assumptions
  FOR DELETE
  USING (auth.role() IN ('anon', 'service_role', 'authenticated'));

-- Results policies
CREATE POLICY "Users can view all results" ON results
  FOR SELECT
  USING (auth.role() IN ('anon', 'service_role', 'authenticated'));

CREATE POLICY "Authenticated users can create results" ON results
  FOR INSERT
  WITH CHECK (auth.role() IN ('anon', 'service_role', 'authenticated'));

CREATE POLICY "Authenticated users can update results" ON results
  FOR UPDATE
  USING (auth.role() IN ('anon', 'service_role', 'authenticated'));

CREATE POLICY "Authenticated users can delete results" ON results
  FOR DELETE
  USING (auth.role() IN ('anon', 'service_role', 'authenticated'));

-- Audit trails policies
CREATE POLICY "Users can view all audit trails" ON audit_trails
  FOR SELECT
  USING (auth.role() IN ('anon', 'service_role', 'authenticated'));

CREATE POLICY "Authenticated users can create audit trails" ON audit_trails
  FOR INSERT
  WITH CHECK (auth.role() IN ('anon', 'service_role', 'authenticated'));

-- Create indexes for better performance
CREATE INDEX idx_versions_created_by ON versions(created_by);
CREATE INDEX idx_versions_created_at ON versions(created_at DESC);
CREATE INDEX idx_assumptions_version_id ON assumptions(version_id);
CREATE INDEX idx_results_version_id ON results(version_id);
CREATE INDEX idx_audit_trails_user_id ON audit_trails(user_id);
CREATE INDEX idx_audit_trails_created_at ON audit_trails(created_at DESC);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_versions_updated_at BEFORE UPDATE ON versions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assumptions_updated_at BEFORE UPDATE ON assumptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_results_updated_at BEFORE UPDATE ON results
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();;