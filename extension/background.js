// Benchsale Dan — Dice Helper: auto-apply runner (Manifest V3 service worker).
//
// Started from the popup after signing in to Benchsale Dan. It searches Dice for the chosen
// keyword (e.g. the person's role), opens each job, skips "Apply Now" (company website) jobs,
// clicks Easy apply, fills every step with the person's saved answers and presses Next/Submit.
// A required question without a saved answer is never guessed: that job is skipped and the
// question is reported so the user can answer it once in the app. Every result is sent to the
// app's Dice Apply report. Progress lives in chrome.storage so the run survives worker restarts.
"use strict";

const DEFAULT_DICE = "https://www.dice.com";
const MAX_PAGES = 30;
const MAX_STEPS = 15;
let looping = false;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const jitter = (a, b) => sleep(a + Math.random() * (b - a));
const get = (keys) => chrome.storage.local.get(keys);
const set = (obj) => chrome.storage.local.set(obj);

// ------------------------------------------------------------------------------------------------
// Benchsale Dan API
// ------------------------------------------------------------------------------------------------

async function api(path, opts = {}) {
  const { site, token } = await get(["site", "token"]);
  if (!site || !token) throw new Error("Sign in to Benchsale Dan in the extension first.");
  const res = await fetch(site.replace(/\/$/, "") + path, {
    ...opts,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...(opts.headers || {}) },
  });
  if (res.status === 401) {
    await chrome.storage.local.remove(["token"]);
    throw new Error("Your Benchsale Dan sign-in expired. Sign in again.");
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body?.error?.message || `Benchsale Dan returned ${res.status}.`);
  return body;
}

// ------------------------------------------------------------------------------------------------
// Run state
// ------------------------------------------------------------------------------------------------

async function getRun() {
  return (await get(["run"])).run || null;
}

async function saveRun(run) {
  await set({ run });
  chrome.action.setBadgeText({ text: run.running ? String(run.applied || 0) : "" }).catch(() => {});
  chrome.action.setBadgeBackgroundColor({ color: "#1d6b3a" }).catch(() => {});
}

async function log(run, text) {
  run.log = [`${new Date().toLocaleTimeString()} ${text}`, ...(run.log || [])].slice(0, 60);
  await saveRun(run);
}

async function finish(run, message) {
  run.running = false;
  run.current = null;
  run.message = message;
  run.finishedAt = Date.now();
  await saveRun(run);
  chrome.alarms.clear("keepalive").catch(() => {});
}

/** The Dice job id (also accepts the app's "dice:<id>" form). */
function jobKey(urlOrKey) {
  const m = /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i.exec(urlOrKey);
  return m ? m[1].toLowerCase() : String(urlOrKey).replace(/^dice:/, "");
}

function searchUrl(run, page) {
  const u = new URL("/jobs", run.diceOrigin);
  u.searchParams.set("q", run.keyword);
  if (run.location) u.searchParams.set("location", run.location);
  u.searchParams.set("filters.easyApply", "true");
  u.searchParams.set("page", String(page));
  return u.toString();
}

/** Job links are stored as canonical dice.com URLs; open them on the configured Dice origin. */
function onDice(run, url) {
  const u = new URL(url);
  return run.diceOrigin.replace(/\/$/, "") + u.pathname;
}

// ------------------------------------------------------------------------------------------------
// Tab helpers
// ------------------------------------------------------------------------------------------------

async function waitForTab(tabId, timeout = 30000) {
  const end = Date.now() + timeout;
  while (Date.now() < end) {
    const tab = await chrome.tabs.get(tabId).catch(() => null);
    if (!tab) throw new Error("The Dice tab was closed.");
    if (tab.status === "complete") return tab;
    await sleep(300);
  }
  return chrome.tabs.get(tabId);
}

async function navigate(tabId, url) {
  await chrome.tabs.update(tabId, { url });
  await sleep(400);
  return waitForTab(tabId);
}

/** Call window.DiceAuto[name](...args) in the tab (injecting the scripts if they are not there yet). */
async function exec(tabId, name, args = []) {
  const call = () =>
    chrome.scripting.executeScript({
      target: { tabId },
      func: (n, a) => (window.DiceAuto ? { value: window.DiceAuto[n](...a) } : { missing: true }),
      args: [name, args],
    });
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      let [res] = await call();
      if (res?.result?.missing) {
        await chrome.scripting.executeScript({ target: { tabId }, files: ["filler.js", "auto.js"] });
        [res] = await call();
      }
      if (res?.result && !res.result.missing) return res.result.value;
    } catch (e) {
      // The page is navigating (or not ready); try again shortly.
    }
    await sleep(700);
  }
  return undefined;
}

async function poll(tabId, name, args, ok, timeout) {
  const end = Date.now() + timeout;
  let last;
  while (Date.now() < end) {
    last = await exec(tabId, name, args);
    if (ok(last)) return last;
    await sleep(800);
  }
  return last;
}

// ------------------------------------------------------------------------------------------------
// One job
// ------------------------------------------------------------------------------------------------

