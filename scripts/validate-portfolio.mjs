import { existsSync, readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  featuredProjects,
  projects,
  projectScore,
  RANK_WEIGHTS,
} from "../src/data/projects.ts";
import { technologies } from "../src/data/technologies.ts";
import { experiences } from "../src/data/experiences.ts";
import { skillDomains, spokenLanguages } from "../src/data/skills.ts";
import { site } from "../src/data/site.ts";
import { ui } from "../src/i18n/ui.ts";
import { findFrenchTypographyIssues } from "../src/lib/rehype-french-typography.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

if (!Array.isArray(projects) || projects.length === 0) {
  throw new Error("Project catalogue is empty.");
}

const ids = new Set();
const knownTags = new Set(technologies);
const locales = ["en", "fr"];
const year = /^\d{4}$/;

// Editorial ranking weights are defined only in projects.ts.
const weightFactors = [
  "technicalDepth",
  "originality",
  "practicalImpact",
  "evidence",
];
const weights = RANK_WEIGHTS;
if (
  Object.keys(weights).length !== weightFactors.length ||
  weightFactors.some((factor) => !Number.isFinite(weights[factor])) ||
  weightFactors.reduce((sum, factor) => sum + weights[factor], 0) !== 100
) {
  throw new Error("Ranking weights must contain four factors totaling 100%.");
}
for (const project of projects) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(project.id) || ids.has(project.id)) {
    throw new Error("Missing, invalid or duplicate project ID: " + project.id);
  }
  ids.add(project.id);
  if (
    !["personal", "library", "competition", "academic"].includes(project.group)
  ) {
    throw new Error("Unknown project group: " + project.id);
  }
  if (
    ![
      "systems",
      "software",
      "web",
      "infrastructure",
      "embedded",
      "security",
      "data",
    ].includes(project.category)
  ) {
    throw new Error("Unknown category: " + project.id);
  }
  if (
    project.team !== undefined &&
    (!Number.isInteger(project.team) || project.team < 1)
  ) {
    throw new Error("Team size must be a positive integer: " + project.id);
  }
  if (project.externalUrl) {
    const url = new URL(project.externalUrl);
    if (!["http:", "https:"].includes(url.protocol)) {
      throw new Error("Invalid external project URL: " + project.id);
    }
  }
  if (
    !project.ranking ||
    weightFactors.some(
      (factor) =>
        typeof project.ranking[factor] !== "number" ||
        !Number.isFinite(project.ranking[factor]) ||
        project.ranking[factor] < 0 ||
        project.ranking[factor] > 5,
    ) ||
    Object.keys(project.ranking).length !== weightFactors.length
  ) {
    throw new Error("Missing/invalid editorial ranking factors: " + project.id);
  }
  if (!Array.isArray(project.tags) || project.tags.length === 0) {
    throw new Error("Missing tags: " + project.id);
  }
  for (const tag of project.tags) {
    if (
      typeof tag !== "string" ||
      !knownTags.has(tag) ||
      tag.trim() !== tag ||
      tag.length > 32 ||
      /[<>\[\]"=]/.test(tag) ||
      /https?:/i.test(tag)
    ) {
      throw new Error(
        "Malformed or unknown project technology tag for " +
          project.id +
          ": " +
          tag,
      );
    }
  }
  const { start, end } = project.period ?? {};
  if (
    !year.test(start ?? "") ||
    (end !== undefined && end !== "present" && !(year.test(end) && end > start))
  ) {
    throw new Error("Invalid period for " + project.id);
  }
  if (typeof project.title === "string" ? !project.title.trim() : false) {
    throw new Error("Missing title for " + project.id);
  }
  for (const lang of locales) {
    if (typeof project.title !== "string" && !project.title?.[lang]?.trim()) {
      throw new Error("Missing title." + lang + " for " + project.id);
    }
    if (!project.description?.[lang]?.trim()) {
      throw new Error("Missing description." + lang + " for " + project.id);
    }
  }
}

if (featuredProjects.length !== 3)
  throw new Error("Expected exactly three featured projects.");
const lowestFeatured = Math.min(...featuredProjects.map(projectScore));
if (
  projects.some(
    (project) =>
      !featuredProjects.includes(project) &&
      projectScore(project) > lowestFeatured,
  )
) {
  throw new Error(
    "Featured projects must be the highest-ranked editorial picks.",
  );
}

