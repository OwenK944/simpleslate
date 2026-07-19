const fs = require('fs');
let code = fs.readFileSync('src/components/TopBar.tsx', 'utf8');

code = code.replace(
  /<div>\s*<h3 className="text-white font-medium mb-2">Credits<\/h3>\s*<p className="text-sm text-slate-400">\s*Developed by <a href="#" className="text-synth-cyan hover:underline">Google AI Studio<\/a>\. Made with love for screenwriters\.\s*<\/p>\s*<\/div>/,
  ""
);

fs.writeFileSync('src/components/TopBar.tsx', code);
