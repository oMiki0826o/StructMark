export interface NormalizedSource {
  readonly text: string;
  readonly originalOffsetAt: (textOffset: number) => number;
  readonly textOffsetAtOriginal: (originalOffset: number) => number;
  readonly byteOffsetAt: (textOffset: number) => number;
}

export function normalizeSource(input: string): NormalizedSource {
  const chars = [...input];
  const normalized: string[] = [];
  const originalAt: number[] = [];
  const bytesAt: number[] = [];
  let original = 0;
  let bytes = 0;
  for (let index = 0; index < input.length;) {
    const char = input[index]!;
    const width = char.codePointAt(0)! > 0xffff ? 2 : 1;
    if (char === "\r") {
      normalized.push("\n"); originalAt.push(index); bytesAt.push(bytes);
      if (input[index + 1] === "\n") { original += 2; bytes += 2; index += 2; }
      else { original += 1; bytes += 1; index += 1; }
      continue;
    }
    normalized.push(char); originalAt.push(index); bytesAt.push(bytes);
    original += width; bytes += new TextEncoder().encode(char).length; index += width;
  }
  const text = normalized.join("");
  const originalOffsetAt = (offset: number) => offset >= originalAt.length ? original : originalAt[Math.max(0, offset)]!;
  const textOffsetAtOriginal = (offset: number) => {
    const found = originalAt.findIndex(value => value >= offset);
    return found < 0 ? text.length : found;
  };
  const byteOffsetAt = (offset: number) => offset >= bytesAt.length ? bytes : bytesAt[Math.max(0, offset)]!;
  return {text, originalOffsetAt, textOffsetAtOriginal, byteOffsetAt};
}
