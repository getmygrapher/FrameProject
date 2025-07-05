import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface CreateAdminRequest {
  email: string;
  password: string;
  fullName: string;
  role: 'admin' | 'super_admin';
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Initialize Supabase client with service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check if there are any existing admin users first
    const { data: existingAdmins, error: countError } = await supabaseAdmin
      .from('admin_users')
      .select('id', { count: 'exact' });

    if (countError) {
      console.error('Error checking existing admins:', countError);
      return new Response(
        JSON.stringify({ error: 'Failed to verify admin status' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const isFirstAdmin = !existingAdmins || existingAdmins.length === 0;

    // Only require authorization if this is NOT the first admin
    if (!isFirstAdmin) {
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        return new Response(
          JSON.stringify({ error: 'Authorization header required' }),
          { 
            status: 401, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Initialize regular client to verify the requesting user
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? ''
      );

      // Verify the requesting user is authenticated
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

      if (userError || !user) {
        return new Response(
          JSON.stringify({ error: 'Invalid authentication token' }),
          { 
            status: 401, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Verify the requesting user is an active admin
      const { data: adminUser, error: adminError } = await supabaseClient
        .from('admin_users')
        .select('id, role, is_active')
        .eq('id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (adminError) {
        console.error('Error checking admin user:', adminError);
        return new Response(
          JSON.stringify({ error: 'Failed to verify admin status' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      if (!adminUser) {
        return new Response(
          JSON.stringify({ error: 'Access denied. Admin privileges required.' }),
          { 
            status: 403, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    }

    // Parse request body
    const body: CreateAdminRequest = await req.json();
    let { email, password, fullName, role } = body;

    // Validate input
    if (!email || !password || !fullName) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: email, password, fullName' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // For the first admin, automatically assign super_admin role
    if (isFirstAdmin) {
      role = 'super_admin';
    } else if (!role || !['admin', 'super_admin'].includes(role)) {
      return new Response(
        JSON.stringify({ error: 'Invalid role. Must be admin or super_admin' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (password.length < 8) {
      return new Response(
        JSON.stringify({ error: 'Password must be at least 8 characters long' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create the auth user using admin client
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName
      }
    });

    if (authError) {
      console.error('Error creating auth user:', authError);
      return new Response(
        JSON.stringify({ error: `Failed to create user account: ${authError.message}` }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!authData.user) {
      return new Response(
        JSON.stringify({ error: 'Failed to create user account' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create the admin record using admin client
    const { data: adminData, error: adminInsertError } = await supabaseAdmin
      .from('admin_users')
      .insert({
        id: authData.user.id,
        email,
        full_name: fullName,
        role,
        is_active: true
      })
      .select()
      .single();

    if (adminInsertError) {
      console.error('Error creating admin user:', adminInsertError);
      
      // Clean up auth user if admin creation fails
      try {
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      } catch (cleanupError) {
        console.error('Error cleaning up auth user:', cleanupError);
      }
      
      return new Response(
        JSON.stringify({ error: `Failed to create admin record: ${adminInsertError.message}` }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        admin: adminData,
        isFirstAdmin 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});