import { useState } from 'react';
import { Button } from './ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCw, X } from 'lucide-react';
import { useTodo } from '../context/TodoContext';

interface TaskOptionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (options: { complexity: 'q1' | 'q2' | 'q3' | 'q4'; recurring: boolean; stack: string }) => void;
    initialComplexity: 'q1' | 'q2' | 'q3' | 'q4';
    initialRecurring: boolean;
    initialStack: string;
}

export function TaskOptionsModal({ isOpen, onClose, onSave, initialComplexity, initialRecurring, initialStack }: TaskOptionsModalProps) {
    const { folders } = useTodo();
    const [complexity, setComplexity] = useState(initialComplexity);
    const [recurring, setRecurring] = useState(initialRecurring);
    const [stack, setStack] = useState(initialStack);

    const handleSave = () => {
        onSave({ complexity, recurring, stack });
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-neo-dark/50 backdrop-blur-sm z-50"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed inset-x-4 top-[20%] md:inset-x-auto md:w-96 md:left-1/2 md:-translate-x-1/2 bg-neo-bg border-3 border-neo-dark shadow-neo p-6 rounded-lg z-50 space-y-6"
                    >
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-black uppercase">Task Options</h3>
                            <button onClick={onClose} className="p-1 hover:bg-neo-dark/10 rounded">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Priority / Complexity */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold uppercase text-neo-dark/60">Eisenhower Matrix</label>
                            <div className="flex gap-2">
                                {['q1', 'q2', 'q3', 'q4'].map((p) => (
                                    <button
                                        key={p}
                                        onClick={() => setComplexity(p as any)}
                                        className={`flex-1 py-3 font-bold uppercase border-2 border-neo-dark transition-all rounded-sm flex flex-col items-center leading-none gap-1 ${complexity === p
                                            ? (p === 'q1' ? 'bg-neo-primary text-neo-dark' :
                                                p === 'q2' ? 'bg-[#3B82F6] text-white' :
                                                    p === 'q3' ? 'bg-neo-secondary text-neo-dark' :
                                                        'bg-gray-300 text-neo-dark')
                                            : 'bg-transparent text-neo-dark/50 hover:bg-neo-dark/5'
                                            }`}
                                    >
                                        <span className="text-lg">{p.toUpperCase()}</span>
                                        <span className="text-[10px] tracking-wider">
                                            {p === 'q1' ? 'Do' : p === 'q2' ? 'Plan' : p === 'q3' ? 'Delegate' : 'Eliminate'}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Stacks */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold uppercase text-neo-dark/60">Stack</label>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => setStack('')}
                                    className={`px-3 py-1 text-sm font-bold border-2 border-neo-dark uppercase rounded-sm transition-all ${!stack ? 'bg-neo-dark text-neo-white' : 'bg-transparent hover:bg-neo-dark/5'
                                        }`}
                                >
                                    None
                                </button>
                                {folders.map(f => (
                                    <button
                                        key={f}
                                        onClick={() => setStack(f)}
                                        className={`px-3 py-1 text-sm font-bold border-2 border-neo-dark uppercase rounded-sm transition-all ${stack === f ? 'bg-neo-secondary text-neo-dark' : 'bg-transparent hover:bg-neo-dark/5'
                                            }`}
                                    >
                                        {f}
                                    </button>
                                ))}
                            </div>
                            {folders.length === 0 && (
                                <p className="text-xs text-neo-dark/40 italic">Create stacks in the Stacks tab to organize tasks.</p>
                            )}
                        </div>

                        {/* Recurring */}
                        <div className="flex items-center justify-between p-3 border-2 border-neo-dark rounded-md bg-neo-white">
                            <div className="flex items-center gap-3">
                                <RotateCw size={20} className={recurring ? 'text-neo-dark' : 'text-neo-dark/30'} />
                                <span className="font-bold uppercase">Recurring Task</span>
                            </div>
                            <button
                                onClick={() => setRecurring(!recurring)}
                                className={`w-12 h-6 rounded-full border-2 border-neo-dark relative transition-colors ${recurring ? 'bg-neo-secondary' : 'bg-neo-gray'
                                    }`}
                            >
                                <motion.div
                                    animate={{ x: recurring ? 24 : 2 }}
                                    className="absolute top-0.5 left-0 w-4 h-4 bg-neo-dark rounded-full shadow-sm"
                                />
                            </button>
                        </div>

                        <Button onClick={handleSave} className="w-full">
                            Save & Add
                        </Button>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
