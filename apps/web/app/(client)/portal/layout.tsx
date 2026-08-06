import { requireSession } from "@/lib/dal";
import { LogoutButton } from "@/components/LogoutButton";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();

  return (
    <>
      <header className="flex items-center justify-between px-6 py-4 border-b border-ink-100">
        <span className="font-[family-name:var(--font-display)] text-lg">
          Your gallery
        </span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-ink-500">{session.email}</span>
          <LogoutButton />
        </div>
      </header>
      <main className="flex-1 px-6 py-8">{children}</main>
    </>
  );
}
