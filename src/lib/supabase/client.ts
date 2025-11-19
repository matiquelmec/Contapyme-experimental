import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Singleton client instances to avoid multiple GoTrueClient instances
// Use globalThis to persist across Next.js hot reloads in development
const globalForSupabase = globalThis as unknown as {
  supabaseClient: any
  supabaseAdminClient: any
}

// Cliente para componentes del lado del cliente
export const createSupabaseClient = () => {
  if (!globalForSupabase.supabaseClient) {
    globalForSupabase.supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        autoRefreshToken: true,
        persistSession: true,
      },
    })
  }
  return globalForSupabase.supabaseClient
}

// Cliente administrativo para operaciones del servidor
export const createSupabaseAdminClient = () => {
  if (!globalForSupabase.supabaseAdminClient) {
    globalForSupabase.supabaseAdminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    )
  }
  return globalForSupabase.supabaseAdminClient
}

// Tipos para TypeScript
export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string
          business_name: string
          legal_name: string | null
          rut: string
          industry_sector: string | null
          company_size: 'micro' | 'small' | 'medium' | 'large' | null
          subscription_tier: 'trial' | 'basic' | 'professional' | 'enterprise' | null
          subscription_status: 'trial' | 'active' | 'past_due' | 'cancelled' | 'suspended' | null
          trial_ends_at: string | null
          max_companies: number | null
          max_employees: number | null
          billing_email: string | null
          address: string | null
          phone: string | null
          email: string | null
          website: string | null
          logo_url: string | null
          tax_regime: string | null
          accounting_period_start: number | null
          currency: string | null
          created_at: string
          updated_at: string
          created_by: string | null
          updated_by: string | null
          status: 'active' | 'suspended' | 'trial' | null
        }
        Insert: {
          id?: string
          business_name: string
          legal_name?: string | null
          rut: string
          industry_sector?: string | null
          company_size?: 'micro' | 'small' | 'medium' | 'large' | null
          subscription_tier?: 'trial' | 'basic' | 'professional' | 'enterprise' | null
          subscription_status?: 'trial' | 'active' | 'past_due' | 'cancelled' | 'suspended' | null
          trial_ends_at?: string | null
          max_companies?: number | null
          max_employees?: number | null
          billing_email?: string | null
          address?: string | null
          phone?: string | null
          email?: string | null
          website?: string | null
          logo_url?: string | null
          tax_regime?: string | null
          accounting_period_start?: number | null
          currency?: string | null
          created_by?: string | null
          updated_by?: string | null
          status?: 'active' | 'suspended' | 'trial' | null
        }
        Update: {
          id?: string
          business_name?: string
          legal_name?: string | null
          rut?: string
          industry_sector?: string | null
          company_size?: 'micro' | 'small' | 'medium' | 'large' | null
          subscription_tier?: 'trial' | 'basic' | 'professional' | 'enterprise' | null
          subscription_status?: 'trial' | 'active' | 'past_due' | 'cancelled' | 'suspended' | null
          trial_ends_at?: string | null
          max_companies?: number | null
          max_employees?: number | null
          billing_email?: string | null
          address?: string | null
          phone?: string | null
          email?: string | null
          website?: string | null
          logo_url?: string | null
          tax_regime?: string | null
          accounting_period_start?: number | null
          currency?: string | null
          created_by?: string | null
          updated_by?: string | null
          status?: 'active' | 'suspended' | 'trial' | null
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          role: 'owner' | 'admin' | 'accountant' | 'viewer' | null
          company_id: string | null
          auth_id: string | null
          provider: string | null
          provider_id: string | null
          profile_completed: boolean | null
          onboarding_step: number | null
          permissions: any | null
          last_login: string | null
          created_at: string
          updated_at: string
          is_active: boolean | null
          phone: string | null
          avatar_url: string | null
          timezone: string | null
          language: string | null
        }
        Insert: {
          id?: string
          email: string
          full_name: string
          role?: 'owner' | 'admin' | 'accountant' | 'viewer' | null
          company_id?: string | null
          auth_id?: string | null
          provider?: string | null
          provider_id?: string | null
          profile_completed?: boolean | null
          onboarding_step?: number | null
          permissions?: any | null
          last_login?: string | null
          is_active?: boolean | null
          phone?: string | null
          avatar_url?: string | null
          timezone?: string | null
          language?: string | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          role?: 'owner' | 'admin' | 'accountant' | 'viewer' | null
          company_id?: string | null
          auth_id?: string | null
          provider?: string | null
          provider_id?: string | null
          profile_completed?: boolean | null
          onboarding_step?: number | null
          permissions?: any | null
          last_login?: string | null
          is_active?: boolean | null
          phone?: string | null
          avatar_url?: string | null
          timezone?: string | null
          language?: string | null
          updated_at?: string
        }
      }
      subscription_plans: {
        Row: {
          id: string
          name: string
          display_name: string
          description: string | null
          price_monthly: number
          price_yearly: number | null
          currency: string | null
          max_companies: number
          max_employees: number
          max_f29_analyses: number
          max_storage_mb: number
          features: any
          is_popular: boolean | null
          sort_order: number | null
          is_active: boolean | null
          created_at: string
          updated_at: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          plan_id: string | null
          status: 'trial' | 'active' | 'past_due' | 'cancelled' | 'suspended' | null
          trial_start: string | null
          trial_end: string | null
          current_period_start: string | null
          current_period_end: string | null
          cancelled_at: string | null
          billing_cycle: 'monthly' | 'yearly' | null
          amount: number | null
          currency: string | null
          stripe_subscription_id: string | null
          stripe_customer_id: string | null
          created_at: string
          updated_at: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          user_id: string
          first_name: string | null
          last_name: string | null
          rut: string | null
          phone: string | null
          address: string | null
          city: string | null
          region: string | null
          country: string | null
          postal_code: string | null
          job_title: string | null
          company_role: string | null
          industry: string | null
          notifications_email: boolean | null
          notifications_marketing: boolean | null
          preferred_language: string | null
          timezone: string | null
          created_at: string
          updated_at: string
        }
      }
    }
    Functions: {
      check_plan_limits: {
        Args: { user_uuid: string; limit_type: string }
        Returns: any
      }
      create_trial_subscription: {
        Args: { user_uuid: string }
        Returns: string
      }
      get_user_plan_features: {
        Args: { user_uuid: string }
        Returns: any
      }
    }
  }
}
