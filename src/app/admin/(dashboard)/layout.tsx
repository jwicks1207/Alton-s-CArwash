import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { requireAdminSession } from "@/lib/require-admin";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdminSession();

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-main">{children}</main>
    </div>
  );
}
