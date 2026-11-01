import { execFileSync } from "node:child_process";

/**
 * Sitemap `<lastmod>`: the date of the last commit that changed what a page
 * says, never the build date. Each page maps to the files holding its
 * content (Markdown, data); layouts, styles and UI strings are left out, as
 * a restyle does not change the page content.
 *
 * In a shallow clone (CI checks) every file would seem to date from the
 * last commit, so no date is returned there; the deploy workflow checks
 * out the full history.
 */

const git = (args) =>
  execFileSync("git", args, { encoding: "utf8", stdio: "pipe" }).trim();

let history;
try {
  history = git(["rev-parse", "--is-shallow-repository"]) === "false";
} catch {
  history = false; // no Git: no dates
}

const page = (name) => `src/pages/[...lang]/${name}.astro`;
const sources = {
  "": [
    page("index"),
    "src/components/home",
    "src/data/experiences.ts",
    "src/data/projects.ts",
  ],
  experiences: [page("experiences"), "src/data/experiences.ts"],
  projects: [page("projects"), "src/data/projects.ts"],
  about: [
    page("about"),
    "src/data/skills.ts",
    "src/data/experiences.ts",
    "src/data/site.ts",
  ],
};

/** Source files of a page, from its English path and locale. */
function sourcesOf(path, lang) {
  const project = /^projects\/([\w-]+)$/.exec(path);
  if (project) {
    const file = `src/content/projects/${lang}/${project[1]}`;
    return [file + ".md", file + ".mdx"];
  }
  if (path === "legal-notice") {
    return [page("legal-notice"), `src/content/legal/${lang}.md`];
  }
  return sources[path];
}

/** ISO 8601 date of the last commit touching the page at `url`, or none. */
export function lastModified(url) {
  if (!history) return undefined;
  const pathname = new URL(url).pathname.replace(/^\/|\/$/g, "");
  const [lang, path] =
    pathname === "fr" || pathname.startsWith("fr/")
      ? ["fr", pathname.slice(3)]
      : ["en", pathname];
  const files = sourcesOf(path, lang);
  if (!files) return undefined;
  // Literal pathspecs: `[...lang]` is a folder name, not a wildcard; a
  // folder still matches every file under it.
  const date = git([
    "log",
    "-1",
    "--format=%cI",
    "--",
    ...files.map((file) => ":(literal)" + file),
  ]);
  return date || undefined;
}