async function openWizard(run, tabId) {
  let created = null;
  const listener = (tab) => {
    if (tab.openerTabId === tabId) created = tab.id;
  };
  chrome.tabs.onCreated.addListener(listener);
  try {
    const before = (await chrome.tabs.get(tabId)).url;
    const clicked = await exec(tabId, "clickEasyApply");
    if (!clicked) return null;
    const end = Date.now() + 12000;
    while (Date.now() < end) {
      await sleep(500);
      if (created) {
        await waitForTab(created);
        return created;
      }
      const now = await chrome.tabs.get(tabId).catch(() => null);
      if (now && now.url !== before && now.status === "complete") return tabId;
      // Some versions open the application on the same page (no navigation).
      if (Date.now() > end - 8000) {
        const st = await exec(tabId, "wizardProbe");
        if (st) return tabId;
      }
    }
    return tabId;
  } finally {
    chrome.tabs.onCreated.removeListener(listener);
  }
}

async function completeWizard(run, tabId, profile) {
  let same = 0;
  for (let step = 0; step < MAX_STEPS; step++) {
    if (!(await getRun())?.running) return { outcome: "STOPPED" };
    await jitter(1200, 2500);
    const res = await exec(tabId, "wizardStep", [profile]);
    if (!res) return { outcome: "SKIPPED", reason: "The application form did not load." };
    if (res.done === "applied") return { outcome: "APPLIED" };
    if (res.done === "login") return { outcome: "LOGIN" };
    if (res.done === "needs") return { outcome: "NEEDS_ANSWERS", questions: res.questions };
    if (res.done === "stuck") {
      return res.questions?.length
        ? { outcome: "NEEDS_ANSWERS", questions: res.questions }
        : { outcome: "SKIPPED", reason: "Could not find the Next or Submit button." + (res.errors?.length ? " " + res.errors.join(" ") : "") };
    }
    await jitter(1500, 3000);
    if (res.action === "submit") {
      const done = await poll(tabId, "isSuccess", [], (v) => v === true, 15000);
      if (done) return { outcome: "APPLIED" };
      const after = await exec(tabId, "afterClick", [res.signature]);
      if (after?.state === "blocked") return { outcome: "NEEDS_ANSWERS", questions: after.questions?.length ? after.questions : after.errors };
      if (after?.state === "moved") return { outcome: "APPLIED", reason: "Submitted (Dice did not show a confirmation)." };
      same++;
    } else {
      const after = await exec(tabId, "afterClick", [res.signature]);
      if (after?.state === "applied") return { outcome: "APPLIED" };
      if (after?.state === "blocked") return { outcome: "NEEDS_ANSWERS", questions: after.questions?.length ? after.questions : after.errors };
      same = after?.state === "same" ? same + 1 : 0;
    }
    if (same >= 2) return { outcome: "NEEDS_ANSWERS", questions: ["A question on this application could not be answered automatically"] };
  }
  return { outcome: "SKIPPED", reason: "The application had too many steps." };
}

async function applyOne(run, tabId, profile, url) {
  await navigate(tabId, onDice(run, url));
  const state = await poll(tabId, "jobState", [], (s) => s && s.kind, 12000);
  const meta = { title: state?.title || null, company: state?.company || null, location: state?.location || null };
  if (!state || !state.kind) return { outcome: "NOT_AVAILABLE", reason: "No apply button (the job may be closed).", ...meta };
  if (state.kind === "login") return { outcome: "LOGIN", ...meta };
  if (state.kind === "applied") return { outcome: "ALREADY_APPLIED", ...meta };
  if (state.kind === "external") return { outcome: "SKIPPED", reason: "Apply Now (company website) — not Easy Apply.", ...meta };
  const wizardTab = await openWizard(run, tabId);
  if (!wizardTab) return { outcome: "SKIPPED", reason: "Could not open Easy apply.", ...meta };
  try {
    return { ...(await completeWizard(run, wizardTab, profile)), ...meta };
  } finally {
    if (wizardTab !== tabId) chrome.tabs.remove(wizardTab).catch(() => {});
  }
}

// ------------------------------------------------------------------------------------------------
// The run
// ------------------------------------------------------------------------------------------------

async function collectMore(run, tabId) {
  while (run.page < MAX_PAGES) {
    run.page++;
    await log(run, `Searching Dice: “${run.keyword}”${run.location ? " in " + run.location : ""}, page ${run.page}`);
    await navigate(tabId, searchUrl(run, run.page));
    const links = (await poll(tabId, "jobLinks", [], (l) => Array.isArray(l) && l.length > 0, 15000)) || [];
    if (!links.length) return false;
    const known = new Set([...run.done, ...run.queue.map(jobKey)]);
    const fresh = links.filter((l) => !known.has(jobKey(l)));
    run.queue.push(...fresh);
    await saveRun(run);
    if (fresh.length) return true;
  }
  return false;
}

