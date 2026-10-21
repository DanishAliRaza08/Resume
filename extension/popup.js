"use strict";
const $ = (id) => document.getElementById(id);
const show = (id, on) => $(id).classList.toggle("hidden", !on);
const err = (t) => ($("err").textContent = t || "");
let people = [];

function send(msg) {
  return new Promise((resolve, reject) =>
    chrome.runtime.sendMessage(msg, (r) => {
      if (chrome.runtime.lastError) return reject(new Error(chrome.runtime.lastError.message));
      if (!r || !r.ok) return reject(new Error((r && r.error) || "Something went wrong."));
      resolve(r.value);
    }),
  );
}

async function signIn() {
  err("");
  const site = $("site").value.trim().replace(/\/+$/, "");
  let origin;
  try {
    origin = new URL(site).origin;
  } catch (e) {
    return err("Enter the website address, e.g. https://benchsaledan.com");
  }
  // Ask for access to a custom address (benchsaledan.com is allowed already).
  if (!/^https:\/\/(www\.)?benchsaledan\.com$/.test(origin)) {
    const granted = await chrome.permissions.request({ origins: [origin + "/*"] }).catch(() => false);
    if (!granted) return err("Permission to reach that website was not given.");
  }
  $("login").disabled = true;
  try {
    const res = await fetch(origin + "/api/extension/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: $("email").value.trim(), password: $("password").value }) });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body?.error?.message || "Sign-in failed.");
    await chrome.storage.local.set({ site: origin, token: body.token, user: body.user });
    $("password").value = "";
    await render();
  } catch (e) {
    err(e.message === "Failed to fetch" ? "Could not reach that website. Check the address." : e.message);
  } finally {
    $("login").disabled = false;
  }
}

async function loadPeople() {
  const me = await send({ type: "api", path: "/api/extension/me" });
  people = me.candidates;
  $("who").textContent = `Signed in as ${me.user.name} (${me.user.email})`;
  const { lastPerson } = await chrome.storage.local.get(["lastPerson"]);
  $("person").innerHTML = people.length ? people.map((p) => `<option value="${p.id}">${escapeHtml(p.name)}${p.role ? " — " + escapeHtml(p.role) : ""}</option>`).join("") : `<option value="">No people yet — create one in Benchsale Dan</option>`;
  if (lastPerson && people.some((p) => p.id === lastPerson)) $("person").value = lastPerson;
  personChanged();
}

function personChanged() {
  const p = people.find((x) => x.id === $("person").value);
  if (!p) return;
  $("keyword").value = p.search || "";
  $("location").value = "";
  chrome.storage.local.set({ lastPerson: p.id });
  // Answers for "fill each step for me" when applying by hand.
  send({ type: "api", path: `/api/extension/profile/${encodeURIComponent(p.id)}` }).then((r) => chrome.storage.local.set({ profile: r.profile })).catch(() => {});
  chrome.storage.local.get(["site"], ({ site }) => ($("report").href = `${site}/apply/${p.id}`));
  if (!p.hasAnswers) $("message").innerHTML = `<span class="warn">Save ${escapeHtml(p.name)}'s answers in Benchsale Dan → Dice Apply first, or most applications will stop at the questions.</span>`;
  else $("message").textContent = "";
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

function paint(run) {
  const running = Boolean(run && run.running);
  show("setup", !running);
  show("progress", running);
  show("logwrap", Boolean(run && run.log && run.log.length));
  if (run) {
    $("applied").textContent = run.applied || 0;
    $("needs").textContent = run.needs || 0;
    $("skipped").textContent = run.skipped || 0;
    $("status").textContent = running ? `Applying for ${run.candidateName} — “${run.keyword}”. Limit ${run.max}. You can close this window; it keeps going.` : "";
    $("log").textContent = (run.log || []).join("\n");
    if (!running && run.message) $("message").innerHTML = `<b>${escapeHtml(run.message)}</b>` + (run.needs ? `<br><span class="muted">Answer the listed questions in Benchsale Dan → Dice Apply, then start again: those jobs are retried.</span>` : "");
  }
}

async function render() {
  const { token, run, autoFill } = await chrome.storage.local.get(["token", "run", "autoFill"]);
  show("signin", !token);
  show("main", Boolean(token));
  $("auto").checked = Boolean(autoFill);
  if (!token) return;
  try {
    await loadPeople();
  } catch (e) {
    err(e.message);
    if (/sign in/i.test(e.message)) return render();
  }
  paint(run);
}

$("login").addEventListener("click", signIn);
$("password").addEventListener("keydown", (e) => e.key === "Enter" && signIn());
$("person").addEventListener("change", personChanged);
$("start").addEventListener("click", async () => {
  err("");
  const p = people.find((x) => x.id === $("person").value);
  if (!p) return err("Choose a person.");
  $("start").disabled = true;
  try {
    await send({ type: "start", candidateId: p.id, candidateName: p.name, keyword: $("keyword").value, location: $("location").value, max: $("max").value });
    $("message").textContent = "";
  } catch (e) {
    err(e.message);
  } finally {
    $("start").disabled = false;
  }
});
$("stop").addEventListener("click", () => send({ type: "stop" }).catch((e) => err(e.message)));
$("auto").addEventListener("change", (e) => chrome.storage.local.set({ autoFill: e.target.checked }));
$("logout").addEventListener("click", async () => {
  await send({ type: "stop" }).catch(() => {});
  const { site, token } = await chrome.storage.local.get(["site", "token"]);
  if (site && token) fetch(site + "/api/extension/logout", { method: "POST", headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
  await chrome.storage.local.remove(["token", "user", "profile"]);
  render();
});
chrome.storage.onChanged.addListener((c) => c.run && paint(c.run.newValue));
render();
