import Link from "next/link";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="flex items-center justify-between px-6 py-4 border-b border-ink-100">
        <Link href="/" className="font-[family-name:var(--font-display)] text-lg">
          Little Pixel Studios
        </Link>
        <nav className="flex gap-6 text-sm text-ink-700">
          <Link href="/login">Client login</Link>
        </nav>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="px-6 py-8 text-sm text-ink-500 border-t border-ink-100">
        © {new Date().getFullYear()} Little Pixel Studios
      </footer>
    </>
  );
}
