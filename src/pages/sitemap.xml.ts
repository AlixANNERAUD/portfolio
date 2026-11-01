import type { APIRoute } from "astro";
import { site } from "../data/site.ts";

/**
 * /sitemap.xml, the address the VitePress site used and that search engines
 * may still have on file. @astrojs/sitemap writes /sitemap-index.xml and
 * /sitemap-0.xml; this index points to the same chunk (the site is far below
 * the 45,000 URLs that would split it), and check-static-seo verifies that
 * both indexes list the same files.
 */
export const GET: APIRoute = () =>
  new Response(
    '<?xml version="1.0" encoding="UTF-8"?>' +
      '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
      `<sitemap><loc>${site.url}/sitemap-0.xml</loc></sitemap>` +
      "</sitemapindex>",
    { headers: { "Content-Type": "application/xml; charset=utf-8" } },
  );
