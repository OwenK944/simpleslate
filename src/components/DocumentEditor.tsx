import React, { useRef, useEffect, useState } from 'react';
import { useSlateStore } from '../store';
import { Reorder, useDragControls } from 'motion/react';
import { GripVertical, X, Plus, StickyNote } from 'lucide-react';
import { cn } from '../lib/utils';
import { ScriptBlock } from '../types';

export function DocumentEditor() {
  const { blocks, reorderBlocks, setSelectedBlockId } = useSlateStore();

  return (
    <div 
      className="min-h-full pb-48 px-4 flex justify-center pt-8"
      onClick={() => setSelectedBlockId(null)}
    >
      <div className="w-full max-w-[850px] bg-slate-bg md:bg-[#0c0c12] shadow-2xl min-h-[1056px] py-24 px-12 md:px-24 rounded-md relative border border-slate-border" style={{ fontFamily: '"Courier New", Courier, monospace' }}>
        
        {blocks.length === 0 ? (
          <div className="text-slate-muted text-center mt-32 font-sans select-none flex flex-col items-center gap-4">
             <div className="w-16 h-16 bg-slate-card rounded-2xl flex items-center justify-center border border-slate-border shadow-inner">
                <div className="text-2xl font-serif italic text-synth-purple drop-shadow-[0_0_8px_rgba(176,38,255,0.6)]">S</div>
             </div>
             <p className="text-xl text-white">Your script starts here.</p>
             <p className="text-sm text-slate-muted max-w-sm">
                Start typing below. SimpleSlate will automatically detect your formatting based on standard screenplay rules.
             </p>
          </div>
        ) : (
          <Reorder.Group axis="y" values={blocks} onReorder={reorderBlocks} className="flex flex-col">
            {blocks.map((block, index) => (
              <BlockItem key={block.id} block={block} index={index} />
            ))}
          </Reorder.Group>
        )}
      </div>
    </div>
  );
}

