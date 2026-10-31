import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

/**
 * Service-role client. Bypasses RLS — only use in trusted server contexts.
 * Falls back to public key if service role key is not configured.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL env var.");
  }

  return createSupabaseClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function getAuthUserOrAdmin() {
  const supabase = await createClient();
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      return { user, db: supabase, isAdminFallback: false };
    }
  } catch {
    // ignore
  }

  // If SUPABASE_SERVICE_ROLE_KEY is present, attempt demo admin user resolution
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const adminDb = createAdminClient();
      const { data: usersData } = await adminDb.auth.admin.listUsers({ page: 1, perPage: 1 });
      let adminUser = usersData?.users?.[0];

      if (!adminUser) {
        const { data: newUser } = await adminDb.auth.admin.createUser({
          email: "demo@tensorbot.ai",
          password: "DemoPassword123!",
          email_confirm: true,
        });
        if (newUser?.user) {
          adminUser = newUser.user;
        }
      }

      if (adminUser) {
        return { user: adminUser, db: adminDb, isAdminFallback: true };
      }
    } catch {
      // ignore admin call failures
    }
  }

  return {
    user: null,
    db: supabase,
    isAdminFallback: false,
  };
}



