import { AnimatePresence } from "framer-motion";
import { useMemo } from "react";
import { type Task } from "../context/TodoContext";
import { TaskItem } from "./TaskItem";

interface TaskListProps {
    tasks: Task[];
    emptyMessage?: string;
    showDate?: boolean;
}

const EMPTY_MESSAGES = [
    "Nothing planned yet. What’s one small win for today?",
    "Clean slate! Time to build some momentum.",
    "All clear. Ready to crush some goals?",
    "Zero tasks. Infinite potential.",
    "Quiet day? Perfect time to start big.",
    "The best way to predict the future is to create it."
];

export function TaskList({ tasks, emptyMessage, showDate }: TaskListProps) {
    // Memoize the random message so it doesn't change on every render unless the component remounts
    const randomMessage = useMemo(() => {
        return EMPTY_MESSAGES[Math.floor(Math.random() * EMPTY_MESSAGES.length)];
    }, []);

    const messageToUse = emptyMessage || randomMessage;

    if (tasks.length === 0) {
        return (
            <div className="text-center p-8 border-3 border-dashed border-neo-dark/30 rounded-lg">
                <p className="text-xl font-bold text-neo-dark/50">{messageToUse}</p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <AnimatePresence mode="popLayout">
                {tasks.map(task => (
                    <TaskItem key={task.id} task={task} showDate={showDate} />
                ))}
            </AnimatePresence>
        </div>
    );
}
