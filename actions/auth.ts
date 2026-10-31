"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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
  const supabase = await createClient();
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

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // Map Supabase error codes to user-friendly messages
    if (error.message.includes("Invalid login credentials") || error.message.includes("invalid_credentials")) {
      return { error: "Invalid email or password. Please try again.", success: null };
    }
    if (error.message.includes("Email not confirmed")) {
      return { error: "Please verify your email address before signing in.", success: null };
    }
    return { error: error.message, success: null };
  }

  if (!data.session) {
    return { error: "Sign in failed. Please try again.", success: null };
  }

  redirect("/dashboard");
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

  const supabase = await createClient();
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
}

export async function forgotPasswordAction(
  _: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!email) {
    return { error: "Email is required.", success: null };
  }

  const supabase = await createClient();
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

  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: error.message, success: null };
  }

  redirect("/sign-in");
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/sign-in");
}