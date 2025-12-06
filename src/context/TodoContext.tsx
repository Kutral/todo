import React, { createContext, useContext, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { isSameDay, subDays, parseISO, startOfDay, isBefore } from 'date-fns';

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
    completedAt?: string; // ISO date string
    createdAt: number;
}

interface TodoContextType {
    tasks: Task[];
    history: Task[];
    addTask: (text: string, type: TaskType, priority: Priority, recurring: boolean) => void;
    toggleTask: (id: string) => void;
    deleteTask: (id: string) => void;
    updateTask: (id: string, text: string) => void;
    togglePriority: (id: string) => void;
    toggleRecurring: (id: string) => void;
    moveTaskToType: (id: string, type: TaskType) => void;
    stats: {
        streak: number;
        totalCompleted: number;
        lastActiveDate: string | null;
    };
}

const TodoContext = createContext<TodoContextType | undefined>(undefined);

export function TodoProvider({ children }: { children: React.ReactNode }) {
    const [tasks, setTasks] = useState<Task[]>(() => {
        const saved = localStorage.getItem('neo-tasks');
        let initialTasks: Task[] = saved ? JSON.parse(saved) : [];

        // Migration Logic: Move 'tomorrow' tasks to 'today' if the day has passed
        const today = startOfDay(new Date());

        initialTasks = initialTasks.map(task => {
            if (task.type === 'tomorrow') {
                const taskDate = parseISO(task.date);
                // If the task date is before today (meaning it was created yesterday or earlier)
                // move it to today.
                // Note: We use isBefore(taskDate, today) because task.date is the creation date.
                // If created yesterday, it is before today's start.
                if (isBefore(taskDate, today)) {
                    return { ...task, type: 'today' as TaskType };
                }
            }
            return task;
        });

        return initialTasks;
    });

    const [history, setHistory] = useState<Task[]>(() => {
        const saved = localStorage.getItem('neo-history');
        return saved ? JSON.parse(saved) : [];
    });

    const [stats, setStats] = useState<{ streak: number; totalCompleted: number; lastActiveDate: string | null }>(() => {
        const saved = localStorage.getItem('neo-stats');
        return saved ? JSON.parse(saved) : { streak: 0, totalCompleted: 0, lastActiveDate: null };
    });

    useEffect(() => {
        localStorage.setItem('neo-tasks', JSON.stringify(tasks));
    }, [tasks]);

    useEffect(() => {
        localStorage.setItem('neo-history', JSON.stringify(history));
    }, [history]);

    useEffect(() => {
        localStorage.setItem('neo-stats', JSON.stringify(stats));
    }, [stats]);

    const addTask = (text: string, type: TaskType, priority: Priority, recurring: boolean) => {
        const newTask: Task = {
            id: uuidv4(),
            text,
            completed: false,
            priority,
            recurring,
            type,
            date: new Date().toISOString(),
            createdAt: Date.now(),
        };
        setTasks(prev => [newTask, ...prev]);
    };

    const toggleTask = (id: string) => {
        const task = tasks.find(t => t.id === id);
        if (task) {
            if (!task.completed) {
                // Completing task
                const completedTask = {
                    ...task,
                    completed: true,
                    completedAt: new Date().toISOString()
                };
                const now = new Date();
                const today = startOfDay(now);

                // Update history
                setHistory(h => [completedTask, ...h]);

                // Update stats (Streak Logic)
                setStats(prev => {
                    let newStreak = prev.streak;
                    const lastActive = prev.lastActiveDate ? parseISO(prev.lastActiveDate) : null;

                    if (!lastActive) {
                        // First ever task
                        newStreak = 1;
                    } else if (isSameDay(lastActive, subDays(today, 1))) {
                        // Continued streak (last active was yesterday)
                        newStreak += 1;
                    } else if (isSameDay(lastActive, today)) {
                        // Already active today, keep streak
                        newStreak = prev.streak;
                    } else {
                        // Streak broken (last active was before yesterday)
                        newStreak = 1;
                    }

                    return {
                        streak: newStreak,
                        totalCompleted: prev.totalCompleted + 1,
                        lastActiveDate: today.toISOString()
                    };
                });

                // Handle Recurring Task
                if (task.recurring) {
                    const recurringTask: Task = {
                        ...task,
                        id: uuidv4(),
                        completed: false,
                        type: 'tomorrow', // Schedule for tomorrow
                        date: new Date().toISOString(),
                        createdAt: Date.now(),
                        completedAt: undefined // Reset completedAt for new instance
                    };
                    setTasks(prev => [recurringTask, ...prev.filter(t => t.id !== id)]);
                } else {
                    // Remove from active tasks
                    setTasks(prev => prev.filter(t => t.id !== id));
                }
            }
        } else {
            // Check history to un-complete
            const historyTask = history.find(t => t.id === id);
            if (historyTask) {
                const activeTask = { ...historyTask, completed: false };
                setTasks(prev => [activeTask, ...prev]);
                setHistory(prev => prev.filter(t => t.id !== id));
                setStats(prev => ({ ...prev, totalCompleted: Math.max(0, prev.totalCompleted - 1) }));
            }
        }
    };


    const deleteTask = (id: string) => {
        setTasks(prev => prev.filter(t => t.id !== id));
        setHistory(prev => prev.filter(t => t.id !== id));
    };

    const updateTask = (id: string, text: string) => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, text } : t));
    };

    const togglePriority = (id: string) => {
        setTasks(prev => prev.map(t => t.id === id ? {
            ...t,
            priority: t.priority === 'urgent' ? 'normal' : t.priority === 'medium' ? 'urgent' : 'medium'
        } : t));
    };

    const toggleRecurring = (id: string) => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, recurring: !t.recurring } : t));
    };

    const moveTaskToType = (id: string, type: TaskType) => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, type } : t));
    };

    return (
        <TodoContext.Provider value={{
            tasks,
            history,
            addTask,
            toggleTask,
            deleteTask,
            updateTask,
            togglePriority,
            toggleRecurring,
            moveTaskToType,
            stats
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
