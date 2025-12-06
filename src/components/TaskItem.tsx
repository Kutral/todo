import { motion } from "framer-motion";
import { Check, Trash2, ArrowRight, Calendar } from "lucide-react";
import { useTodo, type Task } from "../context/TodoContext";
import { Button } from "./ui/Button";
import { cn } from "../lib/utils";

interface TaskItemProps {
    task: Task;
    showDate?: boolean;
}

export function TaskItem({ task, showDate }: TaskItemProps) {
    const { toggleTask, deleteTask, togglePriority, toggleRecurring, moveTaskToType } = useTodo();

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className={cn(
                "group flex items-center gap-2 md:gap-3 p-3 md:p-4 border-2 md:border-3 border-neo-dark bg-neo-white shadow-neo mb-2 md:mb-3 transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none",
                task.priority === 'urgent' && "border-neo-primary bg-neo-primary/10",
                task.priority === 'medium' && "border-neo-secondary bg-neo-secondary/10"
            )}
        >
            <button
                onClick={() => toggleTask(task.id)}
                className="h-6 w-6 border-3 border-neo-dark flex items-center justify-center hover:bg-neo-secondary transition-colors"
            >
                {task.completed && <Check size={16} strokeWidth={4} />}
            </button>

            <div className="flex-1">
                <span className={cn(
                    "font-bold text-base md:text-lg block",
                    task.completed && "line-through text-gray-400"
                )}>
                    {task.text}
                </span>
                {showDate && (
                    <span className="text-xs font-bold text-neo-dark/50">
                        {new Date(task.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                )}
            </div>

            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                    size="sm"
                    variant={task.priority === 'urgent' ? 'default' : 'outline'}
                    className={cn("h-8 px-2 text-xs uppercase",
                        task.priority === 'urgent' ? "bg-neo-primary" :
                            task.priority === 'medium' ? "bg-neo-secondary" : ""
                    )}
                    onClick={() => togglePriority(task.id)}
                >
                    {task.priority}
                </Button>

                <Button
                    size="icon"
                    variant="ghost"
                    className={cn("h-8 w-8", task.recurring && "text-neo-secondary")}
                    onClick={() => toggleRecurring(task.id)}
                    title="Toggle Recurring"
                >
                    <span className="text-lg">↻</span>
                </Button>

                {task.type === 'today' ? (
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => moveTaskToType(task.id, 'tomorrow')}
                        title="Move to Tomorrow"
                    >
                        <ArrowRight size={18} />
                    </Button>
                ) : (
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => moveTaskToType(task.id, 'today')}
                        title="Move to Today"
                    >
                        <Calendar size={18} />
                    </Button>
                )}

                <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 hover:bg-neo-primary hover:text-white"
                    onClick={() => deleteTask(task.id)}
                >
                    <Trash2 size={18} />
                </Button>
            </div>
        </motion.div>
    );
}
