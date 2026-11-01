import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const code = request.nextUrl.searchParams.get("code");

  // Intercept any request returning with ?code= that isn't already hitting /auth/callback
  if (code && pathname !== "/auth/callback") {
    const callbackUrl = new URL("/auth/callback", request.url);
    callbackUrl.searchParams.set("code", code);
    const nextTarget = pathname === "/" ? "/dashboard" : pathname;
    callbackUrl.searchParams.set("next", nextTarget);
    return NextResponse.redirect(callbackUrl);
  }

  let response = NextResponse.next({ request });

  // 1. Check for Yugabyte session cookie `tb_session`
  const tbSession = request.cookies.get("tb_session")?.value;

  const authRoutes = [
    "/sign-in",
    "/sign-up",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
  ];

  const protectedRoutes = ["/dashboard", "/create"];

  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // If user has session cookie, allow request to proceed
  if (tbSession) {
    return response;
  }

  // 2. Check Supabase credentials defensively
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (
    !supabaseUrl ||
    !supabaseKey ||
    supabaseUrl === "..." ||
    !supabaseUrl.startsWith("http")
  ) {
    // If no Supabase configured and route is protected, redirect to sign-in
    if (isProtectedRoute) {
      const redirectUrl = new URL("/sign-in", request.url);
      redirectUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(redirectUrl);
    }
    return response;
  }

  try {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          response = NextResponse.next({ request });

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (isProtectedRoute && !user) {
      const redirectUrl = new URL("/sign-in", request.url);
      redirectUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(redirectUrl);
    }

    if (isAuthRoute && user) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  } catch (err) {
    console.warn("Middleware auth error:", err);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
