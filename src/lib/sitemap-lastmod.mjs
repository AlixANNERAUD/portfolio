import { execFileSync } from "node:child_process";

/**
 * Sitemap `<lastmod>`: the date of the last commit that changed what a page
 * says, never the build date. Each page maps to the files holding its
 * content (Markdown, data) and to the UI dictionary entries it shows as
 * content (its title, description, intro and headings); layouts,
 * components, styles and the other UI strings are left out, as a restyle
 * or a relabelled button does not change the page content.
 *
 * The UI dictionary holds every page's strings, so it is never dated as a
 * whole: only the entries under the page's key prefixes, in its locale,
 * count, and only when their text changes (not when Prettier rewraps them).
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

export const UI_FILE = "src/i18n/ui.ts";
const page = (name) => `src/pages/[...lang]/${name}.astro`;

/** Data each page shows, by English path ("" is the home page). */
const pages = {
  "": {
    files: [
      page("index"),
      "src/data/experiences.ts",
      "src/data/projects.ts",
      "src/data/site.ts",
    ],
    ui: ["meta.homeTitle", "home."],
  },
  experiences: {
    files: [page("experiences"), "src/data/experiences.ts"],
    ui: ["experiences."],
  },
  projects: {
    files: [
      page("projects"),
      "src/data/projects.ts",
      "src/data/technologies.ts",
    ],
    ui: ["projects."],
  },
  about: {
    files: [
      page("about"),
      "src/data/contributions.ts",
      "src/data/experiences.ts",
      "src/data/projects.ts",
      "src/data/site.ts",
      "src/data/skills.ts",
    ],
    ui: ["about.", "skills."],
  },
};

/**
 * Sources of a page, from its English path and locale: `files` are dated as
 * a whole, `ui` lists the UI dictionary key prefixes it shows as content.
 */
export function sourcesOf(path, lang) {
  const project = /^projects\/([\w-]+)$/.exec(path);
  if (project) {
    const file = `src/content/projects/${lang}/${project[1]}`;
    return {
      // The meta line (period, tags, links), the related projects and the
      // next project come from the project data.
      files: [
        file + ".md",
        file + ".mdx",
        "src/data/projects.ts",
        "src/data/technologies.ts",
      ],
      // The Xila page embeds the browser demo and its strings.
      ui: project[1] === "xila" ? ["xila."] : [],
    };
  }
  if (path === "legal-notice") {
    return {
      files: [page("legal-notice"), `src/content/legal/${lang}.md`],
      ui: ["legal."],
    };
  }
  return pages[path];
}

/**
 * The UI dictionary entries of `lang` whose key starts with one of
 * `prefixes`, with line breaks and indentation normalised, from the text of `src/i18n/ui.ts`.
 * Entries start with `  "key":` inside `const <lang>` and run until the next
 * entry, comment or the end of the object.
 */
export function uiEntries(text, lang, prefixes) {
  const kept = [];
  let inLocale = false;
  let keep = false;
  for (const line of text.split("\n")) {
    if (!inLocale) {
      inLocale = new RegExp(`^(export )?const ${lang}\\b`).test(line);
      continue;
    }
    if (/^\}/.test(line)) break;
    const entry = /^\s*"([^"]+)"\s*:/.exec(line);
    if (entry) {
      keep = prefixes.some((prefix) => entry[1].startsWith(prefix));
    } else if (/^\s*(\/\/|\/\*|\*)/.test(line)) {
      keep = false;
    }
    if (keep) kept.push(line);
  }
  // Only line breaks and indentation are normalised: no-break spaces are
  // French typography, part of the text.
  return kept
    .join(" ")
    .replace(/[ \t\r\n]+/g, " ")
    .trim();
}

const revisions = new Map();
const show = (hash) => {
  if (!revisions.has(hash)) {
    revisions.set(hash, git(["show", `${hash}:${UI_FILE}`]));
  }
  return revisions.get(hash);
};

const uiDates = new Map();
/** Date of the last commit changing the given UI entries, or none. */
function uiModified(lang, prefixes) {
  if (prefixes.length === 0) return undefined;
  const key = lang + " " + prefixes.join(" ");
  if (uiDates.has(key)) return uiDates.get(key);
  const log = git(["log", "--format=%H %cI", "--", UI_FILE])
    .split("\n")
    .filter(Boolean)
    .map((line) => line.split(" "));
  // Newest first: the first commit whose entries differ from its
  // predecessor's (or the oldest one, which added them) dates them.
  let date;
  let newer;
  for (const [hash, commitDate] of log) {
    const entries = uiEntries(show(hash), lang, prefixes);
    if (newer !== undefined && entries !== newer.entries) {
      date = newer.date;
      break;
    }
    newer = { entries, date: commitDate };
  }
  if (date === undefined && newer?.entries) date = newer.date;
  uiDates.set(key, date);
  return date;
}

/** ISO 8601 date of the last commit touching the page at `url`, or none. */
export function lastModified(url) {
  if (!history) return undefined;
  const pathname = new URL(url).pathname.replace(/^\/|\/$/g, "");
  const [lang, path] =
    pathname === "fr" || pathname.startsWith("fr/")
      ? ["fr", pathname.slice(3)]
      : ["en", pathname];
  const sources = sourcesOf(path, lang);
  if (!sources) return undefined;
  // Literal pathspecs: `[...lang]` is a folder name, not a wildcard.
  const dates = [
    git([
      "log",
      "-1",
      "--format=%cI",
      "--",
      ...sources.files.map((file) => ":(literal)" + file),
    ]),
    uiModified(lang, sources.ui),
  ].filter(Boolean);
  if (dates.length === 0) return undefined;
  return dates.reduce((latest, date) =>
    Date.parse(date) > Date.parse(latest) ? date : latest,
  );
}
