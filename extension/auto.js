// Page-side steps for auto-apply, called by the background worker (background.js) through
// chrome.scripting. Each function looks at the current Dice page once and reports back; the
// worker decides what happens next. Unknown required questions are never guessed.
(function (global) {
  "use strict";
  const F = global.DiceFiller;
  const SUCCESS = /application (has been |was )?(submitted|sent|received)|you('ve| have) applied|thanks? (you )?for applying|applied on\b|successfully applied/i;
  const LOGIN = /\/(login|sign-?in)\b/i;

  function text(el) {
    return F.clean(el.textContent || el.value || el.getAttribute("aria-label") || "");
  }

  function buttons(root) {
    return F.deepAll(root || document, "button, a, [role=button], input[type=submit], input[type=button]").filter((b) => {
      if (b.closest("#resume-builder-dice-helper, #rb-dice-helper")) return false;
      const r = b.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && !b.disabled && b.getAttribute("aria-disabled") !== "true";
    });
  }

  function find(re) {
    return buttons().find((b) => re.test(text(b)));
  }

  function bodyText() {
    return (document.body ? document.body.innerText : "").slice(0, 20000);
  }

  function pick(selectors) {
    for (const s of selectors) {
      const el = F.deepAll(document, s)[0];
      if (el && F.clean(el.textContent)) return F.clean(el.textContent).slice(0, 300);
    }
    return null;
  }

  /** What kind of page this is: a job with Easy apply, an external "Apply Now", already applied, or the login page. */
  function jobState() {
    const loggedOut = LOGIN.test(location.pathname) || Boolean(find(/^(log ?in|sign ?in)$/i) && !find(/^(easy apply|apply now|apply)$/i));
    const meta = {
      title: pick(["h1", "[data-cy=jobTitle]", "[data-testid=job-title]"]),
      company: pick(["[data-cy=companyNameLink]", "[data-testid=company-name]", "a[href*='/company-profile/']", "[class*=company]"]),
      location: pick(["[data-cy=location]", "[data-testid=location]", "[class*=location]"]),
    };
    if (/application submitted|you('ve| have) applied|applied on\b/i.test(bodyText()) || find(/^applied$/i)) return { kind: "applied", ...meta };
    const kind = F.applyKind(document);
    if (kind) return { kind, ...meta };
    if (loggedOut) return { kind: "login", ...meta };
    return { kind: null, ...meta };
  }

  function clickEasyApply() {
    const b = find(/^easy apply$/i) || find(/^apply$/i);
    if (!b) return false;
    b.click();
    return true;
  }

  /** A short fingerprint of the visible step, to notice when "Next" did not move forward. */
  function stepSignature() {
    const labels = F.deepAll(document, "input, select, textarea")
      .filter((e) => F.visible(e) && e.type !== "hidden")
      .map((e) => F.labelFor(e))
      .join("|");
    return (location.pathname + "#" + labels).slice(0, 2000);
  }

  function errorsShown() {
    return F.deepAll(document, "[role=alert], [aria-live=assertive], .error, [class*=error], [class*=invalid]")
      .map((e) => F.clean(e.textContent))
      .filter((t) => t && t.length < 200)
      .slice(0, 5);
  }

  /**
   * One step of the application: fill what we know, then press Submit or Next.
   * Returns { done: "applied" | "needs" | "stuck" | "login" } or { action: "submit" | "next", signature }.
   */
  function wizardStep(profile) {
    if (SUCCESS.test(bodyText())) return { done: "applied" };
    if (LOGIN.test(location.pathname)) return { done: "login" };
    const r = F.fillRoot(document, profile || {});
    if (r.required.length) return { done: "needs", questions: r.required };
    const signature = stepSignature();
    const submit = find(/^submit( (my )?application)?$/i);
    if (submit) {
      submit.click();
      return { action: "submit", signature, filled: r.filled };
    }
    const next = find(/^(next|continue|review|save (and|&) continue)$/i);
    if (next) {
      next.click();
      return { action: "next", signature, filled: r.filled };
    }
    return { done: "stuck", questions: r.needsYou.slice(0, 5), errors: errorsShown() };
  }

  /** After pressing Next/Submit: did the page accept it? */
  function afterClick(previousSignature) {
    if (SUCCESS.test(bodyText())) return { state: "applied" };
    const errors = errorsShown();
    const same = stepSignature() === previousSignature;
    if (same && errors.length) {
      const needs = F.deepAll(document, "[data-dice-helper=needs-you]").map((e) => F.labelFor(e.matches("input, select, textarea") ? e : e.querySelector("input, select, textarea") || e)).filter(Boolean);
      return { state: "blocked", errors, questions: [...new Set(needs)].slice(0, 5) };
    }
    return { state: same ? "same" : "moved" };
  }

  function jobLinks() {
    return F.collectJobLinks(document);
  }

  /** True when an application form (with Next or Submit) is showing on this page. */
  function wizardProbe() {
    return Boolean(find(/^(next|continue|submit( (my )?application)?)$/i)) && F.deepAll(document, "input, select, textarea").some((e) => F.visible(e) && e.type !== "hidden" && e.type !== "search");
  }

  global.DiceAuto = { wizardProbe, jobState, clickEasyApply, wizardStep, afterClick, jobLinks, isSuccess: () => SUCCESS.test(bodyText()) };
})(typeof window !== "undefined" ? window : globalThis);
