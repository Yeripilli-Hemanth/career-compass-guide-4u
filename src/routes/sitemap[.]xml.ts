import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

const BASE_URL = "https://career-compass-guide-4u.lovable.app";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/careers", changefreq: "weekly", priority: "0.8" },
          { path: "/quiz", changefreq: "monthly", priority: "0.7" },
          {
            path: "/guides/computer-science-career-paths",
            changefreq: "monthly",
            priority: "0.9",
          },
          {
            path: "/guides/entry-level-tech-jobs",
            changefreq: "monthly",
            priority: "0.9",
          },
        ];

        const { data: careers, error } = await supabase
          .from("careers")
          .select("slug")
          .order("name");

        if (error) {
          return new Response("Failed to load careers", { status: 500 });
        }

        for (const career of careers ?? []) {
          entries.push({
            path: `/careers/${career.slug}`,
            changefreq: "monthly",
            priority: "0.9",
          });
        }

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
