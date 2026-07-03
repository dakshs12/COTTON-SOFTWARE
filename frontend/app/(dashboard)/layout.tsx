import Sidebar from "../components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Sidebar — fixed left, light neumorphic */}
      <Sidebar />

      {/* Main content area — offset by sidebar width */}
      <main
        className="flex-1 p-8 print:m-0 print:p-0"
        style={{ marginLeft: "var(--cb-sidebar-width)" }}
      >
        {children}
      </main>
    </>
  );
}
