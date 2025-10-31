CREATE TABLE audit_trails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    version_id UUID,
    action_type TEXT NOT NULL CHECK (action_type IN ('create',
    'update',
    'delete',
    'view',
    'export')),
    action_description TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);