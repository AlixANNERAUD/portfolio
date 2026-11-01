/**
 * French typography for Markdown and MDX pages.
 *
 * A hast plugin (the rehype stage of Sätteri, Astro's Markdown processor) that
 * only runs on French files: a `/fr/` directory or a `fr.md`/`fr.mdx` file.
 * In text outside code, it applies:
 * - U+202F (narrow no-break space) before `;`, `!` and `?`;
 * - U+00A0 (no-break space) before `:` and `»` and after `«`;
 * - « » instead of straight or English curly double quotes;
 * - superscript ordinals: 1ère → 1<sup>re</sup>, 1er → 1<sup>er</sup>,
 *   3ème → 3<sup>e</sup>.
 * URLs, times (10:30), ratios (16:9) and `::` paths are left untouched.
 *
 * No maintained package fits: typograf's French locale removes the space
 * before punctuation and has no ordinals, richtypo-rules-fr no longer loads
 * with richtypo 8, and unified rehype plugins do not run in Sätteri.
 *
 * `findFrenchTypographyIssues` checks plain strings (UI dictionary, data,
 * frontmatter) that never go through this plugin or smart punctuation, so it
 * also requires the typographic apostrophe; validate-portfolio uses it.
 */

const NNBSP = "\u202f";
const NBSP = "\u00a0";

/** Spaces that may sit before punctuation, including the typographic ones. */
const SPACE = "[ \\t\\u00a0\\u202f]";
/** What may follow `; ! ? :` for it to be punctuation and not a URL or time. */
const BOUNDARY = "(?=\\s|$|[)\\]»”\"'’.,…])";

const URL_PATTERN = /(?:https?:\/\/|www\.)[^\s<>«»"“”]+[^\s<>«»"“”.,;:!?)]/g;

const ORDINAL_PATTERN =
  /(?<![\p{L}\p{N}.,])(\d+)(ères|ère|res|re|ers|er|èmes|ème|emes|eme|es|e)(?![\p{L}\p{N}]|[-+]\d)/gu;
const ORDINAL_SUFFIX = {
  ère: "re",
  re: "re",
  ères: "res",
  res: "res",
  er: "er",
  ers: "ers",
  ème: "e",
  eme: "e",
  e: "e",
  èmes: "es",
  emes: "es",
  es: "es",
};

/** Applies `fix` to the parts of `text` that are not URLs. */
function outsideUrls(text, fix) {
  let result = "";
  let last = 0;
  for (const match of text.matchAll(URL_PATTERN)) {
    result += fix(text.slice(last, match.index), last === 0) + match[0];
    last = match.index + match[0].length;
  }
  return result + fix(text.slice(last), last === 0);
}

/**
 * Spaces and quotes. `atStart` is true when `text` begins the original text
 * node, `afterInline` when that node follows an inline element (`**a** : b`).
 */
