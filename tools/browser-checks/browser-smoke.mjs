import assert from "node:assert/strict";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { chromium, firefox } from "playwright";

const base = process.env.TEST_BASE_URL || "http://127.0.0.1:4173";
const output = resolve("artifacts/browser");
mkdirSync(output, { recursive: true });

const targets = [
  "/",
  "/fr/",
  "/projects",
  "/fr/projects",
  "/projects/xila",
  "/fr/projects/xila",
  "/projects/huffman",
  "/fr/projects/huffman",
  "/experiences",
  "/fr/experiences",
  "/skills",
  "/fr/skills",
  "/resume",
  "/fr/resume",
];
const widths = [320, 375, 768, 1440];
// Header collapse breakpoint: same value as narrowQuery in SiteHeader.astro.
const headerBreakpoint = 820;
const failures = [];
let checked = 0;

for (const [engineName, engine] of [
  ["chromium", chromium],
  ["firefox", firefox],
]) {
  const browser = await engine.launch({ headless: true });
  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    });
    const page = await context.newPage();

    for (const path of targets) {
      const url = base + path;
      try {
        // Load each page only once; resizing is enough to test each breakpoint.
        await page.setViewportSize({ width: 1440, height: 900 });
        const response = await page.goto(url, {
          waitUntil: "domcontentloaded",
          timeout: 10000,
        });
        assert.equal(response?.status(), 200, url + " should resolve");
        await page.locator("main").first().waitFor({ timeout: 7000 });

        for (const width of widths) {
          await page.setViewportSize({ width, height: 900 });
          await page.waitForTimeout(60);
          const horizontalOverflow = await page.evaluate(
            () => document.documentElement.scrollWidth > window.innerWidth + 2,
          );
          if (
            horizontalOverflow &&
            width === 320 &&
            path.includes("/experiences")
          ) {
            const offenders = await page.evaluate(() =>
              [...document.body.querySelectorAll("*")]
                .filter((node) => {
                  const box = node.getBoundingClientRect();
                  return (
                    box.width > 0 &&
                    (box.right > window.innerWidth + 2 || box.left < -2)
                  );
                })
                .slice(0, 18)
                .map((node) => ({
                  tag: node.tagName.toLowerCase(),
                  id: node.id,
                  className:
                    typeof node.className === "string"
                      ? node.className.slice(0, 90)
                      : "",
                  rect: (() => {
                    const r = node.getBoundingClientRect();
                    return {
                      left: Math.round(r.left),
                      right: Math.round(r.right),
                      width: Math.round(r.width),
                    };
                  })(),
                })),
            );
            console.error(
              engineName +
                " " +
                url +
                " width=320 overflow diagnostics: " +
                JSON.stringify(offenders),
            );
          }
          assert.equal(
            horizontalOverflow,
            false,
            url + " horizontal overflow at " + width,
          );

          if (
            (path === "/" || path === "/fr/" || path.endsWith("/projects")) &&
            (width === 375 || width === 1440)
          ) {
            const name = path.replace(/\W+/g, "-") || "home";
            await page.screenshot({
              path: resolve(
                output,
                engineName + "-" + name + "-" + width + ".png",
              ),
              fullPage: false,
              timeout: 10000,
            });
          }
          checked++;
        }
      } catch (error) {
        failures.push(engineName + " " + path + ": " + error);
      }
    }

    for (const [path, name] of [
      ["/projects", "Libraries"],
      ["/fr/projects", "Bibliothèques"],
    ]) {
      try {
        await page.goto(base + path, {
          waitUntil: "domcontentloaded",
          timeout: 10000,
        });
        const library = page.getByRole("button", { name, exact: true });
        await library.waitFor({ timeout: 10000 });
        await library.click();
        const cards = page.locator(".showcase-card:visible");
        await page.waitForTimeout(100);
        assert.equal(
          await cards.count(),
          6,
          "Expected six open-source libraries",
        );
        const search = page.locator('input[type="search"]');
        await search.fill("nanoexpr");
        assert.equal(
          await cards.count(),
          1,
          "Expected a single matching library",
        );
        assert.match(await cards.first().innerText(), /nanoexpr/i);
        checked++;
      } catch (error) {
        failures.push(engineName + " " + path + " filters: " + error);
      }
    }

    // A filter combination with no match shows the empty state and a zero
    // count; resetting every control restores the full catalogue.
    for (const [path, labels] of [
      ["/projects", ["Libraries", "Security", "All", "All areas"]],
      [
        "/fr/projects",
        ["Bibliothèques", "Sécurité", "Tous", "Tous les domaines"],
      ],
    ]) {
      try {
        await page.setViewportSize({ width: 1440, height: 900 });
        await page.goto(base + path, {
          waitUntil: "domcontentloaded",
          timeout: 10000,
        });
        const [library, security, allGroups, allAreas] = labels.map((name) =>
          page.getByRole("button", { name, exact: true }),
        );
        await library.waitFor({ timeout: 10000 });
        const cards = page.locator(".showcase-card");
        const visibleCards = page.locator(".showcase-card:visible");
        const status = page.locator(".showcase-count[role=status]");
        const empty = page.locator(".showcase-empty");
        const search = page.locator('input[type="search"]');
        const total = await cards.count();
        assert.ok(total >= 26, path + " should list every project");

        await library.click();
        await security.click();
        await search.fill("zzz");
        assert.equal(await visibleCards.count(), 0, path + " should be empty");
        assert.equal(await empty.isVisible(), true, path + " empty state");
        assert.match(await status.innerText(), /\b0\b/, path + " zero count");

        await allGroups.click();
        await allAreas.click();
        await search.fill("");
        assert.equal(
          await visibleCards.count(),
          total,
          path + " clearing filters should restore every card",
        );
        assert.equal(await empty.isVisible(), false, path + " empty hidden");
        assert.match(
          await status.innerText(),
          new RegExp("\\b" + total + "\\b"),
          path + " count should be restored",
        );
        checked++;
      } catch (error) {
        failures.push(engineName + " " + path + " empty filters: " + error);
      }
    }

    // Grid/list view toggle: aria-pressed buttons, a single-column list, the
    // choice remembered across reloads, and no overflow at 390px.
    for (const [path, gridName, listName] of [
      ["/projects", "Grid", "List"],
      ["/fr/projects", "Grille", "Liste"],
    ]) {
      try {
        await page.setViewportSize({ width: 1440, height: 900 });
        await page.goto(base + path, {
          waitUntil: "domcontentloaded",
          timeout: 10000,
        });
        await page.evaluate(() => localStorage.clear());
        await page.reload({ waitUntil: "domcontentloaded" });
        const gridButton = page.getByRole("button", {
          name: gridName,
          exact: true,
        });
        const listButton = page.getByRole("button", {
          name: listName,
          exact: true,
        });
        const grid = page.locator("[data-catalogue-grid]");
        await listButton.waitFor({ timeout: 10000 });
        // The index list is the default way to browse the catalogue.
        assert.equal(await listButton.getAttribute("aria-pressed"), "true");
        assert.equal(await gridButton.getAttribute("aria-pressed"), "false");
        assert.equal(await grid.getAttribute("data-view"), "list");
        const rects = () =>
          page
            .locator(".showcase-card")
            .evaluateAll((cards) =>
              cards.slice(0, 2).map((card) => card.getBoundingClientRect()),
            );
        let [first, second] = await rects();
        assert.ok(
          Math.abs(first.left - second.left) < 1 && second.top > first.top,
          path + " list view should stack cards in one column",
        );

        await gridButton.click();
        assert.equal(await gridButton.getAttribute("aria-pressed"), "true");
        assert.equal(await listButton.getAttribute("aria-pressed"), "false");
        assert.equal(await grid.getAttribute("data-view"), "grid");
        // Move the pointer off the cards: a hovered card lifts a few pixels.
        await page.mouse.move(0, 0);
        await page.waitForTimeout(400);
        [first, second] = await rects();
        assert.ok(
          Math.abs(first.top - second.top) < 1 && second.left > first.left,
          path + " grid view should place cards side by side",
        );

        await page.reload({ waitUntil: "domcontentloaded" });
        await gridButton.waitFor({ timeout: 10000 });
        assert.equal(
          await gridButton.getAttribute("aria-pressed"),
          "true",
          path + " should remember the grid view",
        );
        assert.equal(await grid.getAttribute("data-view"), "grid");

        await page.setViewportSize({ width: 390, height: 844 });
        await page.waitForTimeout(60);
        for (const view of [gridButton, listButton]) {
          await view.click();
          assert.equal(
            await page.evaluate(
              () =>
                document.documentElement.scrollWidth > window.innerWidth + 2,
            ),
            false,
            path + " catalogue overflows at 390px",
          );
        }
        assert.equal(await grid.getAttribute("data-view"), "list");
        await page.evaluate(() => localStorage.clear());
        checked++;
      } catch (error) {
        failures.push(engineName + " " + path + " view toggle: " + error);
      }
    }

    // Blocked storage must not break the catalogue script.
    {
      const blocked = await browser.newContext({
        viewport: { width: 1440, height: 900 },
      });
      try {
        await blocked.addInitScript(() => {
          Object.defineProperty(window, "localStorage", {
            get() {
              throw new DOMException("blocked", "SecurityError");
            },
          });
        });
        const blockedPage = await blocked.newPage();
        await blockedPage.goto(base + "/projects", {
          waitUntil: "domcontentloaded",
          timeout: 10000,
        });
        const gridView = blockedPage.getByRole("button", {
          name: "Grid",
          exact: true,
        });
        await gridView.waitFor({ timeout: 10000 });
        await gridView.click();
        assert.equal(await gridView.getAttribute("aria-pressed"), "true");
        assert.equal(
          await blockedPage
            .locator("[data-catalogue-grid]")
            .getAttribute("data-view"),
          "grid",
        );
        checked++;
      } catch (error) {
        failures.push(engineName + " blocked storage view toggle: " + error);
      } finally {
        await blocked.close();
      }
    }

    // Immersive typographic homepage, keyboard-friendly scroll navigation and
    // reduced-motion fallback. The intro is static Astro HTML.
    for (const path of ["/", "/fr/"]) {
      try {
        for (const [width, height] of [
          [1440, 900],
          [768, 900],
          [375, 812],
          [320, 640],
        ]) {
          await page.setViewportSize({ width, height });
          await page.goto(base + path, {
            waitUntil: "domcontentloaded",
            timeout: 10000,
          });
          const intro = page.locator(".home-hero");
          const title = intro.locator("#home-hero-title");
          assert.equal(
            await intro.count(),
            1,
            path + " hero should render once",
          );
          assert.equal(
            await title.count(),
            1,
            path + " must have one typographic title",
          );
          assert.equal(
            await intro.locator("img").count(),
            0,
            path + " should not load the removed pixel portrait",
          );
          assert.equal(await intro.locator(".home-hero-title-mask").count(), 2);
          assert.match(
            await title.innerText(),
            /Alix ANNERAUD/,
            path + " H1 should name its owner",
          );
          const accent = await title
            .locator("em")
            .evaluate((node) => getComputedStyle(node).fontStyle);
          assert.equal(accent, "italic", path + " accent line is italic");
          const scrollLink = intro.locator(".home-hero-scroll");
          const scrollLabel = await scrollLink.getAttribute("aria-label");
          if (scrollLabel) {
            const visible = (
              await scrollLink.locator("span:not([aria-hidden])").innerText()
            ).trim();
            assert.ok(
              scrollLabel.includes(visible),
              path + " scroll aria-label should contain its visible text",
            );
          }
          // The hero fills exactly what the sticky header leaves.
          const fill = await page.evaluate(() => {
            const header = document.querySelector(".site-header");
            const hero = document.querySelector(".home-hero");
            return (
              (header?.getBoundingClientRect().height ?? 0) +
              (hero?.getBoundingClientRect().height ?? 0) -
              window.innerHeight
            );
          });
          assert.ok(
            fill >= -2,
            path + " header + hero should fill the viewport (gap " + fill + ")",
          );
          assert.equal(
            await intro.locator(".home-hero-scroll").getAttribute("href"),
            "#career-highlights",
            path + " scroll cue should target career",
          );
          assert.equal(
            await intro.locator(".home-action").count(),
            3,
            path + " should preserve professional, project and contact CTAs",
          );

          const rect = await intro.boundingBox();
          assert.ok(
            rect && rect.height >= height - 119,
            path +
              " hero should nearly fill the viewport at " +
              width +
              "×" +
              height +
              " (height=" +
              rect?.height +
              ")",
          );
          assert.ok(
            rect.width <= width + 2,
            path + " hero must not overflow at " + width,
          );
          const overflow = await page.evaluate(
            () => document.documentElement.scrollWidth > window.innerWidth + 2,
          );
          assert.equal(
            overflow,
            false,
            path + " horizontal overflow at " + width,
          );
          checked++;

          if (width === 1440 || width === 375) {
            // Capture the final visual state, not a mid-animation text reveal.
            await page.waitForTimeout(1250);
            await page.screenshot({
              path: resolve(
                output,
                engineName +
                  "-" +
                  (path === "/" ? "en" : "fr") +
                  "-hero-animated-" +
                  width +
                  ".png",
              ),
              fullPage: false,
              timeout: 15000,
            });
          }
        }

        await page.setViewportSize({ width: 1440, height: 900 });
        await page.emulateMedia({ reducedMotion: "reduce" });
        await page.goto(base + path, {
          waitUntil: "domcontentloaded",
          timeout: 10000,
        });
        const reduced = await page
          .locator(".home-hero-title-line")
          .first()
          .evaluate((node) => ({
            animation: getComputedStyle(node).animationName,
            opacity: getComputedStyle(node).opacity,
          }));
        assert.equal(
          reduced.animation,
          "none",
          path + " must disable title animation for reduced motion",
        );
        assert.equal(
          reduced.opacity,
          "1",
          path + " title remains readable without animation",
        );
        checked++;

        // Same-page anchor works with either motion preference.
        await page.locator(".home-hero-scroll").click();
        await page.waitForFunction(
          () =>
            location.hash === "#career-highlights" &&
            document
              .querySelector("#career-highlights")
              ?.getBoundingClientRect().top <
              window.innerHeight * 0.65,
          null,
          { timeout: 6000 },
        );
        checked++;
        await page.emulateMedia({ reducedMotion: "no-preference" });
      } catch (error) {
        failures.push(engineName + " " + path + " immersive hero: " + error);
        await page.emulateMedia({ reducedMotion: "no-preference" });
      }
    }

    // A balanced homepage must show professional experience first, then
    // multiple projects, with Xila's topology as a clearly labelled deep dive.
    for (const [path, careerUrl] of [
      ["/", "/experiences"],
      ["/fr/", "/fr/experiences"],
    ]) {
      try {
        await page.setViewportSize({ width: 1440, height: 900 });
        await page.goto(base + path, {
          waitUntil: "domcontentloaded",
          timeout: 10000,
        });
        const experience = page.locator(".home-experience");
        const featuredCards = experience.locator(".home-experience-card");
        assert.equal(
          await featuredCards.count(),
          4,
          path + " must surface four professional roles",
        );
        const employers = await featuredCards
          .locator(".home-experience-organization")
          .allTextContents();
        for (const company of [
          "Memo Bank",
          "Linkt",
          "Amazon",
          "New York University",
        ]) {
          assert.ok(
            employers.includes(company),
            path + " missing employer: " + company,
          );
        }
        for (const id of ["memo-bank", "linkt", "amazon", "nyu"]) {
          const link = experience.locator(
            'a[href="' + careerUrl + "#" + id + '-title"]',
          );
          assert.equal(
            await link.count(),
            1,
            path + " role needs a link to its timeline entry",
          );
        }
        const sections = await page.evaluate(() => ({
          hero: document.querySelector(".home-hero")?.getBoundingClientRect()
            .top,
          career: document
            .querySelector(".home-experience")
            ?.getBoundingClientRect().top,
          projects: document
            .querySelector(".portfolio-showcase")
            ?.getBoundingClientRect().top,
          xila: document
            .querySelector(".xila-topology")
            ?.getBoundingClientRect().top,
        }));
        assert.ok(
          Object.values(sections).every((value) => typeof value === "number") &&
            sections.hero < sections.career &&
            sections.career < sections.projects &&
            sections.projects < sections.xila,
          path +
            " homepage sections are out of order: " +
            JSON.stringify(sections),
        );
        assert.match(
          await page.locator(".xila-topology-heading").innerText(),
          /Xila/i,
        );

        for (const [width, columns] of [
          [1440, 2],
          [375, 1],
        ]) {
          await page.setViewportSize({ width, height: 900 });
          const grid = await experience
            .locator(".home-experience-grid")
            .evaluate(
              (el) =>
                getComputedStyle(el)
                  .gridTemplateColumns.split(" ")
                  .filter(Boolean).length,
            );
          assert.equal(
            grid,
            columns,
            path + " experience grid columns at " + width,
          );
          checked++;
        }
        await page.setViewportSize({ width: 1440, height: 900 });
        await page.screenshot({
          path: resolve(
            output,
            engineName +
              "-" +
              (path === "/" ? "home" : "fr-home") +
              "-career-1440.png",
          ),
          fullPage: true,
          timeout: 15000,
        });
      } catch (error) {
        failures.push(engineName + " " + path + " homepage balance: " + error);
      }
    }

    // Astro migration must preserve the centered editorial layout on wide screens.
    for (const path of [
      "/experiences",
      "/fr/experiences",
      "/skills",
      "/fr/skills",
    ]) {
      try {
        await page.setViewportSize({ width: 1440, height: 900 });
        await page.goto(base + path, {
          waitUntil: "domcontentloaded",
          timeout: 10000,
        });
        const container = page.locator(".editorial-page").first();
        await container.waitFor();
        const bounds = await container.boundingBox();
        assert.ok(bounds, path + " editorial container missing");
        assert.ok(
          bounds.width <= 1181,
          path + " editorial content is too wide: " + bounds.width,
        );
        assert.ok(
          Math.abs(bounds.x - (1440 - bounds.width) / 2) <= 2,
          path + " editorial content is not centered",
        );
        checked++;
      } catch (error) {
        failures.push(engineName + " " + path + " editorial width: " + error);
      }
    }

    // Each section hides entire older cards by default and has ONE section
    // toggle. All five older cards must show their full descriptions and tags
    // after expansion, with independent state for professional vs education.
    for (const [path, labels] of [
      [
        "/experiences",
        [
          "Show 3 earlier roles",
          "Hide 3 earlier roles",
          "Show 2 earlier milestones",
          "Hide 2 earlier milestones",
        ],
      ],
      [
        "/fr/experiences",
        [
          "Afficher 3 postes précédents",
          "Masquer 3 postes précédents",
          "Afficher 2 étapes précédentes",
          "Masquer 2 étapes précédentes",
        ],
      ],
    ]) {
      try {
        await page.setViewportSize({ width: 1440, height: 900 });
        await page.goto(base + path, {
          waitUntil: "domcontentloaded",
          timeout: 10000,
        });
        const groups = [
          {
            id: "professional",
            entries: ["insa-relations", "renault-cleon", "guenola-sahut"],
            show: labels[0],
            hide: labels[1],
          },
          {
            id: "education",
            entries: ["baccalaureat", "cambridge-b1"],
            show: labels[2],
            hide: labels[3],
          },
        ];
        assert.equal(
          await page.locator(".career-earlier-toggle").count(),
          2,
          path + " should have exactly two section-level toggles",
        );
        assert.equal(
          await page.locator(".career-expand-button").count(),
          0,
          path + " should have no per-card toggle buttons",
        );

        for (const group of groups) {
          const list = page.locator("#earlier-" + group.id);
          const revealButton = page.getByRole("button", {
            name: group.show,
            exact: true,
          });
          assert.equal(
            await revealButton.getAttribute("aria-controls"),
            "earlier-" + group.id,
          );
          assert.equal(
            await revealButton.getAttribute("aria-expanded"),
            "false",
          );
          assert.equal(
            await list.isVisible(),
            false,
            path + " " + group.id + " initially visible",
          );
          assert.equal(
            await list.locator(".career-card").count(),
            group.entries.length,
          );

          for (const id of group.entries) {
            const card = list.locator('[aria-labelledby="' + id + '-title"]');
            assert.equal(
              await card.count(),
              1,
              path + " must contain " + id + " in SSR",
            );
            assert.equal(
              await card.isVisible(),
              false,
              id + " initially visible",
            );
          }

          await revealButton.click();
          assert.equal(
            await list.isVisible(),
            true,
            group.id + " must be shown",
          );
          const hideButton = page.getByRole("button", {
            name: group.hide,
            exact: true,
          });
          assert.equal(await hideButton.getAttribute("aria-expanded"), "true");

          for (const id of group.entries) {
            const card = list.locator('[aria-labelledby="' + id + '-title"]');
            assert.equal(
              await card.isVisible(),
              true,
              id + " must be visible after expansion",
            );
            assert.equal(
              await card.locator(".career-summary").isVisible(),
              true,
              id + " must show the complete description",
            );
            assert.ok(
              (await card.locator(".career-highlights li").count()) >= 1,
              id + " should retain full detail bullets",
            );
          }

          // Expanding professional entries must not reveal older education cards.
          const otherId =
            group.id === "professional" ? "education" : "professional";
          assert.equal(
            await page.locator("#earlier-" + otherId).isVisible(),
            false,
            "Expanding " + group.id + " should not reveal " + otherId,
          );

          await hideButton.click();
          assert.equal(
            await hideButton.count(),
            0,
            group.id + " must return to 'show' state",
          );
          assert.equal(
            await list.isVisible(),
            false,
            group.id + " must collapse again",
          );
          checked++;
        }
        await page.screenshot({
          path: resolve(
            output,
            engineName +
              "-" +
              (path.startsWith("/fr/") ? "fr-" : "") +
              "experiences-1440.png",
          ),
          fullPage: true,
          timeout: 15000,
        });
      } catch (error) {
        failures.push(
          engineName + " " + path + " earlier experience groups: " + error,
        );
      }
    }

    // Timeline dates and section numbers are machine metadata: JetBrains
    // Mono with tabular figures, in the rail at 1440 and inside the card at
    // 390 (where the rail hides). The earlier-roles toggle keeps the
    // "NN — Label" overline format while it updates the count.
    for (const [path, width, selector] of [
      ["/experiences", 1440, ".career-timeline-date"],
      ["/fr/experiences", 390, ".career-period"],
      ["/", 1440, ".home-experience-period"],
      ["/fr/", 1440, "[data-section-index] .eyebrow__index"],
    ]) {
      try {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(base + path, {
          waitUntil: "load",
          timeout: 10000,
        });
        const date = page.locator(selector).first();
        assert.equal(await date.isVisible(), true, selector + " hidden");
        const style = await date.evaluate((node) => {
          const computed = getComputedStyle(node);
          return {
            family: computed.fontFamily,
            numeric: computed.fontVariantNumeric,
          };
        });
        assert.match(style.family, /JetBrains Mono/, selector + " font");
        assert.match(style.numeric, /tabular-nums/, selector + " figures");
        if (path.endsWith("experiences")) {
          // The overline is a label ("01 — Experience"); the count lives in
          // the toggle, which names the number of earlier roles.
          const numbered = page.locator("#professional [data-section-index]");
          const overline = (await numbered.textContent()).replace(/\s+/g, " ");
          assert.match(overline, /^01 — \D/, "overline " + overline);
          const toggle = page.locator("#professional .career-earlier-toggle");
          assert.match(await toggle.innerText(), /\d/, "toggle needs a count");
        }
        checked++;
      } catch (error) {
        failures.push(
          engineName + " " + path + " " + width + " mono metadata: " + error,
        );
      }
    }

    // Project cards: the whole card opens the project page through one
    // stretched title link, keyboard focus rings the card, hovering dims the
    // neighbours' art panels (motion allowed only), and numbers are stable
    // ranks.
    for (const [path, filter] of [
      ["/", null],
      ["/fr/projects", "Bibliothèques"],
    ]) {
      try {
        await page.setViewportSize({ width: 1440, height: 900 });
        await page.emulateMedia({ reducedMotion: "no-preference" });
        await page.goto(base + path, {
          waitUntil: "load",
          timeout: 10000,
        });
        const cards = page.locator(".showcase-card");
        const [first, second] = [cards.nth(0), cards.nth(1)];
        // Only the art panel dims: the neighbours' text keeps its contrast.
        const opacity = (card) =>
          card
            .locator(".showcase-art")
            .evaluate((node) => Number(getComputedStyle(node).opacity));
        await first.scrollIntoViewIfNeeded();
        // Let the homepage entry animation finish first.
        await page.waitForTimeout(1000);
        await first.hover();
        await page.waitForTimeout(450);
        // Dimming is reserved to hover-capable pointers (headless Firefox
        // reports none): elsewhere every card keeps full opacity.
        const canHover = await page.evaluate(
          () => matchMedia("(hover: hover)").matches,
        );
        assert.equal(await opacity(first), 1, path + " hovered card dimmed");
        if (canHover) {
          assert.ok(
            (await opacity(second)) < 0.8,
            path + " neighbours should dim while a card is hovered",
          );
        } else {
          assert.equal(
            await opacity(second),
            1,
            path + " dimmed without hover",
          );
        }

        const link = first.locator(".showcase-card-link");
        await link.focus();
        assert.notEqual(
          await first.evaluate((node) => getComputedStyle(node).outlineStyle),
          "none",
          path + " focusing the card link should ring the card",
        );

        if (filter) {
          const target = cards.filter({ hasText: "nanoexpr" });
          const rank = () =>
            target.locator(".showcase-art-position").innerText();
          const before = await rank();
          await page.getByRole("button", { name: filter, exact: true }).click();
          assert.equal(
            await rank(),
            before,
            path + " card numbers must not change when filtering",
          );
        }

        // A click anywhere on a visible card opens its project page.
        const clicked = cards.filter({ visible: true }).first();
        const href = await clicked
          .locator(".showcase-card-link")
          .getAttribute("href");
        await clicked.click();
        await page.waitForURL((url) => url.pathname === href, {
          timeout: 5000,
        });

        await page.emulateMedia({ reducedMotion: "reduce" });
        await page.goto(base + path, { waitUntil: "load", timeout: 10000 });
        await first.hover();
        await page.waitForTimeout(300);
        assert.equal(
          await opacity(second),
          1,
          path + " reduced motion: neighbours must not dim",
        );
        assert.equal(
          await first.evaluate((node) => getComputedStyle(node).transform),
          "none",
          path + " reduced motion: hovered card must not move",
        );
        checked++;
      } catch (error) {
        failures.push(engineName + " " + path + " project cards: " + error);
      }
      await page.emulateMedia({ reducedMotion: "no-preference" });
    }

    // Motion audit: with reduced motion requested, nothing animates, hovered
    // cards, buttons and their arrows do not move, and the Xila topology keeps
    // its static drawing instead of the WebGL animation.
    await page.emulateMedia({ reducedMotion: "reduce" });
    for (const path of [
      "/",
      "/fr/",
      "/projects",
      "/projects/xila",
      "/experiences",
      "/skills",
      "/resume",
    ]) {
      try {
        await page.setViewportSize({ width: 1440, height: 900 });
        await page.goto(base + path, { waitUntil: "load", timeout: 10000 });
        const animated = await page.evaluate(() =>
          [...document.querySelectorAll("*")]
            .filter((node) => getComputedStyle(node).animationName !== "none")
            .map((node) => node.tagName.toLowerCase() + "." + node.className)
            .slice(0, 5),
        );
        assert.deepEqual(animated, [], path + " animates under reduced motion");
        if (path === "/" || path === "/fr/") {
          assert.equal(
            await page
              .locator(".home-hero-title-line")
              .first()
              .evaluate((node) => getComputedStyle(node).animationName),
            "none",
            path + " hero lines must not animate",
          );
          assert.equal(
            await page.locator(".xila-topology canvas.is-ready").count(),
            0,
            path + " Xila topology must stay static",
          );
        }
        for (const selector of [
          ".showcase-card",
          ".home-experience-card",
          ".home-action",
          ".showcase-all-link",
          ".editorial-next a",
          ".resume-action",
        ]) {
          const target = page.locator(selector).filter({ visible: true });
          if ((await target.count()) === 0) continue;
          await target.first().scrollIntoViewIfNeeded();
          await target.first().hover();
          await page.waitForTimeout(80);
          const moved = await target.first().evaluate((node) =>
            [node, ...node.querySelectorAll("*")]
              .filter((el) => {
                const style = getComputedStyle(el);
                return (
                  style.transform !== "none" ||
                  (style.translate !== "none" && style.translate !== "")
                );
              })
              .map((el) => el.tagName.toLowerCase() + "." + el.className),
          );
          assert.deepEqual(
            moved,
            [],
            path + " " + selector + " moves on hover under reduced motion",
          );
        }
        checked++;
      } catch (error) {
        failures.push(engineName + " " + path + " reduced motion: " + error);
      }
    }
    await page.emulateMedia({ reducedMotion: "no-preference" });

    // Resume: the PDF preview only appears on wide screens; the download and
    // open buttons and the site footer are always there.
    for (const path of ["/resume", "/fr/resume"]) {
      try {
        await page.setViewportSize({ width: 1440, height: 900 });
        await page.goto(base + path, {
          waitUntil: "domcontentloaded",
          timeout: 10000,
        });
        // Firefox reports <object> as hidden to isVisible(): read its box.
        const preview = page.locator("object.resume-preview");
        const shown = () =>
          preview.evaluate((node) =>
            getComputedStyle(node).display === "none"
              ? 0
              : node.getBoundingClientRect().height,
          );
        // Firefox sizes the <object> once it has resolved it, after DOM load.
        await page.waitForFunction(
          () => {
            const node = document.querySelector("object.resume-preview");
            return node && node.getBoundingClientRect().height >= 600;
          },
          null,
          { timeout: 5000 },
        );
        await page.setViewportSize({ width: 390, height: 844 });
        await page.waitForTimeout(60);
        assert.equal(
          await shown(),
          0,
          path + " preview must be hidden on narrow screens",
        );
        const actions = page.locator(".resume-action");
        assert.equal(await actions.count(), 2);
        for (const action of await actions.all()) {
          assert.equal(await action.isVisible(), true);
          const actionBox = await action.boundingBox();
          assert.ok(actionBox.height >= 44, path + " action under 44px");
        }
        assert.equal(
          await page.locator("footer.site-footer").isVisible(),
          true,
          path + " footer missing",
        );
        checked++;
      } catch (error) {
        failures.push(engineName + " " + path + " resume layout: " + error);
      }
    }

    await context.close();

    // Without JavaScript every card stays visible and the navigation works:
    // filters and the earlier-roles toggle are progressive enhancements.
    // Mobile (390px) checks that the main navigation needs no menu script.
    for (const [width, height] of [
      [1440, 900],
      [390, 844],
    ]) {
      const staticContext = await browser.newContext({
        viewport: { width, height },
        javaScriptEnabled: false,
      });
      const staticPage = await staticContext.newPage();
      for (const [path, cardSelector, minimum] of [
        ["/", ".showcase-card", 3],
        ["/", ".home-experience-card", 4],
        ["/projects", ".showcase-card", 26],
        ["/fr/projects", ".showcase-card", 26],
        ["/experiences", ".career-card", 11],
        ["/fr/experiences", ".career-card", 11],
      ]) {
        try {
          // Wait for the load event so styles apply before checking visibility.
          // A revisited page may be revalidated with 304 Not Modified.
          const response = await staticPage.goto(base + path, {
            waitUntil: "load",
            timeout: 10000,
          });
          assert.ok(
            [200, 304].includes(response?.status() ?? 0),
            path + " should resolve",
          );
          const cards = staticPage.locator(cardSelector);
          const total = await cards.count();
          assert.ok(
            total >= minimum,
            path +
              " without JS: expected at least " +
              minimum +
              " " +
              cardSelector +
              ", found " +
              total,
          );
          assert.equal(
            await staticPage.locator(cardSelector + ":visible").count(),
            total,
            path + " without JS: every " + cardSelector + " must be visible",
          );
          const navLinks = staticPage.locator(".site-main-nav a[href]");
          assert.ok(
            (await navLinks.count()) >= 4,
            path + " without JS: main navigation links missing",
          );
          for (const link of await navLinks.all()) {
            assert.equal(
              await link.isVisible(),
              true,
              path + " nav link hidden",
            );
          }
          checked++;
        } catch (error) {
          failures.push(
            engineName +
              " " +
              path +
              " at " +
              width +
              "px without JavaScript: " +
              error,
          );
        }
      }
      await staticContext.close();
    }

    // Theme menu: one icon button in the header row opens a menu of auto,
    // light and dark radio items, by mouse or keyboard. Each choice survives
    // a reload, auto follows the emulated system scheme live, and the choice
    // reaches the other open tabs.
    const themeNames = {
      en: { label: "Theme: ", auto: "Auto", light: "Light", dark: "Dark" },
      fr: {
        label: "Thème : ",
        auto: "Auto",
        light: "Clair",
        dark: "Sombre",
      },
    };
    const themeState = (page) =>
      page.evaluate(() => {
        const root = document.documentElement;
        const menu = document.querySelector(
          ".site-header-tools [data-theme-menu]",
        );
        const button = menu?.querySelector("button[aria-haspopup]");
        const list = menu?.querySelector('[role="menu"]');
        const icon = [...(button?.querySelectorAll("[data-theme-icon]") ?? [])]
          .filter((node) => getComputedStyle(node).display !== "none")
          .map((node) => node.dataset.themeIcon);
        return {
          checked: [...(list?.querySelectorAll('[aria-checked="true"]') ?? [])]
            .map((item) => item.dataset.themeChoice)
            .join(),
          name: button?.getAttribute("aria-label"),
          icon: icon.join(),
          expanded: button?.getAttribute("aria-expanded"),
          open: Boolean(list && !list.hidden && list.offsetParent !== null),
          focused: document.activeElement?.dataset?.themeChoice ?? null,
          buttonFocused: document.activeElement === button,
          stored: localStorage.getItem("portfolio-theme"),
          scheme: getComputedStyle(root).colorScheme,
          dark: matchMedia("(prefers-color-scheme: dark)").matches,
          classes: root.className,
          // Schemes of the theme-color metas the browser would apply.
          meta: [...document.querySelectorAll("meta[data-theme-color]")]
            .filter((meta) => matchMedia(meta.media || "all").matches)
            .map((meta) => meta.dataset.themeColor),
        };
      });

    for (const systemScheme of ["light", "dark"]) {
      const themeContext = await browser.newContext({
        viewport: { width: 1440, height: 900 },
        colorScheme: systemScheme,
      });
      const themePage = await themeContext.newPage();
      const path = systemScheme === "light" ? "/" : "/fr/projects";
      const names = themeNames[path.startsWith("/fr") ? "fr" : "en"];
      try {
        await themePage.goto(base + path, { waitUntil: "load" });
        const menu = themePage.locator(".site-header-tools [data-theme-menu]");
        const button = menu.locator("button[aria-haspopup]");
        const item = (choice) =>
          menu.locator('[data-theme-choice="' + choice + '"]');
        await button.waitFor({ state: "visible", timeout: 5000 });
        const state = () => themeState(themePage);
        const expectScheme = (actual, scheme, label) => {
          assert.equal(actual.scheme, scheme, path + " " + label);
          const expected =
            scheme === "light dark" ? (actual.dark ? "dark" : "light") : scheme;
          assert.deepEqual(
            actual.meta,
            [expected],
            path + " " + label + ": active theme-color",
          );
        };
        const expectChoice = (actual, choice, label) => {
          assert.equal(actual.checked, choice, path + " " + label + " checked");
          assert.equal(actual.icon, choice, path + " " + label + " icon");
          assert.equal(
            actual.name,
            names.label + names[choice],
            path + " " + label + " button name",
          );
        };

        // Same 44px target as the other header controls.
        const buttonBox = await button.boundingBox();
        assert.ok(
          buttonBox &&
            Math.round(buttonBox.height) >= 44 &&
            Math.round(buttonBox.width) >= 44,
          path +
            " theme button is " +
            buttonBox?.width +
            "x" +
            buttonBox?.height,
        );

        let current = await state();
        expectChoice(current, "auto", "default");
        assert.equal(current.expanded, "false");
        assert.equal(current.open, false, path + " menu starts closed");
        assert.equal(current.stored, null);
        assert.equal(current.classes, "", path + " auto adds no class");
        expectScheme(current, "light dark", "auto by default");

        // Mouse: open, check the anchoring, pick, reload.
        for (const choice of ["light", "dark", "auto"]) {
          await button.click();
          current = await state();
          assert.equal(current.expanded, "true", path + " click opens");
          assert.equal(current.open, true, path + " menu visible");
          const listBox = await menu.locator('[role="menu"]').boundingBox();
          const box = await button.boundingBox();
          assert.ok(
            listBox &&
              listBox.y >= box.y + box.height - 1 &&
              Math.abs(listBox.x + listBox.width - (box.x + box.width)) <= 1,
            path + " menu must hang right-aligned under the button",
          );
          for (const option of await menu
            .locator('[role="menuitemradio"]')
            .all()) {
            const optionBox = await option.boundingBox();
            assert.ok(
              optionBox && Math.round(optionBox.height) >= 44,
              path + " theme item is " + optionBox?.height + "px high",
            );
          }
          await item(choice).click();
          current = await state();
          assert.equal(current.open, false, path + " picking closes");
          assert.equal(current.expanded, "false");
          assert.equal(current.stored, choice, path + " stores " + choice);
          expectChoice(current, choice, choice + " picked");
          const scheme = choice === "auto" ? "light dark" : choice;
          expectScheme(current, scheme, choice + " applies");
          await themePage.reload({ waitUntil: "load" });
          await button.waitFor({ state: "visible", timeout: 5000 });
          current = await state();
          expectChoice(current, choice, choice + " after reload");
          expectScheme(current, scheme, choice + " survives a reload");
        }

        // A click outside closes the menu without choosing.
        await button.click();
        await themePage.mouse.click(20, 600);
        current = await state();
        assert.equal(current.open, false, path + " outside click closes");
        assert.equal(current.expanded, "false");
        assert.equal(current.checked, "auto");

        // Auto follows the system scheme live, without a reload.
        const background = () =>
          themePage.evaluate(
            () => getComputedStyle(document.body).backgroundColor,
          );
        await themePage.emulateMedia({ colorScheme: "light" });
        const lightBackground = await background();
        await themePage.emulateMedia({ colorScheme: "dark" });
        const darkBackground = await background();
        assert.notEqual(
          lightBackground,
          darkBackground,
          path + " auto must follow the system scheme",
        );
        current = await state();
        expectScheme(current, "light dark", "auto with a dark system");
        // An explicit choice ignores the system scheme.
        await button.click();
        await item("light").click();
        assert.equal(await background(), lightBackground, path + " light");
        await themePage.emulateMedia({ colorScheme: "light" });
        assert.equal(await background(), lightBackground);

        // Keyboard: Enter opens on the current item, arrows, Home and End
        // move the focus (wrapping), Space picks and returns to the button.
        await button.focus();
        await themePage.keyboard.press("Enter");
        current = await state();
        assert.equal(current.open, true, path + " Enter opens");
        assert.equal(current.focused, "light", path + " focus on current item");
        await themePage.keyboard.press("ArrowDown");
        assert.equal((await state()).focused, "dark", path + " ArrowDown");
        await themePage.keyboard.press("ArrowDown");
        assert.equal((await state()).focused, "auto", path + " Down wraps");
        await themePage.keyboard.press("ArrowUp");
        assert.equal((await state()).focused, "dark", path + " Up wraps");
        await themePage.keyboard.press("Home");
        assert.equal((await state()).focused, "auto", path + " Home");
        await themePage.keyboard.press("End");
        assert.equal((await state()).focused, "dark", path + " End");
        const focusRing = await themePage.evaluate(
          () => getComputedStyle(document.activeElement).outlineStyle,
        );
        assert.notEqual(focusRing, "none", path + " focused item ring");
        await themePage.keyboard.press("Space");
        current = await state();
        assert.equal(current.open, false, path + " Space picks and closes");
        assert.equal(current.buttonFocused, true, path + " focus back");
        expectChoice(current, "dark", "Space");
        assert.equal(current.stored, "dark");
        assert.equal(await background(), darkBackground, path + " dark");
        // Space on the button opens too; Enter on an item picks it.
        await themePage.keyboard.press("Space");
        assert.equal((await state()).focused, "dark", path + " Space opens");
        await themePage.keyboard.press("Home");
        await themePage.keyboard.press("Enter");
        current = await state();
        assert.equal(current.open, false, path + " Enter picks and closes");
        assert.equal(current.buttonFocused, true);
        expectChoice(current, "auto", "Enter");
        // Escape closes without choosing and returns the focus.
        await themePage.keyboard.press("ArrowDown");
        assert.equal((await state()).open, true, path + " ArrowDown opens");
        await themePage.keyboard.press("End");
        await themePage.keyboard.press("Escape");
        current = await state();
        assert.equal(current.open, false, path + " Escape closes");
        assert.equal(current.expanded, "false");
        assert.equal(current.buttonFocused, true, path + " Escape focus");
        assert.equal(current.checked, "auto", path + " Escape keeps choice");
        // Tab leaves the menu and closes it.
        await themePage.keyboard.press("Enter");
        await themePage.keyboard.press("Tab");
        current = await state();
        assert.equal(current.open, false, path + " Tab closes");
        assert.equal(current.expanded, "false");

        // Another tab of the same site picks up the choice.
        const otherPage = await themeContext.newPage();
        await otherPage.goto(base + path, { waitUntil: "load" });
        const otherMenu = otherPage.locator(
          ".site-header-tools [data-theme-menu]",
        );
        await otherMenu.locator("button[aria-haspopup]").click();
        await otherMenu.locator('[data-theme-choice="dark"]').click();
        await themePage.waitForFunction(() =>
          document.documentElement.classList.contains("dark"),
        );
        expectChoice(await state(), "dark", "other tab");
        await otherPage.close();
        checked++;
      } catch (error) {
        failures.push(
          engineName + " " + path + " theme (" + systemScheme + "): " + error,
        );
      }
      await themeContext.close();
    }

    // Mobile header: one row with a menu button that opens and closes with
    // the keyboard, returns focus on Escape and exposes 44px nav targets.
    // The theme button stays in that row; its menu fits the viewport.
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
    });
    const mobilePage = await mobileContext.newPage();
    for (const path of ["/", "/fr/projects", "/projects/xila"]) {
      try {
        await mobilePage.goto(base + path, {
          waitUntil: "load",
          timeout: 10000,
        });
        const menuButton = mobilePage.locator(".site-menu-button");
        await menuButton.waitFor({ state: "visible", timeout: 5000 });
        const controls = await menuButton.getAttribute("aria-controls");
        assert.ok(controls, path + " menu button needs aria-controls");
        const nav = mobilePage.locator("#" + controls);
        const navLinks = nav.locator("a[href]");
        assert.equal(await menuButton.getAttribute("aria-expanded"), "false");
        assert.equal(
          await navLinks.first().isVisible(),
          false,
          path + " nav links must be hidden while the menu is closed",
        );
        const themeMenu = mobilePage.locator(
          ".site-header-tools [data-theme-menu]",
        );
        const themeButton = themeMenu.locator("button[aria-haspopup]");
        const header = await mobilePage.locator(".site-header").boundingBox();
        const button = await menuButton.boundingBox();
        const themeBox = await themeButton.boundingBox();
        assert.ok(
          header && button && button.y + button.height <= header.y + 80,
          path + " brand, locale, theme and menu must share one row",
        );
        assert.ok(
          themeBox &&
            (await themeButton.isVisible()) &&
            Math.abs(themeBox.y - button.y) <= 1 &&
            Math.round(themeBox.width) >= 44 &&
            Math.round(themeBox.height) >= 44,
          path + " the theme button must sit in the header row at 390px",
        );

        await menuButton.focus();
        await mobilePage.keyboard.press("Enter");
        assert.equal(await menuButton.getAttribute("aria-expanded"), "true");
        assert.ok((await navLinks.count()) >= 4, path + " nav links missing");
        for (const link of await navLinks.all()) {
          assert.equal(await link.isVisible(), true, path + " nav link hidden");
          const box = await link.boundingBox();
          assert.ok(
            box && Math.round(box.height) >= 44,
            path + " nav link target is " + box?.height + "px high",
          );
        }
        assert.equal(
          await nav.locator("[data-theme-menu]").count(),
          0,
          path + " the menu panel must not repeat the theme menu",
        );
        // Tab from the open button lands on the first link it revealed,
        // and the menu stays open (WCAG 2.4.3).
        await mobilePage.keyboard.press("Tab");
        assert.equal(
          await navLinks
            .first()
            .evaluate((node) => node === document.activeElement),
          true,
          path + " Tab from the open menu button must reach the first link",
        );
        assert.equal(await menuButton.getAttribute("aria-expanded"), "true");
        await mobilePage.keyboard.press("Escape");
        assert.equal(await menuButton.getAttribute("aria-expanded"), "false");
        assert.equal(
          await menuButton.evaluate((node) => node === document.activeElement),
          true,
          path + " Escape must return focus to the menu button",
        );
        assert.equal(await navLinks.first().isVisible(), false);
        await mobilePage.keyboard.press("Space");
        assert.equal(await menuButton.getAttribute("aria-expanded"), "true");
        await mobilePage.keyboard.press("Space");
        assert.equal(await menuButton.getAttribute("aria-expanded"), "false");

        // Opening the theme menu closes the navigation panel; its items
        // stay inside the 390px viewport.
        await menuButton.click();
        await themeButton.click();
        assert.equal(
          await menuButton.getAttribute("aria-expanded"),
          "false",
          path + " the theme menu must close the navigation panel",
        );
        const list = themeMenu.locator('[role="menu"]');
        await list.waitFor({ state: "visible", timeout: 5000 });
        const listBox = await list.boundingBox();
        assert.ok(
          listBox && listBox.x >= 0 && listBox.x + listBox.width <= 390,
          path + " the theme menu must fit the 390px viewport",
        );
        assert.equal(
          await mobilePage.evaluate(
            () =>
              document.documentElement.scrollWidth <=
              document.documentElement.clientWidth,
          ),
          true,
          path + " the open theme menu overflows horizontally at 390px",
        );
        await themeMenu.locator('[data-theme-choice="dark"]').click();
        assert.equal(
          await mobilePage.evaluate(() =>
            document.documentElement.classList.contains("dark"),
          ),
          true,
          path + " dark from the 390px theme menu",
        );
        await mobilePage.evaluate(() =>
          localStorage.removeItem("portfolio-theme"),
        );
        checked++;
      } catch (error) {
        failures.push(
          engineName + " " + path + " at 390px mobile header: " + error,
        );
      }
    }
    await mobileContext.close();

    // Either side of the header breakpoint, in both locales: one row that
    // fits, with the menu button only when narrow.
    for (const path of ["/projects", "/fr/projects"]) {
      for (const width of [headerBreakpoint + 1, headerBreakpoint]) {
        const edgeContext = await browser.newContext({
          viewport: { width, height: 700 },
        });
        const edgePage = await edgeContext.newPage();
        try {
          await edgePage.goto(base + path, { waitUntil: "load" });
          await edgePage
            .locator("[data-theme-menu][data-ready]")
            .waitFor({ state: "attached", timeout: 5000 });
          const layout = await edgePage.evaluate(() => {
            const header = document.querySelector(".site-header");
            const inner = header.querySelector(".site-header-inner");
            return {
              overflow:
                document.documentElement.scrollWidth >
                  document.documentElement.clientWidth ||
                inner.scrollWidth > inner.clientWidth,
              height: header.getBoundingClientRect().height,
              menu:
                getComputedStyle(header.querySelector(".site-menu-button"))
                  .display !== "none",
            };
          });
          assert.equal(layout.overflow, false, width + "px header overflows");
          assert.ok(layout.height <= 80, width + "px header wraps");
          assert.equal(
            layout.menu,
            width <= headerBreakpoint,
            width + "px menu button",
          );
          checked++;
        } catch (error) {
          failures.push(
            engineName + " " + path + " header at " + width + "px: " + error,
          );
        }
        await edgeContext.close();
      }
    }
  } finally {
    await browser.close();
  }
}

console.log(
  "Validated " + checked + " browser scenarios in Chromium and Firefox.",
);
if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
}
