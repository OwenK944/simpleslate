import React, { useState, useEffect, useRef } from 'react';
import { useSlateStore } from '../store';
import { BlockType } from '../types';
import { guessBlockType } from '../lib/smartFormat';
import { cn } from '../lib/utils';
import { AlignLeft, User, MessageSquare, Clapperboard, Type, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const blockIcons: Record<BlockType, React.ReactNode> = {
  scene: <Clapperboard className="w-3.5 h-3.5" />,
  action: <AlignLeft className="w-3.5 h-3.5" />,
  character: <User className="w-3.5 h-3.5" />,
  dialogue: <MessageSquare className="w-3.5 h-3.5" />,
  parenthetical: <Type className="w-3.5 h-3.5" />,
  transition: <ChevronRight className="w-3.5 h-3.5" />,
  shot: <Clapperboard className="w-3.5 h-3.5" />
};

const blockColors: Record<BlockType, string> = {
  scene: 'bg-synth-cyan/20 text-synth-cyan border border-synth-cyan/30',
  action: 'bg-slate-card text-slate-300 border border-slate-border',
  character: 'bg-synth-purple/20 text-synth-purple border border-synth-purple/30',
  dialogue: 'bg-green-500/20 text-green-400 border border-green-500/30',
  parenthetical: 'bg-slate-muted/20 text-slate-400 border border-slate-muted/30',
  transition: 'bg-synth-pink/20 text-synth-pink border border-synth-pink/30',
  shot: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
};

const typeOrder: BlockType[] = ['action', 'scene', 'character', 'dialogue', 'parenthetical', 'transition', 'shot'];

export function BottomInput() {
  const { blocks, addBlock, focusMode } = useSlateStore();
  const [text, setText] = useState('');
  const [overrideType, setOverrideType] = useState<BlockType | null>(null);
  const [altHeld, setAltHeld] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  const lastBlock = blocks[blocks.length - 1];
  const detectedType = guessBlockType(text, lastBlock);
  const currentType = overrideType || detectedType;

  // Autocomplete state
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const [currentSuggestions, setCurrentSuggestions] = useState<string[]>([]);
  const [autocompletePreview, setAutocompletePreview] = useState('');

  // Extract unique characters and locations for autocomplete
  const reversedBlocks = [...blocks].reverse();
  const uniqueCharacters = Array.from(new Set(reversedBlocks.filter(b => b.type === 'character').map(b => b.content.replace(/\s*\(.*?\)\s*/g, '').trim()))).filter(Boolean);
  const uniqueLocations = Array.from(new Set(reversedBlocks.filter(b => b.type === 'scene').map(b => {
    return b.content.replace(/^(INT\.|EXT\.|INT\/EXT\.|I\/E\.)\s*/i, '').trim();
  }))).filter(Boolean);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 150)}px`;
    }
  }, [text]);

  // Handle Autocomplete Logic
  useEffect(() => {
    if (!text) {
      setAutocompletePreview('');
      setCurrentSuggestions([]);
      return;
    }

    if (currentType === 'character') {
       const matches = uniqueCharacters.filter(c => c.toLowerCase().startsWith(text.toLowerCase()));
       setCurrentSuggestions(matches);
       if (matches.length > 0) {
          setAutocompletePreview(matches[suggestionIndex % matches.length]);
       } else {
          setAutocompletePreview('');
       }
    } else if (currentType === 'scene') {
       const prefixMatch = text.match(/^(INT\.|EXT\.|INT\/EXT\.|I\/E\.)\s*(.*)$/i);
       if (prefixMatch) {
         const prefix = prefixMatch[1] + ' ';
         const query = prefixMatch[2];
         let matches = uniqueLocations;
         if (query) {
           matches = uniqueLocations.filter(l => l.toLowerCase().startsWith(query.toLowerCase()));
         }
         setCurrentSuggestions(matches);
         if (matches.length > 0) {
           setAutocompletePreview(prefix.toUpperCase() + matches[suggestionIndex % matches.length].toUpperCase());
         } else {
           setAutocompletePreview('');
         }
       } else {
         setAutocompletePreview('');
         setCurrentSuggestions([]);
       }
    } else {
      setAutocompletePreview('');
      setCurrentSuggestions([]);
    }
  }, [text, currentType, blocks, suggestionIndex]); // Depend on suggestionIndex to update preview when it changes

  // Handle Alt key holding globally when focused
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Alt') {
         setAltHeld(true);
      }
    };
    const handleGlobalKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Alt') {
         setAltHeld(false);
         if (inputRef.current) inputRef.current.focus();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    window.addEventListener('keyup', handleGlobalKeyUp);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
      window.removeEventListener('keyup', handleGlobalKeyUp);
    };
  }, []);

  const handleSubmit = (forceText?: string) => {
    const t = (forceText || text).trim();
    if (!t) return;
    
    let finalContent = t;
    if (currentType === 'scene' || currentType === 'character' || currentType === 'transition' || currentType === 'shot') {
      finalContent = finalContent.toUpperCase();
    }
    if (currentType === 'parenthetical') {
      if (!finalContent.startsWith('(')) finalContent = '(' + finalContent;
      if (!finalContent.endsWith(')')) finalContent = finalContent + ')';
    }

    addBlock({ type: currentType, content: finalContent });
    setText('');
    setOverrideType(null);
    setAutocompletePreview('');
    if (inputRef.current) inputRef.current.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Autocomplete cycling
    if (e.key === 'Control') {
       if (currentSuggestions.length > 0) {
         setSuggestionIndex(prev => prev + 1);
       }
       return;
    }

    // If Alt is held, allow WASD or Arrows to navigate
    if (altHeld) {
      e.preventDefault(); // Prevent typing the character
      
      const currentIndex = typeOrder.indexOf(currentType);
      let nextIndex = currentIndex;

      if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
        nextIndex = (currentIndex + 1) % typeOrder.length;
      } else if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
        nextIndex = (currentIndex - 1 + typeOrder.length) % typeOrder.length;
      } else if (e.key === 'ArrowDown' || e.key.toLowerCase() === 's') {
        // Move by 3 roughly to simulate grid down
        nextIndex = (currentIndex + 3) % typeOrder.length;
      } else if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') {
        // Move by 3 roughly to simulate grid up
        nextIndex = (currentIndex - 3 + typeOrder.length) % typeOrder.length;
      }
      
      if (nextIndex !== currentIndex) {
         setOverrideType(typeOrder[nextIndex]);
      }
      return;
    }

    if (e.key === 'Enter') {
      if (e.shiftKey) return;
      e.preventDefault();
      if (autocompletePreview && autocompletePreview.toLowerCase().startsWith(text.toLowerCase()) && text.toLowerCase() !== autocompletePreview.toLowerCase()) {
         handleSubmit(autocompletePreview);
      } else {
         handleSubmit();
      }
    }
    
    if (e.key === 'Tab') {
      e.preventDefault();
      const currentIndex = typeOrder.indexOf(currentType);
      const nextIndex = (currentIndex + 1) % typeOrder.length;
      setOverrideType(typeOrder[nextIndex]);
    }

    if (e.key === 'Escape') {
       setOverrideType(null);
    }
  };

  return (
    <div className={cn("fixed bottom-0 p-4 bg-gradient-to-t from-slate-bg via-slate-bg to-transparent pointer-events-none z-40 flex flex-col justify-end items-center transition-all duration-300", !focusMode ? "md:left-64 md:right-72 left-0 right-0" : "left-0 right-0")}>
      
      <AnimatePresence>
        {altHeld && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="mb-3 p-2 bg-slate-card/90 backdrop-blur rounded-xl shadow-2xl border border-slate-border pointer-events-auto flex flex-wrap max-w-sm justify-center gap-1.5"
          >
            {typeOrder.map((type) => (
              <div
                key={type}
                className={cn(
                  "px-2.5 py-2 rounded-lg flex flex-col items-center gap-1 min-w-[76px] transition-all",
                  currentType === type ? blockColors[type] + " shadow-[0_0_10px_currentColor] scale-105" : "bg-slate-bg text-slate-muted border border-transparent"
                )}
              >
                {blockIcons[type]}
                <span className="text-[10px] font-bold uppercase tracking-wider">{type}</span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className={cn(
        "w-full max-w-3xl bg-slate-card rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.5)] border pointer-events-auto p-2 pl-4 flex flex-col gap-2 transition-all relative overflow-hidden",
        altHeld ? "border-synth-purple shadow-[0_0_15px_rgba(176,38,255,0.3)]" : "border-slate-border"
      )}>
        <div className="flex items-center gap-3 relative z-10">
          <AnimatePresence mode="popLayout">
            <motion.div 
              key={currentType}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className={cn("px-2.5 py-1.5 rounded-md flex items-center gap-1.5 text-xs font-semibold tracking-wide uppercase shrink-0 select-none transition-colors", blockColors[currentType])}
              title="Press Tab to change, or Hold Alt"
            >
              {blockIcons[currentType]}
              {currentType}
            </motion.div>
          </AnimatePresence>
          
          <div className="relative w-full flex items-center">
            {autocompletePreview && text && autocompletePreview.toLowerCase().startsWith(text.toLowerCase()) && (
              <div className="absolute inset-0 pointer-events-none text-slate-muted flex items-center py-2 font-sans overflow-hidden whitespace-pre">
                <span className="opacity-0">{text}</span>
                <span>{autocompletePreview.slice(text.length)}</span>
                {currentSuggestions.length > 1 && (
                  <span className="ml-2 text-[10px] text-slate-500 font-bold bg-slate-bg px-1.5 py-0.5 rounded border border-slate-border">Ctrl to cycle</span>
                )}
              </div>
            )}
            <textarea
              ref={inputRef}
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                if (e.target.value === '') setOverrideType(null);
              }}
              onKeyDown={handleKeyDown}
              placeholder={
                altHeld ? "Use WASD or Arrows to select..." :
                currentType === 'scene' ? 'EXT. LOCATION - DAY' :
                currentType === 'character' ? 'CHARACTER NAME' :
                currentType === 'dialogue' ? 'What are they saying?' :
                currentType === 'action' ? 'Describe the action...' :
                'Type your script... (Enter to add, Tab to change format)'
              }
              className="w-full bg-transparent resize-none focus:outline-none text-white py-2 min-h-[40px] max-h-[150px] font-sans placeholder-slate-muted selection:bg-synth-purple/30 relative z-10"
              rows={1}
              autoFocus
            />
          </div>

          <button 
            onClick={() => handleSubmit()}
            className="w-10 h-10 rounded-xl bg-synth-purple text-white flex items-center justify-center hover:bg-synth-pink transition-colors shrink-0 disabled:opacity-50 disabled:bg-slate-border disabled:text-slate-muted"
            disabled={!text.trim()}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
