/**
 * Lick-mode confetti tests
 *
 * Run:  node tests/lick-mode.test.js
 *
 * Requires a local HTTP server serving index.html on port 8090:
 *   python3 -m http.server 8090
 */

const { chromium } = require("playwright");
const assert = require("node:assert/strict");

const BASE_URL = "http://localhost:8090/index.html";

async function runTests() {
  const browser = await chromium.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 430, height: 900 });

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`  ✅  ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌  ${name}`);
      console.error(`       ${err.message}`);
      failed++;
    }
  }

  // ── Load page ─────────────────────────────────────────────────────────────
  await page.goto(BASE_URL, { waitUntil: "networkidle" });

  console.log("\nLick mode — confetti & interaction tests\n");

  // 1. Initial state
  await test("display shows '?' on load", async () => {
    const text = await page.textContent("#display");
    assert.equal(text.trim(), "?");
  });

  await test("confetti canvas is hidden on load", async () => {
    const display = await page.$eval(
      "#confettiCanvas",
      (el) => window.getComputedStyle(el).display
    );
    assert.equal(display, "none");
  });

  await test("lick mode is OFF by default", async () => {
    const pressed = await page.$eval("#lickBtn", (el) => el.getAttribute("aria-pressed"));
    assert.equal(pressed, "false");
  });

  // 2. Enabling lick mode
  await page.click("#lickBtn");
  await page.waitForTimeout(100);

  await test("lick mode toggles ON (aria-pressed)", async () => {
    const pressed = await page.$eval("#lickBtn", (el) => el.getAttribute("aria-pressed"));
    assert.equal(pressed, "true");
  });

  await test("lick mode button gets .active class", async () => {
    const hasActive = await page.$eval("#lickBtn", (el) => el.classList.contains("active"));
    assert.ok(hasActive);
  });

  await test("hint updates to 'Swipe up to pick!'", async () => {
    const hint = await page.textContent("#hint");
    assert.match(hint, /swipe up to pick/i);
  });

  // 3. Picking a number in lick mode triggers confetti
  await page.click("#pawBtn");
  await page.waitForTimeout(200);

  await test("display updates to a number after pick", async () => {
    const text = await page.textContent("#display");
    assert.ok(!isNaN(parseInt(text.trim(), 10)), `Expected a number, got '${text}'`);
  });

  await test("confetti canvas becomes visible after lick-mode pick", async () => {
    const display = await page.$eval("#confettiCanvas", (el) => el.style.display);
    assert.notEqual(display, "none");
  });

  await test("hint changes to 'The cat has chosen'", async () => {
    const hint = await page.textContent("#hint");
    assert.match(hint, /the cat has chosen/i);
  });

  await test("history gains one entry after pick", async () => {
    const count = await page.$$eval(".history-item", (items) => items.length);
    assert.equal(count, 1);
  });

  // 4. Rapid picks restart confetti (canvas stays visible)
  for (let i = 0; i < 4; i++) {
    await page.click("#pawBtn");
    await page.waitForTimeout(100);
  }

  await test("confetti canvas stays visible during rapid lick-mode picks", async () => {
    const display = await page.$eval("#confettiCanvas", (el) => el.style.display);
    assert.notEqual(display, "none");
  });

  await test("history accumulates entries across rapid picks", async () => {
    const count = await page.$$eval(".history-item", (items) => items.length);
    assert.ok(count >= 5, `Expected ≥5 history entries, got ${count}`);
  });

  // 5. Tap mode — no confetti
  await page.click("#lickBtn"); // turn lick mode off
  await page.waitForTimeout(100);
  await page.waitForTimeout(3500); // wait for previous confetti animation to finish
  await page.click("#pawBtn");
  await page.waitForTimeout(200);

  await test("confetti canvas stays hidden after tap-mode pick", async () => {
    const display = await page.$eval("#confettiCanvas", (el) => el.style.display);
    assert.equal(display, "none");
  });

  // 6. Clear resets display
  await page.click("#clearBtn");
  await page.waitForTimeout(100);

  await test("clear resets display to '?'", async () => {
    const text = await page.textContent("#display");
    assert.equal(text.trim(), "?");
  });

  await test("clear empties history list", async () => {
    const count = await page.$$eval(".history-item", (items) => items.length);
    assert.equal(count, 0);
  });

  // ── Summary ───────────────────────────────────────────────────────────────
  await browser.close();
  console.log(`\n${passed + failed} tests: ${passed} passed, ${failed} failed\n`);
  if (failed > 0) process.exit(1);
}

runTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
