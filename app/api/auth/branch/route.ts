import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// This endpoint returns the user's default branch_id
// Uses service role to bypass RLS for the branch lookup
export async function GET() {
  try {
    // First get the authenticated user via the normal server client
    const supabase = await createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (!user || authError) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Use service role client to bypass RLS
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    // Try profile_branches first
    const { data: pb, error: pbError } = await adminClient
      .from('profile_branches')
      .select('branch_id')
      .eq('profile_id', user.id)
      .limit(1)
      .single()

    if (pb?.branch_id) {
      return NextResponse.json({ branchId: pb.branch_id })
    }

    // Fallback: get branch from profiles -> company -> branches
    const { data: profile } = await adminClient
      .from('profiles')
      .select('company_id')
      .eq('id', user.id)
      .single()

    if (profile?.company_id) {
      const { data: branch } = await adminClient
        .from('branches')
        .select('id')
        .eq('company_id', profile.company_id)
        .eq('is_active', true)
        .limit(1)
        .single()

      if (branch?.id) {
        return NextResponse.json({ branchId: branch.id })
      }
    }

    return NextResponse.json({ error: 'No branch found' }, { status: 404 })
  } catch (error) {
    console.error('[v0] /api/auth/branch error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
