// End-to-end check of the Dice Helper auto-apply against a stand-in Dice site (mock-dice.cjs).
// Needs a running app with demo data (SEED_DEMO=true) and the demo person's answers saved.
//   node tests/e2e-dice/run.cjs            (APP=http://127.0.0.1:3000 by default)
// Loads the real extension in Chromium, signs in, starts a run and prints the results.
const { spawn } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");
let chromium;
try {
  ({ chromium } = require("playwright"));
} catch {
  ({ chromium } = require("/opt/node-tools/node_modules/playwright"));
}
const APP = process.env.APP || "http://127.0.0.1:3000";
const DICE_PORT = 4555;
const DICE = `http://127.0.0.1:${DICE_PORT}`;

(async () => {
  const dice = spawn(process.execPath, [path.join(__dirname, "mock-dice.cjs"), String(DICE_PORT)], { stdio: "ignore" });
  await new Promise((r) => setTimeout(r, 800));
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "dice-e2e-"));
  const ext = path.join(tmp, "ext");
  fs.cpSync(path.join(__dirname, "..", "..", "extension"), ext, { recursive: true });
  const manifest = JSON.parse(fs.readFileSync(path.join(ext, "manifest.json"), "utf8"));
  manifest.host_permissions.push("http://127.0.0.1/*");
  manifest.content_scripts[0].matches.push("http://127.0.0.1/*");
  fs.writeFileSync(path.join(ext, "manifest.json"), JSON.stringify(manifest));
  const ctx = await chromium.launchPersistentContext(path.join(tmp, "profile"), { channel: "chromium", headless: true, args: [`--disable-extensions-except=${ext}`, `--load-extension=${ext}`] });
  try {
    let [sw] = ctx.serviceWorkers();
    if (!sw) sw = await ctx.waitForEvent("serviceworker");
    const popup = await ctx.newPage();
    await popup.goto(`chrome-extension://${sw.url().split("/")[2]}/popup.html`);
    await popup.evaluate((d) => chrome.storage.local.set({ diceOrigin: d, fastMode: true }), DICE);
    await popup.reload();
    await popup.fill("#site", APP);
    await popup.fill("#email", process.env.EMAIL || "creator@example.com");
    await popup.fill("#password", process.env.PASSWORD || "ChangeMe-2026!");
    await popup.click("#login");
    await popup.waitForFunction(() => document.getElementById("keyword") && document.getElementById("keyword").value);
    await popup.click("#start");
    let run;
    const t0 = Date.now();
    do {
      await new Promise((r) => setTimeout(r, 2000));
      run = await popup.evaluate(() => chrome.storage.local.get(["run"]).then((r) => r.run));
    } while (!(run && !run.running && run.finishedAt) && Date.now() - t0 < 300000);
    console.log(run.message);
    console.log([...run.log].reverse().join("\n"));
    const state = await (await fetch(`${DICE}/__state`)).json();
    console.log(`Dice received ${state.submitted.length} application(s):`, JSON.stringify(state.submitted));
  } finally {
    await ctx.close();
    dice.kill();
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
