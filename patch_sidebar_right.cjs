const fs = require('fs');
let code = fs.readFileSync('src/components/SidebarRight.tsx', 'utf8');

code = code.replace(
  "const { blocks, selectedBlockId, focusMode } = useSlateStore();",
  "const { blocks, selectedBlockId, focusMode, updateBlock } = useSlateStore();"
);

code = code.replace(
  `            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Block Type</div>
              <div className="text-xs font-medium text-white capitalize bg-slate-card px-2 py-1 rounded border border-slate-border inline-flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-synth-cyan"></span>
                {selectedBlock.type}
              </div>
            </div>`,
  `            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Block Type</div>
              <div className="relative group/dropdown">
                <select 
                  value={selectedBlock.type}
                  onChange={(e) => updateBlock(selectedBlock.id, { type: e.target.value as any })}
                  className="w-full appearance-none text-xs font-medium text-white capitalize bg-slate-card px-3 py-2 rounded-md border border-slate-border focus:outline-none focus:border-synth-cyan cursor-pointer transition-colors hover:bg-slate-bg/80"
                >
                  <option value="scene">Scene Heading</option>
                  <option value="action">Action</option>
                  <option value="character">Character</option>
                  <option value="dialogue">Dialogue</option>
                  <option value="parenthetical">Parenthetical</option>
                  <option value="transition">Transition</option>
                  <option value="shot">Shot</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-slate-400 group-hover/dropdown:text-synth-cyan transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>`
);

fs.writeFileSync('src/components/SidebarRight.tsx', code);
