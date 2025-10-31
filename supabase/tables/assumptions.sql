CREATE TABLE assumptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    version_id UUID NOT NULL,
    general_setup JSONB DEFAULT '{}'::jsonb,
    strategic_near_term JSONB DEFAULT '{}'::jsonb,
    strategic_long_term JSONB DEFAULT '{}'::jsonb,
    capex_table JSONB DEFAULT '[]'::jsonb,
    working_capital JSONB DEFAULT '{}'::jsonb,
    opening_balance_sheet JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);