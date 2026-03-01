// DASTA Platform — Constants

export const PLAN_LIMITS = {
  free: { products: 50, branches: 1, users: 1, sales: 100, name: 'უფასო' },
  starter: { products: 500, branches: 2, users: 3, sales: 5000, name: 'სტარტერი' },
  professional: { products: 5000, branches: 5, users: 10, sales: 50000, name: 'პროფესიონალი' },
  enterprise: { products: Infinity, branches: Infinity, users: Infinity, sales: Infinity, name: 'ენტერპრაიზი' },
} as const

export const CATEGORIES = [
  { id: 'cat-1', name: 'სასმელები', color: '#3b82f6' },
  { id: 'cat-2', name: 'საკვები', color: '#ef4444' },
  { id: 'cat-3', name: 'საყოფაცხოვრებო', color: '#f59e0b' },
  { id: 'cat-4', name: 'ჰიგიენა', color: '#8b5cf6' },
  { id: 'cat-5', name: 'თამბაქო', color: '#6b7280' },
  { id: 'cat-6', name: 'ალკოჰოლი', color: '#dc2626' },
  { id: 'cat-7', name: 'წვნიანები', color: '#10b981' },
  { id: 'cat-8', name: 'რძის პროდ.', color: '#06b6d4' },
] as const

export const PAYMENT_METHODS = [
  { value: 'cash', label: 'ნაღდი', icon: 'Banknote' },
  { value: 'card', label: 'ბარათი', icon: 'CreditCard' },
  { value: 'transfer', label: 'გადარიცხვა', icon: 'ArrowRightLeft' },
  { value: 'mixed', label: 'შერეული', icon: 'Layers' },
] as const

export const CUSTOMER_TYPES = [
  { value: 'retail', label: 'საცალო' },
  { value: 'wholesale', label: 'საბითუმო' },
  { value: 'vip', label: 'VIP' },
] as const

export const UNITS = ['ცალი', 'კგ', 'ლიტრი', 'პაკეტი', 'ყუთი', 'მეტრი'] as const

export const SIDEBAR_NAV = [
  {
    title: 'მთავარი',
    items: [
      { label: 'დეშბორდი', href: '', icon: 'LayoutDashboard' },
      { label: 'POS - გაყიდვა', href: '/pos', icon: 'ShoppingCart' },
    ],
  },
  {
    title: 'ინვენტარი',
    items: [
      { label: 'პროდუქტები', href: '/inventory', icon: 'Package' },
      { label: 'კატეგორიები', href: '/categories', icon: 'Tag' },
    ],
  },
  {
    title: 'გაყიდვები',
    items: [
      { label: 'გაყიდვების ისტორია', href: '/sales', icon: 'Receipt' },
      { label: 'კლიენტები', href: '/customers', icon: 'Users' },
      { label: 'მომწოდებლები', href: '/suppliers', icon: 'Truck' },
    ],
  },
  {
    title: 'ბუღალტერია',
    items: [
      { label: 'სალარო', href: '/cash-register', icon: 'Landmark' },
      { label: 'ბუღალტერია', href: '/accounting', icon: 'Calculator' },
    ],
  },
  {
    title: 'RS.GE',
    items: [
      { label: 'RS.GE ინტეგრაცია', href: '/rsge', icon: 'Globe' },
    ],
  },
  {
    title: 'სისტემა',
    items: [
      { label: 'შეტყობინებები', href: '/alerts', icon: 'Bell' },
      { label: 'პარამეტრები', href: '/settings', icon: 'Settings' },
    ],
  },
] as const
