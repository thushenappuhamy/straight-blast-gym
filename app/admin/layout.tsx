import { AdminSidebar } from '@/components/admin/AdminSidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0D0D0D] flex">
      <AdminSidebar />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
