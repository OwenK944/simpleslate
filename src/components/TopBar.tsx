import React, { useRef, useState, useEffect } from 'react';
import { useSlateStore } from '../store';
import { calculateStats } from '../lib/utils';
import { exportToPDF } from '../lib/pdfExport';
import { Download, FileUp, File as FileIcon, Settings, Save, FileText, Plus, Undo2, Redo2, Eye, Type, X, Film, GripVertical, StickyNote } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function TopBar() {
  const { blocks, metadata, setMetadata, loadScript, clearScript, autoScroll, toggleAutoScroll, showTypeColors, setShowTypeColors, focusMode, setFocusMode, hasSeenSaveIndicator, setHasSeenSaveIndicator } = useSlateStore();
  const { undo, redo, pastStates, futureStates } = useSlateStore.temporal.getState();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { pages, minutes } = calculateStats(blocks);
  const [showMeta, setShowMeta] = useState(false);
  const [showNewWarning, setShowNewWarning] = useState(false);
  
  const [activeMenu, setActiveMenu] = useState<'file' | 'edit' | 'options' | null>(null);

  // Auto save reminder
  const [lastSaveLength, setLastSaveLength] = useState(blocks.length);
  const needsSave = blocks.length - lastSaveLength > 20;

  const [showSavePopup, setShowSavePopup] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    if (needsSave && !hasSeenSaveIndicator) {
      setShowSavePopup(true);
      setHasSeenSaveIndicator(true);
    }
  }, [needsSave, hasSeenSaveIndicator, setHasSeenSaveIndicator]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          redo();
        } else {
          e.preventDefault();
          undo();
        }
      }
      if (focusMode && e.key === 'Escape') {
        setFocusMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, focusMode]);

  const handleSaveSlate = () => {
    const data = JSON.stringify({ metadata, blocks }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${metadata.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'script'}.slate`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setLastSaveLength(blocks.length);
    setActiveMenu(null);
  };

  const handleLoadSlate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.metadata && json.blocks) {
          useSlateStore.temporal.getState().clear();
          loadScript(json.metadata, json.blocks);
          setLastSaveLength(json.blocks.length);
        }
      } catch (error) {
        alert("Failed to load .slate file.");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setActiveMenu(null);
  };

  if (focusMode) {
    return (
      <div className="fixed top-0 left-0 right-0 h-2 hover:h-12 bg-transparent hover:bg-slate-bg/80 backdrop-blur-sm transition-all duration-300 z-50 flex items-center px-4 overflow-hidden group">
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between w-full">
          <div className="font-bold tracking-tighter text-white flex items-center gap-2">
            <Film className="w-5 h-5 text-synth-purple drop-shadow-[0_0_5px_rgba(176,38,255,0.5)]" />
            SimpleSlate <span className="text-xs text-synth-pink ml-2 font-normal">Focus Mode</span>
          </div>
          <button onClick={() => setFocusMode(false)} className="text-xs bg-slate-card border border-slate-border px-3 py-1.5 rounded text-white hover:text-synth-cyan transition-colors">
            Exit Focus Mode (Esc)
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed top-0 left-0 right-0 h-14 bg-slate-bg/80 backdrop-blur border-b border-slate-border flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-6">
          <div className="font-bold text-xl tracking-tighter text-white flex items-center gap-2 mr-2">
            <Film className="w-6 h-6 text-synth-purple drop-shadow-[0_0_10px_rgba(176,38,255,0.5)]" />
            SimpleSlate
          </div>
          
          <div className="flex items-center gap-1">
            {/* FILE MENU */}
            <div className="relative group" onMouseLeave={() => setActiveMenu(null)}>
              <button 
                onMouseEnter={() => setActiveMenu('file')}
                className="px-3 py-1.5 rounded-md hover:bg-slate-card text-slate-text transition-colors flex items-center gap-1 text-sm font-medium"
              >
                File
                {needsSave && <span className="w-2 h-2 rounded-full bg-synth-pink shadow-[0_0_5px_rgba(255,0,255,0.8)] ml-1 animate-pulse" title="You have unsaved changes!" />}
              </button>
              <AnimatePresence>
                {activeMenu === 'file' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} transition={{ duration: 0.1 }}
                    className="absolute top-full left-0 w-48 bg-slate-card border border-slate-border rounded-xl shadow-2xl z-50 py-2"
                  >
                    <button onClick={() => { setShowNewWarning(true); setActiveMenu(null); }} className="w-full text-left px-4 py-2 hover:bg-slate-border text-sm flex items-center gap-3 text-white">
                      <Plus className="w-4 h-4 text-synth-cyan" /> New Script
                    </button>
                    <div className="h-px bg-slate-border my-1" />
                    <button onClick={() => fileInputRef.current?.click()} className="w-full text-left px-4 py-2 hover:bg-slate-border text-sm flex items-center gap-3 text-slate-text">
                      <FileUp className="w-4 h-4 text-slate-400" /> Open .slate
                    </button>
                    <button onClick={handleSaveSlate} className="w-full text-left px-4 py-2 hover:bg-slate-border text-sm flex items-center gap-3 text-slate-text">
                      <Save className="w-4 h-4 text-synth-pink" /> Save .slate
                    </button>
                    <button onClick={() => { exportToPDF(metadata, blocks); setActiveMenu(null); }} className="w-full text-left px-4 py-2 hover:bg-slate-border text-sm flex items-center gap-3 text-slate-text">
                      <Download className="w-4 h-4 text-slate-400" /> Export PDF
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* EDIT MENU */}
            <div className="relative group" onMouseLeave={() => setActiveMenu(null)}>
              <button 
                onMouseEnter={() => setActiveMenu('edit')}
                className="px-3 py-1.5 rounded-md hover:bg-slate-card text-slate-text transition-colors flex items-center gap-1 text-sm font-medium"
              >
                Edit
              </button>
              <AnimatePresence>
                {activeMenu === 'edit' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} transition={{ duration: 0.1 }}
                    className="absolute top-full left-0 w-48 bg-slate-card border border-slate-border rounded-xl shadow-2xl z-50 py-2"
                  >
                    <button onClick={() => { undo(); setActiveMenu(null); }} disabled={pastStates.length === 0} className="w-full text-left px-4 py-2 hover:bg-slate-border text-sm flex items-center gap-3 text-slate-text disabled:opacity-50">
                      <Undo2 className="w-4 h-4 text-slate-400" /> Undo <span className="ml-auto text-[10px] text-slate-500">Ctrl+Z</span>
                    </button>
                    <button onClick={() => { redo(); setActiveMenu(null); }} disabled={futureStates.length === 0} className="w-full text-left px-4 py-2 hover:bg-slate-border text-sm flex items-center gap-3 text-slate-text disabled:opacity-50">
                      <Redo2 className="w-4 h-4 text-slate-400" /> Redo <span className="ml-auto text-[10px] text-slate-500">Ctrl+Shift+Z</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* OPTIONS MENU */}
            <div className="relative group" onMouseLeave={() => setActiveMenu(null)}>
              <button 
                onMouseEnter={() => setActiveMenu('options')}
                className="px-3 py-1.5 rounded-md hover:bg-slate-card text-slate-text transition-colors flex items-center gap-1 text-sm font-medium"
              >
                Options
              </button>
              <AnimatePresence>
                {activeMenu === 'options' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} transition={{ duration: 0.1 }}
                    className="absolute top-full left-0 w-64 bg-slate-card border border-slate-border rounded-xl shadow-2xl z-50 py-2"
                  >
                    <button onClick={() => { setShowMeta(true); setActiveMenu(null); }} className="w-full text-left px-4 py-2 hover:bg-slate-border text-sm flex items-center gap-3 text-slate-text">
                      <FileIcon className="w-4 h-4 text-synth-cyan" /> Title Page
                    </button>
                    <div className="px-4 py-2 flex items-center gap-3 text-sm text-slate-text hover:bg-slate-border group/wm cursor-pointer" onClick={(e) => e.stopPropagation()}>
                      <Settings className="w-4 h-4 text-slate-400" />
                      <div className="flex-1">
                        Watermark
                        <input 
                          type="text" 
                          placeholder="e.g. CONFIDENTIAL"
                          value={metadata.watermark || ''}
                          onChange={(e) => setMetadata({ watermark: e.target.value })}
                          className="w-full mt-1 px-2 py-1 bg-slate-bg border border-slate-border rounded text-xs focus:outline-none focus:border-synth-cyan text-white"
                        />
                      </div>
                    </div>
                    <div className="h-px bg-slate-border my-1" />
                    <button onClick={() => { toggleAutoScroll(); setActiveMenu(null); }} className="w-full text-left px-4 py-2 hover:bg-slate-border text-sm flex items-center justify-between text-slate-text">
                      <span className="flex items-center gap-3"><Settings className="w-4 h-4 text-slate-400" /> Auto-scroll</span>
                      <span className={`text-xs ${autoScroll ? 'text-synth-cyan' : 'text-slate-muted'}`}>{autoScroll ? 'ON' : 'OFF'}</span>
                    </button>
                    <button onClick={() => { setShowTypeColors(!showTypeColors); setActiveMenu(null); }} className="w-full text-left px-4 py-2 hover:bg-slate-border text-sm flex items-center justify-between text-slate-text">
                      <span className="flex items-center gap-3"><Type className="w-4 h-4 text-slate-400" /> Type Colors</span>
                      <span className={`text-xs ${showTypeColors ? 'text-synth-cyan' : 'text-slate-muted'}`}>{showTypeColors ? 'ON' : 'OFF'}</span>
                    </button>
                    <div className="h-px bg-slate-border my-1" />
                    <button onClick={() => { setFocusMode(true); setActiveMenu(null); }} className="w-full text-left px-4 py-2 hover:bg-slate-border text-sm flex items-center gap-3 text-white">
                      <Eye className="w-4 h-4 text-synth-pink" /> Focus Mode
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <input type="file" accept=".slate" ref={fileInputRef} onChange={handleLoadSlate} className="hidden" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowTutorial(true)}
            className="w-7 h-7 rounded-full bg-slate-bg border border-slate-border flex items-center justify-center text-slate-muted hover:text-synth-cyan hover:border-synth-cyan transition-colors"
            title="Help / Tutorial"
          >
            ?
          </button>
          <div className="text-[10px] text-synth-cyan px-2 py-1 bg-synth-cyan/10 border border-synth-cyan/20 rounded font-medium tracking-wide">
            SAVED TO BROWSER
          </div>
          <div className="flex items-center gap-4 text-xs font-mono text-slate-muted bg-slate-card px-3 py-1.5 rounded-full border border-slate-border shadow-inner">
            <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5"/> {pages} Pgs</span>
            <span className="w-1 h-1 rounded-full bg-slate-muted" />
            <span>~{minutes} Min</span>
          </div>
        </div>
      </div>

      {showNewWarning && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center">
          <div className="bg-slate-card rounded-xl shadow-2xl w-full max-w-md p-6 border border-slate-border text-slate-text">
            <h2 className="text-xl font-bold text-white mb-2">Start New Script?</h2>
            <p className="text-sm text-slate-400 mb-6">This will erase your current script. Would you like to save it as a .slate file first?</p>
            <div className="flex flex-col gap-2">
              <button onClick={() => { handleSaveSlate(); clearScript(); useSlateStore.temporal.getState().clear(); setShowNewWarning(false); }} className="w-full px-4 py-2 bg-synth-cyan/20 text-synth-cyan border border-synth-cyan/50 rounded-lg hover:bg-synth-cyan/30 transition-colors font-medium text-sm">
                Save & Clear
              </button>
              <button onClick={() => { clearScript(); useSlateStore.temporal.getState().clear(); setShowNewWarning(false); }} className="w-full px-4 py-2 bg-slate-bg border border-synth-pink/50 text-synth-pink rounded-lg hover:bg-synth-pink/10 transition-colors font-medium text-sm">
                Clear Without Saving
              </button>
              <button onClick={() => setShowNewWarning(false)} className="w-full px-4 py-2 text-slate-400 hover:text-white transition-colors font-medium text-sm mt-2">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showMeta && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center">
          <div className="bg-slate-card rounded-xl shadow-2xl w-full max-w-md p-6 border border-slate-border text-slate-text">
            <h2 className="text-xl font-bold text-white mb-4">Title Page Metadata</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-muted uppercase tracking-wider mb-1">Title</label>
                <input 
                  type="text" 
                  value={metadata.title}
                  onChange={(e) => setMetadata({ title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-bg border border-slate-border rounded-lg focus:outline-none focus:border-synth-cyan font-medium text-white transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-muted uppercase tracking-wider mb-1">Author</label>
                <input 
                  type="text" 
                  value={metadata.author}
                  onChange={(e) => setMetadata({ author: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-bg border border-slate-border rounded-lg focus:outline-none focus:border-synth-cyan text-white transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-muted uppercase tracking-wider mb-1">Cover Image</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setMetadata({ coverImage: reader.result as string });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="w-full px-3 py-2 bg-slate-bg border border-slate-border rounded-lg focus:outline-none focus:border-synth-cyan text-xs text-slate-300 transition-colors file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-synth-cyan/10 file:text-synth-cyan hover:file:bg-synth-cyan/20"
                />
                {metadata.coverImage && (
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-synth-cyan">Image uploaded</span>
                    <button onClick={() => setMetadata({ coverImage: undefined })} className="text-xs text-synth-pink hover:underline">Remove</button>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-muted uppercase tracking-wider mb-1">Based On</label>
                <input 
                  type="text" 
                  value={metadata.basedOn || ''}
                  onChange={(e) => setMetadata({ basedOn: e.target.value })}
                  placeholder="e.g. A true story"
                  className="w-full px-3 py-2 bg-slate-bg border border-slate-border rounded-lg focus:outline-none focus:border-synth-cyan text-white transition-colors"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-muted uppercase tracking-wider mb-1">Draft Number</label>
                  <input 
                    type="text" 
                    value={metadata.draftNumber || ''}
                    onChange={(e) => setMetadata({ draftNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-bg border border-slate-border rounded-lg focus:outline-none focus:border-synth-cyan text-white transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-muted uppercase tracking-wider mb-1">Draft Date</label>
                  <input 
                    type="text" 
                    value={metadata.draftDate}
                    onChange={(e) => setMetadata({ draftDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-bg border border-slate-border rounded-lg focus:outline-none focus:border-synth-cyan text-white transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-muted uppercase tracking-wider mb-1">Revisions</label>
                <textarea 
                  value={metadata.revisions || ''}
                  onChange={(e) => setMetadata({ revisions: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-bg border border-slate-border rounded-lg focus:outline-none focus:border-synth-cyan h-16 resize-none text-white transition-colors"
                  placeholder="Blue Rev. - MM/DD/YYYY&#10;Pink Rev. - MM/DD/YYYY"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-muted uppercase tracking-wider mb-1">Contact Info</label>
                <textarea 
                  value={metadata.contact || ''}
                  onChange={(e) => setMetadata({ contact: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-bg border border-slate-border rounded-lg focus:outline-none focus:border-synth-cyan h-24 resize-none text-white transition-colors"
                  placeholder="123 Fake St&#10;City, State 12345&#10;email@example.com"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setShowMeta(false)}
                className="px-4 py-2 bg-synth-purple text-white rounded-lg hover:bg-synth-pink transition-colors font-medium text-sm shadow-[0_0_15px_rgba(176,38,255,0.4)]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {showSavePopup && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 bg-slate-card border border-synth-pink shadow-[0_0_20px_rgba(255,0,255,0.3)] rounded-lg p-4 z-50 flex items-start gap-3 w-80">
          <div className="w-8 h-8 rounded-full bg-synth-pink/20 flex items-center justify-center shrink-0">
            <Save className="w-4 h-4 text-synth-pink" />
          </div>
          <div>
            <h3 className="text-white text-sm font-bold mb-1">Unsaved Changes</h3>
            <p className="text-slate-muted text-xs leading-relaxed mb-3">
              The pink dot means you have unsaved work. Your script is saved to your browser, but don't forget to save a .slate file backup!
            </p>
            <button onClick={() => setShowSavePopup(false)} className="text-xs bg-slate-bg border border-slate-border px-3 py-1.5 rounded text-white hover:text-synth-cyan transition-colors">
              Got it
            </button>
          </div>
        </div>
      )}

      {showTutorial && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
          <div className="bg-slate-card rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col border border-slate-border text-slate-text">
            <div className="p-6 border-b border-slate-border flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="w-8 h-8 rounded bg-synth-purple/20 flex items-center justify-center text-synth-purple">
                  <FileIcon className="w-4 h-4" />
                </span>
                SimpleSlate Guide
              </h2>
              <button onClick={() => setShowTutorial(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <section>
                <h3 className="text-sm font-bold text-synth-cyan mb-3 uppercase tracking-wider">Formatting & Blocks</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-bg p-3 rounded-lg border border-slate-border">
                    <div className="font-medium text-white mb-1">Auto-Format</div>
                    <p className="text-xs text-slate-400">Type "INT/EXT" to auto-detect a Scene Heading. Character names and Scene Headings automatically uppercase.</p>
                  </div>
                  <div className="bg-slate-bg p-3 rounded-lg border border-slate-border">
                    <div className="font-medium text-white mb-1">Autocomplete</div>
                    <p className="text-xs text-slate-400">Start typing an existing character or location to see suggestions. Press <kbd className="px-1 py-0.5 bg-slate-card rounded border border-slate-border">Ctrl</kbd> to cycle, <kbd className="px-1 py-0.5 bg-slate-card rounded border border-slate-border">Enter</kbd> to accept.</p>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-sm font-bold text-synth-pink mb-3 uppercase tracking-wider">Keyboard Shortcuts</h3>
                <div className="bg-slate-bg rounded-lg border border-slate-border overflow-hidden">
                  <div className="grid grid-cols-[1fr_auto] gap-4 p-3 border-b border-slate-border text-sm">
                    <span className="text-slate-300">Quick Change Block Type</span>
                    <kbd className="px-1.5 py-0.5 bg-slate-card rounded border border-slate-border text-xs text-slate-400 font-mono">Tab</kbd>
                  </div>
                  <div className="grid grid-cols-[1fr_auto] gap-4 p-3 border-b border-slate-border text-sm">
                    <span className="text-slate-300">Open Element Palette</span>
                    <kbd className="px-1.5 py-0.5 bg-slate-card rounded border border-slate-border text-xs text-slate-400 font-mono">Hold Alt</kbd>
                  </div>
                  <div className="grid grid-cols-[1fr_auto] gap-4 p-3 border-b border-slate-border text-sm">
                    <span className="text-slate-300">Navigate Element Palette</span>
                    <kbd className="px-1.5 py-0.5 bg-slate-card rounded border border-slate-border text-xs text-slate-400 font-mono">Alt + W/A/S/D</kbd>
                  </div>
                  <div className="grid grid-cols-[1fr_auto] gap-4 p-3 border-b border-slate-border text-sm">
                    <span className="text-slate-300">Undo / Redo</span>
                    <div className="flex gap-2">
                      <kbd className="px-1.5 py-0.5 bg-slate-card rounded border border-slate-border text-xs text-slate-400 font-mono">Ctrl Z</kbd>
                      <kbd className="px-1.5 py-0.5 bg-slate-card rounded border border-slate-border text-xs text-slate-400 font-mono">Ctrl Shift Z</kbd>
                    </div>
                  </div>
                  <div className="grid grid-cols-[1fr_auto] gap-4 p-3 border-b border-slate-border text-sm">
                    <span className="text-slate-300">Force new line (don't submit)</span>
                    <kbd className="px-1.5 py-0.5 bg-slate-card rounded border border-slate-border text-xs text-slate-400 font-mono">Shift Enter</kbd>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-sm font-bold text-synth-cyan mb-3 uppercase tracking-wider">Editor Controls</h3>
                <div className="bg-slate-bg rounded-lg border border-slate-border p-4 space-y-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded bg-slate-card border border-slate-border flex items-center justify-center shrink-0">
                      <GripVertical className="w-4 h-4 text-slate-muted" />
                    </div>
                    <div>
                      <div className="font-medium text-white text-sm">Drag to Reorder</div>
                      <p className="text-xs text-slate-400">Hover over any block in your script to reveal the handle on the left. Click and drag to reorder it.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded bg-slate-card border border-slate-border flex items-center justify-center shrink-0">
                      <StickyNote className="w-4 h-4 text-slate-muted" />
                    </div>
                    <div>
                      <div className="font-medium text-white text-sm">Add/Edit Notes</div>
                      <p className="text-xs text-slate-400">Attach invisible sticky notes to any block for your own reference. Notes appear as a small yellow icon.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded bg-slate-card border border-slate-border flex items-center justify-center shrink-0">
                      <Plus className="w-4 h-4 text-slate-muted" />
                    </div>
                    <div>
                      <div className="font-medium text-white text-sm">Insert Block</div>
                      <p className="text-xs text-slate-400">Quickly insert a new Action block directly beneath the hovered block.</p>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-sm font-bold text-synth-purple mb-3 uppercase tracking-wider">Features & Options</h3>
                <ul className="space-y-3 text-sm text-slate-300">
                  <li><strong>Focus Mode <span className="text-[10px] bg-slate-card px-1.5 py-0.5 rounded border border-slate-border ml-2"><Eye className="w-3 h-3 inline pb-0.5"/></span></strong><br/><span className="text-xs text-slate-400">Hides all UI elements for distraction-free writing. Only your script and the input bar remain.</span></li>
                  <li><strong>Type Colors <span className="text-[10px] bg-slate-card px-1.5 py-0.5 rounded border border-slate-border ml-2"><Type className="w-3 h-3 inline pb-0.5"/></span></strong><br/><span className="text-xs text-slate-400">Highlights different elements (Character, Action, Dialogue) in distinct synthwave colors to help you visualize pacing.</span></li>
                  <li><strong>Auto-Scroll <span className="text-[10px] bg-slate-card px-1.5 py-0.5 rounded border border-slate-border ml-2"><Settings className="w-3 h-3 inline pb-0.5"/></span></strong><br/><span className="text-xs text-slate-400">When enabled, the editor automatically scrolls to the bottom when you add new blocks.</span></li>
                  <li><strong>Metadata <span className="text-[10px] bg-slate-card px-1.5 py-0.5 rounded border border-slate-border ml-2"><Settings className="w-3 h-3 inline pb-0.5"/></span></strong><br/><span className="text-xs text-slate-400">Configure your script's Title, Author, Contact Info, and Watermark for the Title Page of your PDF.</span></li>
                  <li><strong>Scene Navigator & Statistics:</strong><br/><span className="text-xs text-slate-400">Jump instantly between scenes using the left sidebar. Click any block to view deep analytics (line counts, scene characters, read time) in the right sidebar.</span></li>
                  <li><strong>Offline First:</strong><br/><span className="text-xs text-slate-400">Everything saves locally to your browser instantly. Export to .slate to back up your files manually.</span></li>
                </ul>
              </section>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
