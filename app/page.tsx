import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function RootPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Try to find the user's first branch
  const { data: profile } = await supabase
    .from('profiles')
    .select('branch_ids')
    .eq('id', user.id)
    .single()

  if (profile?.branch_ids?.length > 0) {
    redirect(`/${profile.branch_ids[0]}`)
  }

  // Fallback: try to find any branch for the user's company
  const { data: companyProfile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', user.id)
    .single()

  if (companyProfile?.company_id) {
    const { data: branches } = await supabase
      .from('branches')
      .select('id')
      .eq('company_id', companyProfile.company_id)
      .limit(1)

    if (branches && branches.length > 0) {
      redirect(`/${branches[0].id}`)
    }
  }

  // If no branches found at all, redirect to a default
  redirect('/login')
}
