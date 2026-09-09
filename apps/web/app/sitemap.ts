import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/siteUrl";
import { getAllPostsMeta } from "@/lib/blog";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
  ];
  const postRoutes: MetadataRoute.Sitemap = getAllPostsMeta().map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "yearly",
    priority: 0.4,
  }));
  return [...staticRoutes, ...postRoutes];
}
