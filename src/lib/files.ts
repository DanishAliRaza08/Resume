// Upload validation and text extraction (spec §9.1, §14). Validates extension, declared MIME type,
// size and the actual file signature before parsing. File contents are treated as untrusted data.

import mammoth from "mammoth";

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export type SupportedKind = "pdf" | "docx" | "txt";

export class UploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UploadError";
  }
}

const EXT_KIND: Record<string, SupportedKind> = { pdf: "pdf", docx: "docx", txt: "txt" };
const MIME_OK: Record<SupportedKind, string[]> = {
  pdf: ["application/pdf"],
  docx: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/zip", "application/octet-stream"],
  txt: ["text/plain", "application/octet-stream", ""],
};

export function detectKind(fileName: string, mime: string, bytes: Uint8Array): SupportedKind {
  if (bytes.length === 0) throw new UploadError("The file is empty.");
  if (bytes.length > MAX_UPLOAD_BYTES) throw new UploadError(`The file exceeds the ${MAX_UPLOAD_BYTES / 1024 / 1024} MB limit.`);
  const ext = fileName.toLowerCase().split(".").pop() ?? "";
  const kind = EXT_KIND[ext];
  if (!kind) throw new UploadError("Unsupported file type. Upload a .docx, .pdf or .txt file.");
  if (mime && !MIME_OK[kind].includes(mime)) throw new UploadError(`The declared type (${mime}) does not match the .${ext} extension.`);
  const sig = (n: number) => Array.from(bytes.slice(0, n));
  if (kind === "pdf" && String.fromCharCode(...sig(5)) !== "%PDF-") throw new UploadError("The file is not a valid PDF (signature mismatch).");
  if (kind === "docx" && !(bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04)) {
    throw new UploadError("The file is not a valid .docx document (signature mismatch).");
  }
  if (kind === "txt") {
    const sample = bytes.slice(0, 4096);
    let control = 0;
    for (const b of sample) if (b === 0 || (b < 9 && b !== 0)) control++;
    if (control > 0) throw new UploadError("The text file contains binary data.");
  }
  return kind;
}

async function extractPdf(buffer: Buffer): Promise<string> {
  // Import the implementation directly: pdf-parse's index runs a debug harness when loaded without a parent module.
  const mod = (await import("pdf-parse/lib/pdf-parse.js")) as unknown as { default: (b: Buffer) => Promise<{ text: string }> };
  const data = await mod.default(buffer);
  return data.text;
}

export interface Extracted {
  kind: SupportedKind;
  text: string;
  warnings: string[];
}

export async function extractText(fileName: string, mime: string, bytes: Uint8Array): Promise<Extracted> {
  const kind = detectKind(fileName, mime, bytes);
  const buffer = Buffer.from(bytes);
  const warnings: string[] = [];
  let text = "";
  try {
    if (kind === "docx") text = (await mammoth.extractRawText({ buffer })).value;
    else if (kind === "pdf") text = await extractPdf(buffer);
    else text = buffer.toString("utf8");
  } catch {
    throw new UploadError("The document could not be read. It may be corrupted or password-protected.");
  }
  text = text.replace(/\u0000/g, "").replace(/\n{3,}/g, "\n\n").trim();
  if (text.length < 40) {
    if (kind === "pdf") {
      // OCR fallback is an infrastructure add-on (spec §13.1); surface a clear message instead of guessing.
      throw new UploadError("No selectable text was found in this PDF (it may be a scanned image). OCR is not enabled; upload a DOCX or text-based PDF, or paste the text.");
    }
    throw new UploadError("The document contains too little text to analyze.");
  }
  if (/ignore (all |any )?(previous|prior) instructions|system prompt|you are (now )?an? (ai|assistant)/i.test(text)) {
    warnings.push("The document contains text that looks like instructions to an AI system. It is treated strictly as data and ignored as instructions.");
  }
  return { kind, text: text.slice(0, 200_000), warnings };
}
