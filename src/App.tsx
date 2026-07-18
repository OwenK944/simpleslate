/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import { TopBar } from './components/TopBar';
import { DocumentEditor } from './components/DocumentEditor';
import { BottomInput } from './components/BottomInput';
import { SceneNav } from './components/SceneNav';
import { SidebarRight } from './components/SidebarRight';
import { WelcomeScreen } from './components/WelcomeScreen';
import { Dashboard } from './components/Dashboard';
import { useSlateStore } from './store';
import { useAuthStore } from './lib/auth';
import { auth } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { cn } from './lib/utils';

export default function App() {
  const { focusMode, view } = useSlateStore();
  const { setUser, setLoading } = useAuthStore();
  
  useEffect(() => {
    if (view === 'welcome') {
      document.title = 'SimpleSlate - Free Screenwriting Software';
    } else if (view === 'dashboard') {
      document.title = 'SimpleSlate Projects';
    } else if (view === 'editor') {
      document.title = 'SimpleSlate Editor';
    }
  }, [view]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [setUser, setLoading]);

  if (view === 'welcome') {
    return <WelcomeScreen />;
  }

  if (view === 'dashboard') {
    return <Dashboard />;
  }
  
  return (
    <div className="min-h-screen bg-slate-bg font-sans text-slate-text flex overflow-hidden">
      <TopBar />
      <div className={cn("flex w-full", !focusMode ? "pt-14" : "")}>
        <SceneNav />
        <main className={cn("flex-1 flex overflow-y-auto scroll-smooth relative", !focusMode ? "h-[calc(100vh-3.5rem)]" : "h-screen")}>
          <div className="flex-1 max-w-[850px] mx-auto">
            <DocumentEditor />
          </div>
          <SidebarRight />
        </main>
      </div>
      <BottomInput />
    </div>
  );
}
