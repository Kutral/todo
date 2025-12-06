import { useState, useMemo } from 'react';
import { addDays, isSameDay, parseISO, startOfDay, isToday, isYesterday, format } from 'date-fns';
import { Layout } from './components/Layout';
import { TaskList } from './components/TaskList';
import { DigitalGarden } from './components/DigitalGarden';
import { useTodo, type Task } from './context/TodoContext';
import { Input } from './components/ui/Input';
import { Button } from './components/ui/Button';
import { Plus } from 'lucide-react';

function TodoApp() {
    const [activeTab, setActiveTab] = useState<'today' | 'tomorrow' | 'history' | 'garden'>('today');
    const { tasks, history, addTask } = useTodo();
    const [newTask, setNewTask] = useState('');
    const [priority, setPriority] = useState<'normal' | 'medium' | 'urgent'>('normal');
    const [recurring, setRecurring] = useState(false);

    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTask.trim()) return;

        // If adding from tomorrow tab, add to tomorrow, else today
        const type = activeTab === 'tomorrow' ? 'tomorrow' : 'today';
        addTask(newTask, type, priority, recurring);
        setNewTask('');
        setPriority('normal');
        setRecurring(false);
    };

    const filteredTasks = tasks.filter(t => t.type === activeTab);

    // Sort: Urgent > Medium > Normal, then by creation date
    filteredTasks.sort((a, b) => {
        const priorityWeight = { urgent: 3, medium: 2, normal: 1 };
        if (priorityWeight[a.priority] === priorityWeight[b.priority]) {
            return b.createdAt - a.createdAt;
        }
        return priorityWeight[b.priority] - priorityWeight[a.priority];
    });

    const displayDate = activeTab === 'tomorrow' ? addDays(new Date(), 1) : new Date();

    // Group history by date
    const groupedHistory = useMemo(() => {
        const groups: { [key: string]: Task[] } = {};
        history.forEach(task => {
            // Use completedAt if available, otherwise fallback to date (creation) or just today
            const dateStr = task.completedAt || task.date;
            const dateKey = startOfDay(parseISO(dateStr)).toISOString();

            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }
            groups[dateKey].push(task);
        });

        return Object.entries(groups)
            .map(([date, tasks]) => ({
                date: parseISO(date),
                tasks: tasks.sort((a, b) => (b.completedAt ? parseISO(b.completedAt).getTime() : b.createdAt) - (a.completedAt ? parseISO(a.completedAt).getTime() : a.createdAt))
            }))
            .sort((a, b) => b.date.getTime() - a.date.getTime());
    }, [history]);

    return (
        <Layout activeTab={activeTab} onTabChange={setActiveTab}>
            {activeTab === 'garden' ? (
                <DigitalGarden />
            ) : activeTab === 'history' ? (
                <div className="space-y-8">
                    <h2 className="text-4xl font-black uppercase mb-8">History</h2>
                    {groupedHistory.length === 0 ? (
                        <TaskList tasks={[]} emptyMessage="No history yet. Go do something!" />
                    ) : (
                        groupedHistory.map(group => (
                            <div key={group.date.toISOString()} className="space-y-4">
                                <h3 className="text-xl font-bold text-neo-dark/50 uppercase sticky top-0 bg-neo-bg py-2 z-10">
                                    {isToday(group.date) ? 'Today' : isYesterday(group.date) ? 'Yesterday' : format(group.date, 'MMMM d, yyyy')}
                                </h3>
                                <TaskList tasks={group.tasks} showDate={false} />
                            </div>
                        ))
                    )}
                </div>
            ) : (
                <div className="space-y-4 md:space-y-6">
                    <header className="flex justify-between items-end mb-4 md:mb-8">
                        <div>
                            <h2 className="text-2xl md:text-4xl font-black uppercase">{activeTab}</h2>
                            <p className="text-neo-dark/70 font-bold mt-1 md:mt-2 text-sm md:text-base">
                                {displayDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                            </p>
                        </div>
                        <div className="text-right hidden md:block">
                            <p className="text-sm font-bold">Tasks: {filteredTasks.length}</p>
                        </div>
                    </header>

                    <form onSubmit={handleAddTask} className="flex gap-2 mb-4 md:mb-8">
                        <div className="relative flex-1">
                            <Input
                                value={newTask}
                                onChange={(e) => setNewTask(e.target.value)}
                                placeholder={`Add task...`}
                                className="pr-28 md:pr-24 text-base md:text-lg h-12 md:h-14 border-2 md:border-3"
                            />
                            <div className="absolute right-1 md:right-2 top-1/2 -translate-y-1/2 flex gap-1">
                                <button
                                    type="button"
                                    onClick={() => setRecurring(!recurring)}
                                    className={`w-8 h-8 md:w-6 md:h-6 flex items-center justify-center text-sm md:text-xs font-bold border-2 border-neo-dark transition-all ${recurring ? 'bg-neo-secondary text-neo-dark' : 'bg-neo-gray text-neo-dark/50'}`}
                                    title="Recurring Task"
                                >
                                    ↻
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPriority(priority === 'urgent' ? 'normal' : priority === 'medium' ? 'urgent' : 'medium')}
                                    className={`w-16 h-8 md:w-auto md:h-auto px-1 md:px-2 py-0.5 md:py-1 text-xs md:text-xs font-bold uppercase border-2 border-neo-dark transition-all flex items-center justify-center ${priority === 'urgent' ? 'bg-neo-primary text-neo-dark' :
                                        priority === 'medium' ? 'bg-neo-secondary text-neo-dark' :
                                            'bg-neo-gray text-neo-dark/50'
                                        }`}
                                >
                                    {priority}
                                </button>
                            </div>
                        </div>
                        <Button type="submit" size="lg" className="h-12 md:h-14 px-4 md:px-8 text-lg border-2 md:border-3">
                            <Plus size={24} strokeWidth={3} className="md:w-6 md:h-6" />
                        </Button>
                    </form>

                    <TaskList tasks={filteredTasks} />

                    {/* Completed Tasks Section */}
                    {history.filter(t => t.type === activeTab && (t.completedAt && isSameDay(parseISO(t.completedAt), new Date()))).length > 0 && (
                        <div className="mt-8 pt-8 border-t-3 border-neo-dark/20">
                            <h3 className="text-xl font-bold uppercase mb-4 text-neo-dark/50">Completed</h3>
                            <TaskList tasks={history.filter(t => t.type === activeTab && (t.completedAt && isSameDay(parseISO(t.completedAt), new Date())))} />
                        </div>
                    )}
                </div>
            )}
        </Layout>
    );
}

export default TodoApp;
