import { BlockType, ScriptBlock } from '../types';

export function guessBlockType(text: string, previousBlock?: ScriptBlock): BlockType {
  const t = text.trim();
  const upper = t.toUpperCase();
  
  if (!t) return 'action';

  // SCENE HEADING
  if (upper.startsWith('INT.') || upper.startsWith('EXT.') || upper.startsWith('INT/EXT.') || upper.startsWith('I/E.') || upper.startsWith('EST.')) {
    return 'scene';
  }

  // TRANSITION
  if (upper.endsWith(' TO:') || upper === 'FADE IN:' || upper === 'FADE OUT.' || upper === 'CUT TO BLACK.') {
    return 'transition';
  }

  // PARENTHETICAL
  if (t.startsWith('(') && t.endsWith(')')) {
    return 'parenthetical';
  }

  // If previous block is Character or Parenthetical, this is likely Dialogue
  if (previousBlock && (previousBlock.type === 'character' || previousBlock.type === 'parenthetical')) {
    // Unless it's explicitly wrapped in parentheses, which we already caught.
    return 'dialogue';
  }

  // SHOT / CHARACTER heuristic
  // If it's all caps, relatively short, it might be a character or shot.
  if (t === upper && t.length < 40 && t.length > 0) {
    if (upper.includes('ANGLE ON') || upper.includes('CLOSE UP') || upper.includes('ECU') || upper.includes('POV')) {
      return 'shot';
    }
    // If previous was scene, action, or dialogue, it's likely a character name.
    if (!previousBlock || previousBlock.type === 'action' || previousBlock.type === 'scene' || previousBlock.type === 'dialogue') {
      return 'character';
    }
  }

  // Default fallback
  return 'action';
}
