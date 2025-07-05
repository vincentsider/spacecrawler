-- Admin authentication setup
-- This migration sets up admin user management

-- Create a custom claim for admin role
CREATE OR REPLACE FUNCTION auth.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  claims jsonb;
  user_email text;
BEGIN
  -- Get the user email from the JWT
  user_email := event->>'email';
  
  -- Initialize claims
  claims := event->'claims';
  
  -- Check if user email is in admin list
  -- Add your admin emails here
  IF user_email IN ('admin@spacecrawler.com', 'vincent@example.com') THEN
    claims := jsonb_set(claims, '{role}', '"admin"');
  ELSE
    claims := jsonb_set(claims, '{role}', '"user"');
  END IF;
  
  -- Update the event with new claims
  event := jsonb_set(event, '{claims}', claims);
  
  RETURN event;
END;
$$;

-- Grant execute permission to the service role
GRANT EXECUTE ON FUNCTION auth.custom_access_token_hook TO service_role;

-- Configure the hook (this needs to be done via Supabase dashboard or API)
-- Go to Authentication > Hooks and set up the custom_access_token_hook

-- Create a function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.jwt() ->> 'role' = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;