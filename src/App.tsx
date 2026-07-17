/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TopBar } from './components/TopBar';
import { DocumentEditor } from './components/DocumentEditor';
import { BottomInput } from './components/BottomInput';
import { SceneNav } from './components/SceneNav';
import { SidebarRight } from './components/SidebarRight';
import { useSlateStore } from './store';
import { cn } from './lib/utils';

export default function App() {
  const { focusMode } = useSlateStore();
  
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
