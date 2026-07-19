const fs = require('fs');
let code = fs.readFileSync('src/components/DocumentEditor.tsx', 'utf8');

code = code.replace(
  "const [isEditingNote, setIsEditingNote] = useState(false);",
  "const [isEditingNote, setIsEditingNote] = useState(false);\n  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);\n  const typeOptions = ['scene', 'action', 'character', 'dialogue', 'parenthetical', 'transition', 'shot'];"
);

code = code.replace(
  /\<button \n\s*onPointerDown=\{.*?drag to reorder"/,
  `{/* Type Dropdown */}
        <div className="relative" onMouseLeave={() => setIsTypeDropdownOpen(false)}>
          <button 
            onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
            className="p-1.5 px-2 text-[10px] text-slate-400 hover:text-synth-cyan transition-colors bg-slate-bg rounded-md border border-slate-border shadow-sm flex-shrink-0 uppercase font-mono w-14 text-center tracking-wider"
            title="Change block type"
          >
            {block.type.substring(0, 3)}
          </button>
          
          <AnimatePresence>
            {isTypeDropdownOpen && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.1 }}
                className="absolute top-full left-0 mt-1 w-32 bg-slate-card border border-slate-border rounded-lg shadow-xl z-50 py-1 overflow-hidden"
              >
                {typeOptions.map(t => (
                  <button 
                    key={t} 
                    onClick={() => { updateBlock(block.id, { type: t }); setIsTypeDropdownOpen(false); }} 
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-bg/80 text-[11px] text-slate-300 uppercase font-mono flex items-center gap-2"
                  >
                    {block.type === t ? <span className="w-1.5 h-1.5 rounded-full bg-synth-cyan" /> : <span className="w-1.5 h-1.5" />}
                    {t}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button 
          onPointerDown={(e) => controls.start(e)}
          className="p-1.5 text-slate-muted hover:text-white cursor-grab active:cursor-grabbing bg-slate-bg rounded-md border border-slate-border shadow-sm flex-shrink-0"
          title="Drag to reorder"`
);

fs.writeFileSync('src/components/DocumentEditor.tsx', code);
