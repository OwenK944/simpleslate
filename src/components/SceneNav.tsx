import React, { useState } from 'react';
import { useSlateStore } from '../store';
import { Clapperboard, GripVertical } from 'lucide-react';
import { cn } from '../lib/utils';

export function SceneNav() {
  const { blocks, focusMode, moveScene } = useSlateStore();
  const scenes = blocks.filter(b => b.type === 'scene');
  const [draggedScene, setDraggedScene] = useState<string | null>(null);

  if (focusMode || scenes.length === 0) return null;

  return (
    <div className="w-64 border-r border-slate-border bg-slate-bg/50 backdrop-blur shrink-0 hidden md:flex flex-col h-full z-10">
      <div className="p-4 text-xs font-semibold uppercase tracking-widest text-slate-muted border-b border-slate-border">
        Scenes
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {scenes.map((scene, idx) => (
          <SceneItem 
            key={scene.id} 
            scene={scene} 
            idx={idx} 
            draggedScene={draggedScene}
            setDraggedScene={setDraggedScene}
            moveScene={moveScene}
          />
        ))}
      </div>
    </div>
  );
}

function SceneItem({ scene, idx, draggedScene, setDraggedScene, moveScene }: any) {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    setDraggedScene(scene.id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedScene && draggedScene !== scene.id) {
      moveScene(draggedScene, scene.id);
    }
    setDraggedScene(null);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={cn(
        "w-full text-left px-2 py-2 text-sm text-slate-text/70 hover:text-synth-cyan hover:bg-slate-card rounded-md transition-colors flex items-start gap-2 group cursor-pointer border border-transparent",
        draggedScene === scene.id ? "opacity-50" : ""
      )}
      onClick={() => {
        const el = document.getElementById(`block-${scene.id}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }}
    >
      <button className="cursor-grab active:cursor-grabbing p-0.5 hover:text-white shrink-0 mt-0.5 opacity-50 group-hover:opacity-100">
        <GripVertical className="w-3.5 h-3.5" />
      </button>
      <div className="flex flex-col">
        <span className="text-[10px] font-bold text-slate-500 mb-0.5 uppercase tracking-wider">Scene {idx + 1}</span>
        <span className="line-clamp-2 leading-tight font-medium">
          {scene.content || 'UNTITLED SCENE'}
        </span>
      </div>
    </div>
  );
}