function punctuate(text, atStart, afterInline) {
  const leadingWord = !atStart || afterInline;
  return (
    text
      // English curly quotes, then straight quotes by position.
      .replace(/“\s*/g, `«${NBSP}`)
      .replace(/\s*”/g, `${NBSP}»`)
      .replace(/(^|[\s([{])"/g, `$1«${NBSP}`)
      .replace(/"/g, `${NBSP}»`)
      // Guillemets: exactly one no-break space inside.
      .replace(new RegExp(`«${SPACE}*`, "g"), `«${NBSP}`)
      .replace(new RegExp(`${SPACE}*»`, "g"), `${NBSP}»`)
      // `; ! ?` (a run like `?!` takes one space before it), then `:`.
      .replace(
        new RegExp(`(^|[^\\s;!?:])${SPACE}*([;!?]+)${BOUNDARY}`, "g"),
        (match, before, marks) =>
          before === "" && !leadingWord ? match : before + NNBSP + marks,
      )
      .replace(
        new RegExp(`(^|[^\\s:])${SPACE}*:${BOUNDARY}`, "g"),
        (match, before) =>
          before === "" && !leadingWord ? match : before + NBSP + ":",
      )
  );
}

/**
 * Typesets one French text node. Returns its parts in order: strings, and
 * `{ sup }` objects for ordinal suffixes rendered as `<sup>`.
 *
 * @param {string} text
 * @param {{ afterInline?: boolean }} [options]
 * @returns {Array<string | { sup: string }>}
 */
export function typesetFrench(text, { afterInline = false } = {}) {
  const spaced = outsideUrls(text, (part, atStart) =>
    punctuate(part, atStart, afterInline),
  );
  const parts = [];
  let last = 0;
  // Ordinals never match inside URLs: digits there follow a letter or `/`.
  for (const match of spaced.matchAll(ORDINAL_PATTERN)) {
    const end = match.index + match[1].length;
    parts.push(spaced.slice(last, end), { sup: ORDINAL_SUFFIX[match[2]] });
    last = match.index + match[0].length;
  }
  parts.push(spaced.slice(last));
  return parts.filter((part) => part !== "");
}

/**
 * Typesets a French string that is rendered as plain text (no `<sup>`), such
 * as a heading lifted out of the Markdown body: ordinals become 1re, 3e.
 *
 * @param {string} text
 * @returns {string}
 */
export function typesetFrenchText(text) {
  return typesetFrench(text)
    .map((part) => (typeof part === "string" ? part : part.sup))
    .join("");
}

const RULES = [
  [
    new RegExp(`(?<=[^\\u202f;!?])[;!?]+${BOUNDARY}`),
    "use U+202F before ; ! ?",
  ],
  [new RegExp(`(?<=[^\\u00a0:]):${BOUNDARY}`), "use U+00A0 before :"],
  [/«(?!\u00a0)/, "use U+00A0 after «"],
  [/(?<!\u00a0)»/, "use U+00A0 before »"],
  [/["“”]/, "use « » instead of English quotes"],
  [/'/, "use ’ instead of '"],
  [/\d(?:ère|ème|eme)s?(?![\p{L}\p{N}])/u, "write ordinals as 1re, 1er, 3e"],
];

/**
 * Lists the French typography rules a plain string breaks (one message per
 * rule). URLs are ignored.
 *
 * @param {string} text
 * @returns {string[]}
 */
export function findFrenchTypographyIssues(text) {
  const prose = text.replace(URL_PATTERN, "");
  return RULES.filter(([pattern]) => pattern.test(prose)).map(
    ([, message]) => message,
  );
}

/** Elements whose text is code or otherwise not prose. */
const SKIPPED = new Set([
  "code",
  "kbd",
  "math",
  "pre",
  "samp",
  "script",
  "style",
  "svg",
  "textarea",
  "var",
]);

function isSkipped(node, ctx) {
  for (let parent = ctx.parent(node); parent; parent = ctx.parent(parent)) {
    if (parent.type === "element" && SKIPPED.has(parent.tagName)) return true;
  }
  return false;
}

const typography = {
  name: "french-typography",
  text(node, ctx) {
    if (isSkipped(node, ctx)) return;
    const parts = typesetFrench(node.value, {
      afterInline: (ctx.indexOf(node) ?? 0) > 0,
    });
    if (parts.length === 1 && parts[0] === node.value) return;
    ctx.replaceNode(
      node,
      parts.map((part) =>
        typeof part === "string"
          ? { type: "text", value: part }
          : {
              type: "element",
              tagName: "sup",
              properties: {},
              children: [{ type: "text", value: part.sup }],
            },
      ),
    );
  },
};

/** True for a French Markdown or MDX file: in `fr/`, or named `fr.md(x)`. */
export function isFrenchFile(fileURL) {
  return Boolean(fileURL) && /[/\\]fr(?:[/\\]|\.mdx?$)/.test(fileURL.pathname);
}

/** Plugin factory: only French Markdown and MDX files get the plugin. */
export default function frenchTypographyPlugin({ fileURL }) {
  return isFrenchFile(fileURL) ? typography : null;
}
