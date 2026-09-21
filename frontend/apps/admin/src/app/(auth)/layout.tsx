export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main
      id="admin-main"
      tabIndex={-1}
      className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#f7fafc] via-white to-[#fff8e7] p-4"
    >
      {children}
    </main>
  );
}
