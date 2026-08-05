export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main
      id="admin-main"
      tabIndex={-1}
      className="flex min-h-screen items-center justify-center bg-muted/50 p-4"
    >
      {children}
    </main>
  );
}
