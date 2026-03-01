// DASTA Platform — Core TypeScript Types

export interface Company {
  id: string
  name: string
  taxId: string
  address: string
  phone: string
  email: string
  plan: 'free' | 'starter' | 'professional' | 'enterprise'
  createdAt: string
}

export interface Branch {
  id: string
  companyId: string
  name: string
  address: string
  phone: string
  isActive: boolean
}

export interface User {
  id: string
  email: string
  fullName: string
  role: 'owner' | 'admin' | 'manager' | 'cashier'
  companyId: string
  branchIds: string[]
  avatar?: string
}

export interface Category {
  id: string
  name: string
  color: string
  icon?: string
}

export interface Product {
  id: string
  name: string
  sku: string
  barcode?: string
  categoryId: string
  costPrice: number
  salePrice: number
  wholesalePrice?: number
  stock: number
  minStock: number
  unit: string
  isActive: boolean
  imageUrl?: string
  description?: string
  branchId: string
  createdAt: string
  updatedAt: string
}

export interface CartItem {
  product: Product
  quantity: number
  discount: number
  total: number
}

export type PaymentMethod = 'cash' | 'card' | 'transfer' | 'mixed'

export interface SaleItem {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  discount: number
  total: number
}

export interface Sale {
  id: string
  receiptNumber: string
  branchId: string
  customerId?: string
  customerName?: string
  items: SaleItem[]
  subtotal: number
  discount: number
  total: number
  paymentMethod: PaymentMethod
  cashReceived?: number
  change?: number
  status: 'completed' | 'returned' | 'partial_return'
  cashierId: string
  cashierName: string
  sessionId?: string
  createdAt: string
  note?: string
}

export type CustomerType = 'retail' | 'wholesale' | 'vip'

export interface Customer {
  id: string
  fullName: string
  phone?: string
  email?: string
  type: CustomerType
  loyaltyPoints: number
  totalPurchases: number
  totalSpent: number
  debt: number
  branchId: string
  createdAt: string
  note?: string
}

export interface Supplier {
  id: string
  name: string
  contactPerson?: string
  phone?: string
  email?: string
  address?: string
  balance: number
  branchId: string
  createdAt: string
}

export interface CashMovement {
  id: string
  sessionId: string
  type: 'in' | 'out'
  amount: number
  reason: string
  createdAt: string
}

export interface CashSession {
  id: string
  branchId: string
  cashierId: string
  cashierName: string
  openingBalance: number
  closingBalance?: number
  expectedBalance?: number
  difference?: number
  totalSales: number
  totalCash: number
  totalCard: number
  totalTransfer: number
  salesCount: number
  movements: CashMovement[]
  status: 'open' | 'closed'
  openedAt: string
  closedAt?: string
  note?: string
}

export interface StockAlert {
  id: string
  productId: string
  productName: string
  currentStock: number
  minStock: number
  severity: 'critical' | 'warning' | 'info'
  branchId: string
}

export interface NavItem {
  label: string
  href: string
  icon: string
  badge?: number
  children?: NavItem[]
}

export interface NavSection {
  title: string
  items: NavItem[]
}