// Every catalogue item must have its own public page in BOTH languages.
for (const lang of ["fr", "en"]) {
  const archivePath = join(
    root,
    "src",
    "content",
    "projects",
    lang,
    "archive.md",
  );
  if (existsSync(archivePath)) {
    throw new Error(
      "Obsolete project archive must not be restored: " + archivePath,
    );
  }

  for (const project of projects) {
    const basePath = join(root, "src", "content", "projects", lang, project.id);
    const markdownPath = basePath + ".md";
    const mdxPath = basePath + ".mdx";
    if (existsSync(markdownPath) === existsSync(mdxPath)) {
      throw new Error(
        "Expected exactly one .md/.mdx project page: " +
          lang +
          "/" +
          project.id,
      );
    }
    const markdown = readFileSync(
      existsSync(mdxPath) ? mdxPath : markdownPath,
      "utf8",
    );
    if (!markdown.startsWith("---\n")) {
      throw new Error("Missing page frontmatter: " + lang + "/" + project.id);
    }
    if (!/^title: /m.test(markdown) || !/^description: /m.test(markdown)) {
      throw new Error(
        "Missing project page SEO metadata: " + lang + "/" + project.id,
      );
    }
    if ([...markdown.matchAll(/^# (.+)$/gm)].length !== 1) {
      throw new Error(
        "Expected exactly one page H1: " + lang + "/" + project.id,
      );
    }
    if (markdown.includes("/projects/archive")) {
      throw new Error(
        "Old archive URL in project page: " + lang + "/" + project.id,
      );
    }
  }
}
if (existsSync(join(root, "docs")) || existsSync(join(root, ".vitepress"))) {
  throw new Error("The obsolete docs/ directory must not be restored.");
}

const caseStudies = ["xila", "mini-train-store", "infrastructure"];
for (const lang of ["fr", "en"]) {
  for (const id of caseStudies) {
    const markdown = readFileSync(
      join(root, "src", "content", "projects", lang, id + ".mdx"),
      "utf8",
    );
    if (
      !markdown.includes("<ArchitectureFlow") ||
      !markdown.includes("description:")
    ) {
      throw new Error(
        "Missing case study diagram or SEO description: " + lang + "/" + id,
      );
    }
  }
}

console.log(
  "Validated " +
    projects.length +
    " dedicated FR/EN pages and six case studies.",
);

// MDX pages are rendered by the Astro integration with preserved .html routes.
const config = readFileSync(join(root, "astro.config.mjs"), "utf8");
if (!config.includes("mdx()") || !config.includes('format: "preserve"')) {
  throw new Error(
    "Astro integrations and preserved .html route format are required.",
  );
}

// The site is all-Astro: no Vue component or client framework may return.
const vueFiles = readdirSync(join(root, "src"), { recursive: true })
  .map(String)
  .filter((file) => file.endsWith(".vue"));
if (vueFiles.length > 0) {
  throw new Error("Vue components are not allowed: " + vueFiles.join(", "));
}
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const deps = { ...pkg.dependencies, ...pkg.devDependencies };
const banned = ["vue", "@astrojs/vue", "lucide-vue-next"].filter(
  (name) => name in deps,
);
if (banned.length > 0) {
  throw new Error("Client framework dependencies: " + banned.join(", "));
}

// The homepage shows exactly the four professional roles.
const homepage = experiences.filter((entry) => entry.homepage);
if (
  homepage.length !== 4 ||
  homepage.some((entry) => entry.group !== "professional")
) {
  throw new Error(
    "Exactly four professional roles must be flagged `homepage`.",
  );
}

/** Splits a page into its `title`/`description` frontmatter and its body. */
function parseFrontmatter(source) {
  const [, frontmatter = "", body = source] =
    source.replace(/\r\n?/g, "\n").match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/) ??
    [];
  const fields = {};
  for (const [, key, raw] of frontmatter.matchAll(
    /^(title|description): (.*)$/gm,
  )) {
    const quoted = raw.match(/^"(.*)"$/) ?? raw.match(/^'(.*)'$/);
    fields[key] = quoted
      ? quoted[1].replace(/\\"/g, '"').replace(/''/g, "'")
      : raw;
  }
  return { fields, body };
}

/** Reads the single `.md` or `.mdx` page of a project. */
function readProjectPage(lang, id) {
  const base = join(root, "src", "content", "projects", lang, id);
  return readFileSync(
    existsSync(base + ".mdx") ? base + ".mdx" : base + ".md",
    "utf8",
  );
}

// Editorial rules for project pages: a meta description of 120-160
// characters, a unique title per locale, a <title> of 50-60 characters
// (a target, reported as a warning), no generic defensive "Scope and
// limitations" section, and a team size for every academic project.
const SCOPE_HEADING_ALLOWED = new Set([
  "odor-localization",
  "music-danceability",
]);
const editorialIssues = [];
const editorialWarnings = [];
const charCount = (text) => [...text].length;

for (const lang of locales) {
  const seenTitles = new Map();
  for (const project of projects) {
    const where = `${lang}/${project.id}`;
    const { fields, body } = parseFrontmatter(
      readProjectPage(lang, project.id),
    );
    // Only single-line `title:` and `description:` values are read.
    const missing = ["title", "description"].filter(
      (key) => typeof fields[key] !== "string" || !fields[key].trim(),
    );
    if (missing.length) {
      editorialIssues.push(
        `${where}: frontmatter needs single-line ${missing.join(" and ")}`,
      );
      continue;
    }
    const title = fields.title.trim();
    const duplicate = seenTitles.get(title.toLowerCase());
    if (duplicate) {
      editorialIssues.push(`${where}: title duplicates ${lang}/${duplicate}`);
    }
    seenTitles.set(title.toLowerCase(), project.id);

    const description = charCount(fields.description.trim());
    if (description < 120 || description > 160) {
      editorialIssues.push(
        `${where}: description is ${description} characters (expected 120-160)`,
      );
    }
    const pageTitle = charCount(
      ui[lang]["meta.pageTitle"].replace("{title}", title),
    );
    if (pageTitle < 50 || pageTitle > 60) {
      editorialWarnings.push(
        `${where}: <title> is ${pageTitle} characters (target 50-60)`,
      );
    }
    if (
      !SCOPE_HEADING_ALLOWED.has(project.id) &&
      /^#{2,6} +(?:Scope and limitations|Portée et limites)\s*$/im.test(body)
    ) {
      editorialIssues.push(`${where}: generic "Scope and limitations" section`);
    }
    if (lang === "en" && project.group === "academic" && !project.team) {
      editorialIssues.push(`${project.id}: academic project without team size`);
    }
  }
}
for (const warning of editorialWarnings) console.warn("Warning: " + warning);
if (editorialIssues.length > 0) {
  throw new Error("Project editorial rules:\n" + editorialIssues.join("\n"));
}

// French typography. Markdown bodies are typeset at build time by
// src/lib/rehype-french-typography.mjs (verify:static checks the result), but
// plain strings never go through it: the UI dictionary, data `Localized.fr`
// values and frontmatter must already be correct. Bodies must still use « »
// rather than English quotes, whose pairing the plugin can only guess.
const typographyIssues = [];
function checkFrench(where, text) {
  for (const issue of findFrenchTypographyIssues(text)) {
    typographyIssues.push(`${where}: ${issue} in ${JSON.stringify(text)}`);
  }
}

for (const [key, value] of Object.entries(ui.fr))
  checkFrench(`ui.fr.${key}`, value);

/** Visits every `{ en, fr }` value in the data and checks its French strings. */
function checkLocalized(where, value) {
  if (typeof value !== "object" || value === null) return;
  const keys = Object.keys(value);
  if (
    !Array.isArray(value) &&
    keys.length === 2 &&
    "en" in value &&
    "fr" in value
  ) {
    for (const text of [value.fr].flat(Infinity)) {
      if (typeof text === "string") checkFrench(where + ".fr", text);
    }
    return;
  }
  for (const key of keys) checkLocalized(`${where}.${key}`, value[key]);
}
checkLocalized("projects", projects);
checkLocalized("experiences", experiences);
checkLocalized("skillDomains", skillDomains);
checkLocalized("spokenLanguages", spokenLanguages);
checkLocalized("site", site);

const frenchMarkdown = [
  ...readdirSync(join(root, "src", "content", "projects", "fr")).map((file) =>
    join("src", "content", "projects", "fr", file),
  ),
  join("src", "content", "legal", "fr.md"),
].filter((file) => /\.mdx?$/.test(file));
for (const file of frenchMarkdown) {
  const source = readFileSync(join(root, file), "utf8");
  const { fields, body } = parseFrontmatter(source);
  for (const [key, value] of Object.entries(fields))
    checkFrench(`${file} ${key}`, value);
  // Prose only: no code, MDX imports, HTML/JSX tags or link targets.
  const prose = body
    .replace(/^(```|~~~)[\s\S]*?^\1/gm, "")
    .replace(/`[^`\n]*`/g, "")
    .replace(/^(?:import|export) .*$/gm, "")
    .replace(/<[^>]*>/g, "")
    .replace(/\]\([^)]*\)/g, "]");
  for (const [line] of prose.matchAll(/^.*["“”].*$/gm)) {
    typographyIssues.push(
      `${file}: use « » instead of English quotes in ${JSON.stringify(line.trim())}`,
    );
  }
}
if (typographyIssues.length > 0) {
  throw new Error(
    "French typography (U+202F before ; ! ?, U+00A0 before : and inside « », 1re/3e ordinals):\n" +
      typographyIssues.join("\n"),
  );
}
