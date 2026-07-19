import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { useSlateStore } from '../store';
import { cn } from '../lib/utils';
import { User, MapPin, AlignLeft, Clock, MessageSquare, Activity } from 'lucide-react';

export function SidebarRight() {
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const blockTypes = ['scene', 'action', 'character', 'dialogue', 'parenthetical', 'transition', 'shot'];
  const typeLabels: Record<string, string> = {
    scene: 'Scene Heading',
    action: 'Action',
    character: 'Character',
    dialogue: 'Dialogue',
    parenthetical: 'Parenthetical',
    transition: 'Transition',
    shot: 'Shot'
  };
  const { blocks, selectedBlockId, focusMode, updateBlock } = useSlateStore();

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
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full flex items-center justify-between text-xs font-medium text-white capitalize bg-slate-card px-3 py-2.5 rounded-md border border-slate-border focus:outline-none focus:border-synth-cyan cursor-pointer transition-colors hover:bg-slate-bg/80"
                >
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "w-2 h-2 rounded-full",
                      selectedBlock.type === 'scene' ? 'bg-synth-cyan' :
                      selectedBlock.type === 'action' ? 'bg-slate-300' :
                      selectedBlock.type === 'character' ? 'bg-synth-purple' :
                      selectedBlock.type === 'dialogue' ? 'bg-gray-100' :
                      selectedBlock.type === 'parenthetical' ? 'bg-slate-400' :
                      selectedBlock.type === 'transition' ? 'bg-synth-pink' :
                      selectedBlock.type === 'shot' ? 'bg-cyan-200' : 'bg-synth-cyan'
                    )}></span>
                    {typeLabels[selectedBlock.type] || selectedBlock.type}
                  </div>
                  <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", isDropdownOpen && "rotate-180 text-synth-cyan")} />
                </button>
                
                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 mt-2 w-full bg-slate-card border border-slate-border rounded-md shadow-2xl z-50 py-1 overflow-hidden"
                    >
                      {blockTypes.map(t => (
                        <button 
                          key={t} 
                          onClick={() => { updateBlock(selectedBlock.id, { type: t as any }); setIsDropdownOpen(false); }} 
                          className="w-full text-left px-3 py-2 hover:bg-slate-bg/80 text-xs font-medium text-slate-300 capitalize flex items-center gap-2 transition-colors"
                        >
                          <span className={cn(
                            "w-2 h-2 rounded-full",
                            t === 'scene' ? 'bg-synth-cyan' :
                            t === 'action' ? 'bg-slate-300' :
                            t === 'character' ? 'bg-synth-purple' :
                            t === 'dialogue' ? 'bg-gray-100' :
                            t === 'parenthetical' ? 'bg-slate-400' :
                            t === 'transition' ? 'bg-synth-pink' :
                            t === 'shot' ? 'bg-cyan-200' : 'bg-synth-cyan',
                            selectedBlock.type !== t && "opacity-40"
                          )}></span>
                          <span className={selectedBlock.type === t ? "text-white" : ""}>{typeLabels[t]}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                                </AnimatePresence>
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
