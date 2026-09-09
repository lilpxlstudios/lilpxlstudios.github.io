import type { Metadata } from "next";
import Link from "next/link";
import { getAllPostsMeta } from "@/lib/blog";
import { Reveal } from "../Reveal";

export const metadata: Metadata = { title: "Blog" };

export default function BlogIndexPage() {
  const posts = getAllPostsMeta();

  return (
    <div className="mx-auto max-w-4xl px-6 py-20 sm:py-28">
      <Reveal className="flex flex-col items-center gap-3 text-center">
        <span className="text-xs font-medium uppercase tracking-[0.25em] text-accent-600">
          Journal
        </span>
        <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-tight text-ink-900 sm:text-5xl">
          Stories & Tips
        </h1>
        <div className="h-0.5 w-12 bg-accent-500" />
      </Reveal>

      <div className="mt-14 flex flex-col divide-y divide-ink-100">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group flex flex-col gap-2 py-8 transition"
          >
            <span className="text-xs text-ink-500">
              {new Date(post.date).toLocaleDateString("en-IN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            <h2 className="font-[family-name:var(--font-display)] text-2xl text-ink-900 transition group-hover:text-accent-600">
              {post.title}
            </h2>
            <p className="text-ink-500">{post.excerpt}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
