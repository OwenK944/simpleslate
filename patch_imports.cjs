const fs = require('fs');
let code = fs.readFileSync('src/components/DocumentEditor.tsx', 'utf8');

code = code.replace(
  "import { Reorder, useDragControls } from 'motion/react';",
  "import { Reorder, useDragControls, motion, AnimatePresence } from 'motion/react';"
);

fs.writeFileSync('src/components/DocumentEditor.tsx', code);
