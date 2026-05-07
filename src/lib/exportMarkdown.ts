import type { PartialBlock } from "@blocknote/core";
import type { Page } from "../types";

function blocksToMarkdown(blocks: PartialBlock[], depth = 0): string {
  return blocks
    .map((block) => {
      const indent = "  ".repeat(depth);
      const text = Array.isArray(block.content)
        ? (block.content as { text: string; styles?: Record<string, unknown> }[])
            .map((c) => {
              let t = c.text ?? "";
              if (c.styles) {
                if ((c.styles as { bold?: boolean }).bold) t = `**${t}**`;
                if ((c.styles as { italic?: boolean }).italic) t = `_${t}_`;
                if ((c.styles as { code?: boolean }).code) t = `\`${t}\``;
                if ((c.styles as { strike?: boolean }).strike) t = `~~${t}~~`;
              }
              return t;
            })
            .join("")
        : "";

      const props = (block.props ?? {}) as Record<string, unknown>;

      switch (block.type) {
        case "heading": {
          const level = (props.level as number) ?? 1;
          return "#".repeat(level) + " " + text;
        }
        case "bulletListItem":
          return `${indent}- ${text}`;
        case "numberedListItem":
          return `${indent}1. ${text}`;
        case "checkListItem":
          return `${indent}- [${props.checked ? "x" : " "}] ${text}`;
        case "codeBlock":
          return "```\n" + text + "\n```";
        case "quote":
          return `> ${text}`;
        case "paragraph":
        default:
          return text || "";
      }
    })
    .join("\n");
}

/** Pure function — converts a page to a markdown string. Exported for testing. */
export function pageToMarkdown(page: Page): string {
  return `# ${page.title}\n\n` + blocksToMarkdown(page.content ?? []);
}

export function exportPageAsMarkdown(page: Page): void {
  const md = pageToMarkdown(page);
  const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${page.title || "untitled"}.md`;
  a.click();
  URL.revokeObjectURL(url);
}
