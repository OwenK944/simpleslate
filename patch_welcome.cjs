const fs = require('fs');
let code = fs.readFileSync('src/components/WelcomeScreen.tsx', 'utf8');

// Add decorative background elements
code = code.replace(
  '<div className="min-h-screen bg-slate-bg flex flex-col font-sans text-slate-text overflow-y-auto custom-scrollbar">',
  `<div className="min-h-screen bg-slate-bg flex flex-col font-sans text-slate-text overflow-y-auto custom-scrollbar relative">
      {/* Immersive Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[600px] opacity-30 bg-gradient-to-b from-synth-purple/20 via-synth-cyan/5 to-transparent blur-3xl rounded-full mix-blend-screen pointer-events-none" />
        <motion.div 
          animate={{ y: [0, -20, 0], opacity: [0.3, 0.5, 0.3] }} 
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-40 left-[10%] w-64 h-64 bg-synth-cyan/10 blur-[100px] rounded-full" 
        />
        <motion.div 
          animate={{ y: [0, 30, 0], opacity: [0.2, 0.4, 0.2] }} 
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-60 right-[10%] w-80 h-80 bg-synth-pink/10 blur-[120px] rounded-full" 
        />
      </div>
      <div className="relative z-10 w-full flex flex-col items-center">`
);

code = code.replace(
  '</main>\n    </div>',
  '</main>\n      </div>\n    </div>'
);

// Add viewport animation to sections
code = code.replace(
  /<section className="w-full bg-slate-card\/30 border-y border-slate-border py-24">/g,
  '<motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6 }} className="w-full bg-slate-card/30 border-y border-slate-border py-24">'
);
code = code.replace(
  /<\/section>\n\n\s*\{\/\* Feature Grid \*\/\}/g,
  '</motion.section>\n\n        {/* Feature Grid */}'
);

code = code.replace(
  /<section className="w-full max-w-6xl mx-auto px-6 py-24">/g,
  '<motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6 }} className="w-full max-w-6xl mx-auto px-6 py-24">'
);

code = code.replace(
  /<\/section>\n\n\s*\{\/\* Footer CTA \*\/\}/g,
  '</motion.section>\n\n        {/* Footer CTA */}'
);

code = code.replace(
  /<section className="w-full bg-gradient-to-b from-slate-bg to-slate-card border-t border-slate-border py-20 text-center">/g,
  '<motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6 }} className="w-full bg-gradient-to-b from-slate-bg to-slate-card border-t border-slate-border py-20 text-center relative overflow-hidden">'
);
code = code.replace(
  /<h2 className="text-3xl font-bold text-white mb-8">Ready to write your next masterpiece\?<\/h2>/g,
  `<div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] opacity-20 bg-gradient-to-t from-synth-cyan/30 to-transparent blur-3xl rounded-full" />
          </div>
          <div className="relative z-10 max-w-3xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-white mb-8">Ready to write your next masterpiece?</h2>`
);
code = code.replace(
  /<\/div>\n\s*<\/section>/g,
  '</div>\n          </div>\n        </motion.section>'
);


fs.writeFileSync('src/components/WelcomeScreen.tsx', code);
