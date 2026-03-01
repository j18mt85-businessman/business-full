// DASTA Platform — Realistic Georgian Mock Data

import type { Product, Sale, SaleItem, Customer, Supplier, CashSession, CashMovement, Branch, Company, User, Category } from './types'

export const MOCK_COMPANY: Company = {
  id: 'comp-1',
  name: 'შპს "დასტა ტექნოლოგიები"',
  taxId: '404123456',
  address: 'თბილისი, რუსთაველის გამზ. 24',
  phone: '+995 555 12 34 56',
  email: 'info@dasta.ge',
  plan: 'professional',
  createdAt: '2024-01-15T10:00:00Z',
}

export const MOCK_BRANCHES: Branch[] = [
  { id: 'branch-1', companyId: 'comp-1', name: 'მთავარი მაღაზია', address: 'რუსთაველის გამზ. 24', phone: '+995 555 12 34 56', isActive: true },
  { id: 'branch-2', companyId: 'comp-1', name: 'ვაკის ფილიალი', address: 'ჭავჭავაძის გამზ. 71', phone: '+995 555 78 90 12', isActive: true },
  { id: 'branch-3', companyId: 'comp-1', name: 'საბურთალოს ფილიალი', address: 'პეკინის გამზ. 15', phone: '+995 555 34 56 78', isActive: false },
]

export const MOCK_USER: User = {
  id: 'user-1',
  email: 'admin@dasta.ge',
  fullName: 'გიორგი ბერიძე',
  role: 'admin',
  companyId: 'comp-1',
  branchIds: ['branch-1', 'branch-2'],
}

export const MOCK_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'სასმელები', color: '#3b82f6' },
  { id: 'cat-2', name: 'საკვები', color: '#ef4444' },
  { id: 'cat-3', name: 'საყოფაცხოვრებო', color: '#f59e0b' },
  { id: 'cat-4', name: 'ჰიგიენა', color: '#8b5cf6' },
  { id: 'cat-5', name: 'თამბაქო', color: '#6b7280' },
  { id: 'cat-6', name: 'ალკოჰოლი', color: '#dc2626' },
  { id: 'cat-7', name: 'წვნიანები', color: '#10b981' },
  { id: 'cat-8', name: 'რძის პროდ.', color: '#06b6d4' },
]

