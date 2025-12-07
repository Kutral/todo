import { useState, useMemo } from 'react';
import { addDays, isSameDay, parseISO, startOfDay, isToday, isYesterday, format } from 'date-fns';
import { Layout } from './components/Layout';
import { TaskList } from './components/TaskList';
import { useState, useMemo } from 'react';
import { addDays, isSameDay, parseISO, startOfDay, isToday, isYesterday, format } from 'date-fns';
import { Layout } from './components/Layout';
import { TaskList } from './components/TaskList';
import { DigitalGarden } from './components/DigitalGarden';
import { useTodo, type Task } from './context/TodoContext';
import { Input } from './components/ui/Input';
import { Button } from './components/ui/Button';
import { Plus, Trash2, Layers, Folder, RotateCw } from 'lucide-react';
import { useLongPress } from './hooks/useLongPress';
import { TaskOptionsModal } from './components/TaskOptionsModal';

function TodoApp() {
    const [activeTab, setActiveTab] = useState('today');
    const { tasks, history, addTask, folders, addFolder, deleteFolder } = useTodo();
    const [newTask, setNewTask] = useState('');
    const [priority, setPriority] = useState<'normal' | 'medium' | 'urgent'>('normal');
    const [recurring, setRecurring] = useState(false);
    // category state is now used for selecting stack when in Today/Tomorrow
    const [selectedFolder, setSelectedFolder] = useState<string>('');
    const [showFolderSelect, setShowFolderSelect] = useState(false);

    // Modal State
    const [showOptionsModal, setShowOptionsModal] = useState(false);

    const isFolderTab = folders.includes(activeTab);

    // Dedicated handler for creating folders in the folders-manage view
    const handleCreateFolder = (e: React.FormEvent) => {
        e.preventDefault();
        if (newTask.trim()) {
            addFolder(newTask.trim());
            setNewTask('');
        }
    };

    const submitTask = (customOptions?: { complexity: 'normal' | 'medium' | 'urgent'; recurring: boolean; stack: string }) => {
        if (!newTask.trim()) return;

        // Use custom options if provided, otherwise current state
        const p = customOptions?.complexity || priority;
        const r = customOptions?.recurring ?? recurring;
        const s = customOptions?.stack || (isFolderTab ? activeTab : selectedFolder || undefined);

        // If adding from tomorrow tab, add to tomorrow. If in folder tab, default to today unless specified.
        const type = activeTab === 'tomorrow' ? 'tomorrow' : 'today';

        addTask(newTask, type, p, r, s);
        setNewTask('');
        setPriority('normal');
        setRecurring(false);
        setSelectedFolder('');
        setShowFolderSelect(false);
        setShowOptionsModal(false);
    };

    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault();
        submitTask();
    };

    // Long Press Handlers
    const onLongPressAdd = () => {
        if (!newTask.trim()) return;
        setShowOptionsModal(true);
    };

    const onClickAdd = () => {
        submitTask();
    };

    const defaultOptions = {
        shouldPreventDefault: true,
        delay: 500,
    };

    const longPressEvent = useLongPress(onLongPressAdd, onClickAdd, defaultOptions);

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

    const totalTasksForView = filteredTasks.length + completedToday;
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
                <div className="space-y-4">
                    <div>
                        <h2 className="text-4xl font-black uppercase tracking-tight">Stacks</h2>
                        <p className="text-sm font-bold text-neo-dark/50 mt-1">
                            Bundles of tasks (like routines). <br className="md:hidden" /> Example: Health, Money, Deep Work.
                        </p>
                    </div>

                    <div className="mt-4 p-4 md:p-6 border-2 border-dashed border-neo-dark/30 rounded-lg bg-neo-bg/50">
                        <h3 className="font-bold uppercase mb-2 text-sm text-neo-dark/60 tracking-widest">Create New Stack</h3>
                        <form onSubmit={handleCreateFolder} className="flex gap-2">
                            <Input
                                value={newTask}
                                onChange={(e) => setNewTask(e.target.value)}
                                placeholder="e.g. Health, Deep Work..."
                                className="h-10 text-base border-2 bg-transparent focus:bg-white transition-colors"
                            />
                            <Button type="submit" size="default" className="h-10 border-2 px-4 bg-neo-dark text-neo-white hover:bg-neo-primary hover:text-neo-dark">
                                <Plus size={20} />
                            </Button>
                        </form>
                    </div>

                    <div className="grid grid-cols-2 gap-3 md:gap-4 mt-4">
                        {folders.map(folder => {
                            const count = tasks.filter(t => t.category === folder).length;
                            return (
                                <div key={folder} className="relative group">
                                    <button
                                        onClick={() => setActiveTab(folder)}
                                        className="w-full aspect-square bg-neo-white border-2 border-neo-dark p-4 flex flex-col items-start justify-between hover:translate-x-1 hover:translate-y-1 transition-transform shadow-neo text-left relative overflow-hidden"
                                    >
                                        <div className="w-full flex justify-between items-start">
                                            <Layers size={28} className="text-neo-dark/20 group-hover:text-neo-dark/40 transition-colors" />
                                            {count > 0 && (
                                                <span className="h-2 w-2 rounded-full bg-neo-primary animate-pulse"></span>
                                            )}
                                        </div>

                                        <div className="w-full">
                                            <span className="font-black uppercase text-lg break-all line-clamp-2 leading-tight block mb-1">{folder}</span>
                                            <span className="text-[10px] font-black text-neo-dark/40 uppercase tracking-widest block">
                                                {count} Tasks
                                            </span>
                                        </div>
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); deleteFolder(folder); }}
                                        className="absolute top-1 right-1 p-2 text-neo-dark/20 hover:text-red-600 transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100"
                                        title="Delete Stack"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
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
                                            className={`w-8 h-8 md:w-auto md:h-8 md:px-2 flex items-center justify-center gap-1 text-sm md:text-xs font-bold border-2 border-neo-dark transition-all ${selectedFolder ? 'bg-neo-primary text-neo-dark' : 'bg-neo-white text-neo-dark/50'}`}
                                            title="Select Stack"
                                        >
                                            <Folder size={16} strokeWidth={2.5} />
                                            <span className="hidden md:inline font-bold uppercase tracking-wide">
                                                {selectedFolder || 'Stack'}
                                            </span>
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => setRecurring(!recurring)}
                                        className={`w-8 h-8 md:w-8 md:h-8 flex items-center justify-center text-sm md:text-xs font-bold border-2 border-neo-dark transition-all ${recurring ? 'bg-neo-secondary text-neo-dark' : 'bg-neo-gray text-neo-dark/50'}`}
                                        title="Recurring Task"
                                    >
                                        <RotateCw size={18} strokeWidth={2.5} className={recurring ? 'animate-spin-slow' : ''} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPriority(priority === 'urgent' ? 'normal' : priority === 'medium' ? 'urgent' : 'medium')}
                                        className={`w-8 h-8 md:w-auto md:h-8 md:px-3 text-xs font-bold uppercase border-2 border-neo-dark transition-all flex items-center justify-center ${priority === 'urgent' ? 'bg-neo-primary text-neo-dark' :
                                            priority === 'medium' ? 'bg-neo-secondary text-neo-dark' :
                                                'bg-neo-gray text-neo-dark/50'
                                            }`}
                                    >
                                        <span className="md:hidden">
                                            {priority === 'normal' ? 'N' : priority === 'urgent' ? 'U' : 'M'}
                                        </span>
                                        <span className="hidden md:inline tracking-wider">
                                            {priority}
                                        </span>
                                    </button>
                                </div>
                            </div>
                            <Button
                                type="button"
                                size="lg"
                                className={`h-12 md:h-14 px-4 md:px-8 text-lg border-2 md:border-3 transition-colors ${priority === 'urgent' ? 'bg-neo-primary text-neo-dark hover:bg-neo-primary/90' :
                                    priority === 'medium' ? 'bg-neo-secondary text-neo-dark hover:bg-neo-secondary/90' :
                                        ''
                                    }`}
                                {...longPressEvent}
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

            <TaskOptionsModal
                isOpen={showOptionsModal}
                onClose={() => setShowOptionsModal(false)}
                onSave={submitTask}
                initialComplexity={priority}
                initialRecurring={recurring}
                initialStack={selectedFolder}
            />
        </Layout>
    );
}

export default TodoApp;
