const fs = require('fs');
let code = fs.readFileSync('src/components/SidebarRight.tsx', 'utf8');

if (!code.includes("useState")) {
  code = code.replace("import React from 'react';", "import React, { useState } from 'react';\nimport { motion, AnimatePresence } from 'motion/react';\nimport { ChevronDown } from 'lucide-react';");
}

code = code.replace(
  "export function SidebarRight() {",
  "export function SidebarRight() {\n  const [isDropdownOpen, setIsDropdownOpen] = useState(false);\n  const blockTypes = ['scene', 'action', 'character', 'dialogue', 'parenthetical', 'transition', 'shot'];\n  const typeLabels: Record<string, string> = {\n    scene: 'Scene Heading',\n    action: 'Action',\n    character: 'Character',\n    dialogue: 'Dialogue',\n    parenthetical: 'Parenthetical',\n    transition: 'Transition',\n    shot: 'Shot'\n  };"
);

code = code.replace(
  /<div className="relative group\/dropdown">[\s\S]*?<\/div>\s*<\/div>/,
  `<div className="relative" onMouseLeave={() => setIsDropdownOpen(false)}>
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
            </div>`
);

fs.writeFileSync('src/components/SidebarRight.tsx', code);
