const fs = require('fs');
let code = fs.readFileSync('src/components/TopBar.tsx', 'utf8');

code = code.replace(
  "import { Download, FileUp, File as FileIcon, Settings, Save, FileText, Plus, Undo2, Redo2, Eye, Type, X, Film, GripVertical, StickyNote } from 'lucide-react';",
  "import { Download, FileUp, File as FileIcon, Settings, Save, FileText, Plus, Undo2, Redo2, Eye, Type, X, Film, GripVertical, StickyNote, Bug, Info, Send } from 'lucide-react';\nimport { db } from '../lib/firebase';\nimport { collection, addDoc, serverTimestamp } from 'firebase/firestore';"
);

code = code.replace(
  "const [showTutorial, setShowTutorial] = useState(false);",
  `const [showTutorial, setShowTutorial] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  const handleFeedbackSubmit = async () => {
    if (!feedbackText.trim()) return;
    setIsSubmittingFeedback(true);
    try {
      await addDoc(collection(db, 'feedback'), {
        text: feedbackText,
        userId: user?.uid || 'guest',
        userEmail: user?.email || 'guest',
        createdAt: serverTimestamp(),
        appVersion: '1.1.0'
      });
      setFeedbackSuccess(true);
      setTimeout(() => {
        setShowFeedback(false);
        setFeedbackSuccess(false);
        setFeedbackText('');
      }, 2000);
    } catch (e) {
      console.error('Error submitting feedback', e);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmittingFeedback(false);
    }
  };`
);

// Inject buttons next to help button
code = code.replace(
  /className=\{.*?w-7 h-7 rounded-full bg-slate-bg border border-slate-border flex items-center justify-center text-slate-muted hover:text-synth-cyan hover:border-synth-cyan transition-colors \$\{blocks\.length === 0 \? 'animate-pulse ring-2 ring-synth-cyan\/50 text-synth-cyan' : ''\}\}.*?\>/,
  `className={\`w-7 h-7 rounded-full bg-slate-bg border border-slate-border flex items-center justify-center text-slate-muted hover:text-synth-cyan hover:border-synth-cyan transition-colors \${blocks.length === 0 ? 'animate-pulse ring-2 ring-synth-cyan/50 text-synth-cyan' : ''}\`}
            title="Help / Tutorial"
          >
            ?
          </button>
          
          <button 
            onClick={() => setShowFeedback(true)}
            className="w-7 h-7 rounded-full bg-slate-bg border border-slate-border flex items-center justify-center text-slate-muted hover:text-synth-pink hover:border-synth-pink transition-colors"
            title="Report Bug / Feedback"
          >
            <Bug className="w-3.5 h-3.5" />
          </button>
          
          <button 
            onClick={() => setShowInfo(true)}
            className="w-7 h-7 rounded-full bg-slate-bg border border-slate-border flex items-center justify-center text-slate-muted hover:text-synth-purple hover:border-synth-purple transition-colors"
            title="App Info & Updates"
          >
            <Info className="w-3.5 h-3.5" />
          </button>
          
          {/* Hide original Help button content`
);
code = code.replace(
  /\>\n            \?\n          \<\/button\>\n          \<div className="flex items-center gap-4 text-xs/,
  `>\n          <div className="flex items-center gap-4 text-xs`
);

fs.writeFileSync('src/components/TopBar.tsx', code);
