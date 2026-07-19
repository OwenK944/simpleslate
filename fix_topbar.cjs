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

code = code.replace(
  /className=\{\`w-7 h-7 rounded-full bg-slate-bg border border-slate-border flex items-center justify-center text-slate-muted hover:text-synth-cyan hover:border-synth-cyan transition-colors \$\{blocks\.length === 0 \? 'animate-pulse ring-2 ring-synth-cyan\/50 text-synth-cyan' : ''\}\`\}\n\s*title="Help \/ Tutorial"\n\s*\>\n\s*\<div className="flex items-center gap-4 text-xs font-mono text-slate-muted bg-slate-card px-3 py-1\.5 rounded-full border border-slate-border shadow-inner"\>/g,
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
          <div className="flex items-center gap-4 text-xs font-mono text-slate-muted bg-slate-card px-3 py-1.5 rounded-full border border-slate-border shadow-inner">`
);

// We need to inject the Info Modal and Feedback Modal at the end of the return statement before the last </div>
// Or just right after `showTutorial` rendering
code = code.replace(
  /\{showTutorial && \(/,
  `{showFeedback && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
          <div className="bg-slate-card rounded-xl shadow-2xl w-full max-w-md flex flex-col border border-slate-border text-slate-text">
            <div className="p-5 border-b border-slate-border flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="w-7 h-7 rounded bg-synth-pink/20 flex items-center justify-center text-synth-pink">
                  <Bug className="w-4 h-4" />
                </span>
                Report a Bug / Feedback
              </h2>
              <button onClick={() => setShowFeedback(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5">
              {feedbackSuccess ? (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mb-4">
                    <Send className="w-6 h-6" />
                  </div>
                  <h3 className="text-white font-medium">Feedback Sent!</h3>
                  <p className="text-sm text-slate-400 mt-2">Thank you for helping improve SimpleSlate.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <textarea
                    autoFocus
                    placeholder="Describe the bug or feature request..."
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    className="w-full h-32 bg-slate-bg border border-slate-border rounded-lg p-3 text-white focus:outline-none focus:border-synth-pink resize-none"
                  />
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => setShowFeedback(false)}
                      className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleFeedbackSubmit}
                      disabled={isSubmittingFeedback || !feedbackText.trim()}
                      className="px-4 py-2 bg-synth-pink text-white rounded-lg text-sm font-medium hover:bg-pink-500 disabled:opacity-50 flex items-center gap-2 transition-colors"
                    >
                      {isSubmittingFeedback ? 'Sending...' : 'Submit'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showInfo && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
          <div className="bg-slate-card rounded-xl shadow-2xl w-full max-w-md flex flex-col border border-slate-border text-slate-text">
            <div className="p-5 border-b border-slate-border flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="w-7 h-7 rounded bg-synth-purple/20 flex items-center justify-center text-synth-purple">
                  <Info className="w-4 h-4" />
                </span>
                About SimpleSlate
              </h2>
              <button onClick={() => setShowInfo(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <h3 className="text-white font-medium mb-1">Version Info</h3>
                <p className="text-sm text-slate-400 font-mono bg-slate-bg p-2 rounded-md border border-slate-border">Build: 1.1.0-alpha</p>
              </div>
              
              <div>
                <h3 className="text-white font-medium mb-2">Recently Added Features</h3>
                <ul className="text-sm text-slate-400 space-y-2 list-disc pl-5">
                  <li><strong>Type Dropdown:</strong> Easily switch block types via a new dropdown context menu.</li>
                  <li><strong>Focus Mode:</strong> Total distraction-free writing environment.</li>
                  <li><strong>Cloud Sync:</strong> Free accounts get 15 projects synced automatically.</li>
                  <li><strong>Feedback System:</strong> Submit bugs directly from the editor!</li>
                </ul>
              </div>

              <div>
                <h3 className="text-white font-medium mb-2">Credits</h3>
                <p className="text-sm text-slate-400">
                  Developed by <a href="#" className="text-synth-cyan hover:underline">Google AI Studio</a>. Made with love for screenwriters.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {showTutorial && (`
);

fs.writeFileSync('src/components/TopBar.tsx', code);
