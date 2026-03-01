# DASTA.GE -- Multi-Tenant SaaS POS & Business Management Platform

## Overview

DASTA (`dasta.ge`) is a production-oriented, multi-tenant SaaS POS and business management platform built exclusively for Georgian businesses. The entire UI is in **Georgian language (kartuli)**. Currency is **Georgian Lari (GEL/Lari)** using the symbol `₾`. All dates use Georgian locale.

**Current state:** Frontend MVP with mock data (React Context). No backend integrations yet.

---

## Tech Stack

| Layer        | Technology                                                      |
| ------------ | --------------------------------------------------------------- |
| Framework    | Next.js 16 (App Router, TypeScript)                             |
| Styling      | Tailwind CSS v4, custom CSS design tokens                       |
| UI Library   | shadcn/ui (Radix UI primitives), Lucide React icons             |
| Charts       | Recharts                                                        |
| State        | React Context (8 providers) -- all in-memory, no persistence    |
| Font         | Noto Sans Georgian (via Google Fonts)                           |
| Language     | 100% Georgian UI                                                |

---

## Project Structure

```
app/
  layout.tsx                          # Root layout -- fonts, AppProviders wrapper
  page.tsx                            # Redirects to /branch-1 (dashboard)
  globals.css                         # DASTA design system tokens + Tailwind v4 config

  (auth)/
    layout.tsx                        # Auth layout (centered, no sidebar)
    login/page.tsx                    # Login -- email/password, mock auth
    register/page.tsx                 # Registration -- company + user info
    forgot-password/page.tsx          # Password reset form

  (dashboard)/[branchId]/
    layout.tsx                        # Dashboard shell -- Sidebar + Topbar + CommandPalette
    page.tsx                          # Main Dashboard -- KPI cards, charts, recent activity
    pos/page.tsx                      # POS System -- product grid + cart + payment + receipt
    inventory/page.tsx                # Inventory Management -- CRUD, filters, categories
    sales/page.tsx                    # Sales History -- table, filters, receipt printing
    customers/page.tsx                # Customer Management -- CRUD, loyalty, types
    suppliers/page.tsx                # Supplier Management -- CRUD, balance tracking
    cash-register/page.tsx            # Cash Register -- sessions, movements
    accounting/page.tsx               # Accounting -- P&L, receivables, tax estimates
    rsge/page.tsx                     # RS.GE Integration -- waybills, invoices, config
    alerts/page.tsx                   # Stock Alerts -- low inventory warnings
    settings/page.tsx                 # Settings -- company, branch, profile, theme

components/
  layout/
    Sidebar.tsx                       # Collapsible sidebar with nav sections, branch switcher
    Topbar.tsx                        # Top bar with search, notifications, user menu

  providers/
    AppProviders.tsx                  # Wraps all 8 context providers

  ui/
    CommandPalette.tsx                # Ctrl+K quick navigation (uses cmdk)
    (shadcn/ui components...)         # button, dialog, badge, input, card, etc.

contexts/
  AuthContext.tsx                     # useAuth() -- login, logout, register, user state
  BranchContext.tsx                   # useBranch() -- currentBranch, branches, switchBranch
  InventoryContext.tsx                # useInventory() -- products CRUD, categories, alerts, stock
  SalesContext.tsx                    # useSales() -- sales, addSale, returnSale, cart management
  CustomerContext.tsx                 # useCustomers() -- customers CRUD, loyalty management
  SupplierContext.tsx                 # useSuppliers() -- suppliers CRUD, balance tracking
  CashRegisterContext.tsx             # useCashRegister() -- sessions, openSession, closeSession, addMovement
  ThemeContext.tsx                    # useTheme() -- dark/light/system toggle

lib/
  types.ts                           # All TypeScript interfaces & types (180 lines)
  constants.ts                       # SIDEBAR_NAV, CATEGORIES, PAYMENT_METHODS, PLAN_LIMITS, UNITS
  mock-data.ts                       # Realistic Georgian mock data (20 products, 8 sales, 6 customers, 4 suppliers)
  utils.ts                           # formatCurrency, formatDate, generateId, timeAgo, getPaymentLabel, etc.
  print-utils.ts                     # printReceipt (80mm thermal), printReport (A4)
```

---

## Context Providers (Data Layer)

