'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useBranch } from '@/contexts/BranchContext'
import { useTheme } from '@/contexts/ThemeContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  User, Building2, Receipt, Palette, Bell, Shield, Globe, Save,
  Sun, Moon,
} from 'lucide-react'

export default function SettingsPage() {
  const { user } = useAuth()
  const { currentBranch } = useBranch()
  const { theme, toggleTheme } = useTheme()
  const [activeTab, setActiveTab] = useState('profile')

  const tabs = [
    { id: 'profile', label: 'პროფილი', icon: User },
    { id: 'business', label: 'ბიზნესი', icon: Building2 },
    { id: 'receipt', label: 'ჩეკი', icon: Receipt },
    { id: 'appearance', label: 'გარეგნობა', icon: Palette },
    { id: 'notifications', label: 'შეტყობინებები', icon: Bell },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground text-balance">{'პარამეტრები'}</h1>
        <p className="text-sm text-muted-foreground">{'აპლიკაციის კონფიგურაცია'}</p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Sidebar Tabs */}
        <div className="w-full lg:w-56">
          <nav className="flex gap-1 lg:flex-col">
            {tabs.map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-dasta-green text-primary-foreground'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }`}
                >
                  <Icon className="size-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">{'პროფილის ინფორმაცია'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex size-16 items-center justify-center rounded-full bg-dasta-green/10 text-2xl font-bold text-dasta-green">
                    {user?.fullName?.charAt(0) || 'D'}
                  </div>
                  <div>
                    <p className="text-lg font-bold text-foreground">{user?.fullName || 'DASTA მომხმარებელი'}</p>
                    <p className="text-sm text-muted-foreground">{user?.email || 'demo@dasta.ge'}</p>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium">{'სახელი / გვარი'}</label>
                    <Input defaultValue={user?.fullName || 'DASTA მომხმარებელი'} />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">{'ელ. ფოსტა'}</label>
                    <Input type="email" defaultValue={user?.email || 'demo@dasta.ge'} />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">{'ტელეფონი'}</label>
                    <Input defaultValue="+995 555 12 34 56" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">{'როლი'}</label>
                    <Input value={user?.role || 'admin'} readOnly className="bg-secondary" />
                  </div>
                </div>
                <Button className="bg-dasta-green text-primary-foreground hover:bg-dasta-green-dark">
                  <Save className="size-4" />
                  {'შენახვა'}
                </Button>
              </CardContent>
            </Card>
          )}

          {activeTab === 'business' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">{'ბიზნესის ინფორმაცია'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium">{'კომპანიის სახელი'}</label>
                    <Input defaultValue="DASTA Demo" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">{'საიდენტიფიკაციო კოდი'}</label>
                    <Input defaultValue="404123456" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">{'მისამართი'}</label>
                    <Input defaultValue={currentBranch.address} />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">{'ტელეფონი'}</label>
                    <Input defaultValue={currentBranch.phone || '+995 32 2 12 34 56'} />
                  </div>
                </div>
                <Button className="bg-dasta-green text-primary-foreground hover:bg-dasta-green-dark">
                  <Save className="size-4" />
                  {'შენახვა'}
                </Button>
              </CardContent>
            </Card>
          )}

          {activeTab === 'receipt' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">{'ჩეკის პარამეტრები'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium">{'ჩეკის სათაური'}</label>
                    <Input defaultValue={currentBranch.name} />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">{'ქვესათაური'}</label>
                    <Input defaultValue="გმადლობთ შეძენისთვის!" />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="size-4 rounded border-border text-dasta-green" />
                    <span className="text-sm">{'ავტომატური ბეჭდვა'}</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="size-4 rounded border-border text-dasta-green" />
                    <span className="text-sm">{'კლიენტის ინფორმაციის ჩვენება'}</span>
                  </label>
                </div>
                <Button className="bg-dasta-green text-primary-foreground hover:bg-dasta-green-dark">
                  <Save className="size-4" />
                  {'შენახვა'}
                </Button>
              </CardContent>
            </Card>
          )}

          {activeTab === 'appearance' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">{'გარეგნობის პარამეტრები'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="mb-3 text-sm font-medium">{'თემის არჩევა'}</h3>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <button
                      onClick={() => theme !== 'light' && toggleTheme()}
                      className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                        theme === 'light' ? 'border-dasta-green bg-dasta-green/5' : 'border-border hover:border-dasta-green/50'
                      }`}
                    >
                      <Sun className="size-6 text-dasta-warning" />
                      <span className="text-sm font-medium">{'ნათელი'}</span>
                    </button>
                    <button
                      onClick={() => theme !== 'dark' && toggleTheme()}
                      className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                        theme === 'dark' ? 'border-dasta-green bg-dasta-green/5' : 'border-border hover:border-dasta-green/50'
                      }`}
                    >
                      <Moon className="size-6 text-dasta-info" />
                      <span className="text-sm font-medium">{'მუქი'}</span>
                    </button>
                  </div>
                </div>
                <div>
                  <h3 className="mb-3 text-sm font-medium">{'ენა'}</h3>
                  <div className="flex gap-2">
                    <Button variant="default" size="sm" className="bg-dasta-green text-primary-foreground">
                      <Globe className="size-3" /> {'ქართული'}
                    </Button>
                    <Button variant="outline" size="sm" disabled>
                      <Globe className="size-3" /> English
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">{'შეტყობინებების პარამეტრები'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: 'მარაგის გაფრთხილება', desc: 'შეტყობინება როდესაც პროდუქტის მარაგი მინიმუმზე ნაკლებია', default: true },
                  { label: 'ახალი გაყიდვა', desc: 'შეტყობინება ყოველი ახალი გაყიდვისას', default: false },
                  { label: 'სალაროს დახურვა', desc: 'შეხსენება სალაროს დახურვის შესახებ', default: true },
                  { label: 'ვალის ვადა', desc: 'შეტყობინება კლიენტის ვალის ვადის ამოწურვისას', default: true },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input type="checkbox" defaultChecked={item.default} className="peer sr-only" />
                      <div className="peer h-5 w-9 rounded-full bg-secondary after:absolute after:left-[2px] after:top-[2px] after:size-4 after:rounded-full after:border after:border-border after:bg-card after:transition-all after:content-[''] peer-checked:bg-dasta-green peer-checked:after:translate-x-full" />
                    </label>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