export const MOCK_PRODUCTS: Product[] = [
  { id: 'prod-1', name: 'კოკა-კოლა 0.5ლ', sku: 'SKU-001', barcode: '5449000000439', categoryId: 'cat-1', costPrice: 1.20, salePrice: 2.00, stock: 150, minStock: 20, unit: 'ცალი', isActive: true, branchId: 'branch-1', createdAt: '2024-01-20T10:00:00Z', updatedAt: '2024-12-01T10:00:00Z' },
  { id: 'prod-2', name: 'ბორჯომი 0.5ლ', sku: 'SKU-002', barcode: '4860019001278', categoryId: 'cat-1', costPrice: 0.80, salePrice: 1.50, stock: 200, minStock: 30, unit: 'ცალი', isActive: true, branchId: 'branch-1', createdAt: '2024-01-20T10:00:00Z', updatedAt: '2024-12-01T10:00:00Z' },
  { id: 'prod-3', name: 'ნაბეღლავი 1ლ', sku: 'SKU-003', barcode: '4860019002343', categoryId: 'cat-1', costPrice: 0.60, salePrice: 1.20, stock: 180, minStock: 25, unit: 'ცალი', isActive: true, branchId: 'branch-1', createdAt: '2024-01-20T10:00:00Z', updatedAt: '2024-12-01T10:00:00Z' },
  { id: 'prod-4', name: 'ხაჭაპური იმერული', sku: 'SKU-004', categoryId: 'cat-2', costPrice: 3.50, salePrice: 6.50, stock: 8, minStock: 5, unit: 'ცალი', isActive: true, branchId: 'branch-1', createdAt: '2024-02-01T10:00:00Z', updatedAt: '2024-12-01T10:00:00Z' },
  { id: 'prod-5', name: 'პური შავი', sku: 'SKU-005', categoryId: 'cat-2', costPrice: 0.80, salePrice: 1.50, stock: 45, minStock: 15, unit: 'ცალი', isActive: true, branchId: 'branch-1', createdAt: '2024-02-01T10:00:00Z', updatedAt: '2024-12-01T10:00:00Z' },
  { id: 'prod-6', name: 'რძე სოფლის 1ლ', sku: 'SKU-006', categoryId: 'cat-8', costPrice: 2.50, salePrice: 4.20, stock: 3, minStock: 10, unit: 'ცალი', isActive: true, branchId: 'branch-1', createdAt: '2024-02-10T10:00:00Z', updatedAt: '2024-12-01T10:00:00Z' },
  { id: 'prod-7', name: 'კვერცხი 10ც', sku: 'SKU-007', categoryId: 'cat-2', costPrice: 3.00, salePrice: 5.50, stock: 25, minStock: 8, unit: 'პაკეტი', isActive: true, branchId: 'branch-1', createdAt: '2024-02-10T10:00:00Z', updatedAt: '2024-12-01T10:00:00Z' },
  { id: 'prod-8', name: 'ყველი სულგუნი', sku: 'SKU-008', categoryId: 'cat-8', costPrice: 8.00, salePrice: 14.00, stock: 12, minStock: 5, unit: 'კგ', isActive: true, branchId: 'branch-1', createdAt: '2024-03-01T10:00:00Z', updatedAt: '2024-12-01T10:00:00Z' },
  { id: 'prod-9', name: 'სარეცხი ფხვნილი 3კგ', sku: 'SKU-009', categoryId: 'cat-3', costPrice: 7.00, salePrice: 12.50, stock: 18, minStock: 5, unit: 'ცალი', isActive: true, branchId: 'branch-1', createdAt: '2024-03-01T10:00:00Z', updatedAt: '2024-12-01T10:00:00Z' },
  { id: 'prod-10', name: 'კბილის პასტა', sku: 'SKU-010', categoryId: 'cat-4', costPrice: 2.00, salePrice: 4.50, stock: 35, minStock: 10, unit: 'ცალი', isActive: true, branchId: 'branch-1', createdAt: '2024-03-15T10:00:00Z', updatedAt: '2024-12-01T10:00:00Z' },
  { id: 'prod-11', name: 'მარლბორო წითელი', sku: 'SKU-011', barcode: '4820005920019', categoryId: 'cat-5', costPrice: 5.00, salePrice: 8.50, stock: 60, minStock: 15, unit: 'ცალი', isActive: true, branchId: 'branch-1', createdAt: '2024-03-15T10:00:00Z', updatedAt: '2024-12-01T10:00:00Z' },
  { id: 'prod-12', name: 'საპარიკმახერო წინსაფარი', sku: 'SKU-012', categoryId: 'cat-3', costPrice: 1.00, salePrice: 2.50, stock: 2, minStock: 5, unit: 'ცალი', isActive: true, branchId: 'branch-1', createdAt: '2024-04-01T10:00:00Z', updatedAt: '2024-12-01T10:00:00Z' },
  { id: 'prod-13', name: 'ღვინო საფერავი 0.75ლ', sku: 'SKU-013', categoryId: 'cat-6', costPrice: 8.00, salePrice: 15.00, stock: 22, minStock: 8, unit: 'ცალი', isActive: true, branchId: 'branch-1', createdAt: '2024-04-01T10:00:00Z', updatedAt: '2024-12-01T10:00:00Z' },
  { id: 'prod-14', name: 'ლუდი ნატახტარი 0.5ლ', sku: 'SKU-014', categoryId: 'cat-6', costPrice: 1.50, salePrice: 3.00, stock: 90, minStock: 20, unit: 'ცალი', isActive: true, branchId: 'branch-1', createdAt: '2024-04-15T10:00:00Z', updatedAt: '2024-12-01T10:00:00Z' },
  { id: 'prod-15', name: 'ჩიფსი ლეისი 150გ', sku: 'SKU-015', categoryId: 'cat-2', costPrice: 2.50, salePrice: 4.80, stock: 40, minStock: 10, unit: 'ცალი', isActive: true, branchId: 'branch-1', createdAt: '2024-05-01T10:00:00Z', updatedAt: '2024-12-01T10:00:00Z' },
  { id: 'prod-16', name: 'შოკოლადი მილკა 100გ', sku: 'SKU-016', categoryId: 'cat-2', costPrice: 2.20, salePrice: 4.50, stock: 55, minStock: 12, unit: 'ცალი', isActive: true, branchId: 'branch-1', createdAt: '2024-05-01T10:00:00Z', updatedAt: '2024-12-01T10:00:00Z' },
  { id: 'prod-17', name: 'ფანტა 1ლ', sku: 'SKU-017', categoryId: 'cat-1', costPrice: 1.80, salePrice: 3.20, stock: 70, minStock: 15, unit: 'ცალი', isActive: true, branchId: 'branch-1', createdAt: '2024-05-15T10:00:00Z', updatedAt: '2024-12-01T10:00:00Z' },
  { id: 'prod-18', name: 'ტუალეტის ქაღალდი 4ც', sku: 'SKU-018', categoryId: 'cat-3', costPrice: 3.00, salePrice: 5.80, stock: 28, minStock: 8, unit: 'პაკეტი', isActive: true, branchId: 'branch-1', createdAt: '2024-06-01T10:00:00Z', updatedAt: '2024-12-01T10:00:00Z' },
  { id: 'prod-19', name: 'მაკარონი 500გ', sku: 'SKU-019', categoryId: 'cat-2', costPrice: 1.20, salePrice: 2.30, stock: 65, minStock: 15, unit: 'ცალი', isActive: true, branchId: 'branch-1', createdAt: '2024-06-01T10:00:00Z', updatedAt: '2024-12-01T10:00:00Z' },
  { id: 'prod-20', name: 'ზეთისხილის ზეთი 0.5ლ', sku: 'SKU-020', categoryId: 'cat-2', costPrice: 6.00, salePrice: 11.00, stock: 15, minStock: 5, unit: 'ცალი', isActive: true, branchId: 'branch-1', createdAt: '2024-06-15T10:00:00Z', updatedAt: '2024-12-01T10:00:00Z' },
]