All state is in-memory via React Context. Each provider holds mock data and exposes CRUD methods.

### `useAuth()`
- `user: User | null` -- current logged in user
- `company: Company` -- company info
- `isAuthenticated: boolean`
- `login(email, password)` -- mock login (any credentials work)
- `logout()`
- `register(data)` -- mock registration

### `useBranch()`
- `currentBranch: Branch` -- active branch
- `branches: Branch[]` -- all branches
- `switchBranch(branchId)` -- switch active branch

### `useInventory()`
- `products: Product[]` -- filtered by current branch
- `categories: Category[]`
- `alerts: StockAlert[]` -- auto-generated when stock < minStock
- `addProduct(data)`, `updateProduct(id, data)`, `deleteProduct(id)`
- `updateStock(id, newStock)` -- update stock level
- `getCategoryName(categoryId)` -- helper

### `useSales()`
- `sales: Sale[]` -- all sales for current branch
- `cart: CartItem[]` -- POS cart state
- `addToCart(product)`, `removeFromCart(productId)`, `updateCartQuantity(productId, qty)`
- `clearCart()`, `cartTotal: number`
- `addSale(sale)` -- complete a sale, updates inventory
- `returnSale(saleId)` -- process return

### `useCustomers()`
- `customers: Customer[]`
- `addCustomer(data)`, `updateCustomer(id, data)`, `deleteCustomer(id)`

### `useSuppliers()`
- `suppliers: Supplier[]`
- `addSupplier(data)`, `updateSupplier(id, data)`, `deleteSupplier(id)`

### `useCashRegister()`
- `currentSession: CashSession | null`
- `pastSessions: CashSession[]`
- `openSession(openingBalance)` -- start new session
- `closeSession(closingBalance, note?)` -- close session with balance
- `addMovement(type: 'in'|'out', amount, reason)` -- cash in/out

### `useTheme()`
- `theme: 'light' | 'dark' | 'system'`
- `setTheme(theme)` -- toggle theme

---

## Design System

CSS variables defined in `app/globals.css`:

| Token                | Light                        | Purpose                    |
| -------------------- | ---------------------------- | -------------------------- |
| `--dasta-green`      | `#22c55e`                    | Primary brand color        |
| `--dasta-navy`       | `#0f1724`                    | Sidebar background         |
| `--dasta-navy-light` | `#1a2332`                    | Sidebar hover              |
| `--dasta-success`    | `#22c55e`                    | Success states             |
| `--dasta-danger`     | `#ef4444`                    | Error/danger states        |
| `--dasta-warning`    | `#f59e0b`                    | Warning states             |
| `--dasta-info`       | `#3b82f6`                    | Info/card payments         |
| `--background`       | `#f9fafb` / `#0a0a0a`       | Page background            |
| `--card`             | `#ffffff` / `#111111`        | Card background            |

Font stack: `'Noto Sans Georgian'` for all text (Georgian script support).

---

## Key Features Implemented

### 1. POS System (`/pos`)
- Split layout: Product grid (left) + Cart panel (right)
- Real-time search and category filtering
- Cart with quantity controls, discount per item
- Full payment modal: cash, card, transfer methods
- Cash payment with change calculation
- Receipt generation with print functionality (80mm thermal format)
- Keyboard shortcut support (Ctrl+K for command palette)

### 2. Dashboard (`/`)
- 4 KPI stat cards: daily revenue, checks count, average check, active products
- Daily sales bar chart (Recharts)
- Category distribution pie chart
- Recent transactions list
- Low stock alerts panel

### 3. Inventory (`/inventory`)
- Full CRUD: add, edit, delete products
- Search by name, SKU, barcode
- Filter by category
- Sortable table with stock status badges
- Inline stock level display with color coding

### 4. Sales History (`/sales`)
- Filterable sales table (by date, payment method, status)
- Sale detail dialog with item breakdown
- Return processing
- Receipt printing per sale
- Full sales report printing (A4 format)

### 5. Customers (`/customers`)
- 3 customer types: retail, wholesale, VIP
- Loyalty points tracking
- Debt tracking per customer
- Full CRUD operations

### 6. Suppliers (`/suppliers`)
- Supplier management with balance tracking
- Contact info, address management
- Full CRUD

### 7. Cash Register (`/cash-register`)
- Session management: open/close with balance tracking
- Cash movements: in/out with reasons
- Past sessions history
- Balance verification on close

