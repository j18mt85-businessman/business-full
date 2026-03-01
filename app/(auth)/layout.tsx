export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Left side - branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-dasta-navy p-12">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-dasta-green to-dasta-green-dark">
            <span className="text-xl font-bold text-primary-foreground">D</span>
          </div>
          <span className="text-2xl font-bold text-sidebar-foreground">DASTA</span>
        </div>
        <div className="space-y-6">
          <h1 className="text-4xl font-bold leading-tight text-sidebar-foreground text-balance">
            {'ბიზნესის მართვის ახალი სტანდარტი'}
          </h1>
          <p className="text-lg leading-relaxed text-sidebar-foreground/70">
            {'POS სისტემა, ინვენტარის მართვა, სალარო, კლიენტები და RS.GE ინტეგრაცია - ყველაფერი ერთ პლატფორმაზე.'}
          </p>
          <div className="grid grid-cols-2 gap-4 pt-4">
            {[
              { num: '500+', text: 'აქტიური ბიზნესი' },
              { num: '1M+', text: 'დამუშავებული ტრანზაქცია' },
              { num: '99.9%', text: 'Uptime გარანტია' },
              { num: '24/7', text: 'მხარდაჭერა' },
            ].map(stat => (
              <div key={stat.num} className="rounded-lg border border-sidebar-border bg-sidebar-accent/50 p-4">
                <div className="text-2xl font-bold text-dasta-green">{stat.num}</div>
                <div className="text-sm text-sidebar-foreground/60">{stat.text}</div>
              </div>
            ))}
          </div>
        </div>
        <p className="text-sm text-sidebar-foreground/40">
          {'2024 DASTA.GE - ყველა უფლება დაცულია'}
        </p>
      </div>
      {/* Right side - form */}
      <div className="flex flex-1 items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  )
}
