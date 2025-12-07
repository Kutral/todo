import { useState, useMemo } from 'react';
import { addDays, isSameDay, parseISO, startOfDay, isToday, isYesterday, format } from 'date-fns';
import { Layout } from './components/Layout';
import { TaskList } from './components/TaskList';
import { DigitalGarden } from './components/DigitalGarden';
import { useTodo, type Task } from './context/TodoContext';
import { Input } from './components/ui/Input';
import { Button } from './components/ui/Button';
import { Plus, Trash2 } from 'lucide-react';

function TodoApp() {
    const [activeTab, setActiveTab] = useState('today');
    const { tasks, history, addTask, folders, addFolder, deleteFolder } = useTodo();
    const [newTask, setNewTask] = useState('');
    const [priority, setPriority] = useState<'normal' | 'medium' | 'urgent'>('normal');
    const [recurring, setRecurring] = useState(false);
    // category state is now used for selecting stack when in Today/Tomorrow
    const [selectedFolder, setSelectedFolder] = useState<string>('');
    const [showFolderSelect, setShowFolderSelect] = useState(false);

    const isFolderTab = folders.includes(activeTab);

    // Dedicated handler for creating folders in the folders-manage view
    const handleCreateFolder = (e: React.FormEvent) => {
        e.preventDefault();
        if (newTask.trim()) {
            addFolder(newTask.trim());
            setNewTask('');
        }
    };

    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTask.trim()) return;

        // If in a folder tab, force that category
        const taskCategory = isFolderTab ? activeTab : selectedFolder || undefined;

        // If adding from tomorrow tab, add to tomorrow. If in folder tab, default to today unless specified.
        const type = activeTab === 'tomorrow' ? 'tomorrow' : 'today';

        addTask(newTask, type, priority, recurring, taskCategory);
        setNewTask('');
        setPriority('normal');
        setRecurring(false);
        setSelectedFolder('');
        setShowFolderSelect(false);
    };

    const filteredTasks = tasks.filter(t => {
        if (activeTab === 'tomorrow') {
            return t.type === 'tomorrow' || (t.type === 'today' && t.recurring);
        }
        if (isFolderTab) {
            return t.category === activeTab;
        }
        return t.type === activeTab;
    });

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

    // Calculate Momentum logic
    const completedToday = history.filter(t =>
        (t.type === activeTab || (isFolderTab && t.category === activeTab)) &&
        (t.completedAt && isSameDay(parseISO(t.completedAt), new Date()))
    ).length;

    // For momentum, we ideally want "Total Tasks for Today including completed"
    // But since `tasks` state only holds incomplete tasks, we sum filteredTasks + completedToday
    const totalTasksForView = filteredTasks.length + completedToday;

    // Generate progress blocks: 5 blocks total
    // 0-20% = 1 block, 21-40% = 2 blocks, etc.
    const filledBlocks = totalTasksForView === 0 ? 0 : Math.ceil((completedToday / totalTasksForView) * 5);
    const emptyBlocks = 5 - filledBlocks;
    const progressVisual = '█'.repeat(filledBlocks) + '░'.repeat(emptyBlocks);


    return (
        <Layout activeTab={activeTab} onTabChange={setActiveTab}>
            {activeTab === 'garden' ? (
                <DigitalGarden />
            ) : activeTab === 'history' ? (
                <div className="space-y-8">
                    <h2 className="text-4xl font-black uppercase mb-8">Past</h2>
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
            ) : activeTab === 'folders-manage' ? (
                <div className="space-y-6">
                    <h2 className="text-4xl font-black uppercase mb-8">Stacks</h2>

                    <div className="grid grid-cols-2 gap-4">
                        {folders.map(folder => (
                            <div key={folder} className="relative group">
                                <button
                                    onClick={() => setActiveTab(folder)}
                                    className="w-full aspect-square bg-neo-white border-3 border-neo-dark p-4 flex flex-col items-center justify-center gap-2 hover:translate-x-1 hover:translate-y-1 transition-transform shadow-neo text-center max-w-full"
                                >
                                    <span className="font-black uppercase text-lg break-all line-clamp-2">{folder}</span>
                                    <span className="text-xs font-bold text-neo-dark/50">{tasks.filter(t => t.category === folder).length} Tasks</span>
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); deleteFolder(folder); }}
                                    className="absolute top-2 right-2 p-2 bg-neo-white border-2 border-neo-dark rounded-full opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity hover:bg-red-100 text-red-600"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 p-6 border-3 border-neo-dark bg-neo-white shadow-neo">
                        <h3 className="font-black uppercase mb-4 text-xl">Create New Stack</h3>
                        <form onSubmit={handleCreateFolder} className="flex gap-2">
                            <Input
                                value={newTask}
                                onChange={(e) => setNewTask(e.target.value)}
                                placeholder="Stack Name..."
                                className="h-12 border-3 text-lg"
                            />
                            <Button type="submit" size="lg" className="h-12 border-3 px-6">
                                <Plus size={24} />
                            </Button>
                        </form>
                    </div>
                    {folders.length === 0 && (
                        <div className="text-center py-12 opacity-50">
                            <p className="font-bold text-xl uppercase">No Stacks Yet</p>
                            <p className="text-sm">Create one above to get started!</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-4 md:space-y-6">
                    <header className="flex justify-between items-end mb-4 md:mb-8">
                        <div>
                            <div className="flex items-center gap-3">
                                <h2 className="text-2xl md:text-4xl font-black uppercase">{activeTab}</h2>
                                {isFolderTab && (
                                    <span className="bg-neo-dark text-neo-white text-xs px-2 py-1 font-bold uppercase tracking-wider rounded-sm">STACK</span>
                                )}
                            </div>
                            <p className="text-neo-dark/70 font-bold mt-1 md:mt-2 text-sm md:text-base">
                                {isFolderTab ? `Tasks in ${activeTab}` : displayDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                            </p>
                        </div>
                        <div className="text-right">
                            {/* Momentum Bar */}
                            <div className="flex flex-col items-end gap-1">
                                <p className="text-sm font-bold uppercase tracking-wider">
                                    Tasks: {completedToday}/{totalTasksForView}
                                </p>
                                <div className="text-neo-primary text-lg font-black tracking-widest leading-none">
                                    {progressVisual}
                                </div>
                            </div>
                        </div>
                    </header>

                    <form onSubmit={handleAddTask} className="flex flex-col gap-2 mb-4 md:mb-8">
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Input
                                    value={newTask}
                                    onChange={(e) => setNewTask(e.target.value)}
                                    placeholder={isFolderTab ? `Add to ${activeTab}...` : `Add task...`}
                                    className={`pr-28 md:pr-24 text-base md:text-lg h-12 md:h-14 border-2 md:border-3 transition-colors ${priority === 'urgent' ? 'border-neo-primary focus-visible:ring-neo-primary' :
                                        priority === 'medium' ? 'border-neo-secondary focus-visible:ring-neo-secondary' :
                                            ''
                                        }`}
                                />
                                <div className="absolute right-1 md:right-2 top-1/2 -translate-y-1/2 flex gap-1">
                                    {!isFolderTab && folders.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => setShowFolderSelect(!showFolderSelect)}
                                            className={`w-8 h-8 md:w-6 md:h-6 flex items-center justify-center text-sm md:text-xs font-bold border-2 border-neo-dark transition-all ${selectedFolder ? 'bg-neo-primary text-neo-dark' : 'bg-neo-white text-neo-dark/50'}`}
                                            title="Select Stack"
                                        >
                                            S
                                        </button>
                                    )}
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
                                        className={`w-8 h-8 md:w-auto md:h-auto md:px-2 md:py-1 text-xs font-bold uppercase border-2 border-neo-dark transition-all flex items-center justify-center ${priority === 'urgent' ? 'bg-neo-primary text-neo-dark' :
                                            priority === 'medium' ? 'bg-neo-secondary text-neo-dark' :
                                                'bg-neo-gray text-neo-dark/50'
                                            }`}
                                    >
                                        {priority === 'normal' ? 'N' : priority === 'urgent' ? 'U' : 'M'}
                                    </button>
                                </div>
                            </div>
                            <Button
                                type="submit"
                                size="lg"
                                className={`h-12 md:h-14 px-4 md:px-8 text-lg border-2 md:border-3 transition-colors ${priority === 'urgent' ? 'bg-neo-primary text-neo-dark hover:bg-neo-primary/90' :
                                    priority === 'medium' ? 'bg-neo-secondary text-neo-dark hover:bg-neo-secondary/90' :
                                        ''
                                    }`}
                            >
                                <Plus size={24} strokeWidth={3} className="md:w-6 md:h-6" />
                            </Button>
                        </div>
                        {showFolderSelect && !isFolderTab && (
                            <div className="flex gap-2 flex-wrap">
                                {folders.map(f => (
                                    <button
                                        key={f}
                                        type="button"
                                        onClick={() => setSelectedFolder(selectedFolder === f ? '' : f)}
                                        className={`px-3 py-1 text-xs font-bold border-2 border-neo-dark uppercase rounded-sm transition-all ${selectedFolder === f ? 'bg-neo-primary text-neo-dark' : 'bg-neo-white text-neo-dark/70 hover:bg-neo-secondary'}`}
                                    >
                                        {f}
                                    </button>
                                ))}
                            </div>
                        )}
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
