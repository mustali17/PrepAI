import { getDocumentProxy, extractText } from "unpdf";

export async function extractResumeText(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);

  if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
    const pdf = await getDocumentProxy(buffer);
    const { text } = await extractText(pdf, { mergePages: true });
    return text.trim();
  }

  // Plain text / .txt fallback
  return Buffer.from(buffer).toString("utf-8").trim();
}
