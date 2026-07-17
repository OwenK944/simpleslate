import React from 'react';
import { useSlateStore } from '../store';
import { cn } from '../lib/utils';
import { User, MapPin, AlignLeft, Clock, MessageSquare, Activity } from 'lucide-react';

export function SidebarRight() {
  const { blocks, selectedBlockId, focusMode } = useSlateStore();

  if (focusMode) return null;

  const selectedBlock = blocks.find(b => b.id === selectedBlockId);

  // Character stats logic
  const getCharacterLines = (charName: string) => {
    if (!charName) return [];
    const cleanName = charName.replace(/\s*\(.*?\)\s*/g, '').trim().toUpperCase();
    const lines: { scene: string; dialogue: string }[] = [];
    let currentScene = 'UNKNOWN SCENE';
    
    for (let i = 0; i < blocks.length; i++) {
      const b = blocks[i];
      if (b.type === 'scene') currentScene = b.content;
      
      if (b.type === 'character' && b.content.replace(/\s*\(.*?\)\s*/g, '').trim().toUpperCase() === cleanName) {
        let j = i + 1;
        let charDialogue = '';
        while (j < blocks.length && (blocks[j].type === 'dialogue' || blocks[j].type === 'parenthetical')) {
          if (blocks[j].type === 'dialogue') {
            charDialogue += blocks[j].content + ' ';
          }
          j++;
        }
        if (charDialogue.trim()) {
           lines.push({ scene: currentScene, dialogue: charDialogue.trim() });
        }
      }
    }
    return lines;
  };

  // Scene stats logic
  const getSceneDetails = (sceneId: string) => {
    const sceneIndex = blocks.findIndex(b => b.id === sceneId);
    if (sceneIndex === -1) return { characters: [], actionBlocks: 0, dialogueBlocks: 0 };
    
    const chars = new Set<string>();
    let actionBlocks = 0;
    let dialogueBlocks = 0;

    let i = sceneIndex + 1;
    while (i < blocks.length && blocks[i].type !== 'scene') {
      const b = blocks[i];
      if (b.type === 'character') {
        const clean = b.content.replace(/\s*\(.*?\)\s*/g, '').trim().toUpperCase();
        if (clean) chars.add(clean);
      }
      if (b.type === 'action') actionBlocks++;
      if (b.type === 'dialogue') dialogueBlocks++;
      i++;
    }

    return { characters: Array.from(chars), actionBlocks, dialogueBlocks };
  };

  const getReadingTime = (content: string) => {
    const words = content.trim().split(/\s+/).filter(Boolean).length;
    if (words === 0) return "0 seconds";
    const minutes = words / 130;
    if (minutes < 0.1) return "< 5 seconds";
    if (minutes < 0.5) return "~ 15 seconds";
    if (minutes < 1) return "~ 30 seconds";
    return `~ ${Math.round(minutes * 60)} seconds`;
  };

  return (
    <div 
      className="w-72 bg-slate-bg/50 border-l border-slate-border flex flex-col h-full sticky top-0 shrink-0 overflow-y-auto"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Context Info</h2>
        {!selectedBlock ? (
          <div className="flex flex-col items-center justify-center py-8 text-center px-4">
            <AlignLeft className="w-8 h-8 text-slate-muted mb-3 opacity-50" />
            <p className="text-xs text-slate-500">Click inside any block in your script to view detailed information and statistics here.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Block Type</div>
              <div className="text-xs font-medium text-white capitalize bg-slate-card px-2 py-1 rounded border border-slate-border inline-flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-synth-cyan"></span>
                {selectedBlock.type}
              </div>
            </div>

            {selectedBlock.type === 'character' && (
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                  <User className="w-3 h-3 text-synth-purple" /> Character Overview
                </div>
                
                {(() => {
                  const lines = getCharacterLines(selectedBlock.content);
                  const scenesCount = new Set(lines.map(l => l.scene)).size;
                  return (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-slate-card border border-slate-border rounded-md p-2 text-center">
                          <div className="text-lg font-bold text-synth-purple">{lines.length}</div>
                          <div className="text-[10px] text-slate-400 uppercase tracking-wider">Lines</div>
                        </div>
                        <div className="bg-slate-card border border-slate-border rounded-md p-2 text-center">
                          <div className="text-lg font-bold text-synth-pink">{scenesCount}</div>
                          <div className="text-[10px] text-slate-400 uppercase tracking-wider">Scenes</div>
                        </div>
                      </div>
                      
                      {lines.length > 0 && (
                        <div className="mt-4">
                          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">All Dialogue</div>
                          <div className="space-y-2 max-h-96 overflow-y-auto pr-1 custom-scrollbar">
                            {lines.map((line, idx) => (
                              <div key={idx} className="bg-slate-card/50 border border-slate-border/50 rounded p-2 text-xs">
                                <div className="text-[9px] text-synth-cyan mb-1 truncate uppercase">{line.scene}</div>
                                <div className="text-slate-300 italic">"{line.dialogue}"</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            {selectedBlock.type === 'scene' && (
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                  <MapPin className="w-3 h-3 text-synth-cyan" /> Scene Overview
                </div>
                
                {(() => {
                  const details = getSceneDetails(selectedBlock.id);
                  return (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-slate-card border border-slate-border rounded-md p-2 text-center flex flex-col items-center">
                          <Activity className="w-4 h-4 text-synth-pink mb-1" />
                          <div className="text-sm font-bold text-white">{details.actionBlocks}</div>
                          <div className="text-[9px] text-slate-400 uppercase tracking-wider">Action Blocks</div>
                        </div>
                        <div className="bg-slate-card border border-slate-border rounded-md p-2 text-center flex flex-col items-center">
                          <MessageSquare className="w-4 h-4 text-synth-purple mb-1" />
                          <div className="text-sm font-bold text-white">{details.dialogueBlocks}</div>
                          <div className="text-[9px] text-slate-400 uppercase tracking-wider">Dialogue Blocks</div>
                        </div>
                      </div>

                      {details.characters.length > 0 && (
                        <div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Characters in Scene ({details.characters.length})</div>
                          <div className="flex flex-wrap gap-1">
                            {details.characters.map((char, idx) => (
                              <span key={idx} className="text-[10px] bg-synth-purple/10 text-synth-purple border border-synth-purple/20 px-1.5 py-0.5 rounded">
                                {char}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            {(selectedBlock.type === 'action' || selectedBlock.type === 'dialogue') && (
              <div>
                 <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Clock className="w-3 h-3 text-synth-pink" /> Reading Estimate
                </div>
                <div className="bg-slate-card border border-slate-border rounded-md p-3 text-sm text-white">
                  {getReadingTime(selectedBlock.content)}
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
