import "server-only";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

export type PostMeta = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
};

export type Post = PostMeta & { content: string };

export function getAllPostSlugs(): string[] {
  return fs
    .readdirSync(BLOG_DIR)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => file.replace(/\.mdx$/, ""));
}

function getPostMeta(slug: string): PostMeta {
  const raw = fs.readFileSync(path.join(BLOG_DIR, `${slug}.mdx`), "utf8");
  const { data } = matter(raw);
  return {
    slug,
    title: data.title as string,
    date: data.date as string,
    excerpt: data.excerpt as string,
  };
}

export function getPostBySlug(slug: string): Post {
  const raw = fs.readFileSync(path.join(BLOG_DIR, `${slug}.mdx`), "utf8");
  const { data, content } = matter(raw);
  return {
    slug,
    title: data.title as string,
    date: data.date as string,
    excerpt: data.excerpt as string,
    content,
  };
}

export function getAllPostsMeta(): PostMeta[] {
  return getAllPostSlugs()
    .map(getPostMeta)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}
