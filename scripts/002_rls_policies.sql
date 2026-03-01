-- DASTA.GE Row Level Security Policies
-- Multi-tenant isolation: users can only see data belonging to their company

-- ============================================
-- Helper function: get current user's company_id
-- ============================================
CREATE OR REPLACE FUNCTION public.get_my_company_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT company_id FROM public.profiles WHERE id = auth.uid()
$$;

-- ============================================
-- Helper function: get current user's branch_ids
-- ============================================
CREATE OR REPLACE FUNCTION public.get_my_branch_ids()
RETURNS UUID[]
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT array_agg(branch_id) FROM public.profile_branches WHERE profile_id = auth.uid()
$$;

-- ============================================
-- COMPANIES RLS
-- ============================================
CREATE POLICY "Users can view own company"
  ON public.companies FOR SELECT
  USING (id = public.get_my_company_id());

CREATE POLICY "Owner can update own company"
  ON public.companies FOR UPDATE
  USING (id = public.get_my_company_id());

-- ============================================
-- PROFILES RLS
-- ============================================
CREATE POLICY "Users can view profiles in own company"
  ON public.profiles FOR SELECT
  USING (company_id = public.get_my_company_id());

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (id = auth.uid());

-- ============================================
-- BRANCHES RLS
-- ============================================
CREATE POLICY "Users can view branches in own company"
  ON public.branches FOR SELECT
  USING (company_id = public.get_my_company_id());

CREATE POLICY "Owner/Admin can insert branches"
  ON public.branches FOR INSERT
  WITH CHECK (company_id = public.get_my_company_id());

CREATE POLICY "Owner/Admin can update branches"
  ON public.branches FOR UPDATE
  USING (company_id = public.get_my_company_id());

CREATE POLICY "Owner/Admin can delete branches"
  ON public.branches FOR DELETE
  USING (company_id = public.get_my_company_id());

-- ============================================
-- PROFILE_BRANCHES RLS
-- ============================================
CREATE POLICY "Users can view own branch assignments"
  ON public.profile_branches FOR SELECT
  USING (profile_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() 
    AND p.role IN ('owner', 'admin')
    AND p.company_id = (SELECT company_id FROM public.profiles WHERE id = profile_branches.profile_id)
  ));

CREATE POLICY "Owner/Admin can manage branch assignments"
  ON public.profile_branches FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() 
    AND p.role IN ('owner', 'admin')
  ));

CREATE POLICY "Owner/Admin can delete branch assignments"
  ON public.profile_branches FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() 
    AND p.role IN ('owner', 'admin')
  ));

-- ============================================
-- CATEGORIES RLS
-- ============================================
CREATE POLICY "Users can view categories in own company"
  ON public.categories FOR SELECT
  USING (company_id = public.get_my_company_id());

CREATE POLICY "Users can insert categories in own company"
  ON public.categories FOR INSERT
  WITH CHECK (company_id = public.get_my_company_id());

CREATE POLICY "Users can update categories in own company"
  ON public.categories FOR UPDATE
  USING (company_id = public.get_my_company_id());

CREATE POLICY "Users can delete categories in own company"
  ON public.categories FOR DELETE
  USING (company_id = public.get_my_company_id());

-- ============================================
-- PRODUCTS RLS (branch-level)
-- ============================================
CREATE POLICY "Users can view products in accessible branches"
  ON public.products FOR SELECT
  USING (branch_id = ANY(public.get_my_branch_ids()));

CREATE POLICY "Users can insert products in accessible branches"
  ON public.products FOR INSERT
  WITH CHECK (branch_id = ANY(public.get_my_branch_ids()));

CREATE POLICY "Users can update products in accessible branches"
  ON public.products FOR UPDATE
  USING (branch_id = ANY(public.get_my_branch_ids()));

CREATE POLICY "Users can delete products in accessible branches"
  ON public.products FOR DELETE
  USING (branch_id = ANY(public.get_my_branch_ids()));

