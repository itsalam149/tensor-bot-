"use server";

import { headers, cookies } from "next/headers";
import { redirect } from "next/navigation";
import { signInUser, signUpUser, signOutSession } from "@/services/yugabyte/auth";
import { isYugabyteEnabled } from "@/services/yugabyte/client";
import { createClient as createSupabaseClient } from "@/lib/supabase/server";

export type AuthState = {
  error: string | null;
  success: string | null;
};

async function getOrigin(): Promise<string> {
  const h = await headers();
  const origin = h.get("origin");
  if (origin) return origin;
  const host = h.get("x-forwarded-host");
  if (host) return `https://${host}`;
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export async function signInWithGoogleAction(redirectToPath: string = "/dashboard") {
  const supabase = await createSupabaseClient();
  const origin = await getOrigin();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(redirectToPath)}`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) {
    redirect(`/sign-in?error=${encodeURIComponent(error.message)}`);
  }

  if (data?.url) {
    redirect(data.url);
  }

  redirect("/sign-in?error=Failed+to+initialize+Google+Sign-In");
}

export async function signInAction(
  _: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required.", success: null };
  }

  // 1. Authenticate via YugabyteDB if enabled
  if (isYugabyteEnabled()) {
    const { user, token, error } = await signInUser({ email, password });
    if (error || !token || !user) {
      return { error: error ?? "Invalid email or password.", success: null };
    }

    const cookieStore = await cookies();
    cookieStore.set("tb_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    });

    redirect("/dashboard");
  }

  // 2. Fallback to Supabase
  try {
    const supabase = await createSupabaseClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.includes("Invalid login credentials") || error.message.includes("invalid_credentials")) {
        return { error: "Invalid email or password. Please try again.", success: null };
      }
      return { error: error.message, success: null };
    }

    if (!data.session) {
      return { error: "Sign in failed. Please try again.", success: null };
    }

    redirect("/dashboard");
  } catch (err: any) {
    // If redirect throws NEXT_REDIRECT, rethrow
    if (err?.message?.includes("NEXT_REDIRECT")) throw err;
    return { error: err.message || "Sign in failed.", success: null };
  }
}

export async function signUpAction(
  _: AuthState,
  formData: FormData
): Promise<AuthState> {
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const fullName = `${firstName} ${lastName}`.trim();

  if (!email || !password) {
    return { error: "Email and password are required.", success: null };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters.", success: null };
  }

  // 1. Sign up via YugabyteDB if enabled
  if (isYugabyteEnabled()) {
    const { user, error } = await signUpUser({ email, password, fullName });
    if (error || !user) {
      return { error: error ?? "Failed to create account.", success: null };
    }

    // Auto sign-in or prompt
    const login = await signInUser({ email, password });
    if (login.token) {
      const cookieStore = await cookies();
      cookieStore.set("tb_session", login.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 30 * 24 * 60 * 60,
      });
      redirect("/dashboard");
    }

    return {
      error: null,
      success: "Account created successfully! You can now sign in.",
    };
  }

  // 2. Fallback to Supabase
  try {
    const supabase = await createSupabaseClient();
    const origin = await getOrigin();

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${origin}/auth/callback?next=/dashboard`,
      },
    });

    if (error) {
      if (error.message.includes("already registered") || error.message.includes("already exists")) {
        return { error: "An account with this email already exists. Try signing in instead.", success: null };
      }
      return { error: error.message, success: null };
    }

    return {
      error: null,
      success: "Account created! Check your email to verify your account before signing in.",
    };
  } catch (err: any) {
    if (err?.message?.includes("NEXT_REDIRECT")) throw err;
    return { error: err.message || "Failed to create account.", success: null };
  }
}

export async function forgotPasswordAction(
  _: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!email) {
    return { error: "Email is required.", success: null };
  }

  try {
    const supabase = await createSupabaseClient();
    const origin = await getOrigin();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/callback?next=/reset-password`,
    });

    if (error) {
      return { error: error.message, success: null };
    }

    return {
      error: null,
      success: "Password reset link sent. Check your email.",
    };
  } catch {
    return {
      error: null,
      success: "If an account exists, a reset link will be sent.",
    };
  }
}

export async function resetPasswordAction(
  _: AuthState,
  formData: FormData
): Promise<AuthState> {
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!password || password.length < 8) {
    return {
      error: "Password must be at least 8 characters long.",
      success: null,
    };
  }

  if (password !== confirmPassword) {
    return {
      error: "Passwords do not match.",
      success: null,
    };
  }

  try {
    const supabase = await createSupabaseClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      return { error: error.message, success: null };
    }

    redirect("/sign-in");
  } catch (err: any) {
    if (err?.message?.includes("NEXT_REDIRECT")) throw err;
    return { error: err.message || "Failed to reset password.", success: null };
  }
}

export async function signOutAction() {
  // Clear Yugabyte session if present
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("tb_session")?.value;
    if (token) {
      await signOutSession(token);
      cookieStore.delete("tb_session");
    }
  } catch (err) {
    console.warn("SignOut session error:", err);
  }

  // Clear Supabase session if present
  try {
    const supabase = await createSupabaseClient();
    await supabase.auth.signOut();
  } catch {
    // ignore
  }

  redirect("/sign-in");
}
