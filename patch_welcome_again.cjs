const fs = require('fs');
let code = fs.readFileSync('src/components/WelcomeScreen.tsx', 'utf8');

// 1. Remove Top Bar Buttons
code = code.replace(
  /<a href="#features" className="hover:text-white transition-colors">Features<\/a>[\s\S]*?<\/div>/,
  '<a href="#features" className="hover:text-white transition-colors">Features</a>\n          </div>'
);

// 2. Change Buttons
code = code.replace("Start Writing for Free", "Start Writing (Login)");
code = code.replace("Try as Guest", "Start Writing (Guest)");

// 3. Change subtext
code = code.replace(
  "Free cloud sync included with account. No credit card required.",
  "100% Free forever. No trials, no paywalls, just writing."
);

// 4. Change Final CTA
code = code.replace(
  "Create Your Free Account",
  "Start Writing Now"
);

// 5. Add SEO Text
code = code.replace(
  /<\/div>\n\s*<\/div>\n\s*\);\n\}/,
  `</div>
      
      {/* SEO Footer */}
      <footer className="relative z-10 w-full bg-slate-bg border-t border-slate-border py-12 text-center text-slate-500 text-sm">
        <div className="max-w-4xl mx-auto px-6">
          <p className="mb-4">
            SimpleSlate is a <strong>free screenwriting software</strong> designed for maximum focus. 
            Whether you are writing a movie, a TV pilot, or a short film, our <strong>minimalist script writing app</strong> 
            helps you format your screenplay to industry standards automatically using Fountain syntax.
          </p>
          <p>
            No subscriptions, no paywalls, just a clean, offline-capable environment to write your next masterpiece.
          </p>
        </div>
      </footer>
    </div>
  );
}`
);

fs.writeFileSync('src/components/WelcomeScreen.tsx', code);
