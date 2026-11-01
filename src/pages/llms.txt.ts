import type { APIRoute } from "astro";
import { experiences } from "../data/experiences.ts";
import { byScore, projects, projectUrl } from "../data/projects.ts";
import { site } from "../data/site.ts";
import { localize } from "../data/types.ts";
import { localizePath, type Locale } from "../i18n/locales.ts";
import { useTranslations, type UIKey } from "../i18n/ui.ts";

/**
 * /llms.txt (https://llmstxt.org): a Markdown index of the site for
 * language models, built from the same data as the pages. English first,
 * then the French pages under their own heading.
 */

const hubs: { path: string; title: UIKey; description: UIKey }[] = [
  {
    path: "/experiences",
    title: "nav.experiences",
    description: "experiences.description",
  },
  {
    path: "/projects",
    title: "nav.projects",
    description: "projects.description",
  },
  { path: "/skills", title: "nav.skills", description: "skills.description" },
  { path: "/resume", title: "nav.resume", description: "resume.description" },
];

const url = (path: string, lang: Locale) => site.url + localizePath(path, lang);
const link = (title: string, href: string, description?: string) =>
  `- [${title}](${href})` + (description ? `: ${description}` : "");

function pages(lang: Locale): string[] {
  const t = useTranslations(lang);
  return [
    // The summary above the list already describes the home page.
    link(t("nav.home"), url("/", lang)),
    ...hubs.map((hub) =>
      link(t(hub.title), url(hub.path, lang), t(hub.description)),
    ),
    link(t("resume.pdfTitle"), site.resumePdf[lang]),
  ];
}

function projectLinks(lang: Locale): string[] {
  return [...projects]
    .sort(byScore)
    .map((project) =>
      link(
        localize(project.title, lang),
        site.url + projectUrl(project.id, lang),
        project.description[lang],
      ),
    );
}

function roles(lang: Locale): string[] {
  return experiences
    .filter((entry) => entry.group === "professional")
    .map(
      (entry) =>
        `- ${entry.role[lang]}, ${localize(entry.company, lang)} (${entry.period[lang]}): ${entry.summary[lang]}`,
    );
}

export const GET: APIRoute = () => {
  const en = useTranslations("en");
  const fr = useTranslations("fr");
  const body = [
    `# ${site.name}`,
    "",
    `> ${en("home.description")}`,
    "",
    `## ${en("llms.pages")}`,
    "",
    ...pages("en"),
    "",
    `## ${en("nav.experiences")}`,
    "",
    ...roles("en"),
    "",
    `## ${en("nav.projects")}`,
    "",
    ...projectLinks("en"),
    "",
    `## ${fr("llms.locale")}`,
    "",
    `> ${fr("home.description")}`,
    "",
    ...pages("fr"),
    "",
    `### ${fr("nav.projects")}`,
    "",
    ...projectLinks("fr"),
    "",
  ].join("\n");
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
