"use strict";
const $ = (id) => document.getElementById(id);
const say = (text, cls) => {
  $("msg").textContent = text;
  $("msg").className = "row " + (cls || "");
};

function parseCode(text) {
  const raw = text.trim();
  let data;
  try {
    data = JSON.parse(raw.startsWith("{") ? raw : decodeURIComponent(escape(atob(raw))));
  } catch (e) {
    throw new Error("That doesn't look like an answer code. Copy it again from the app.");
  }
  if (data.v !== 1 || !Array.isArray(data.answers)) throw new Error("Unsupported answer code. Copy a fresh one from the app.");
  return data;
}

function refresh() {
  chrome.storage.local.get(["profile", "autoFill", "collected"], (r) => {
    $("current").textContent = r.profile ? `Using answers for: ${r.profile.candidate || "saved profile"}` : "No answers saved yet.";
    $("auto").checked = Boolean(r.autoFill);
    $("count").textContent = `${(r.collected || []).length} collected`;
  });
}

$("save").addEventListener("click", () => {
  try {
    const profile = parseCode($("code").value);
    chrome.storage.local.set({ profile }, () => {
      $("code").value = "";
      say(`Saved answers for ${profile.candidate || "this person"}.`, "ok");
      refresh();
    });
  } catch (e) {
    say(e.message, "bad");
  }
});
$("forget").addEventListener("click", () => chrome.storage.local.remove("profile", () => (say("Answers removed from this browser.", "ok"), refresh())));
$("auto").addEventListener("change", (e) => chrome.storage.local.set({ autoFill: e.target.checked }));
$("copy").addEventListener("click", () =>
  chrome.storage.local.get(["collected"], async (r) => {
    const links = r.collected || [];
    if (!links.length) return say("No links collected yet. Use “Add job links” on a Dice search page.", "bad");
    await navigator.clipboard.writeText(links.join("\n"));
    say(`Copied ${links.length} link(s). Paste them into “Add Dice jobs” in the app.`, "ok");
  }),
);
refresh();
