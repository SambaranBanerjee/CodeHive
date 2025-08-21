//import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex bg-[#101010] text-white min-h-screen pt-16">
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
