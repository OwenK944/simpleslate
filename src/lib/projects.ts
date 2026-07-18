import { db } from './firebase';
import { collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy, serverTimestamp, limit } from 'firebase/firestore';
import { ScriptBlock, ScriptMetadata } from '../types';

export interface Project {
  id: string;
  userId: string;
  title: string;
  metadata: ScriptMetadata;
  blocks: ScriptBlock[];
  createdAt: any;
  updatedAt: any;
}

export const getProjects = async (userId: string): Promise<Project[]> => {
  const q = query(
    collection(db, 'projects'),
    where('userId', '==', userId),
    orderBy('updatedAt', 'desc'),
    limit(15)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Project[];
};

export const createProject = async (userId: string, metadata: ScriptMetadata, blocks: ScriptBlock[]): Promise<string> => {
  // Check limit before creating
  const q = query(collection(db, 'projects'), where('userId', '==', userId));
  const snapshot = await getDocs(q);
  if (snapshot.size >= 15) {
    throw new Error("You have reached the maximum limit of 15 projects on the free tier.");
  }

  const docRef = await addDoc(collection(db, 'projects'), {
    userId,
    title: metadata.title,
    metadata,
    blocks,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

export const updateProject = async (projectId: string, metadata: ScriptMetadata, blocks: ScriptBlock[]): Promise<void> => {
  const projectRef = doc(db, 'projects', projectId);
  await updateDoc(projectRef, {
    title: metadata.title,
    metadata,
    blocks,
    updatedAt: serverTimestamp(),
  });
};

export const deleteProject = async (projectId: string): Promise<void> => {
  const projectRef = doc(db, 'projects', projectId);
  await deleteDoc(projectRef);
};
