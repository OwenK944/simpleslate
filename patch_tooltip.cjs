const fs = require('fs');
let code = fs.readFileSync('src/components/DocumentEditor.tsx', 'utf8');

code = code.replace(
  "{block.type.substring(0, 3)}",
  `{block.type.substring(0, 3)}
            {!hasSeenHint && index === 0 && (
              <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-max bg-synth-cyan text-slate-900 text-[10px] font-bold px-2 py-1 rounded shadow-lg z-50 animate-bounce pointer-events-none after:content-[''] after:absolute after:-top-1 after:left-1/2 after:-translate-x-1/2 after:border-[4px] after:border-transparent after:border-b-synth-cyan">
                Click to change type
              </div>
            )}`
);

fs.writeFileSync('src/components/DocumentEditor.tsx', code);
