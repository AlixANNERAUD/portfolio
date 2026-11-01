/**
 * Markdown (Sätteri mdast) plugin for project pages: lifts the `# Title` out
 * of the body and exposes its text as `remarkPluginFrontmatter.pageTitle`, so
 * ProjectLayout renders it in the page header with the breadcrumb and meta
 * line. Every project file keeps exactly one H1 (validate-portfolio), and the
 * built page still has exactly one. Other Markdown (legal notice) is skipped.
 */
const projectContent = /[/\\]src[/\\]content[/\\]projects[/\\]/;

const liftTitle = {
  name: "project-title",
  heading(node, ctx) {
    if (node.depth !== 1) return;
    const frontmatter = ctx.data.astro?.frontmatter;
    if (!frontmatter || frontmatter.pageTitle !== undefined) return;
    frontmatter.pageTitle = ctx.textContent(node).trim();
    ctx.removeNode(node);
  },
};

/** Plugin factory: only project pages get the plugin. */
export default function projectTitlePlugin({ fileURL }) {
  return fileURL && projectContent.test(fileURL.pathname) ? liftTitle : null;
}
