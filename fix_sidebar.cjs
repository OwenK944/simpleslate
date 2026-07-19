const fs = require('fs');
let code = fs.readFileSync('src/components/SidebarRight.tsx', 'utf8');

code = code.replace(
  /<\/AnimatePresence>\n\s*<\/div>\n\s*<\/div>\n\s*<\/div>/,
  `                </AnimatePresence>
              </div>
            </div>`
);

fs.writeFileSync('src/components/SidebarRight.tsx', code);
