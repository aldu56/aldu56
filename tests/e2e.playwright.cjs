/* eslint-disable @typescript-eslint/no-require-imports */
// End-to-end flow test. Usage: start the app against a seeded Supabase, insert serials ELM-E2E0-<N>/ELC-E2E0-<N>, then: node tests/e2e.playwright.cjs <N>
// Requires test images face.jpg, scalp.jpg, dark.jpg next to this file (see README).
const { chromium } = require("playwright");
const S = process.env.E2E_ASSETS || __dirname, BASE = process.env.E2E_BASE_URL || "http://localhost:3000";
const log = (...a) => console.log("✔", ...a);
const stamp = Date.now();
const n = process.argv[2];
const MS = "ELM-E2E0-" + n, CS = "ELC-E2E0-" + n;
async function expectText(page, text, timeout = 15000) { await page.getByText(text, { exact: false }).first().waitFor({ timeout }); }

async function signup(page, name, email) {
  await page.goto(BASE + "/signup");
  await page.fill("#fullName", name); await page.fill("#email", email);
  await page.fill("#password", "Beauty2026x"); await page.fill("#confirmPassword", "Beauty2026x");
  await page.check("input[type=checkbox]");
  await page.click("button[type=submit]");
  await page.waitForURL("**/dashboard/devices?welcome=1", { timeout: 20000 });
}
async function pair(page, serial) {
  await page.fill("#serial", serial);
  await page.click("form button[type=submit]:has-text('Pair device')");
}
async function scan(page, kind, file) {
  await page.goto(`${BASE}/dashboard/${kind}/scan`);
  await page.getByRole("tab", { name: "Upload" }).click();
  await page.setInputFiles("input[type=file]", file);
  const resP = page.waitForResponse((r) => r.url().includes("/api/analyses/"), { timeout: 30000 });
  await page.getByRole("button", { name: new RegExp(`Analyze my ${kind}`) }).click();
  const r = await resP; console.log("   api", r.status(), (await r.text()).slice(0, 120));
}

