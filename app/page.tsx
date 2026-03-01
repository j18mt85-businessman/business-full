import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function RootPage() {
  const supabase = await createClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  console.log('[v0] Root page - user:', user?.id, 'error:', userError?.message)
  
  if (!user) {
    redirect('/login')
  }

  // Get user's first branch
  const { data: profileBranches, error: pbError } = await supabase
    .from('profile_branches')
    .select('branch_id')
    .eq('profile_id', user.id)
    .limit(1)
    .single()

  console.log('[v0] Root page - profileBranches:', profileBranches, 'error:', pbError?.message)

  if (profileBranches?.branch_id) {
    redirect(`/${profileBranches.branch_id}`)
  }

  // Fallback: get any branch from user's company
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', user.id)
    .single()

  console.log('[v0] Root page - profile:', profile, 'error:', profileError?.message)

  if (profile?.company_id) {
    const { data: branch, error: branchError } = await supabase
      .from('branches')
      .select('id')
      .eq('company_id', profile.company_id)
      .eq('is_active', true)
      .limit(1)
      .single()

    console.log('[v0] Root page - branch:', branch, 'error:', branchError?.message)

    if (branch?.id) {
      redirect(`/${branch.id}`)
    }
  }

  // If no branch found, show error page instead of redirect to avoid loops
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="max-w-md space-y-4 text-center">
        <h1 className="text-2xl font-bold text-foreground">{'ფილიალი ვერ მოიძებნა'}</h1>
        <p className="text-muted-foreground">
          {'თქვენი ანგარიში ჯერ არ არის დაკავშირებული ფილიალთან. გთხოვთ დაუკავშირდეთ ადმინისტრატორს.'}
        </p>
        <form action={async () => {
          'use server'
          const supabase = await createClient()
          await supabase.auth.signOut()
          redirect('/login')
        }}>
          <button 
            type="submit" 
            className="rounded-lg bg-dasta-green px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-dasta-green-dark"
          >
            {'გასვლა'}
          </button>
        </form>
      </div>
    </div>
  )
}
