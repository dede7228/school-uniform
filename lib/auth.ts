export const AUTH_COOKIE = "cl_auth";

export async function computeAuthToken(): Promise<string | null> {
  const code = process.env.TEAM_ACCESS_CODE;
  const secret = process.env.AUTH_SECRET;
  if (!code || !secret) return null;

  const data = new TextEncoder().encode(`${code}::${secret}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