-- ============================================
-- CUSTOMERS RLS
-- ============================================
CREATE POLICY "Users can view customers in accessible branches"
  ON public.customers FOR SELECT
  USING (branch_id = ANY(public.get_my_branch_ids()));

CREATE POLICY "Users can insert customers in accessible branches"
  ON public.customers FOR INSERT
  WITH CHECK (branch_id = ANY(public.get_my_branch_ids()));

CREATE POLICY "Users can update customers in accessible branches"
  ON public.customers FOR UPDATE
  USING (branch_id = ANY(public.get_my_branch_ids()));

CREATE POLICY "Users can delete customers in accessible branches"
  ON public.customers FOR DELETE
  USING (branch_id = ANY(public.get_my_branch_ids()));

-- ============================================
-- SUPPLIERS RLS
-- ============================================
CREATE POLICY "Users can view suppliers in accessible branches"
  ON public.suppliers FOR SELECT
  USING (branch_id = ANY(public.get_my_branch_ids()));

CREATE POLICY "Users can insert suppliers in accessible branches"
  ON public.suppliers FOR INSERT
  WITH CHECK (branch_id = ANY(public.get_my_branch_ids()));

CREATE POLICY "Users can update suppliers in accessible branches"
  ON public.suppliers FOR UPDATE
  USING (branch_id = ANY(public.get_my_branch_ids()));

CREATE POLICY "Users can delete suppliers in accessible branches"
  ON public.suppliers FOR DELETE
  USING (branch_id = ANY(public.get_my_branch_ids()));

-- ============================================
-- CASH SESSIONS RLS
-- ============================================
CREATE POLICY "Users can view cash sessions in accessible branches"
  ON public.cash_sessions FOR SELECT
  USING (branch_id = ANY(public.get_my_branch_ids()));

CREATE POLICY "Users can insert cash sessions in accessible branches"
  ON public.cash_sessions FOR INSERT
  WITH CHECK (branch_id = ANY(public.get_my_branch_ids()));

CREATE POLICY "Users can update cash sessions in accessible branches"
  ON public.cash_sessions FOR UPDATE
  USING (branch_id = ANY(public.get_my_branch_ids()));

-- ============================================
-- CASH MOVEMENTS RLS
-- ============================================
CREATE POLICY "Users can view cash movements for their sessions"
  ON public.cash_movements FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.cash_sessions cs 
    WHERE cs.id = cash_movements.session_id 
    AND cs.branch_id = ANY(public.get_my_branch_ids())
  ));

CREATE POLICY "Users can insert cash movements for their sessions"
  ON public.cash_movements FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.cash_sessions cs 
    WHERE cs.id = cash_movements.session_id 
    AND cs.branch_id = ANY(public.get_my_branch_ids())
  ));

-- ============================================
-- SALES RLS
-- ============================================
CREATE POLICY "Users can view sales in accessible branches"
  ON public.sales FOR SELECT
  USING (branch_id = ANY(public.get_my_branch_ids()));

CREATE POLICY "Users can insert sales in accessible branches"
  ON public.sales FOR INSERT
  WITH CHECK (branch_id = ANY(public.get_my_branch_ids()));

CREATE POLICY "Users can update sales in accessible branches"
  ON public.sales FOR UPDATE
  USING (branch_id = ANY(public.get_my_branch_ids()));

-- ============================================
-- SALE ITEMS RLS
-- ============================================
CREATE POLICY "Users can view sale items for their sales"
  ON public.sale_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.sales s 
    WHERE s.id = sale_items.sale_id 
    AND s.branch_id = ANY(public.get_my_branch_ids())
  ));

CREATE POLICY "Users can insert sale items for their sales"
  ON public.sale_items FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.sales s 
    WHERE s.id = sale_items.sale_id 
    AND s.branch_id = ANY(public.get_my_branch_ids())
  ));
