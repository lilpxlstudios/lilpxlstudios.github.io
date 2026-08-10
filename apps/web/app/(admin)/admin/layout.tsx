import Link from "next/link";
import { requireAdmin } from "@/lib/dal";
import { LogoutButton } from "@/components/LogoutButton";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();

  return (
    <>
      <header className="flex items-center justify-between px-6 py-4 border-b border-ink-100 bg-ink-950 text-paper-50">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="font-[family-name:var(--font-display)] text-lg">
            Little Pixel Studios — Admin
          </Link>
          <nav className="flex gap-4 text-sm text-ink-300">
            <Link href="/admin/clients">Clients</Link>
            <Link href="/admin/inquiries">Inquiries</Link>
            <Link href="/admin/subscribers">Subscribers</Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-ink-300">{session.email}</span>
          <LogoutButton />
        </div>
      </header>
      <main className="flex-1 px-6 py-8">{children}</main>
    </>
  );
}
