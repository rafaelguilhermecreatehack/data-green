-- Fix remaining security warnings

-- 1. Fix function search path mutable issues
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
  -- Log to postgres logs for now (can be enhanced with dedicated audit table)
  RAISE LOG 'AUDIT: User % performed % on %.% record %', 
    auth.uid(), action, 'public', table_name, record_id;
END;
$$;

-- 2. Update Auth configuration to reduce OTP expiry and enable leaked password protection
-- Note: These settings need to be configured in Supabase dashboard under Authentication settings

-- Create a function to help with password validation if needed
CREATE OR REPLACE FUNCTION public.validate_password_strength(password TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Basic password strength validation
  IF LENGTH(password) < 8 THEN
    RETURN FALSE;
  END IF;
  
  -- Check for at least one number
  IF NOT password ~ '[0-9]' THEN
    RETURN FALSE;
  END IF;
  
  -- Check for at least one uppercase letter
  IF NOT password ~ '[A-Z]' THEN
    RETURN FALSE;
  END IF;
  
  -- Check for at least one lowercase letter  
  IF NOT password ~ '[a-z]' THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$;