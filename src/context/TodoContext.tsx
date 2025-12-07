import React, { createContext, useContext, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { isSameDay, subDays, parseISO, startOfDay, isBefore } from 'date-fns';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { collection, query, onSnapshot, doc, setDoc, deleteDoc, updateDoc, writeBatch } from 'firebase/firestore';

export type TaskType = 'today' | 'tomorrow';
export type Priority = 'normal' | 'medium' | 'urgent';

export interface Task {
    id: string;
    text: string;
    completed: boolean;
    priority: Priority;
    recurring: boolean;
    type: TaskType;
    date: string; // ISO date string
    category?: string;
    completedAt?: string; // ISO date string
    createdAt: number;
}

interface TodoContextType {
    user: User | null;
    loading: boolean;
    tasks: Task[];
    history: Task[];
    folders: string[];
    addTask: (text: string, type: TaskType, priority: Priority, recurring: boolean, category?: string) => void;
    toggleTask: (id: string) => void;
    deleteTask: (id: string) => void;
    updateTask: (id: string, text: string) => void;
    togglePriority: (id: string) => void;
    toggleRecurring: (id: string) => void;
    moveTaskToType: (id: string, type: TaskType) => void;
    addFolder: (name: string) => void;
    deleteFolder: (name: string) => void;
    logout: () => void;
    stats: {
        streak: number;
        totalCompleted: number;
        lastActiveDate: string | null;
    };
}

const TodoContext = createContext<TodoContextType | undefined>(undefined);

export function TodoProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [tasks, setTasks] = useState<Task[]>([]); // Active tasks
    const [history, setHistory] = useState<Task[]>([]); // Completed tasks
    const [folders, setFolders] = useState<string[]>([]);
    const [stats, setStats] = useState({ streak: 0, totalCompleted: 0, lastActiveDate: null as string | null });

    // 1. Auth Listener
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            setAuthLoading(false);

            // Optional: Migration logic could go here if we want to sync local to cloud on first login
        });
        return () => unsubscribe();
    }, []);

    // 2. Data Listener (Firestore)
    useEffect(() => {
        if (!user) {
            setTasks([]);
            setHistory([]);
            setFolders([]);
            return;
        }

        // Listen to Tasks Collection
        const tasksRef = collection(db, 'users', user.uid, 'tasks');
        const q = query(tasksRef);

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const allTasks = snapshot.docs.map(doc => doc.data() as Task);

            // Logic to separate Active vs History
            const active = allTasks.filter(t => !t.completed);
            const completed = allTasks.filter(t => t.completed);

            // Sort active methods (optional, or rely on client sort)
            // Note: Types stored in Firestore might need migration if coming from local

            // Migration check: 'tomorrow' tasks moving to 'today'
            const today = startOfDay(new Date());
            active.forEach(t => {
                if (t.type === 'tomorrow') {
                    const taskDate = parseISO(t.date);
                    if (isBefore(taskDate, today)) {
                        // Need to update this task in Firestore
                        updateDoc(doc(db, 'users', user.uid, 'tasks', t.id), { type: 'today' });
                    }
                }
            });

            setTasks(active);
            setHistory(completed);

            // Derive Folders from unique categories in ALL tasks (or separate collection)
            // For now, let's keep folders in a separate doc to persist empty folders, 
            // OR just derive them. 
            // The previous app allowed empty folders. Let's create a 'settings' doc listeners if needed.
            // For MVP: Let's fetch folders from a 'metadata' doc.
        });

        // Listen to Metadata (Folders & Stats)
        const metaRef = doc(db, 'users', user.uid, 'data', 'metadata');
        const unsubMeta = onSnapshot(metaRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setFolders(data.folders || []);
                setStats(data.stats || { streak: 0, totalCompleted: 0, lastActiveDate: null });
            } else {
                // Initialize default metadata if not exists
                setDoc(metaRef, { folders: [], stats: { streak: 0, totalCompleted: 0, lastActiveDate: null } });
            }
        });

        return () => {
            unsubscribe();
            unsubMeta();
        };
    }, [user]);

    // Actions


    const addFolder = async (name: string) => {
        if (!user || folders.includes(name)) return;
        const newFolders = [...folders, name];
        await setDoc(doc(db, 'users', user.uid, 'data', 'metadata'), { folders: newFolders, stats }, { merge: true });
    };

    const deleteFolder = async (name: string) => {
        if (!user) return;
        const newFolders = folders.filter(f => f !== name);
        // Also update tasks? - Logic: Remove category from tasks
        // Batch update
        const batch = writeBatch(db);
        // Update metadata
        batch.set(doc(db, 'users', user.uid, 'data', 'metadata'), { folders: newFolders, stats }, { merge: true });

        // Find tasks with this category
        const tasksToUpdate = [...tasks, ...history].filter(t => t.category === name);
        tasksToUpdate.forEach(t => {
            batch.update(doc(db, 'users', user.uid, 'tasks', t.id), { category: null }); // or DELETE field
        });

        await batch.commit();
    };

    const addTask = async (text: string, type: TaskType, priority: Priority, recurring: boolean, category?: string) => {
        if (!user) return;
        const newTask: Task = {
            id: uuidv4(),
            text,
            completed: false,
            priority,
            recurring,
            type,
            category: category || undefined,
            date: new Date().toISOString(),
            createdAt: Date.now(),
        };
        await setDoc(doc(db, 'users', user.uid, 'tasks', newTask.id), newTask);
    };

    const toggleTask = async (id: string) => {
        if (!user) return;
        const task = [...tasks, ...history].find(t => t.id === id);
        if (!task) return;

        if (!task.completed) {
            // Completing...
            const now = new Date();
            const today = startOfDay(now);
            const completedAt = now.toISOString();

            // Stats & Streak Logic
            let newStreak = stats.streak;
            let newTotal = stats.totalCompleted + 1;
            const lastActive = stats.lastActiveDate ? parseISO(stats.lastActiveDate) : null;
            let newLastActive = today.toISOString();

            if (!lastActive) {
                newStreak = 1;
            } else if (isSameDay(lastActive, subDays(today, 1))) {
                newStreak += 1;
            } else if (isSameDay(lastActive, today)) {
                newStreak = stats.streak; // No change
            } else {
                newStreak = 1; // Broken
            }

            const batch = writeBatch(db);

            // 1. Update/Move Task
            if (task.recurring) {
                // Create NEXT task
                const nextTask: Task = {
                    ...task,
                    id: uuidv4(),
                    completed: false,
                    type: 'tomorrow',
                    date: now.toISOString(),
                    createdAt: Date.now(),
                    completedAt: undefined
                };
                batch.set(doc(db, 'users', user.uid, 'tasks', nextTask.id), nextTask);
                // Mark current as completed
                batch.update(doc(db, 'users', user.uid, 'tasks', task.id), { completed: true, completedAt });
            } else {
                batch.update(doc(db, 'users', user.uid, 'tasks', task.id), { completed: true, completedAt });
            }

            // 2. Update Stats
            batch.set(doc(db, 'users', user.uid, 'data', 'metadata'), {
                folders,
                stats: { streak: newStreak, totalCompleted: newTotal, lastActiveDate: newLastActive }
            }, { merge: true });

            await batch.commit();

        } else {
            // Un-completing
            const batch = writeBatch(db);
            batch.update(doc(db, 'users', user.uid, 'tasks', task.id), { completed: false, completedAt: null });
            // Revert stats? Complicated to revert streak accurately without history log. 
            // Simple approach: Decrement total, maybe don't touch streak to avoid bugs.
            batch.set(doc(db, 'users', user.uid, 'data', 'metadata'), {
                folders,
                stats: { ...stats, totalCompleted: Math.max(0, stats.totalCompleted - 1) }
            }, { merge: true });
            await batch.commit();
        }
    };

    const deleteTask = async (id: string) => {
        if (!user) return;
        await deleteDoc(doc(db, 'users', user.uid, 'tasks', id));
    };

    const updateTask = async (id: string, text: string) => {
        if (!user) return;
        await updateDoc(doc(db, 'users', user.uid, 'tasks', id), { text });
    };

    const togglePriority = async (id: string) => {
        if (!user) return;
        const task = [...tasks, ...history].find(t => t.id === id);
        if (!task) return;
        const nextP = task.priority === 'urgent' ? 'normal' : task.priority === 'medium' ? 'urgent' : 'medium';
        await updateDoc(doc(db, 'users', user.uid, 'tasks', id), { priority: nextP });
    };

    const toggleRecurring = async (id: string) => {
        if (!user) return;
        const task = [...tasks, ...history].find(t => t.id === id);
        if (!task) return;
        await updateDoc(doc(db, 'users', user.uid, 'tasks', id), { recurring: !task.recurring });
    };

    const moveTaskToType = async (id: string, type: TaskType) => {
        if (!user) return;
        await updateDoc(doc(db, 'users', user.uid, 'tasks', id), { type });
    };

    const logout = () => signOut(auth);

    return (
        <TodoContext.Provider value={{
            user,
            loading: authLoading,
            tasks,
            history,
            folders,
            stats,
            addTask,
            toggleTask,
            deleteTask,
            updateTask,
            togglePriority,
            toggleRecurring,
            moveTaskToType,
            addFolder,
            deleteFolder,
            logout
        }}>
            {children}
        </TodoContext.Provider>
    );
}

export function useTodo() {
    const context = useContext(TodoContext);
    if (context === undefined) {
        throw new Error('useTodo must be used within a TodoProvider');
    }
    return context;
}
