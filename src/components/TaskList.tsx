import { AnimatePresence } from "framer-motion";
import { type Task } from "../context/TodoContext";
import { TaskItem } from "./TaskItem";

interface TaskListProps {
    tasks: Task[];
    emptyMessage?: string;
    showDate?: boolean;
}

export function TaskList({ tasks, emptyMessage = "No tasks yet. Add one!", showDate }: TaskListProps) {
    if (tasks.length === 0) {
        return (
            <div className="text-center p-8 border-3 border-dashed border-neo-dark/30 rounded-lg">
                <p className="text-xl font-bold text-neo-dark/50">{emptyMessage}</p>
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
