import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllPostSlugs, getPostBySlug } from "@/lib/blog";
import { Reveal } from "../../Reveal";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (!getAllPostSlugs().includes(slug)) return {};
  const post = getPostBySlug(slug);
  return { title: post.title, description: post.excerpt };
}

const mdxComponents = {
  h2: (props: React.ComponentProps<"h2">) => (
    <h2 className="font-[family-name:var(--font-display)] text-2xl text-ink-900 mt-10 mb-3" {...props} />
  ),
  p: (props: React.ComponentProps<"p">) => <p className="text-ink-700 leading-relaxed mb-4" {...props} />,
  ul: (props: React.ComponentProps<"ul">) => <ul className="list-disc pl-5 text-ink-700 mb-4 flex flex-col gap-1" {...props} />,
  a: (props: React.ComponentProps<"a">) => <a className="text-accent-600 underline underline-offset-2" {...props} />,
  hr: (props: React.ComponentProps<"hr">) => <hr className="my-10 border-ink-100" {...props} />,
};

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!getAllPostSlugs().includes(slug)) notFound();
  const post = getPostBySlug(slug);

  return (
    <article className="mx-auto max-w-2xl px-6 py-20 sm:py-28">
      <Reveal className="flex flex-col gap-3">
        <span className="text-xs text-ink-500">
          {new Date(post.date).toLocaleDateString("en-IN", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </span>
        <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-tight text-ink-900 sm:text-4xl">
          {post.title}
        </h1>
        <div className="h-0.5 w-12 bg-accent-500" />
      </Reveal>

      <div className="mt-10">
        <MDXRemote source={post.content} components={mdxComponents} />
      </div>
    </article>
  );
}
