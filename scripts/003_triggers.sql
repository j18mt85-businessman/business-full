-- DASTA.GE Triggers
-- Auto-create profile on signup, auto-deduct stock on sale

-- ============================================
-- Trigger: Auto-create profile on auth.users insert
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_company_id UUID;
  v_branch_id UUID;
BEGIN
  -- Check if user metadata has company info (from registration)
  IF new.raw_user_meta_data ? 'company_name' THEN
    -- Create company
    INSERT INTO public.companies (name, tax_id, address, phone, email)
    VALUES (
      coalesce(new.raw_user_meta_data ->> 'company_name', 'ახალი კომპანია'),
      coalesce(new.raw_user_meta_data ->> 'tax_id', null),
      coalesce(new.raw_user_meta_data ->> 'company_address', null),
      coalesce(new.raw_user_meta_data ->> 'company_phone', null),
      new.email
    )
    RETURNING id INTO v_company_id;

    -- Create default branch
    INSERT INTO public.branches (company_id, name, address, phone)
    VALUES (
      v_company_id,
      coalesce(new.raw_user_meta_data ->> 'branch_name', 'მთავარი მაღაზია'),
      coalesce(new.raw_user_meta_data ->> 'branch_address', null),
      coalesce(new.raw_user_meta_data ->> 'branch_phone', null)
    )
    RETURNING id INTO v_branch_id;

    -- Create profile as owner
    INSERT INTO public.profiles (id, email, full_name, role, company_id)
    VALUES (
      new.id,
      new.email,
      coalesce(new.raw_user_meta_data ->> 'full_name', ''),
      'owner',
      v_company_id
    )
    ON CONFLICT (id) DO NOTHING;

    -- Link profile to branch
    INSERT INTO public.profile_branches (profile_id, branch_id)
    VALUES (new.id, v_branch_id)
    ON CONFLICT DO NOTHING;

    -- Create default categories for the company
    INSERT INTO public.categories (company_id, name, color, sort_order) VALUES
      (v_company_id, 'სასმელები', '#3b82f6', 1),
      (v_company_id, 'საკვები', '#ef4444', 2),
      (v_company_id, 'საყოფაცხოვრებო', '#f59e0b', 3),
      (v_company_id, 'ჰიგიენა', '#8b5cf6', 4),
      (v_company_id, 'თამბაქო', '#6b7280', 5),
      (v_company_id, 'ალკოჰოლი', '#dc2626', 6),
      (v_company_id, 'წვნიანები', '#10b981', 7),
      (v_company_id, 'რძის პროდ.', '#06b6d4', 8);
  ELSE
    -- Simple signup without company (invited user, etc.)
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
      new.id,
      new.email,
      coalesce(new.raw_user_meta_data ->> 'full_name', ''),
      'cashier'
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;

  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- Trigger: Auto-deduct stock on sale item insert
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_sale_item_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.products
  SET stock = GREATEST(0, stock - NEW.quantity),
      updated_at = now()
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_sale_item_created ON public.sale_items;

CREATE TRIGGER on_sale_item_created
  AFTER INSERT ON public.sale_items
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_sale_item_insert();

-- ============================================
-- Trigger: Auto-restore stock on sale return
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_sale_return()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'returned' AND OLD.status = 'completed' THEN
    UPDATE public.products p
    SET stock = stock + si.quantity,
        updated_at = now()
    FROM public.sale_items si
    WHERE si.sale_id = NEW.id AND si.product_id = p.id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_sale_returned ON public.sales;

CREATE TRIGGER on_sale_returned
  AFTER UPDATE ON public.sales
  FOR EACH ROW
  WHEN (NEW.status IS DISTINCT FROM OLD.status)
  EXECUTE FUNCTION public.handle_sale_return();

-- ============================================
-- Trigger: Auto-update updated_at
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_branches_updated_at BEFORE UPDATE ON public.branches FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON public.suppliers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
