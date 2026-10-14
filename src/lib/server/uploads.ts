import { extractText } from "../files";
import { str } from "./forms";

/** Read an uploaded file (validated + extracted) or pasted text from a form. Not a server action. */
export async function readUploadOrText(form: FormData, fileKey: string, textKey: string): Promise<{ text: string; fileName: string | null; mime: string | null; warnings: string[] }> {
  const file = form.get(fileKey);
  if (file && typeof file === "object" && "arrayBuffer" in file && file.size > 0) {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const ex = await extractText(file.name, file.type, bytes);
    return { text: ex.text, fileName: file.name, mime: file.type, warnings: ex.warnings };
  }
  const text = str(form, textKey);
  if (text.length < 40) throw new Error("Paste the job description text or upload a file.");
  if (text.length > 200_000) throw new Error("The text is too long.");
  return { text, fileName: null, mime: null, warnings: [] };
}

