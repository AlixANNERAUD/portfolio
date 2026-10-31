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
  "/experiences",
  "/fr/experiences",
  "/skills",
  "/fr/skills",
  "/resume",
  "/fr/resume",
];
const widths = [320, 375, 768, 1440];
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
        assert.equal(await gridButton.getAttribute("aria-pressed"), "true");
        assert.equal(await listButton.getAttribute("aria-pressed"), "false");

        await listButton.click();
        assert.equal(await listButton.getAttribute("aria-pressed"), "true");
        assert.equal(await gridButton.getAttribute("aria-pressed"), "false");
        assert.equal(await grid.getAttribute("data-view"), "list");
        const [first, second] = await page
          .locator(".showcase-card")
          .evaluateAll((cards) =>
            cards.slice(0, 2).map((card) => card.getBoundingClientRect()),
          );
        assert.ok(
          Math.abs(first.left - second.left) < 1 && second.top > first.top,
          path + " list view should stack cards in one column",
        );

        await page.reload({ waitUntil: "domcontentloaded" });
        await listButton.waitFor({ timeout: 10000 });
        assert.equal(
          await listButton.getAttribute("aria-pressed"),
          "true",
          path + " should remember the list view",
        );
        assert.equal(await grid.getAttribute("data-view"), "list");

        await page.setViewportSize({ width: 390, height: 844 });
        await page.waitForTimeout(60);
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth > window.innerWidth + 2,
          ),
          false,
          path + " list view overflows at 390px",
        );

        await gridButton.click();
        assert.equal(await grid.getAttribute("data-view"), "grid");
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
        const list = blockedPage.getByRole("button", {
          name: "List",
          exact: true,
        });
        await list.waitFor({ timeout: 10000 });
        await list.click();
        assert.equal(await list.getAttribute("aria-pressed"), "true");
        assert.equal(
          await blockedPage
            .locator("[data-catalogue-grid]")
            .getAttribute("data-view"),
          "list",
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
          "Show earlier experience",
          "Hide earlier experience",
          "Show earlier education",
          "Hide earlier education",
        ],
      ],
      [
        "/fr/experiences",
        [
          "Voir les expériences précédentes",
          "Masquer les expériences précédentes",
          "Voir les formations précédentes",
          "Masquer les formations précédentes",
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

    // Project cards: the whole card opens the project page through one
    // stretched title link, keyboard focus rings the card, hovering dims the
    // neighbours (motion allowed only), and numbers are stable ranks.
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
        const opacity = (card) =>
          card.evaluate((node) => Number(getComputedStyle(node).opacity));
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

    // Mobile header: one row with a menu button that opens and closes with
    // the keyboard, returns focus on Escape and exposes 44px nav targets.
    // The theme toggle reports its state with aria-pressed.
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
        const header = await mobilePage.locator(".site-header").boundingBox();
        const button = await menuButton.boundingBox();
        assert.ok(
          header && button && button.y + button.height <= header.y + 80,
          path + " brand, locale, theme and menu must share one row",
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

        const toggle = mobilePage.locator("[data-theme-toggle]");
        await toggle.waitFor({ state: "visible", timeout: 5000 });
        const wasDark = await mobilePage.evaluate(() =>
          document.documentElement.classList.contains("dark"),
        );
        assert.equal(
          await toggle.getAttribute("aria-pressed"),
          String(wasDark),
        );
        await toggle.click();
        assert.equal(
          await toggle.getAttribute("aria-pressed"),
          String(!wasDark),
          path + " theme toggle must update aria-pressed",
        );
        await toggle.click();
        await mobilePage.evaluate(() => localStorage.clear());
        checked++;
      } catch (error) {
        failures.push(
          engineName + " " + path + " at 390px mobile header: " + error,
        );
      }
    }
    await mobileContext.close();
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
