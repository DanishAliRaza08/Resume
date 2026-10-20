// Bookmark-button version of the Dice Helper panel (no extension needed). Runs in the Dice page when
// the user clicks the bookmark. Expects window.DiceFiller (filler.js) and window.__RB_PROFILE.
// Like the extension, it never presses Next or Submit and never guesses unknown answers.
(function () {
  "use strict";
  var F = window.DiceFiller;
  var profile = window.__RB_PROFILE;
  var KEY = "rbDiceHelperLinks";
  var existing = document.getElementById("rb-dice-helper");
  if (existing) existing.remove();

  function load() {
    try {
      return JSON.parse(localStorage.getItem(KEY) || "[]");
    } catch (e) {
      return [];
    }
  }
  function save(list) {
    try {
      localStorage.setItem(KEY, JSON.stringify(list));
    } catch (e) {
      /* storage blocked: links are still shown for copying */
    }
  }

  var host = document.createElement("div");
  host.id = "rb-dice-helper";
  host.style.cssText = "all: initial; position: fixed; right: 16px; bottom: 16px; z-index: 2147483647;";
  var shadow = host.attachShadow({ mode: "open" });
  shadow.innerHTML =
    "<style>" +
    ".p{font:15px/1.45 system-ui,-apple-system,'Segoe UI',Arial,sans-serif;color:#1b2330;background:#fff;border:2px solid #1f4e79;border-radius:12px;box-shadow:0 8px 28px rgba(0,0,0,.25);width:320px}" +
    ".h{display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:#1f4e79;color:#fff;border-radius:9px 9px 0 0;font-weight:700}" +
    ".h button{background:none;border:0;color:#fff;font-size:20px;cursor:pointer}" +
    ".b{padding:12px 14px}.r{margin:10px 0}" +
    "button.a{width:100%;padding:12px;border-radius:8px;border:0;background:#1d6b3a;color:#fff;font-size:16px;font-weight:700;cursor:pointer}" +
    "button.s{width:100%;padding:10px;border-radius:8px;border:1px solid #9aa6b6;background:#fff;color:#1b2330;font-size:15px;cursor:pointer}" +
    ".m{font-size:14px;white-space:pre-wrap}.ok{color:#1d6b3a}.w{color:#8a5a00}" +
    "textarea{width:100%;box-sizing:border-box;min-height:70px;font-size:11px}" +
    "label{display:flex;gap:8px;align-items:center;font-size:14px}" +
    "</style>" +
    '<div class="p" role="dialog" aria-label="Benchsale Dan Dice Helper"><div class="h"><span>Benchsale Dan — ' +
    esc(profile && profile.candidate ? profile.candidate : "") +
    '</span><button id="x" aria-label="Close">×</button></div><div class="b" id="b"></div></div>';
  document.documentElement.appendChild(host);
  shadow.getElementById("x").onclick = function () {
    stop();
    host.remove();
  };
  var body = shadow.getElementById("b");
  var observer = null;
  var auto = false;
  var message = null;

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function hasForm() {
    // An application form, not the search box on a results page.
    if (F.collectJobLinks(document).length > 1) return false;
    return F.deepAll(document, 'input:not([type="hidden"]):not([type="search"]), select, textarea').length >= 2;
  }

  function render(newMessage) {
    if (newMessage !== undefined) message = newMessage;
    var links = F.collectJobLinks(document);
    var collected = load();
    var kind = F.applyKind(document);
    var html = "";
    if (hasForm()) {
      html += '<div class="r"><button class="a" id="fill">✍ Fill my answers</button></div>';
      html += '<div class="r"><label><input type="checkbox" id="auto"' + (auto ? " checked" : "") + "> Keep filling each new page</label></div>";
      html += '<div class="r m">Check the answers, then click Next / Submit on Dice yourself.</div>';
    } else if (kind) {
      html += '<div class="r m">' + (kind === "easy" ? '<b class="ok">✔ Easy Apply job</b> — click “Easy apply” on Dice, then click this bookmark again.' : '<b class="w">✘ Apply Now (company website)</b> — skip this one.') + "</div>";
    }
    if (links.length > 1) html += '<div class="r"><button class="a" id="add">➕ Save ' + links.length + " job links from this page</button></div>";
    if (collected.length) {
      html += '<div class="r"><button class="s" id="copy">📋 Copy ' + collected.length + " saved job links</button></div>";
      html += '<div class="r"><button class="s" id="clear">Clear saved links</button></div>';
    }
    if (!html) html = '<div class="r m">Open a Dice search, a job, or an application, then click the bookmark.</div>';
    if (message) html += '<div class="r m ' + (message.cls || "") + '">' + esc(message.text) + "</div>";
    if (message && message.links) html += '<div class="r"><textarea readonly id="t">' + esc(message.links) + "</textarea></div>";
    body.innerHTML = html;
    bind("fill", "click", function () {
      fill(true);
    });
    bind("auto", "change", function (e) {
      auto = e.target.checked;
      if (auto) start();
      else stop();
    });
    bind("add", "click", function () {
      var merged = Array.from(new Set(load().concat(F.collectJobLinks(document))));
      save(merged);
      render({ text: "Saved " + merged.length + " job link(s). Open the next results page and click the bookmark again, or press Copy.", cls: "ok" });
    });
    bind("copy", "click", function () {
      var list = load().join("\n");
      var done = function () {
        render({ text: "Copied! Paste them into “Add Dice jobs” in Benchsale Dan.", cls: "ok" });
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(list).then(done, function () {
          render({ text: "Select the links below and copy them (Ctrl+C):", cls: "w", links: list });
        });
      } else render({ text: "Select the links below and copy them (Ctrl+C):", cls: "w", links: list });
    });
    bind("clear", "click", function () {
      save([]);
      render({ text: "Saved links cleared.", cls: "ok" });
    });
  }

  function bind(id, ev, fn) {
    var el = shadow.getElementById(id);
    if (el) el.addEventListener(ev, fn);
  }

  function fill(fromClick) {
    if (!profile) return render({ text: "This bookmark has no answers. Make a new one in Benchsale Dan.", cls: "w" });
    var r = F.fillRoot(document, profile);
    var needs = r.needsYou.filter(Boolean).slice(0, 6);
    if (fromClick || r.filled || needs.length) {
      render({
        text: "Filled " + r.filled + " answer(s)." + (needs.length ? "\nPlease answer yourself (orange boxes):\n• " + needs.join("\n• ") : "\nAll done on this page."),
        cls: needs.length ? "w" : "ok",
      });
    }
  }

  var timer = null;
  function start() {
    stop();
    observer = new MutationObserver(function (records) {
      if (records.every(function (rec) { return host.contains(rec.target) || rec.target === host; })) return;
      clearTimeout(timer);
      timer = setTimeout(function () {
        fill(false);
      }, 700);
    });
    observer.observe(document.body || document.documentElement, { childList: true, subtree: true });
    fill(false);
  }
  function stop() {
    if (observer) observer.disconnect();
    observer = null;
  }

  render();
})();
