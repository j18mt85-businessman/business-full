import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function RootPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Get user's first branch
  const { data: profileBranches } = await supabase
    .from('profile_branches')
    .select('branch_id')
    .eq('profile_id', user.id)
    .limit(1)
    .single()

  if (profileBranches?.branch_id) {
    redirect(`/${profileBranches.branch_id}`)
  }

  // Fallback: get any branch from user's company
  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', user.id)
    .single()

  if (profile?.company_id) {
    const { data: branch } = await supabase
      .from('branches')
      .select('id')
      .eq('company_id', profile.company_id)
      .eq('is_active', true)
      .limit(1)
      .single()

    if (branch?.id) {
      redirect(`/${branch.id}`)
    }
  }

  // If no branch found, redirect to login
  redirect('/login')
}