const now = new Date()
const today = now.toISOString().split('T')[0]

function makeTime(hoursAgo: number): string {
  const d = new Date(now.getTime() - hoursAgo * 3600000)
  return d.toISOString()
}

export const MOCK_SALES: Sale[] = [
  {
    id: 'sale-1', receiptNumber: 'R-000001', branchId: 'branch-1', customerId: 'cust-1', customerName: 'ანა მაისურაძე',
    items: [
      { productId: 'prod-1', productName: 'კოკა-კოლა 0.5ლ', quantity: 3, unitPrice: 2.00, discount: 0, total: 6.00 },
      { productId: 'prod-5', productName: 'პური შავი', quantity: 1, unitPrice: 1.50, discount: 0, total: 1.50 },
    ],
    subtotal: 7.50, discount: 0, total: 7.50, paymentMethod: 'cash', cashReceived: 10, change: 2.50,
    status: 'completed', cashierId: 'user-1', cashierName: 'გიორგი ბერიძე', sessionId: 'session-1', createdAt: makeTime(1),
  },
  {
    id: 'sale-2', receiptNumber: 'R-000002', branchId: 'branch-1',
    items: [
      { productId: 'prod-4', productName: 'ხაჭაპური იმერული', quantity: 2, unitPrice: 6.50, discount: 0, total: 13.00 },
      { productId: 'prod-2', productName: 'ბორჯომი 0.5ლ', quantity: 2, unitPrice: 1.50, discount: 0, total: 3.00 },
    ],
    subtotal: 16.00, discount: 0, total: 16.00, paymentMethod: 'card',
    status: 'completed', cashierId: 'user-1', cashierName: 'გიორგი ბერიძე', sessionId: 'session-1', createdAt: makeTime(2),
  },
  {
    id: 'sale-3', receiptNumber: 'R-000003', branchId: 'branch-1', customerId: 'cust-3', customerName: 'ლევან ხარაიშვილი',
    items: [
      { productId: 'prod-13', productName: 'ღვინო საფერავი 0.75ლ', quantity: 1, unitPrice: 15.00, discount: 0, total: 15.00 },
      { productId: 'prod-8', productName: 'ყველი სულგუნი', quantity: 0.5, unitPrice: 14.00, discount: 0, total: 7.00 },
      { productId: 'prod-5', productName: 'პური შავი', quantity: 2, unitPrice: 1.50, discount: 0, total: 3.00 },
    ],
    subtotal: 25.00, discount: 2.50, total: 22.50, paymentMethod: 'cash', cashReceived: 25, change: 2.50,
    status: 'completed', cashierId: 'user-1', cashierName: 'გიორგი ბერიძე', sessionId: 'session-1', createdAt: makeTime(3),
  },
  {
    id: 'sale-4', receiptNumber: 'R-000004', branchId: 'branch-1',
    items: [
      { productId: 'prod-11', productName: 'მარლბორო წითელი', quantity: 2, unitPrice: 8.50, discount: 0, total: 17.00 },
      { productId: 'prod-14', productName: 'ლუდი ნატახტარი 0.5ლ', quantity: 4, unitPrice: 3.00, discount: 0, total: 12.00 },
    ],
    subtotal: 29.00, discount: 0, total: 29.00, paymentMethod: 'card',
    status: 'completed', cashierId: 'user-1', cashierName: 'გიორგი ბერიძე', sessionId: 'session-1', createdAt: makeTime(4),
  },
  {
    id: 'sale-5', receiptNumber: 'R-000005', branchId: 'branch-1', customerId: 'cust-2', customerName: 'დავით კაპანაძე',
    items: [
      { productId: 'prod-9', productName: 'სარეცხი ფხვნილი 3კგ', quantity: 1, unitPrice: 12.50, discount: 0, total: 12.50 },
      { productId: 'prod-18', productName: 'ტუალეტის ქაღალდი 4ც', quantity: 2, unitPrice: 5.80, discount: 0, total: 11.60 },
      { productId: 'prod-10', productName: 'კბილის პასტა', quantity: 1, unitPrice: 4.50, discount: 0, total: 4.50 },
    ],
    subtotal: 28.60, discount: 0, total: 28.60, paymentMethod: 'transfer',
    status: 'completed', cashierId: 'user-1', cashierName: 'გიორგი ბერიძე', sessionId: 'session-1', createdAt: makeTime(5),
  },
  {
    id: 'sale-6', receiptNumber: 'R-000006', branchId: 'branch-1',
    items: [
      { productId: 'prod-15', productName: 'ჩიფსი ლეისი 150გ', quantity: 3, unitPrice: 4.80, discount: 0, total: 14.40 },
      { productId: 'prod-16', productName: 'შოკოლადი მილკა 100გ', quantity: 2, unitPrice: 4.50, discount: 0, total: 9.00 },
      { productId: 'prod-17', productName: 'ფანტა 1ლ', quantity: 2, unitPrice: 3.20, discount: 0, total: 6.40 },
    ],
    subtotal: 29.80, discount: 0, total: 29.80, paymentMethod: 'cash', cashReceived: 30, change: 0.20,
    status: 'completed', cashierId: 'user-1', cashierName: 'გიორგი ბერიძე', sessionId: 'session-1', createdAt: makeTime(6),
  },
  {
    id: 'sale-7', receiptNumber: 'R-000007', branchId: 'branch-1',
    items: [
      { productId: 'prod-6', productName: 'რძე სოფლის 1ლ', quantity: 2, unitPrice: 4.20, discount: 0, total: 8.40 },
      { productId: 'prod-7', productName: 'კვერცხი 10ც', quantity: 1, unitPrice: 5.50, discount: 0, total: 5.50 },
    ],
    subtotal: 13.90, discount: 0, total: 13.90, paymentMethod: 'cash', cashReceived: 15, change: 1.10,
    status: 'completed', cashierId: 'user-1', cashierName: 'გიორგი ბერიძე', sessionId: 'session-1', createdAt: makeTime(7),
  },
  {
    id: 'sale-8', receiptNumber: 'R-000008', branchId: 'branch-1',
    items: [
      { productId: 'prod-19', productName: 'მაკარონი 500გ', quantity: 3, unitPrice: 2.30, discount: 0, total: 6.90 },
      { productId: 'prod-20', productName: 'ზეთისხილის ზეთი 0.5ლ', quantity: 1, unitPrice: 11.00, discount: 0, total: 11.00 },
    ],
    subtotal: 17.90, discount: 0, total: 17.90, paymentMethod: 'card',
    status: 'completed', cashierId: 'user-1', cashierName: 'გიორგი ბერიძე', sessionId: 'session-1', createdAt: makeTime(8),
  },
]

