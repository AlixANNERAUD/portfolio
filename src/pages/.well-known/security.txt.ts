import type { APIRoute } from "astro";
import { site } from "../../data/site.ts";

/**
 * /.well-known/security.txt (RFC 9116). Expires must be under a year away:
 * it is set 180 days after the build, so each deployment renews it and a
 * site left unbuilt for half a year stops advertising a stale contact.
 */
export const GET: APIRoute = () => {
  const expires = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000);
  expires.setUTCHours(0, 0, 0, 0);
  const body = [
    `Contact: mailto:${site.email}`,
    `Expires: ${expires.toISOString()}`,
    "Preferred-Languages: en, fr",
    `Canonical: ${site.url}/.well-known/security.txt`,
    "",
  ].join("\n");
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
