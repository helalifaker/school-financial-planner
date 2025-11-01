import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://unwehmjzzyghaslunkkl.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVud2VobWp6enlnaGFzbHVua2tsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4NDY0OTksImV4cCI6MjA3NzQyMjQ5OX0.jGLRYqCQpsWUH4BPQ5gvdeez9o1H18Hf0W3ULEpfTRs"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export type Profile = {
  id: string
  email: string
  full_name: string | null
  role: 'admin' | 'analyst' | 'viewer'
  created_at: string
  updated_at: string
}

export type Version = {
  id: string
  name: string
  version_type: 'base' | 'optimistic' | 'downside'
  created_by: string
  created_at: string
  updated_at: string
  is_active: boolean
  metadata: Record<string, any>
}

export type Assumptions = {
  id: string
  version_id: string
  general_setup: Record<string, any>
  strategic_near_term: Record<string, any>
  strategic_long_term: Record<string, any>
  capex_table: Array<any>
  working_capital: Record<string, any>
  opening_balance_sheet: Record<string, any>
  created_at: string
  updated_at: string
}

export type Results = {
  id: string
  version_id: string
  revenue_streams: Record<string, any>
  profit_loss: Record<string, any>
  balance_sheet: Record<string, any>
  cash_flow: Record<string, any>
  controls: Record<string, any>
  ratios: Record<string, any>
  created_at: string
  updated_at: string
}