(async () => {
  const browser = await chromium.launch();
  const errors = [];
  // ---------- Mirror-only customer
  const ctxA = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctxA.newPage();
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(BASE + "/"); await expectText(page, "Your beauty,"); await page.screenshot({ path: S + "/01-home.png", fullPage: true }); log("home renders");
  await page.goto(BASE + "/dashboard"); await page.waitForURL("**/login?next=%2Fdashboard"); log("dashboard protected → login redirect");

  await signup(page, "Camille Mirror", `mirror${stamp}@test.dev`); log("signup → devices onboarding");
  await page.goto(BASE + "/dashboard/skin"); await expectText(page, "needs the Smart Mirror"); log("skin locked before pairing");
  await page.goto(BASE + "/dashboard/devices");
  await pair(page, "ELM-NOPE-9999"); await expectText(page, "couldn't find this serial"); log("unknown serial rejected");
  await page.fill("#serial", MS.toLowerCase().replace(/-/g, "")); await expectText(page, "Detected: ÉLORIA Smart Mirror");
  await page.click("form button[type=submit]:has-text('Pair device')"); await expectText(page, MS); log("mirror paired");
  await page.screenshot({ path: S + "/02-devices.png", fullPage: true });

  await page.goto(BASE + "/dashboard/scalp"); await expectText(page, "needs the Smart Comb"); log("scalp locked for mirror-only owner");
  const apiRes = await page.request.post(BASE + "/api/analyses/scalp", { multipart: { image: { name: "s.jpg", mimeType: "image/jpeg", buffer: require("fs").readFileSync(S + "/scalp.jpg") } } });
  if (apiRes.status() !== 403) throw new Error("scalp API should be 403, got " + apiRes.status()); log("scalp API returns 403 for mirror-only owner");

  await scan(page, "skin", S + "/dark.jpg"); await expectText(page, "too dark"); log("quality gate rejects dark image");
  await scan(page, "skin", S + "/face.jpg"); await page.waitForURL(/\/dashboard\/skin\/[0-9a-f-]{36}\?new=1/, { timeout: 30000 });
  await expectText(page, "Analysis complete"); await expectText(page, "Your recommendations"); log("skin analysis saved + report shown");
  await page.screenshot({ path: S + "/03-skin-report.png", fullPage: true });
  await scan(page, "skin", S + "/face.jpg"); await page.waitForURL(/\/dashboard\/skin\/[0-9a-f-]{36}/, { timeout: 30000 }); log("second skin analysis");
  await page.goto(BASE + "/dashboard/skin"); await expectText(page, "2 analyses recorded"); await page.waitForTimeout(1200);
  await page.screenshot({ path: S + "/04-skin-overview.png", fullPage: true }); log("skin overview with charts");

  await page.goto(BASE + "/dashboard/routine"); await expectText(page, "Morning");
  const box = page.getByRole("checkbox").first(); await box.click(); await page.waitForTimeout(800);
  if ((await box.getAttribute("aria-checked")) !== "true") throw new Error("routine toggle failed");
  await page.reload(); await expectText(page, "Morning");
  if ((await page.getByRole("checkbox").first().getAttribute("aria-checked")) !== "true") throw new Error("routine toggle not persisted"); log("routine step toggled + persisted");
  await page.screenshot({ path: S + "/05-routine.png", fullPage: true });

  await page.goto(BASE + "/dashboard"); await expectText(page, "Skin score"); await page.waitForTimeout(1000); await page.screenshot({ path: S + "/06-dashboard.png", fullPage: true }); log("overview dashboard");

  await page.goto(BASE + "/shop/hydra-veil-serum"); await page.getByRole("button", { name: "Add to bag" }).click();
  await page.goto(BASE + "/cart"); await expectText(page, "Hydra Veil Serum"); await page.click("text=Proceed to checkout");
  await page.waitForURL("**/checkout"); await page.fill("#shippingAddress", "12 Rue de la Paix"); await page.fill("#shippingCity", "Paris"); await page.fill("#shippingPostalCode", "75002");
  await page.click("button:has-text('Place order')"); await page.waitForURL("**/checkout/success?order=*", { timeout: 20000 }); log("checkout → order placed");
  await page.goto(BASE + "/dashboard/orders"); await expectText(page, "Awaiting payment"); await expectText(page, "€77.00"); log("order listed with server-computed total (68 + 9 shipping)");

  await page.goto(BASE + "/dashboard/profile"); await page.selectOption("#skinType", "combination"); await page.click("button:has-text('Save profile')"); await expectText(page, "Profile saved"); log("profile saved");

  await page.goto(BASE + "/contact"); await page.fill("#name", "Camille"); await page.fill("#email", "c@test.dev"); await page.fill("#message", "I love my new Smart Mirror!");
  await page.click("button:has-text('Send message')"); await expectText(page, "Message received"); log("contact form stored");

  // ---------- Comb-only customer
  const ctxB = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  const pb = await ctxB.newPage(); pb.on("pageerror", (e) => errors.push(e.message));
  await signup(pb, "Sofia Comb", `comb${stamp}@test.dev`);
  await pair(pb, MS); await expectText(pb, "already registered to another account"); log("cannot claim someone else's mirror");
  await pb.fill("#serial", CS); await pb.click("form button[type=submit]:has-text('Pair device')"); await expectText(pb, CS); log("comb paired");
  await scan(pb, "scalp", S + "/scalp.jpg"); await pb.waitForURL(/\/dashboard\/scalp\/[0-9a-f-]{36}/, { timeout: 30000 }).catch(async (e) => { await pb.screenshot({ path: S + "/fail.png", fullPage: true }); throw e; }); await expectText(pb, "Scalp report"); log("scalp analysis (mobile)");
  await pb.screenshot({ path: S + "/07-scalp-mobile.png", fullPage: true });
  await pb.goto(BASE + "/dashboard/skin"); await expectText(pb, "needs the Smart Mirror"); log("skin locked for comb-only owner");
  await pb.goto(BASE + "/dashboard"); await expectText(pb, "Scalp score");
  if (await pb.getByText("Skin score").count()) throw new Error("comb owner should not see skin card"); log("comb-only dashboard shows scalp only");
  // data isolation: try to open A's analysis id
  const aUrl = (await page.goto(BASE + "/dashboard/skin")) && (await page.$$eval("a", (as) => as.map((a) => a.getAttribute("href")).find((h) => /^\/dashboard\/skin\/[0-9a-f-]{36}$/.test(h || ""))));
  await pb.goto(BASE + aUrl); await pb.waitForTimeout(2000); await pb.screenshot({ path: S + "/foreign.png", fullPage: true }); await expectText(pb, "wandered off"); if (await pb.getByText("What we see").count()) throw new Error("foreign report leaked"); log("cannot view another customer's analysis (not found)");

  // delete analysis
  await page.goto(BASE + aUrl); await page.getByRole("button", { name: "Delete analysis" }).click(); await page.getByRole("button", { name: "Delete", exact: true }).click();
  await page.waitForURL("**/dashboard/skin"); await expectText(page, "1 analysis recorded"); log("analysis deleted");

  // sign out
  await page.goto(BASE + "/dashboard"); await page.click("button:has-text('Sign out')"); await page.waitForURL(BASE + "/"); log("sign out");

  for (const p of ["/smart-mirror", "/smart-comb", "/technology", "/shop", "/about", "/faq"]) { const res = await page.goto(BASE + p); if (res.status() !== 200) throw new Error(p + " " + res.status()); }
  await page.goto(BASE + "/smart-mirror"); await page.screenshot({ path: S + "/08-mirror.png" }); log("public pages 200");
  const m = await browser.newContext({ viewport: { width: 390, height: 844 } }); const mp = await m.newPage(); await mp.goto(BASE + "/"); await mp.screenshot({ path: S + "/09-home-mobile.png", fullPage: true });
  const overflow = await mp.evaluate(() => document.documentElement.scrollWidth > window.innerWidth); if (overflow) throw new Error("horizontal overflow on mobile home"); log("no horizontal overflow on mobile");

  if (errors.length) throw new Error("page errors: " + errors.join(" | "));
  console.log("\nALL E2E CHECKS PASSED");
  await browser.close();
})().catch((e) => { console.error("✘", e.message); process.exit(1); });