function BlockItem({ block, index }: { key?: string; block: ScriptBlock; index: number }) {
  const { updateBlock, deleteBlock, addBlock, autoScroll, showTypeColors, selectedBlockId, setSelectedBlockId } = useSlateStore();
  const controls = useDragControls();
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isEditingNote, setIsEditingNote] = useState(false);

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto';
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  }, [block.content]);

  // Scroll to this block if it was just added and autoScroll is on.
  // We can approximate "just added" by checking if it's the last block rendered, but 
  // actually a better way is to check if it's mounted. If it mounts and is at the end...
  // Since blocks can be inserted anywhere, a simple mount scroll is okay if we only scroll when it mounts.
  useEffect(() => {
    if (autoScroll && containerRef.current) {
       containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []); // Only on mount

  const getStyle = () => {
    switch (block.type) {
      case 'scene': return cn('uppercase font-bold mb-4 mt-6 text-left ml-[5%] md:ml-[10%]', showTypeColors ? 'text-synth-cyan' : 'text-white');
      case 'action': return cn('mb-4 text-left ml-[5%] md:ml-[10%] mr-[5%] md:mr-[10%]', showTypeColors ? 'text-slate-300' : 'text-white');
      case 'character': return cn('uppercase text-left ml-[30%] md:ml-[40%] mt-4', showTypeColors ? 'text-synth-purple' : 'text-white');
      case 'dialogue': return cn('text-left ml-[15%] md:ml-[25%] mr-[15%] md:mr-[25%] mb-2', showTypeColors ? 'text-gray-100' : 'text-white');
      case 'parenthetical': return cn('text-left ml-[20%] md:ml-[32%] mr-[20%] md:mr-[30%] mb-1', showTypeColors ? 'text-slate-400' : 'text-white');
      case 'transition': return cn('uppercase text-right mr-[5%] md:mr-[10%] mb-4 mt-4', showTypeColors ? 'text-synth-pink' : 'text-white');
      case 'shot': return cn('uppercase font-bold mb-4 mt-4 text-left ml-[5%] md:ml-[10%]', showTypeColors ? 'text-cyan-200' : 'text-white');
      default: return cn('mb-4 text-left ml-[5%] md:ml-[10%]', showTypeColors ? 'text-slate-300' : 'text-white');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateBlock(block.id, { content: e.target.value });
  };

  return (
    <Reorder.Item 
      value={block}
      id={block.id}
      dragListener={false}
      dragControls={controls}
      className={cn(
        "group relative flex items-start w-full hover:bg-slate-card/40 rounded-sm transition-colors py-1",
        selectedBlockId === block.id && "bg-slate-card/20"
      )}
    >
      <div 
        id={`block-${block.id}`}
        ref={containerRef}
        onClick={(e) => e.stopPropagation()}
        className={cn("absolute -left-2 top-0 flex items-start justify-end transition-opacity pt-1 gap-1 -translate-x-full pr-2 z-10", (isEditingNote || selectedBlockId === block.id) ? "opacity-100" : "opacity-0 group-hover:opacity-100")}
      >
        <button 
          onPointerDown={(e) => controls.start(e)}
          className="p-1.5 text-slate-muted hover:text-white cursor-grab active:cursor-grabbing bg-slate-bg rounded-md border border-slate-border shadow-sm flex-shrink-0"
          title="Drag to reorder"
        >
          <GripVertical className="w-3.5 h-3.5" />
        </button>
        <button 
          onClick={() => setIsEditingNote(!isEditingNote)}
          className={cn("p-1.5 transition-colors bg-slate-bg rounded-md border shadow-sm flex-shrink-0", block.note ? "text-synth-purple border-synth-purple/50 bg-synth-purple/10" : "text-slate-muted hover:text-synth-purple border-slate-border")}
          title="Add/Edit Note"
        >
          <StickyNote className="w-3.5 h-3.5" />
        </button>
        <button 
          onClick={() => addBlock({ type: 'action', content: '' }, index + 1)}
          className="p-1.5 text-slate-muted hover:text-synth-cyan transition-colors bg-slate-bg rounded-md border border-slate-border shadow-sm flex-shrink-0"
          title="Insert block below"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
        <button 
          onClick={() => deleteBlock(block.id)}
          className="p-1.5 text-slate-muted hover:text-synth-pink transition-colors bg-slate-bg rounded-md border border-slate-border shadow-sm flex-shrink-0"
          title="Delete block"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className={cn("w-full leading-relaxed text-[15px] relative", getStyle())}>
        {isEditingNote && (
          <div 
            onClick={(e) => e.stopPropagation()}
            className="absolute -top-1 left-full ml-4 w-48 bg-yellow-900/40 border border-yellow-600/50 rounded-md p-2 shadow-xl z-20"
          >
            <textarea
              autoFocus
              placeholder="Add a note..."
              value={block.note || ''}
              onChange={(e) => updateBlock(block.id, { note: e.target.value })}
              className="w-full bg-transparent resize-none focus:outline-none text-xs text-yellow-100 placeholder-yellow-700/50 min-h-[60px]"
            />
          </div>
        )}
        <textarea
          ref={textAreaRef}
          value={block.content}
          onChange={handleChange}
          onFocus={() => setSelectedBlockId(block.id)}
          onClick={(e) => { e.stopPropagation(); setSelectedBlockId(block.id); }}
          className="w-full bg-transparent resize-none focus:outline-none focus:bg-slate-card/60 rounded-sm transition-colors py-0.5"
          rows={block.content.split('\n').length}
          spellCheck={false}
          style={{ 
            height: 'auto',
            overflow: 'hidden'
          }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = 'auto';
            target.style.height = `${target.scrollHeight}px`;
          }}
        />
        {block.note && !isEditingNote && (
          <div 
            onClick={() => setIsEditingNote(true)}
            className="absolute top-1 -right-8 w-6 h-6 rounded bg-yellow-900/30 border border-yellow-600/30 flex items-center justify-center text-yellow-500 cursor-pointer hover:bg-yellow-900/50 transition-colors"
            title={block.note}
          >
            <StickyNote className="w-3 h-3" />
          </div>
        )}
      </div>
    </Reorder.Item>
  );
}
