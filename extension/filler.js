// Form-filling logic (shared by the content script and the tests).
// Fills empty fields from the user's saved answers. It never clicks Next or Submit, and it never
// guesses: a question without a saved answer is highlighted for the user instead.
(function (global) {
  "use strict";

  const TEXT_INPUTS = 'input[type="text"], input[type="email"], input[type="tel"], input[type="number"], input[type="url"], input:not([type]), textarea';

  /** querySelectorAll that also searches open shadow roots (Dice uses web components). */
  function deepAll(root, selector) {
    const out = [];
    const visit = (node) => {
      if (!node || !node.querySelectorAll) return;
      out.push(...node.querySelectorAll(selector));
      // Search web-component shadow roots, but never the helper's own panel.
      for (const el of node.querySelectorAll("*")) if (el.shadowRoot && el.id !== "resume-builder-dice-helper" && el.id !== "rb-dice-helper") visit(el.shadowRoot);
    };
    visit(root);
    return out;
  }

  function clean(text) {
    return (text || "").replace(/\s+/g, " ").replace(/[*:]+\s*$/, "").trim();
  }

  function visible(el) {
    if (el.disabled || el.readOnly) return false;
    if (el.type === "hidden") return false;
    const r = el.getBoundingClientRect();
    const style = el.ownerDocument.defaultView.getComputedStyle(el);
    // Radios/checkboxes are often visually hidden behind a styled label; treat them as visible.
    if ((el.type === "radio" || el.type === "checkbox") && style.display !== "none") return true;
    return r.width > 0 && r.height > 0 && style.visibility !== "hidden" && style.display !== "none";
  }

  function byId(el, id) {
    const root = el.getRootNode();
    return (root.getElementById && root.getElementById(id)) || el.ownerDocument.getElementById(id);
  }

  /** The question text for a field: aria labels, <label>, fieldset legend, or nearby text. */
  function labelFor(el) {
    const aria = el.getAttribute("aria-label");
    if (aria && aria.trim()) return clean(aria);
    const by = el.getAttribute("aria-labelledby");
    if (by) {
      const t = by.split(/\s+/).map((id) => byId(el, id)).filter(Boolean).map((n) => n.textContent).join(" ");
      if (clean(t)) return clean(t);
    }
    if (el.id) {
      const root = el.getRootNode();
      const lab = root.querySelector ? root.querySelector(`label[for="${CSS.escape(el.id)}"]`) : null;
      if (lab && clean(lab.textContent)) return clean(lab.textContent);
    }
    const wrap = el.closest("label");
    if (wrap && clean(wrap.textContent)) return clean(wrap.textContent);
    for (const attr of ["placeholder", "title", "name"]) {
      const v = el.getAttribute(attr);
      if (v && v.trim() && !/^[a-z0-9_\-\[\]]+$/i.test(v)) return clean(v);
    }
    const container = el.closest("fieldset, [role=group], [role=radiogroup], .form-group, .question, div");
    if (container) {
      const legend = container.querySelector("legend, [class*=label], [class*=question], h3, h4, p");
      if (legend && clean(legend.textContent)) return clean(legend.textContent).slice(0, 300);
      const first = clean(container.textContent).split(/(?<=[?.:])\s/)[0];
      if (first) return first.slice(0, 300);
    }
    return "";
  }

  /** The question for a radio/checkbox group (the legend), not the option's own label. */
  function groupQuestion(inputs) {
    const el = inputs[0];
    const group = el.closest("fieldset, [role=radiogroup], [role=group]");
    if (group) {
      const legend = group.querySelector("legend, [id][class*=label], [class*=question], [class*=label]");
      const by = group.getAttribute("aria-labelledby");
      if (by) {
        const n = byId(el, by.split(/\s+/)[0]);
        if (n && clean(n.textContent)) return clean(n.textContent);
      }
      const aria = group.getAttribute("aria-label");
      if (aria) return clean(aria);
      if (legend && clean(legend.textContent)) return clean(legend.textContent);
    }
    // Walk up until the container holds more text than the options themselves.
    let node = el.parentElement;
    const optionText = inputs.map((i) => labelFor(i)).join(" ");
    for (let i = 0; node && i < 5; i++, node = node.parentElement) {
      const text = clean(node.textContent);
      if (text.length > optionText.length + 8) return text.replace(optionText, "").trim().slice(0, 300) || text.slice(0, 300);
    }
    return labelFor(el);
  }

  function norm(s) {
    return (s || "").toLowerCase().replace(/[^a-z0-9+#]+/g, " ").trim();
  }

  /** Find the saved answer for a question. Custom questions first, then the most specific keyword. */
  function findAnswer(question, profile) {
    const q = norm(question);
    if (!q || !profile) return null;
    for (const c of profile.custom || []) {
      const cq = norm(c.question);
      if (cq && c.answer && ((" " + q + " ").includes(" " + cq + " ") || (cq.length > 12 && cq.includes(q)))) return { answer: c.answer, type: "text", key: "custom" };
    }
    let best = null;
    for (const a of profile.answers || []) {
      if (!a.answer) continue;
      for (const kw of a.keywords || []) {
        const k = norm(kw);
        if (k && (" " + q + " ").includes(" " + k + " ") && (!best || k.length > best.len)) best = { answer: a.answer, type: a.type, key: a.key, len: k.length };
      }
    }
    return best;
  }

  /** Set a value so React/Vue-controlled inputs notice the change. */
  function setValue(el, value) {
    const proto = el.tagName === "TEXTAREA" ? HTMLTextAreaElement.prototype : el.tagName === "SELECT" ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(proto, "value").set;
    setter.call(el, value);
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
    el.dispatchEvent(new Event("blur", { bubbles: true }));
  }

  function mark(el, ok) {
    const target = el.type === "radio" || el.type === "checkbox" ? el.closest("fieldset, [role=radiogroup], label, div") || el : el;
    target.style.outline = ok ? "2px solid #1d6b3a" : "2px dashed #c27c00";
    target.style.outlineOffset = "2px";
    target.setAttribute("data-dice-helper", ok ? "filled" : "needs-you");
  }

  function sameOption(optionText, answer) {
    const o = norm(optionText);
    const a = norm(answer);
    if (!o || !a) return false;
    if (o === a) return true;
    if (a === "yes" || a === "no") return o === a || o.startsWith(a + " ");
    return o.includes(a) || a.includes(o);
  }

  /**
   * Fill empty fields under `root`. Returns { filled, needsYou: [questions] }.
   * Never clicks buttons; never checks a box unless the saved answer is "Yes".
   */
  /** Whether a field must be answered before the form can continue. */
  function isRequired(el) {
    if (el.required || el.getAttribute("aria-required") === "true") return true;
    const group = el.closest("fieldset, [role=radiogroup], [role=group]");
    if (group && (group.getAttribute("aria-required") === "true" || group.querySelector("[required], [aria-required=true]"))) return true;
    // An asterisk or "(required)" in the field's own label (not anywhere on the page).
    const own = [];
    if (el.getAttribute("aria-label")) own.push(el.getAttribute("aria-label"));
    const root = el.getRootNode();
    if (el.id && root.querySelector) {
      const lab = root.querySelector(`label[for="${CSS.escape(el.id)}"]`);
      if (lab) own.push(lab.textContent);
    }
    if (el.type !== "radio" && el.type !== "checkbox" && el.closest("label")) own.push(el.closest("label").textContent);
    const legend = group && group.querySelector("legend");
    if (legend) own.push(legend.textContent);
    return own.some((t) => /\*|\(required\)/i.test(t || ""));
  }

  function fillRoot(root, profile) {
    const result = { filled: 0, needsYou: [], required: [] };
    const needs = (q, el) => {
      if (q && !result.needsYou.includes(q)) result.needsYou.push(q);
      if (el && isRequired(el) && !result.required.includes(q || "(unlabeled question)")) result.required.push(q || "(unlabeled question)");
      if (el) mark(el, false);
    };

    for (const el of deepAll(root, TEXT_INPUTS)) {
      if (!visible(el) || (el.value || "").trim()) continue;
      if (/password|search/i.test(el.type + " " + (el.name || "") + " " + (el.id || ""))) continue;
      const q = labelFor(el);
      const hit = findAnswer(q, profile);
      if (!hit) {
        needs(q, el);
        continue;
      }
      setValue(el, hit.answer);
      mark(el, true);
      result.filled++;
    }

    for (const el of deepAll(root, "select")) {
      if (!visible(el) || (el.value && el.selectedIndex > 0)) continue;
      const q = labelFor(el);
      const hit = findAnswer(q, profile);
      const opt = hit && [...el.options].find((o) => o.value && sameOption(o.textContent, hit.answer));
      if (!opt) {
        needs(q, el);
        continue;
      }
      setValue(el, opt.value);
      mark(el, true);
      result.filled++;
    }

    const radios = deepAll(root, 'input[type="radio"]').filter(visible);
    const groups = new Map();
    for (const r of radios) {
      const key = (r.getRootNode() === r.ownerDocument ? "" : "shadow:") + (r.name || r.closest("fieldset, [role=radiogroup]")?.id || Math.random());
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(r);
    }
    for (const group of groups.values()) {
      if (group.some((r) => r.checked)) continue;
      const q = groupQuestion(group);
      const hit = findAnswer(q, profile);
      const pick = hit && group.find((r) => sameOption(labelFor(r) || r.value, hit.answer));
      if (!pick) {
        needs(q, group[0]);
        continue;
      }
      pick.click();
      if (!pick.checked) {
        pick.checked = true;
        pick.dispatchEvent(new Event("change", { bubbles: true }));
      }
      mark(pick, true);
      result.filled++;
    }

    for (const cb of deepAll(root, 'input[type="checkbox"]').filter(visible)) {
      if (cb.checked) continue;
      const q = labelFor(cb);
      const hit = findAnswer(q, profile);
      if (!hit) {
        needs(q, cb);
        continue;
      }
      if (norm(hit.answer) === "yes") {
        cb.click();
        if (!cb.checked) {
          cb.checked = true;
          cb.dispatchEvent(new Event("change", { bubbles: true }));
        }
        mark(cb, true);
        result.filled++;
      }
    }
    return result;
  }

  /** Dice job links on the page, normalised to https://www.dice.com/job-detail/<id>. */
  function collectJobLinks(root) {
    const out = new Set();
    for (const a of deepAll(root, 'a[href*="/job-detail/"]')) {
      try {
        const u = new URL(a.getAttribute("href"), "https://www.dice.com");
        const m = /\/job-detail\/([0-9a-f-]{36})/i.exec(u.pathname);
        if (m && /(^|\.)dice\.com$/i.test(u.hostname)) out.add("https://www.dice.com/job-detail/" + m[1].toLowerCase());
      } catch (e) {
        /* ignore malformed links */
      }
    }
    return [...out];
  }

  /** "easy" when the page offers Dice Easy Apply, "external" for Apply Now (company site), else null. */
  function applyKind(root) {
    const buttons = deepAll(root, "button, a, [role=button]");
    const text = (b) => clean(b.textContent).toLowerCase();
    if (buttons.some((b) => /^easy apply$/.test(text(b)))) return "easy";
    if (buttons.some((b) => /^apply now$/.test(text(b)))) return "external";
    if (buttons.some((b) => /^apply$/.test(text(b)))) return "easy";
    return null;
  }

  global.DiceFiller = { deepAll, labelFor, groupQuestion, findAnswer, fillRoot, collectJobLinks, applyKind, isRequired, visible, clean };
})(typeof window !== "undefined" ? window : globalThis);
