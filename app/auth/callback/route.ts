import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";
  const errorParam = searchParams.get("error_description") || searchParams.get("error");

  if (errorParam) {
    return NextResponse.redirect(
      `${origin}/sign-in?error=${encodeURIComponent(errorParam)}`
    );
  }

  if (code) {
    const cookieStore = await cookies();

    const forwardedHost = request.headers.get("x-forwarded-host");
    const isLocalEnv = process.env.NODE_ENV === "development";
    let redirectTarget = `${origin}${next}`;
    if (!isLocalEnv && forwardedHost) {
      redirectTarget = `https://${forwardedHost}${next}`;
    }

    const response = NextResponse.redirect(redirectTarget);

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return response;
    }

    console.error("Auth callback exchange error:", error.message);
    return NextResponse.redirect(
      `${origin}/sign-in?error=${encodeURIComponent(error.message)}`
    );
  }

  return NextResponse.redirect(`${origin}${next}`);
}