// Builds the "Fill Dice" bookmark: the Dice Helper code plus one person's answers inside a
// javascript: URL. Dragged to the bookmarks bar once, it works without installing anything.
import { readFileSync } from "node:fs";
import path from "node:path";

let source: string | null = null;

function helperSource(): string {
  if (source) return source;
  const dir = path.join(process.cwd(), "extension");
  const strip = (code: string) =>
    code
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith("//"))
      .join("\n");
  source = strip(readFileSync(path.join(dir, "filler.js"), "utf8")) + "\n" + strip(readFileSync(path.join(dir, "bookmarklet-panel.js"), "utf8"));
  return source;
}

/** Profile JSON is the decoded answer code ({ v, candidate, answers, custom }). */
export function bookmarkletHref(answerCodeBase64: string): string {
  const profileJson = Buffer.from(answerCodeBase64, "base64").toString("utf8");
  // JSON.stringify of the JSON text yields a safe JS string literal; parse it inside the page.
  const code = `(function(){window.__RB_PROFILE=JSON.parse(${JSON.stringify(profileJson)});\n${helperSource()}\n})();void 0`;
  return "javascript:" + encodeURIComponent(code);
}
