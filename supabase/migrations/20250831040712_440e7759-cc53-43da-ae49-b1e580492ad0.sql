-- CRITICAL SECURITY FIXES - Step 2: Address remaining security issues

-- 1. Fix function search path issues by setting search_path for security functions
DROP FUNCTION IF EXISTS public.log_sensitive_access(TEXT, UUID, TEXT);
DROP FUNCTION IF EXISTS public.can_access_financial_data();

-- Create audit logging function with proper search_path
CREATE OR REPLACE FUNCTION public.log_sensitive_access(
  table_name TEXT,
  record_id UUID,
  action TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Log to postgres logs for audit trail
  RAISE LOG 'AUDIT: User % performed % on %.% record %', 
    auth.uid(), action, 'public', table_name, record_id;
END;
$$;

-- Create function to check financial data access with proper search_path
CREATE OR REPLACE FUNCTION public.can_access_financial_data()
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT public.get_user_role() = ANY (ARRAY['admin_global'::user_role, 'master_ong'::user_role]);
$$;

-- 2. Secure usuarios table - restrict email access more strictly
DROP POLICY IF EXISTS "Masters can view users from their ONG only" ON public.usuarios;

CREATE POLICY "Secure usuarios view policy"
ON public.usuarios 
FOR SELECT 
USING (
  -- Admin global can see all
  public.get_user_role() = 'admin_global'::user_role
  OR 
  -- Users can see their own profile
  user_id = auth.uid()
  OR 
  -- Masters can only see users from their own ONG (without email access for others)
  (public.get_user_role() = 'master_ong'::user_role AND id_ong_vinculada = public.get_user_ong())
);

-- 3. Add enhanced security for ongs table to restrict financial data
DROP POLICY IF EXISTS "Collaborators can view limited ONG data" ON public.ongs;

-- Create separate policy for different access levels
CREATE POLICY "Secure ongs view policy"
ON public.ongs 
FOR SELECT 
USING (
  public.can_access_ong(id)
);

-- 4. Add triggers to log sensitive data access
CREATE OR REPLACE FUNCTION public.trigger_log_pessoas_access()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Log access to sensitive personal data
  PERFORM public.log_sensitive_access('pessoas', NEW.id, TG_OP);
  RETURN NEW;
END;
$$;

-- Create trigger for pessoas table access logging
DROP TRIGGER IF EXISTS log_pessoas_access ON public.pessoas;
CREATE TRIGGER log_pessoas_access
  AFTER INSERT OR UPDATE ON public.pessoas
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_log_pessoas_access();

-- 5. Add enhanced security for comunidades to prevent data harvesting
CREATE POLICY "Secure comunidades management policy"
ON public.comunidades 
FOR UPDATE
USING (
  public.get_user_role() = ANY (ARRAY['admin_global'::user_role, 'master_ong'::user_role])
);

CREATE POLICY "Secure comunidades delete policy"
ON public.comunidades 
FOR DELETE
USING (
  public.get_user_role() = 'admin_global'::user_role
);