export const MOCK_CUSTOMERS: Customer[] = [
  { id: 'cust-1', fullName: 'ანა მაისურაძე', phone: '+995 555 11 11 11', email: 'ana@mail.ge', type: 'retail', loyaltyPoints: 250, totalPurchases: 45, totalSpent: 850.50, debt: 0, branchId: 'branch-1', createdAt: '2024-02-01T10:00:00Z' },
  { id: 'cust-2', fullName: 'დავით კაპანაძე', phone: '+995 555 22 22 22', email: 'davit@mail.ge', type: 'wholesale', loyaltyPoints: 1200, totalPurchases: 120, totalSpent: 15600.00, debt: 450.00, branchId: 'branch-1', createdAt: '2024-01-15T10:00:00Z' },
  { id: 'cust-3', fullName: 'ლევან ხარაიშვილი', phone: '+995 555 33 33 33', type: 'vip', loyaltyPoints: 3500, totalPurchases: 230, totalSpent: 32400.00, debt: 0, branchId: 'branch-1', createdAt: '2024-01-10T10:00:00Z' },
  { id: 'cust-4', fullName: 'ნინო გელაშვილი', phone: '+995 555 44 44 44', type: 'retail', loyaltyPoints: 80, totalPurchases: 12, totalSpent: 320.00, debt: 50.00, branchId: 'branch-1', createdAt: '2024-04-01T10:00:00Z' },
  { id: 'cust-5', fullName: 'თამარ ჯანიაშვილი', phone: '+995 555 55 55 55', email: 'tamar@mail.ge', type: 'wholesale', loyaltyPoints: 600, totalPurchases: 75, totalSpent: 8900.00, debt: 1200.00, branchId: 'branch-1', createdAt: '2024-03-01T10:00:00Z' },
  { id: 'cust-6', fullName: 'ზურაბ წიკლაური', phone: '+995 555 66 66 66', type: 'retail', loyaltyPoints: 150, totalPurchases: 28, totalSpent: 620.00, debt: 0, branchId: 'branch-1', createdAt: '2024-05-15T10:00:00Z' },
]

