import { richTextToPlainText, sanitizeRichText } from "@ksu/ui/components";

export function richTextToEditorValue(value?: string | null) {
  return sanitizeRichText(value ?? "");
}

export function richTextToPayloadValue(value?: string | null) {
  return richTextToPlainText(value ?? "") || null;
}
