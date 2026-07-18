export type BlockType = 'scene' | 'action' | 'character' | 'dialogue' | 'parenthetical' | 'transition' | 'shot';

export interface ScriptBlock {
  id: string;
  type: BlockType;
  content: string;
  note?: string;
}

export interface ScriptMetadata {
  title: string;
  author: string;
  draftDate: string;
  contact?: string;
  basedOn?: string;
  draftNumber?: string;
  revisions?: string;
  watermark?: string;
  coverImage?: string;
  version?: number;
}
