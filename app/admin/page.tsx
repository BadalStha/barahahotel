export default function AdminDashboardPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-semibold">Admin Dashboard</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Protected admin routes go here.
      </p>
    </main>
  );
}
