export function framingWithoutPlateThesis(framing: string, thesis: string): string {
  const lines = framing.split("\n");
  const first = lines[0]?.trim();
  if (first === `*${thesis}*`) {
    return lines.slice(1).join("\n").trim();
  }
  return framing;
}