### 8. Accounting (`/accounting`)
- 4 tabs: Overview, P&L Statement, Receivables/Payables, Tax Estimates
- Automated calculations from sales data
- Bar chart (daily revenue) and pie chart (payment methods)
- Georgian tax rates: VAT 18%, Income Tax 15%
- Printable report

### 9. RS.GE Integration (`/rsge`)
- Connection settings form (TIN, service user, password)
- Waybill management (mock data with types: internal, incoming, outgoing, return)
- Status tracking: draft, active, confirmed, cancelled
- Invoice management
- Auto-send configuration
- Print functionality for waybills

### 10. Print System
- `printReceipt()` -- 80mm thermal receipt format with Georgian text
- `printReport()` -- A4 report format with sections and table data
- Used across: POS receipts, sales reports, accounting reports, RS.GE waybills

### 11. Settings (`/settings`)
- Company info editing
- Branch management
- User profile editing
- Theme toggle (light/dark/system)

### 12. Other
- Command Palette (Ctrl+K) for quick navigation
- Stock alert system (auto-generated when product stock < minStock)
- Responsive sidebar with collapse
- Branch switcher in sidebar
- Mobile-responsive topbar

---

## Routing

All dashboard routes use dynamic `[branchId]` segment:

| Route                             | Page                  |
| --------------------------------- | --------------------- |
| `/`                               | Redirect to /branch-1 |
| `/login`                          | Login page            |
| `/register`                       | Registration page     |
| `/forgot-password`                | Password reset        |
| `/[branchId]`                     | Dashboard             |
| `/[branchId]/pos`                 | POS System            |
| `/[branchId]/inventory`           | Inventory             |
| `/[branchId]/sales`               | Sales History         |
| `/[branchId]/customers`           | Customers             |
| `/[branchId]/suppliers`           | Suppliers             |
| `/[branchId]/cash-register`       | Cash Register         |
| `/[branchId]/accounting`          | Accounting            |
| `/[branchId]/rsge`                | RS.GE Integration     |
| `/[branchId]/alerts`              | Stock Alerts          |
| `/[branchId]/settings`            | Settings              |

---

## TypeScript Types (lib/types.ts)

Main interfaces:
- `Company` -- id, name, taxId, address, phone, email, plan
- `Branch` -- id, companyId, name, address, phone, isActive
- `User` -- id, email, fullName, role (owner/admin/manager/cashier), companyId, branchIds
- `Product` -- id, name, sku, barcode, categoryId, costPrice, salePrice, stock, minStock, unit
- `CartItem` -- product, quantity, discount, total
- `Sale` -- id, receiptNumber, items[], subtotal, discount, total, paymentMethod, status
- `SaleItem` -- productId, productName, quantity, unitPrice, discount, total
- `Customer` -- id, fullName, phone, email, type (retail/wholesale/vip), loyaltyPoints, debt
- `Supplier` -- id, name, contactPerson, phone, email, balance
- `CashSession` -- openingBalance, closingBalance, totalSales, totalCash, totalCard, movements[]
- `CashMovement` -- type (in/out), amount, reason
- `StockAlert` -- productId, currentStock, minStock, severity
- `PaymentMethod` -- 'cash' | 'card' | 'transfer' | 'mixed'
- `CustomerType` -- 'retail' | 'wholesale' | 'vip'

---

## Mock Data (lib/mock-data.ts)

- 1 Company: "dasta tekhnologiebi" (professional plan)
- 3 Branches: main store, Vake branch, Saburtalo branch
- 1 User: admin "Giorgi Beridze"
- 8 Product categories: beverages, food, household, hygiene, tobacco, alcohol, soups, dairy
- 20 Products: realistic Georgian retail items with barcodes, prices in GEL
- 8 Sales: recent transactions with items, payment methods, receipt numbers
- 6 Customers: retail, wholesale, VIP types with loyalty and debt
- 4 Suppliers: Georgian companies with balances
- 1 Active cash session with 2 movements

---

## What Needs To Be Done (TODO)

### Priority 1 -- Backend Integration

