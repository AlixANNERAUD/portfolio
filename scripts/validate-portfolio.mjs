import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  featuredProjects,
  projects,
  projectScore,
  RANK_WEIGHTS,
} from "../src/data/projects.ts";
import { technologies } from "../src/data/technologies.ts";

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
