// Floating helper panel on Dice pages. Every action starts from the user's click (or, if the user
// turns it on, auto-fill when a new application step appears). It never presses Next or Submit.
(function () {
  "use strict";
  if (window.__diceHelperLoaded) return;
  window.__diceHelperLoaded = true;
  const F = window.DiceFiller;
  const state = { profile: null, autoFill: false, collected: [], minimized: false, message: null };

  const host = document.createElement("div");
  host.id = "resume-builder-dice-helper";
  host.style.cssText = "all: initial; position: fixed; right: 16px; bottom: 16px; z-index: 2147483647;";
  const shadow = host.attachShadow({ mode: "open" });
  shadow.innerHTML = `
    <style>
      .panel { font: 13px/1.4 system-ui, -apple-system, "Segoe UI", Arial, sans-serif; color: #1b2330; background: #fff;
               border: 1px solid #c9d1dc; border-radius: 10px; box-shadow: 0 6px 24px rgba(0,0,0,.18); width: 290px; }
      .head { display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: #1f4e79; color: #fff; border-radius: 10px 10px 0 0; }
      .head b { font-size: 13px; } .head button { background: none; border: 0; color: #fff; cursor: pointer; font-size: 16px; }
      .body { padding: 10px 12px; } .row { margin: 8px 0; }
      button.act { width: 100%; padding: 7px 10px; border-radius: 6px; border: 1px solid #1f4e79; background: #1f4e79; color: #fff; font-weight: 600; cursor: pointer; }
      button.sec { width: 100%; padding: 6px 10px; border-radius: 6px; border: 1px solid #c9d1dc; background: #fff; color: #1b2330; cursor: pointer; }
      .msg { font-size: 12px; color: #5d6878; white-space: pre-wrap; } .ok { color: #1d6b3a; } .warn { color: #8a5a00; }
      .badge { display: inline-block; padding: 1px 8px; border-radius: 999px; font-size: 12px; font-weight: 600; }
      .easy { background: #e3f3e8; color: #1d6b3a; } .ext { background: #fdf2d8; color: #8a5a00; }
      label { display: flex; gap: 6px; align-items: center; font-size: 12px; }
    </style>
    <div class="panel" role="complementary" aria-label="Benchsale Dan Dice helper">
      <div class="head"><b>Benchsale Dan · Dice Helper</b><button id="min" aria-label="Minimize">–</button></div>
      <div class="body" id="body"></div>
    </div>`;
  const body = shadow.getElementById("body");
  shadow.getElementById("min").addEventListener("click", () => {
    state.minimized = !state.minimized;
    body.style.display = state.minimized ? "none" : "block";
  });

  function isApplicationForm() {
    return F.deepAll(document, 'input:not([type="hidden"]):not([type="search"]), select, textarea').filter((e) => !e.closest("#resume-builder-dice-helper")).length >= 2 &&
      /apply|application|job-applications/i.test(location.pathname + " " + document.title);
  }

  function render(newMessage) {
    if (newMessage !== undefined) state.message = newMessage;
    const message = state.message;
    const links = F.collectJobLinks(document);
    const kind = F.applyKind(document);
    const form = isApplicationForm();
    const who = state.profile ? `Answers: <b>${escapeHtml(state.profile.candidate || "saved")}</b>` : `<span class="warn">No answers yet — open the extension and paste your answer code from the app.</span>`;
    body.innerHTML = `
      <div class="row msg">${who}</div>
      ${form ? `
        <div class="row"><button class="act" id="fill">Fill this step with my answers</button></div>
        <div class="row"><label><input type="checkbox" id="auto" ${state.autoFill ? "checked" : ""}> Fill each new step automatically</label></div>
        <div class="row msg">You review the answers and click Next / Submit yourself.</div>` : ""}
      ${!form && kind ? `<div class="row">This job: ${kind === "easy" ? '<span class="badge easy">Easy Apply ✓</span>' : '<span class="badge ext">Apply Now — company site (skip)</span>'}</div>` : ""}
      ${links.length > 1 ? `
        <div class="row"><button class="act" id="add">Add ${links.length} job links on this page</button></div>` : ""}
      ${state.collected.length ? `
        <div class="row"><button class="sec" id="copy">Copy ${state.collected.length} collected link(s)</button></div>
        <div class="row"><button class="sec" id="clear">Clear collected links</button></div>
        <div class="row msg">Paste them into “Add Dice jobs” in the app.</div>` : ""}
      ${message ? `<div class="row msg ${message.cls || ""}">${escapeHtml(message.text)}</div>` : ""}`;
    on("fill", () => fill(true));
    on("auto", (e) => chrome.storage.local.set({ autoFill: e.target.checked }));
    on("add", () => {
      const merged = [...new Set([...state.collected, ...F.collectJobLinks(document)])];
      chrome.storage.local.set({ collected: merged });
      render({ text: `Collected ${merged.length} link(s) in total. Go to the next results page and add those too.`, cls: "ok" });
    });
    on("copy", async () => {
      try {
        await navigator.clipboard.writeText(state.collected.join("\n"));
        render({ text: `Copied ${state.collected.length} link(s).`, cls: "ok" });
      } catch (e) {
        render({ text: "Copy was blocked by the page. Use the extension popup to copy instead.", cls: "warn" });
      }
    });
    on("clear", () => chrome.storage.local.set({ collected: [] }));
  }

  function on(id, fn) {
    const el = shadow.getElementById(id);
    if (el) el.addEventListener(id === "auto" ? "change" : "click", fn);
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  }

  function fill(fromClick) {
    if (!state.profile) {
      if (fromClick) render({ text: "Paste your answer code into the extension first.", cls: "warn" });
      return;
    }
    const r = F.fillRoot(document, state.profile);
    const needs = r.needsYou.filter(Boolean).slice(0, 6);
    if (fromClick || r.filled || needs.length) {
      render({
        text: `Filled ${r.filled} field(s).` + (needs.length ? `\nNeeds you (orange outline):\n• ${needs.join("\n• ")}\nTip: add these to “Other questions” in the app.` : ""),
        cls: needs.length ? "warn" : "ok",
      });
    }
  }

  // Auto-fill when a new step appears (only empty fields; still never presses Next/Submit).
  let timer = null;
  new MutationObserver(() => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (state.autoFill && isApplicationForm()) fill(false);
      else if (!document.activeElement || !host.contains(document.activeElement)) render();
    }, 700);
  }).observe(document.documentElement, { childList: true, subtree: true });

  chrome.storage.local.get(["profile", "autoFill", "collected"], (r) => {
    state.profile = r.profile || null;
    state.autoFill = Boolean(r.autoFill);
    state.collected = r.collected || [];
    if (window.top === window) document.documentElement.appendChild(host);
    else if (isApplicationForm()) document.documentElement.appendChild(host); // application forms inside frames
    render();
    if (state.autoFill && isApplicationForm()) fill(false);
  });
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.profile) state.profile = changes.profile.newValue || null;
    if (changes.autoFill) state.autoFill = Boolean(changes.autoFill.newValue);
    if (changes.collected) state.collected = changes.collected.newValue || [];
    render();
  });
})();
