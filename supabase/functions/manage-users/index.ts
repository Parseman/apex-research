import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Preflight CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // Client admin (service role) — contourne RLS
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Vérifier que l'appelant est authentifié
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Non autorisé.');

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) throw new Error('Non autorisé.');

    // Vérifier que l'appelant est admin
    const { data: callerProfile } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    if (callerProfile?.role !== 'admin') throw new Error('Accès refusé.');

    const body = await req.json() as { action: string; [key: string]: unknown };

    // ── Créer un utilisateur ──────────────────────────────────────────────────
    if (body.action === 'create_user') {
      const { email, password, role, createdBy } = body as {
        email: string; password: string; role: string; createdBy: string;
      };

      const { data, error } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });
      if (error) throw new Error(error.message);

      // Le trigger SQL crée déjà le profil ; on le met à jour avec le bon rôle
      const { error: profileError } = await adminClient.from('profiles').upsert({
        id: data.user.id,
        email,
        role: role ?? 'user',
        created_by: createdBy ?? 'admin',
      });
      if (profileError) throw new Error(profileError.message);

      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── Supprimer un utilisateur ──────────────────────────────────────────────
    if (body.action === 'delete_user') {
      const { userId } = body as { userId: string };
      const { error } = await adminClient.auth.admin.deleteUser(userId);
      if (error) throw new Error(error.message);

      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── Changer le rôle ───────────────────────────────────────────────────────
    if (body.action === 'update_role') {
      const { userId, role } = body as { userId: string; role: string };
      const { error } = await adminClient
        .from('profiles')
        .update({ role })
        .eq('id', userId);
      if (error) throw new Error(error.message);

      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── Changer le mot de passe ───────────────────────────────────────────────
    if (body.action === 'update_password') {
      const { userId, password } = body as { userId: string; password: string };
      const { error } = await adminClient.auth.admin.updateUserById(userId, { password });
      if (error) throw new Error(error.message);

      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error('Action inconnue.');

  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
