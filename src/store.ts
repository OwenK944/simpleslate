import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { temporal } from 'zundo';
import { v4 as uuidv4 } from 'uuid';
import { ScriptBlock, ScriptMetadata, BlockType } from './types';

interface SlateStore {
  metadata: ScriptMetadata;
  blocks: ScriptBlock[];
  autoScroll: boolean;
  showTypeColors: boolean;
  focusMode: boolean;
  hasSeenSaveIndicator: boolean;
  selectedBlockId: string | null;
  
  // Actions
  setMetadata: (metadata: Partial<ScriptMetadata>) => void;
  addBlock: (block: Omit<ScriptBlock, 'id'>, index?: number) => void;
  updateBlock: (id: string, updates: Partial<Omit<ScriptBlock, 'id'>>) => void;
  deleteBlock: (id: string) => void;
  reorderBlocks: (newBlocks: ScriptBlock[]) => void;
  moveScene: (sceneId: string, targetSceneId: string) => void;
  loadScript: (metadata: ScriptMetadata, blocks: ScriptBlock[]) => void;
  clearScript: () => void;
  toggleAutoScroll: () => void;
  setShowTypeColors: (show: boolean) => void;
  setFocusMode: (focus: boolean) => void;
  setHasSeenSaveIndicator: (seen: boolean) => void;
  setSelectedBlockId: (id: string | null) => void;
}

const defaultMetadata: ScriptMetadata = {
  title: 'UNTITLED SCREENPLAY',
  author: 'Author Name',
  draftDate: new Date().toLocaleDateString(),
};

export const useSlateStore = create<SlateStore>()(
  persist(
    temporal(
      (set, get) => ({
        metadata: defaultMetadata,
        blocks: [],
        autoScroll: true,
        showTypeColors: false,
        focusMode: false,
        hasSeenSaveIndicator: false,
        selectedBlockId: null,
        
        setMetadata: (metadata) => set((state) => ({ 
          metadata: { ...state.metadata, ...metadata } 
        })),
        
        addBlock: (block, index) => set((state) => {
          const newBlock = { ...block, id: uuidv4() };
          const newBlocks = [...state.blocks];
          if (index !== undefined) {
            newBlocks.splice(index, 0, newBlock);
          } else {
            newBlocks.push(newBlock);
          }
          return { blocks: newBlocks };
        }),
        
        updateBlock: (id, updates) => set((state) => ({
          blocks: state.blocks.map(b => b.id === id ? { ...b, ...updates } : b)
        })),
        
        deleteBlock: (id) => set((state) => ({
          blocks: state.blocks.filter(b => b.id !== id)
        })),
        
        reorderBlocks: (newBlocks) => set({ blocks: newBlocks }),

        moveScene: (sceneId, targetSceneId) => set((state) => {
          if (sceneId === targetSceneId) return { blocks: state.blocks };
          
          const blocks = [...state.blocks];
          const sceneIndex = blocks.findIndex(b => b.id === sceneId);
          const targetIndex = blocks.findIndex(b => b.id === targetSceneId);
          
          if (sceneIndex === -1 || targetIndex === -1) return { blocks };

          // Find end of the scene being moved
          let sceneEndIndex = sceneIndex + 1;
          while (sceneEndIndex < blocks.length && blocks[sceneEndIndex].type !== 'scene') {
            sceneEndIndex++;
          }
          
          // Extract the scene and its blocks
          const sceneBlocks = blocks.splice(sceneIndex, sceneEndIndex - sceneIndex);
          
          // Re-calculate target index after removal
          const newTargetIndex = blocks.findIndex(b => b.id === targetSceneId);
          
          // Insert at new location
          // If we are moving it downwards, and want to place it *after* target scene, we could just insert at targetIndex
          // Wait, Reorder components usually give the new order.
          blocks.splice(newTargetIndex >= 0 ? newTargetIndex : blocks.length, 0, ...sceneBlocks);
          
          return { blocks };
        }),
        
        loadScript: (metadata, blocks) => set({ metadata, blocks }),
        
        clearScript: () => set({ metadata: defaultMetadata, blocks: [] }),

        toggleAutoScroll: () => set((state) => ({ autoScroll: !state.autoScroll })),
        setShowTypeColors: (show) => set({ showTypeColors: show }),
        setFocusMode: (focus) => set({ focusMode: focus }),
        setHasSeenSaveIndicator: (seen) => set({ hasSeenSaveIndicator: seen }),
        setSelectedBlockId: (id) => set({ selectedBlockId: id })
      }),
      {
        partialize: (state) => {
          return { blocks: state.blocks, metadata: state.metadata };
        },
        equality: (pastState, currentState) => {
          return pastState.blocks === currentState.blocks && pastState.metadata === currentState.metadata;
        }
      }
    ),
    {
      name: 'simpleslate-storage',
      partialize: (state) => ({
        metadata: state.metadata,
        blocks: state.blocks,
        autoScroll: state.autoScroll,
        showTypeColors: state.showTypeColors,
        hasSeenSaveIndicator: state.hasSeenSaveIndicator
      })
    }
  )
);
