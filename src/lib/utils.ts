import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Very basic estimate: 1 page = ~54 lines of Courier 12pt.
// ~1 page = 1 min.
// We can estimate lines based on character counts for different types.
import { ScriptBlock } from "../types";

export function calculateStats(blocks: ScriptBlock[]) {
  let estimatedLines = 0;
  
  for (const block of blocks) {
    const lines = block.content.split('\n').length;
    switch (block.type) {
      case 'scene':
      case 'transition':
      case 'shot':
        estimatedLines += 2; // Usually padded with blank lines
        break;
      case 'character':
        estimatedLines += 1;
        break;
      case 'parenthetical':
        estimatedLines += lines;
        break;
      case 'dialogue':
        // Dialogue margins are smaller, ~35 chars per line
        estimatedLines += Math.ceil(block.content.length / 35) || 1;
        break;
      case 'action':
      default:
        // Action margins are wider, ~60 chars per line
        estimatedLines += Math.ceil(block.content.length / 60) || 1;
        estimatedLines += 1; // padding
        break;
    }
  }

  // 54 lines per page roughly in standard screenplay format
  const pages = Math.max(1, Math.ceil(estimatedLines / 54));
  const minutes = Math.max(1, Math.ceil((estimatedLines / 54) * 0.9)); // slightly less than 1 min per page on avg
  
  return {
    pages,
    minutes,
    lines: estimatedLines
  };
}
