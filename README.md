# DASTA.GE -- SaaS POS System

ქართული ბიზნესებისთვის შექმნილი SaaS POS და ინვენტარის მართვის პლატფორმა.

## ტექნიკური სტეკი

| ტექნოლოგია | გამოყენება |
|---|---|
| Next.js 16 | App Router, RSC, Middleware |
| TypeScript | ტიპიზაცია |
| Tailwind CSS v4 | სტილიზაცია |
| shadcn/ui | UI კომპონენტები |
| Supabase | Auth, Database, RLS |
| Recharts | გრაფიკები |
| Lucide Icons | იკონები |

---

## გაკეთებული (Done)

### Supabase ინტეგრაცია (სრული მიგრაცია)
- [x] Supabase Auth -- რეგისტრაცია, ავტორიზაცია, გამოსვლა (email/password)
- [x] Middleware -- route protection, session refresh
- [x] Supabase Client -- Browser + Server + Proxy setup (`lib/supabase/`)
- [x] AuthContext -- Supabase Auth + profiles + companies fetch
- [x] BranchContext -- ფილიალების ჩატვირთვა Supabase-დან
- [x] InventoryContext -- პროდუქტები + კატეგორიები Supabase CRUD
- [x] SalesContext -- გაყიდვები + sale_items Supabase CRUD (cart in-memory)
- [x] CustomerContext -- კლიენტები Supabase CRUD
- [x] SupplierContext -- მომწოდებლები Supabase CRUD
- [x] CashRegisterContext -- სალაროს სესიები + მოძრაობები Supabase CRUD
- [x] AppProviders -- Auth gate + loading state

### Frontend UI
- [x] Auth გვერდები -- Login, Register, Forgot Password
- [x] Dashboard -- KPI ბარათები, გრაფიკები, შეტყობინებები
- [x] POS (გაყიდვის წერტილი) -- პროდუქტის ბადე, კალათა, გადახდის მოდალი, ჩეკი
- [x] ინვენტარი -- პროდუქტების CRUD, ძიება, ფილტრი
- [x] კატეგორიები -- კატეგორიების მართვა, ფერები, CRUD
- [x] გაყიდვების ისტორია -- ცხრილი, დეტალები, დაბრუნება, ბეჭდვა
- [x] კლიენტები -- CRUD, ლოიალობის ქულები, დავალიანება
- [x] მომწოდებლები -- CRUD, ბალანსი
- [x] სალარო -- სესიები, ფულის მოძრაობა
- [x] ბუღალტერია -- მოგება-ზარალი, დებიტორები, გადასახადი
- [x] RS.GE -- Mock UI (ზედნადებები, ინვოისები)
- [x] შეტყობინებები -- მარაგის გაფრთხილებები
- [x] პარამეტრები -- კომპანია, ფილიალი, თემა

### Layout და კომპონენტები
- [x] Sidebar -- ნავიგაცია, ფილიალის გადართვა
- [x] Topbar -- ძიება, Command Palette, პროფილი, გამოსვლა
- [x] Dark/Light mode -- თემის გადართვა
- [x] Print System -- 80mm თერმული + A4 ფორმატი

---

## გასაკეთებელი (TODO)

### P1 -- მაღალი პრიორიტეტი
- [ ] Stripe Billing -- 4 გეგმა (free/starter/pro/enterprise), checkout, webhooks, /pricing, /billing
- [ ] RS.GE ნამდვილი API -- SOAP client, ზედნადებები, ინვოისები, სინქრონიზაცია

### P2 -- აუცილებელი გვერდები
- [ ] შეძენები (/purchases) -- მომწოდებლებისგან შეძენის ისტორია
- [ ] ტრანსფერები (/transfers) -- ფილიალებს შორის პროდუქტის გადატანა
- [ ] ინვენტარიზაცია (/adjustments) -- მარაგის კორექტირება
- [ ] ანგარიშები (/reports) -- გაფართოებული რეპორტები
- [ ] მომხმარებლები (/users) -- თანამშრომლების მართვა, როლები
- [ ] კომპანია (/company) -- კომპანიის პარამეტრები
- [ ] Onboarding (/onboarding) -- ახალი მომხმარებლის wizard

### P3 -- ბარკოდ სკანერი
- [ ] Camera Scanner -- @zxing ბიბლიოთეკა, POS/Inventory ინტეგრაცია

### P4 -- POS Premium ფუნქციები
- [ ] Loyalty Redemption, Gift Cards, Promo Codes
- [ ] Price Tiers, Happy Hour

### P5 -- იმპორტი/ექსპორტი
- [ ] Excel Import/Export -- პროდუქტები, გაყიდვები, P&L, VAT
- [ ] PDF Generation -- ჩეკები, ინვოისები, ანგარიშები

### P6 -- დამატებითი ფუნქციები
- [ ] EOD Report, VAT Tab, Debt Dashboard, Backup, Audit Log

### P7 -- PWA და Performance
- [ ] PWA -- manifest.json, service worker, keyboard shortcuts

### P8 -- Polish
- [ ] Zod Validation, Skeleton Loaders, Error Boundaries, Animations, Mobile

---

## პროექტის სტრუქტურა

```
app/
  (auth)/           -- Login, Register, Forgot Password
  (dashboard)/
    [branchId]/     -- Dashboard, POS, Inventory, Sales, Categories, etc.
  page.tsx          -- Root redirect
components/
  layout/           -- Sidebar, Topbar
  providers/        -- AppProviders (auth gate)
  ui/               -- shadcn/ui components
contexts/           -- Auth, Branch, Inventory, Sales, Customer, Supplier, CashRegister, Theme
lib/
  supabase/         -- client.ts, server.ts, proxy.ts
  types.ts          -- TypeScript types
  constants.ts      -- Navigation, plans, categories
  utils.ts          -- Formatting, helpers
  print-utils.ts    -- Receipt/report printing
middleware.ts       -- Route protection + session refresh
```

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```
