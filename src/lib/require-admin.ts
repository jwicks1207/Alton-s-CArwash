import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "./auth";

/** Server-side guard for admin pages — redirects to login if not authenticated. */
export async function requireAdminSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/admin/login");
  }
  return session;
}
