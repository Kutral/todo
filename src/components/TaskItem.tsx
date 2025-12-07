import { motion, AnimatePresence } from "framer-motion";
import { Check, Trash2, ArrowRight, Calendar } from "lucide-react";
import { useTodo, type Task } from "../context/TodoContext";
import { Button } from "./ui/Button";
import { cn } from "../lib/utils";
import confetti from 'canvas-confetti';
import { useState } from "react";

interface TaskItemProps {
    task: Task;
    showDate?: boolean;
}

const GRATIFYING_MESSAGES = [
    "Nice!", "Done!", "Crushed it!", "Boom!", "Next!", "Easy!", "On fire!", "Smoooooth"
];

export function TaskItem({ task, showDate }: TaskItemProps) {
    const { toggleTask, deleteTask, togglePriority, toggleRecurring, moveTaskToType } = useTodo();
    const [showGratification, setShowGratification] = useState(false);
    const [message, setMessage] = useState("");

    const handleToggle = (id: string) => {
        if (!task.completed) {
            // Trigger confetti
            confetti({
                particleCount: 150,
                spread: 100,
                origin: { y: 0.6 },
                colors: ['#000000', '#FFDE00', '#FFFFFF', '#FF3E3E', '#3E3EFF'], // Neo-brutalist colors
                zIndex: 9999,
                disableForReducedMotion: false
            });

            // Show random message
            setMessage(GRATIFYING_MESSAGES[Math.floor(Math.random() * GRATIFYING_MESSAGES.length)]);
            setShowGratification(true);
            setTimeout(() => setShowGratification(false), 2000);
        }
        toggleTask(id);
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className={cn(
                "group flex items-center gap-2 md:gap-3 p-3 md:p-4 border-2 md:border-3 border-neo-dark bg-neo-white shadow-neo mb-2 md:mb-3 transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none relative",
                task.priority === 'urgent' && "border-neo-primary bg-neo-primary/10",
                task.priority === 'medium' && "border-neo-secondary bg-neo-secondary/10"
            )}
        >
            <AnimatePresence>
                {showGratification && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.5, y: -10 }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-50 pointer-events-none whitespace-nowrap"
                    >
                        <span className="font-black text-2xl md:text-3xl uppercase italic bg-neo-primary text-neo-dark px-2 py-1 border-2 border-neo-dark shadow-neo rotate-[-5deg] block">
                            {message}
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>

            <button
                onClick={() => handleToggle(task.id)}
                className="h-6 w-6 border-3 border-neo-dark flex items-center justify-center hover:bg-neo-secondary transition-colors"
                aria-label={task.completed ? "Mark as incomplete" : "Mark as complete"}
            >
                {task.completed && <Check size={16} strokeWidth={4} />}
            </button>

            <div className="flex-1 min-w-0">
                {task.category && (
                    <span className="inline-flex items-center gap-1 bg-neo-secondary/50 text-neo-dark text-[10px] md:text-xs font-bold px-1.5 py-0.5 rounded-sm mr-2 uppercase tracking-wider border border-neo-dark/10">
                        {task.category}
                    </span>
                )}
                <span className={cn(
                    "font-bold text-base md:text-lg break-all transition-all duration-300",
                    task.completed && "line-through text-gray-400 blur-[0.5px]"
                )}>
                    {task.text}
                </span>
                {showDate && (
                    <span className="text-xs font-bold text-neo-dark/50">
                        {new Date(task.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                )}
            </div>

            <div className="flex gap-1 md:gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity shrink-0 items-center">
                <Button
                    size="sm"
                    variant={task.priority === 'urgent' ? 'default' : 'outline'}
                    className={cn("hidden md:flex h-6 w-6 md:h-8 md:w-auto p-0 md:px-2 text-[10px] md:text-xs uppercase items-center justify-center",
                        task.priority === 'urgent' ? "bg-neo-primary" :
                            task.priority === 'medium' ? "bg-neo-secondary" : ""
                    )}
                    onClick={() => togglePriority(task.id)}
                >
                    <span className="md:hidden">{task.priority.charAt(0)}</span>
                    <span className="hidden md:inline">{task.priority}</span>
                </Button>

                <Button
                    size="icon"
                    variant="ghost"
                    className={cn("hidden md:flex h-6 w-6 md:h-8 md:w-8", task.recurring && "text-neo-secondary")}
                    onClick={() => toggleRecurring(task.id)}
                    title="Toggle Recurring"
                >
                    <span className="text-sm md:text-lg">↻</span>
                </Button>

                {task.type === 'today' ? (
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 md:h-8 md:w-8"
                        onClick={() => moveTaskToType(task.id, 'tomorrow')}
                        title="Move to Tomorrow"
                    >
                        <ArrowRight size={14} className="md:w-[18px]" />
                    </Button>
                ) : (
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 md:h-8 md:w-8"
                        onClick={() => moveTaskToType(task.id, 'today')}
                        title="Move to Today"
                    >
                        <Calendar size={14} className="md:w-[18px]" />
                    </Button>
                )}

                <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 md:h-8 md:w-8 hover:bg-neo-primary hover:text-white"
                    onClick={() => deleteTask(task.id)}
                >
                    <Trash2 size={14} className="md:w-[18px]" />
                </Button>
            </div>
        </motion.div>
    );
}
