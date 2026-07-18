import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../lib/auth';
import { useSlateStore } from '../store';
import { getProjects, createProject, updateProject, deleteProject, Project } from '../lib/projects';
import { auth, signOut } from '../lib/firebase';
import { Film, LogOut, Plus, FileText, Trash2, Clock, Upload, Cloud } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatDistanceToNow } from 'date-fns';

export function Dashboard() {
  const { user } = useAuthStore();
  const { setView, loadScript, setCurrentProjectId, clearScript, currentProjectId, blocks, metadata } = useSlateStore();
  const { clear } = useSlateStore.temporal.getState();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [conflictProject, setConflictProject] = useState<Project | null>(null);

  useEffect(() => {
    if (!user) {
      setView('welcome');
      return;
    }
    
    // Auto-save the current script if we're coming from the editor to the dashboard
    const autoSave = async () => {
      if (currentProjectId && blocks.length > 0) {
        try {
          await updateProject(currentProjectId, metadata, blocks);
        } catch (e) {
          console.error("Auto-save failed on dashboard entry", e);
        }
      }
    };
    
    const fetchProjects = async () => {
      try {
        await autoSave();
        const p = await getProjects(user.uid);
        setProjects(p);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProjects();
  }, [user, setView]);

  const handleSignOut = async () => {
    await signOut(auth);
    setView('welcome');
  };

  const handleNewProject = () => {
    clearScript();
    clear();
    setCurrentProjectId(null);
    setView('editor');
    useSlateStore.getState().setShowScriptSetup(true);
  };

  const handleOpenProject = (project: Project) => {
    const state = useSlateStore.getState();
    const isSameProject = state.currentProjectId === project.id;
    const cloudTime = project.updatedAt?.toMillis ? project.updatedAt.toMillis() : 0;
    
    // If the browser was editing THIS project, and its local save timestamp is newer than cloud
    if (isSameProject && state.lastLocalSave > cloudTime + 5000) { // 5s buffer
      setConflictProject(project);
      return;
    }
    
    loadScript(project.metadata, project.blocks);
    clear(); 
    setCurrentProjectId(project.id);
    setView('editor');
  };

  const resolveConflict = (choice: 'cloud' | 'browser') => {
    if (!conflictProject) return;
    
    if (choice === 'cloud') {
      // Overwrite local with cloud
      loadScript(conflictProject.metadata, conflictProject.blocks);
      clear();
      setCurrentProjectId(conflictProject.id);
      setView('editor');
    } else {
      // Keep browser (local), auto-save it to cloud, and go to editor
      updateProject(conflictProject.id, metadata, blocks).catch(e => console.error(e));
      setView('editor');
    }
    
    setConflictProject(null);
  };

  const executeDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await deleteProject(deleteConfirmId);
      setProjects(projects.filter(p => p.id !== deleteConfirmId));
      if (currentProjectId === deleteConfirmId) {
        setCurrentProjectId(null);
        clearScript();
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setDeleteConfirmId(null);
    }
  };

  // Allow importing a slate file directly from dashboard
  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.slate';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          if (data.metadata && data.blocks) {
            loadScript(data.metadata, data.blocks);
            clear();
            setCurrentProjectId(null); // It's not in the cloud yet
            setView('editor');
            useSlateStore.getState().setShowScriptSetup(true);
          }
        } catch (err) {
          alert("Invalid .slate file");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-bg flex items-center justify-center text-synth-cyan">Loading projects...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-bg flex flex-col text-slate-text">
      <header className="h-16 border-b border-slate-border bg-slate-card/50 flex items-center justify-between px-8">
        <div className="font-bold text-xl tracking-tighter text-white flex items-center gap-2">
          <Film className="w-6 h-6 text-synth-purple drop-shadow-[0_0_10px_rgba(176,38,255,0.5)]" />
          SimpleSlate <span className="text-sm font-normal text-slate-400 ml-2">Projects</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-400">{user?.email}</span>
          <button onClick={handleSignOut} className="text-slate-400 hover:text-white transition-colors" title="Sign Out">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Your Scripts</h1>
            <p className="text-sm text-slate-400">
              {projects.length} / 15 cloud projects used
            </p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={handleImport}
              className="px-4 py-2 bg-slate-card border border-slate-border rounded-lg text-white hover:text-synth-cyan hover:border-synth-cyan transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <Upload className="w-4 h-4" />
              Import .slate
            </button>
            <button 
              onClick={handleNewProject}
              className="px-4 py-2 bg-synth-purple text-white rounded-lg hover:bg-synth-pink transition-colors flex items-center gap-2 text-sm font-medium shadow-[0_0_10px_rgba(176,38,255,0.3)]"
            >
              <Plus className="w-4 h-4" />
              New Script
            </button>
          </div>
        </div>

        {error && <div className="text-synth-pink mb-4 p-4 bg-synth-pink/10 rounded-lg border border-synth-pink/20">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <motion.div
              key={project.id}
              whileHover={{ y: -4 }}
              onClick={() => handleOpenProject(project)}
              className="bg-slate-card border border-slate-border rounded-xl p-5 cursor-pointer hover:border-synth-cyan hover:shadow-[0_8px_30px_rgba(0,255,255,0.1)] transition-all group relative flex flex-col h-48"
            >
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-white text-lg line-clamp-2 pr-6">{project.metadata.title || "Untitled"}</h3>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(project.id); }}
                    className="absolute top-5 right-5 text-slate-500 hover:text-synth-pink opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    title="Delete project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-slate-400 line-clamp-1">{project.metadata.author || "Unknown Author"}</p>
              </div>
              
              <div className="flex items-center justify-between text-xs text-slate-500 mt-4 pt-4 border-t border-slate-border/50">
                <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5"/> {project.blocks.length} blocks</span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5"/> {project.updatedAt?.toDate ? formatDistanceToNow(project.updatedAt.toDate(), {addSuffix: true}) : 'Just now'}</span>
              </div>
            </motion.div>
          ))}
          
          {projects.length === 0 && (
            <div className="col-span-full py-16 text-center border-2 border-dashed border-slate-border rounded-xl flex flex-col items-center text-slate-400">
              <FileText className="w-12 h-12 mb-4 opacity-50" />
              <p>You don't have any cloud projects yet.</p>
              <p className="text-sm mt-1">Create a new script or import a .slate file to get started.</p>
            </div>
          )}
        </div>
      </main>

      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-card rounded-xl shadow-2xl w-full max-w-md p-6 border border-slate-border text-slate-text"
            >
              <h2 className="text-xl font-bold text-white mb-2 text-synth-pink">Delete Project?</h2>
              <p className="text-sm text-slate-400 mb-6">This will permanently delete this project from the cloud. This action cannot be undone.</p>
              <div className="flex flex-col gap-2">
                <button 
                  onClick={executeDelete} 
                  className="w-full px-4 py-2 bg-synth-pink/20 text-synth-pink border border-synth-pink/50 rounded-lg hover:bg-synth-pink/30 transition-colors font-medium text-sm"
                >
                  Delete Permanently
                </button>
                <button 
                  onClick={() => setDeleteConfirmId(null)} 
                  className="w-full px-4 py-2 text-slate-400 hover:text-white transition-colors font-medium text-sm mt-2"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {conflictProject && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-card rounded-xl shadow-2xl w-full max-w-lg p-6 border border-slate-border text-slate-text"
            >
              <h2 className="text-xl font-bold text-white mb-2 text-synth-cyan">Version Conflict</h2>
              <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                Your browser has a newer unsaved version of <strong>{conflictProject.metadata.title || 'this script'}</strong> than what is currently in the cloud. Which version would you like to load?
              </p>
              <div className="flex flex-col gap-4">
                <button 
                  onClick={() => resolveConflict('cloud')} 
                  className="w-full text-left px-5 py-4 bg-slate-bg border border-slate-border hover:border-synth-purple rounded-xl transition-colors group"
                >
                  <div className="flex items-center gap-3 mb-1">
                    <Cloud className="w-5 h-5 text-synth-purple" />
                    <span className="font-bold text-white text-base">Load Cloud Version</span>
                  </div>
                  <p className="text-xs text-slate-400 ml-8 group-hover:text-slate-300">
                    Discard local changes and load the version from {conflictProject.updatedAt?.toDate ? formatDistanceToNow(conflictProject.updatedAt.toDate(), {addSuffix: true}) : 'the cloud'}.
                  </p>
                </button>
                
                <button 
                  onClick={() => resolveConflict('browser')} 
                  className="w-full text-left px-5 py-4 bg-slate-bg border border-slate-border hover:border-synth-cyan rounded-xl transition-colors group"
                >
                  <div className="flex items-center gap-3 mb-1">
                    <FileText className="w-5 h-5 text-synth-cyan" />
                    <span className="font-bold text-white text-base">Keep Browser Version</span>
                  </div>
                  <p className="text-xs text-slate-400 ml-8 group-hover:text-slate-300">
                    Keep your unsaved local changes and automatically sync them to the cloud.
                  </p>
                </button>

                <div className="text-center mt-2">
                  <button 
                    onClick={() => setConflictProject(null)} 
                    className="text-xs text-slate-500 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
