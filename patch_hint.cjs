const fs = require('fs');
let code = fs.readFileSync('src/components/DocumentEditor.tsx', 'utf8');

code = code.replace(
  "const typeOptions = ['scene', 'action', 'character', 'dialogue', 'parenthetical', 'transition', 'shot'];",
  "const typeOptions = ['scene', 'action', 'character', 'dialogue', 'parenthetical', 'transition', 'shot'];\n  const [hasSeenHint, setHasSeenHint] = useState(() => localStorage.getItem('hasSeenTypeDropdownHint') === 'true');"
);

code = code.replace(
  "onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}",
  "onClick={() => { setIsTypeDropdownOpen(!isTypeDropdownOpen); if (!hasSeenHint) { localStorage.setItem('hasSeenTypeDropdownHint', 'true'); setHasSeenHint(true); } }}"
);

code = code.replace(
  "className=\"p-1.5 px-2 text-[10px] text-slate-400 hover:text-synth-cyan transition-colors bg-slate-bg rounded-md border border-slate-border shadow-sm flex-shrink-0 uppercase font-mono w-14 text-center tracking-wider\"",
  "className={`p-1.5 px-2 text-[10px] transition-colors bg-slate-bg rounded-md border shadow-sm flex-shrink-0 uppercase font-mono w-14 text-center tracking-wider relative ${!hasSeenHint && index === 0 ? 'text-synth-cyan border-synth-cyan animate-pulse ring-2 ring-synth-cyan/30' : 'text-slate-400 border-slate-border hover:text-synth-cyan'}`}"
);

// We need to make sure AnimatePresence is imported in DocumentEditor.tsx if it isn't already.
if (!code.includes("AnimatePresence")) {
  code = code.replace("import { motion } from 'motion/react';", "import { motion, AnimatePresence } from 'motion/react';");
}

fs.writeFileSync('src/components/DocumentEditor.tsx', code);