async function ensureTab(run) {
  const tab = run.tabId ? await chrome.tabs.get(run.tabId).catch(() => null) : null;
  if (tab) return tab.id;
  const created = await chrome.tabs.create({ url: searchUrl(run, 1), active: true });
  run.tabId = created.id;
  await saveRun(run);
  await waitForTab(created.id);
  return created.id;
}

async function runLoop() {
  if (looping) return;
  looping = true;
  try {
    let run = await getRun();
    if (!run || !run.running) return;
    const { profile } = await api(`/api/extension/profile/${encodeURIComponent(run.candidateId)}`);
    run = await getRun();
    while (run && run.running) {
      if (run.applied >= run.max) return finish(run, `Done: ${run.applied} application(s) submitted (limit reached). ${run.needs} need your answers, ${run.skipped} skipped.`);
      const tabId = await ensureTab(run);
      if (run.index >= run.queue.length) {
        const more = await collectMore(run, tabId);
        if (!more) return finish(run, `Done: no more matching Easy Apply jobs. ${run.applied} submitted, ${run.needs} need your answers, ${run.skipped} skipped.`);
        continue;
      }
      const url = run.queue[run.index];
      run.current = url;
      await saveRun(run);
      let r;
      try {
        r = await applyOne(run, tabId, profile, url);
      } catch (e) {
        r = { outcome: "SKIPPED", reason: `Error: ${e.message}`.slice(0, 300) };
      }
      run = (await getRun()) || run;
      if (r.outcome === "STOPPED") return;
      if (r.outcome === "LOGIN") return finish(run, "Please log in to Dice in the Dice tab, then press Start again. Nothing was skipped.");
      run.index++;
      run.done.push(jobKey(url));
      const label = [r.title, r.company].filter(Boolean).join(" — ") || url;
      if (r.outcome === "APPLIED") run.applied++;
      else if (r.outcome === "NEEDS_ANSWERS") run.needs++;
      else run.skipped++;
      await log(run, `${{ APPLIED: "✔ Applied", NEEDS_ANSWERS: "? Needs answers", ALREADY_APPLIED: "• Already applied", NOT_AVAILABLE: "✘ Closed", SKIPPED: "✘ Skipped" }[r.outcome] || r.outcome}: ${label}${r.questions?.length ? " (" + r.questions.slice(0, 2).join("; ") + ")" : r.reason ? " (" + r.reason + ")" : ""}`);
      try {
        const res = await api("/api/extension/results", {
          method: "POST",
          body: JSON.stringify({ candidateId: run.candidateId, jobUrl: url, outcome: r.outcome, title: r.title, company: r.company, location: r.location, reason: r.reason || null, questions: r.questions || [] }),
        });
        run.totals = res.totals;
        await saveRun(run);
      } catch (e) {
        await log(run, `Could not save the result to Benchsale Dan: ${e.message}`);
      }
      await jitter(run.fast ? 300 : 3000, run.fast ? 600 : 7000);
      run = (await getRun()) || run;
    }
  } catch (e) {
    const run = await getRun();
    if (run) await finish(run, `Stopped: ${e.message}`);
  } finally {
    looping = false;
  }
}

async function start(msg) {
  const current = await getRun();
  if (current?.running) throw new Error("A run is already in progress.");
  const { profile, done } = await api(`/api/extension/profile/${encodeURIComponent(msg.candidateId)}`);
  const { diceOrigin, fastMode } = await get(["diceOrigin", "fastMode"]);
  const run = {
    running: true,
    candidateId: msg.candidateId,
    candidateName: msg.candidateName || profile.candidate,
    keyword: String(msg.keyword || "").trim().slice(0, 120),
    location: String(msg.location || "").trim().slice(0, 120),
    max: Math.max(1, Math.min(500, Number(msg.max) || 25)),
    diceOrigin: diceOrigin || DEFAULT_DICE,
    fast: Boolean(fastMode),
    page: 0,
    queue: [],
    index: 0,
    done: (done || []).map(jobKey),
    applied: 0,
    skipped: 0,
    needs: 0,
    log: [],
    startedAt: Date.now(),
    tabId: null,
    message: null,
  };
  if (!run.keyword) throw new Error("Enter what to search for, e.g. Business Analyst.");
  await set({ profile });
  await saveRun(run);
  chrome.alarms.create("keepalive", { periodInMinutes: 0.5 });
  runLoop();
}

chrome.runtime.onMessage.addListener((msg, _sender, reply) => {
  (async () => {
    if (msg.type === "start") await start(msg);
    else if (msg.type === "stop") {
      const run = await getRun();
      if (run?.running) await finish(run, `Stopped by you. ${run.applied} submitted, ${run.needs} need your answers, ${run.skipped} skipped.`);
    } else if (msg.type === "api") return api(msg.path, msg.opts || {});
    return { ok: true };
  })()
    .then((v) => reply({ ok: true, value: v }))
    .catch((e) => reply({ ok: false, error: e.message }));
  return true;
});

// Keep a run going if the worker was restarted.
chrome.alarms.onAlarm.addListener((a) => {
  if (a.name === "keepalive") runLoop();
});
chrome.runtime.onStartup.addListener(() => runLoop());