export const MOCK_SUPPLIERS: Supplier[] = [
  { id: 'sup-1', name: 'შპს "ნიკორა"', contactPerson: 'გიორგი ნიკოლაძე', phone: '+995 322 15 15 15', email: 'supply@nikora.ge', address: 'თბილისი', balance: -2500.00, branchId: 'branch-1', createdAt: '2024-01-20T10:00:00Z' },
  { id: 'sup-2', name: 'შპს "აგრო ჰაბი"', contactPerson: 'მარიამ ლომიძე', phone: '+995 322 20 20 20', email: 'info@agrohub.ge', address: 'რუსთავი', balance: -800.00, branchId: 'branch-1', createdAt: '2024-02-01T10:00:00Z' },
  { id: 'sup-3', name: 'შპს "კავკასუს ფუდ"', contactPerson: 'ნოდარ თურქია', phone: '+995 322 30 30 30', address: 'ქუთაისი', balance: 0, branchId: 'branch-1', createdAt: '2024-03-01T10:00:00Z' },
  { id: 'sup-4', name: 'ი/მ "ბაქარ ხვიჩია"', contactPerson: 'ბაქარ ხვიჩია', phone: '+995 555 99 88 77', address: 'ზუგდიდი', balance: -350.00, branchId: 'branch-1', createdAt: '2024-04-15T10:00:00Z' },
]

export const MOCK_CASH_SESSION: CashSession = {
  id: 'session-1',
  branchId: 'branch-1',
  cashierId: 'user-1',
  cashierName: 'გიორგი ბერიძე',
  openingBalance: 200.00,
  totalSales: 165.20,
  totalCash: 82.30,
  totalCard: 62.90,
  totalTransfer: 28.60,
  salesCount: 8,
  movements: [
    { id: 'mov-1', sessionId: 'session-1', type: 'in', amount: 50.00, reason: 'ხურდის შეტანა', createdAt: makeTime(9) },
    { id: 'mov-2', sessionId: 'session-1', type: 'out', amount: 20.00, reason: 'საოფისე ხარჯი', createdAt: makeTime(5) },
  ],
  status: 'open',
  openedAt: makeTime(10),
}
