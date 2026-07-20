"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_COOKIE, computeAuthToken } from "@/lib/auth";

export async function login(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/");

  if (password !== process.env.TEAM_ACCESS_CODE) {
    redirect(`/login?error=1&next=${encodeURIComponent(next)}`);
  }

  const token = await computeAuthToken();
  if (token) {
    const store = await cookies();
    store.set(AUTH_COOKIE, token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
  }

  redirect(next || "/");
}
