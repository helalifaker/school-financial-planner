CREATE TABLE results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    version_id UUID NOT NULL,
    revenue_streams JSONB DEFAULT '{}'::jsonb,
    profit_loss JSONB DEFAULT '{}'::jsonb,
    balance_sheet JSONB DEFAULT '{}'::jsonb,
    cash_flow JSONB DEFAULT '{}'::jsonb,
    controls JSONB DEFAULT '{}'::jsonb,
    ratios JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);