1. **Supabase Integration**
   - Connect Supabase project
   - Create database schema (see `DASTA_ULTIMATE_PROMPT` Part 2 for full SQL)
   - Tables needed: companies, branches, users, products, categories, sales, sale_items, customers, suppliers, cash_sessions, cash_movements, invoices, waybills
   - Enable Row Level Security (RLS) with company_id tenant isolation
   - Replace all React Context mock data with Supabase queries
   - Implement real authentication with Supabase Auth (email/password + Google OAuth)
   - Add real-time subscriptions for POS updates across tabs

2. **Stripe Integration**
   - Connect Stripe project
   - Implement subscription billing (4 plans: free, starter, professional, enterprise)
   - Plan limits enforcement (see `PLAN_LIMITS` in constants.ts)
   - Checkout flow, customer portal, webhook handling
   - Add `/pricing` page and `/billing` page

3. **RS.GE SOAP API Integration**
   - Implement real RS.GE SOAP service connection (waybill service)
   - Endpoints: save_waybill, get_waybill, send_waybill, get_waybill_types
   - Replace mock waybill/invoice data with real API calls
   - Auto-sync configuration
   - See `DASTA_ULTIMATE_PROMPT` Part 6 for full SOAP API spec

### Priority 2 -- Missing Pages

4. **Categories Page** (`/categories`) -- separate page for category management (CRUD)
5. **Reports Page** (`/reports`) -- advanced analytics with date range filters, export
6. **Users/Staff Page** (`/users`) -- team management, role assignment, permissions
7. **Pricing/Landing Page** (`/pricing`) -- public pricing page for the SaaS
8. **Onboarding Flow** -- multi-step wizard after registration (company setup, branch, first product)
9. **Billing Page** (`/billing`) -- Stripe subscription management

### Priority 3 -- Features

10. **Barcode Scanner** -- camera-based barcode scanning for POS (use @zxing/library)
11. **Excel Export/Import** -- product bulk import via XLSX, sales export
12. **PDF Generation** -- proper PDF receipts and reports (jspdf + jspdf-autotable)
13. **PWA Support** -- offline-capable with next-pwa, service worker for POS
14. **Real-time Notifications** -- toast notifications for sales, low stock, etc.
15. **Keyboard Shortcuts** -- full POS keyboard shortcut system (F1-F12 for categories, etc.)
16. **Multi-language** -- i18n support if needed (currently Georgian only)
17. **Audit Log** -- track all user actions for compliance
18. **Batch Operations** -- bulk price updates, stock adjustments

### Priority 4 -- Polish

19. **Form Validation** -- add Zod schemas + react-hook-form to all forms
20. **Error Boundaries** -- add error boundaries to all pages
21. **Loading States** -- skeleton loaders for all data-dependent pages
22. **Animations** -- framer-motion page transitions and micro-interactions
23. **Responsive Design** -- full mobile optimization for all pages
24. **Accessibility** -- ARIA labels, keyboard navigation, screen reader support

---

## How to Replace Mock Data with Supabase

When Supabase is connected, follow this migration pattern for each context:

```typescript
// BEFORE (mock): contexts/InventoryContext.tsx
const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS)

// AFTER (Supabase):
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()
const [products, setProducts] = useState<Product[]>([])

useEffect(() => {
  async function fetchProducts() {
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('branch_id', currentBranch.id)
    setProducts(data || [])
  }
  fetchProducts()
}, [currentBranch.id])

// CRUD methods: replace setState with supabase.from('products').insert/update/delete
```

---

## Environment Variables Needed

```env
# Supabase (when connected)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe (when connected)
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# RS.GE (when connected)
RS_DEFAULT_SU=                      # RS.GE service username
RS_DEFAULT_SP=                      # RS.GE service password

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Running Locally

```bash
pnpm install
pnpm dev
```

Navigate to `http://localhost:3000`. The app redirects to `/branch-1` (dashboard).
Login with any email/password (mock auth accepts all credentials).

---

## Original Spec

The full original specification is in `DASTA_ULTIMATE_PROMPT-jQbYI.md` (1626 lines). It contains:
- Part 0: Tech stack and installation
- Part 1: Full CSS design system specification
- Part 2: Complete Supabase SQL schema with RLS policies
- Part 3: Multi-tenant authentication system
- Part 4: Stripe subscription billing
- Part 5: Complete component specifications for all 37+ pages
- Part 6: RS.GE SOAP API integration details
- Part 7-16: Detailed page specifications, PWA, barcode, keyboard shortcuts
