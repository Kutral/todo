import { type ReactNode, useState } from "react";
import { QuoteWidget } from "./QuoteWidget";
import { Button } from "./ui/Button";
import { LayoutDashboard, Calendar, History, Sprout, Folder, Plus, X } from "lucide-react";
import { cn } from "../lib/utils";
import { useSwipeable } from "react-swipeable";
import { useTodo } from "../context/TodoContext";
import { Input } from "./ui/Input";

interface LayoutProps {
    children: ReactNode;
    activeTab: string;
    onTabChange: (tab: string) => void;
}

export function Layout({ children, activeTab, onTabChange }: LayoutProps) {
    const { folders, addFolder, deleteFolder } = useTodo();
    const [isAddingFolder, setIsAddingFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useState("");
    const TABS: string[] = ['today', 'tomorrow', 'garden', 'history', ...folders];

    const handleAddFolder = (e: React.FormEvent) => {
        e.preventDefault();
        if (newFolderName.trim()) {
            addFolder(newFolderName.trim());
            setNewFolderName("");
            setIsAddingFolder(false);
        }
    };

    const handlers = useSwipeable({
        onSwipedLeft: () => {
            const currentIndex = TABS.indexOf(activeTab);
            if (currentIndex < TABS.length - 1) {
                onTabChange(TABS[currentIndex + 1]);
            }
        },
        onSwipedRight: () => {
            const currentIndex = TABS.indexOf(activeTab);
            if (currentIndex > 0) {
                onTabChange(TABS[currentIndex - 1]);
            }
        },
        trackMouse: false
    });

    return (
        <div className="min-h-screen bg-neo-bg flex flex-col font-sans selection:bg-neo-primary selection:text-neo-dark">
            <QuoteWidget />

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <aside className="w-64 border-r-3 border-neo-dark bg-neo-white hidden md:flex flex-col p-4 gap-4">
                    <div className="p-4 border-3 border-neo-dark bg-neo-primary shadow-neo mb-4">
                        <h1 className="text-2xl font-black uppercase tracking-tighter">NeoTodo</h1>
                    </div>

                    <nav className="flex flex-col gap-2">
                        <NavButton
                            active={activeTab === 'today'}
                            onClick={() => onTabChange('today')}
                            icon={<LayoutDashboard size={20} />}
                            label="Today"
                        />
                        <NavButton
                            active={activeTab === 'tomorrow'}
                            onClick={() => onTabChange('tomorrow')}
                            icon={<Calendar size={20} />}
                            label="Tomorrow"
                        />
                        <NavButton
                            active={activeTab === 'garden'}
                            onClick={() => onTabChange('garden')}
                            icon={<Sprout size={20} />}
                            label="Digital Garden"
                        />
                        <NavButton
                            active={activeTab === 'history'}
                            onClick={() => onTabChange('history')}
                            icon={<History size={20} />}
                            label="History"
                        />
                    </nav>

                    <div className="mt-8">
                        <div className="flex items-center justify-between mb-2 px-2">
                            <h3 className="text-xs font-black uppercase tracking-widest text-neo-dark/50">Folders</h3>
                            <button onClick={() => setIsAddingFolder(!isAddingFolder)} className="text-neo-dark hover:bg-neo-secondary rounded p-1">
                                <Plus size={16} strokeWidth={3} />
                            </button>
                        </div>

                        {isAddingFolder && (
                            <form onSubmit={handleAddFolder} className="mb-4 px-2 flex gap-1">
                                <Input
                                    value={newFolderName}
                                    onChange={(e) => setNewFolderName(e.target.value)}
                                    placeholder="Name..."
                                    className="h-8 text-xs min-h-0"
                                    autoFocus
                                />
                                <button type="submit" className="bg-neo-dark text-neo-white px-2 rounded font-bold text-xs hover:bg-neo-dark/80">
                                    OK
                                </button>
                            </form>
                        )}

                        <nav className="flex flex-col gap-1 max-h-64 overflow-y-auto">
                            {folders.map(folder => (
                                <div key={folder} className="group flex items-center">
                                    <NavButton
                                        active={activeTab === folder}
                                        onClick={() => onTabChange(folder)}
                                        icon={<Folder size={18} />}
                                        label={folder}
                                    />
                                    <button
                                        onClick={(e) => { e.stopPropagation(); deleteFolder(folder); }}
                                        className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-600 transition-opacity"
                                        title="Delete Folder"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                            {folders.length === 0 && (
                                <p className="text-xs text-neo-dark/40 italic px-2">No folders yet</p>
                            )}
                        </nav>
                    </div>

                    <div className="mt-auto pt-6 border-t-3 border-neo-dark">
                        <div className="flex flex-col gap-1">
                            <p className="font-bold text-xs text-neo-dark/60 uppercase tracking-widest">
                                Est. {new Date().getFullYear()}
                            </p>
                            <p className="font-black text-sm text-neo-dark uppercase tracking-tight">
                                Developed by Kutral Eswar
                            </p>
                        </div>
                    </div>


                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-auto p-4 md:p-8 relative pb-24 md:pb-8 overflow-x-hidden" {...handlers}>
                    <div className="max-w-4xl mx-auto min-h-[calc(100vh-8rem)] flex flex-col">
                        <div className="flex-1 relative">
                            {children}
                        </div>
                        <div className="md:hidden py-8 text-center opacity-50 hover:opacity-100 transition-opacity">
                            <p className="font-bold text-[10px] uppercase tracking-widest mb-1">
                                © {new Date().getFullYear()} NeoTodo
                            </p>
                            <p className="font-black text-xs uppercase tracking-tight text-neo-dark">
                                Developed by Kutral Eswar
                            </p>
                        </div>
                    </div>
                </main>
            </div>

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-neo-white border-t-3 border-neo-dark flex items-center justify-around z-50 pb-safe">
                <NavButton
                    active={activeTab === 'today'}
                    onClick={() => onTabChange('today')}
                    icon={<LayoutDashboard size={24} />}
                    label="Today"
                    mobile
                />
                <NavButton
                    active={activeTab === 'tomorrow'}
                    onClick={() => onTabChange('tomorrow')}
                    icon={<Calendar size={28} />} // Slightly larger for tap target? Keep 24 for consistency
                    label="Tmrw" // Shorten text
                    mobile
                />
                <NavButton
                    active={activeTab === 'garden'}
                    onClick={() => onTabChange('garden')}
                    icon={<Sprout size={24} />}
                    label="Garden"
                    mobile
                />
                <NavButton
                    active={activeTab === 'history'}
                    onClick={() => onTabChange('history')}
                    icon={<History size={24} />}
                    label="History"
                    mobile
                />
                <NavButton
                    active={folders.includes(activeTab) || activeTab === 'folders-manage'}
                    onClick={() => onTabChange('folders-manage')}
                    icon={<Folder size={24} />}
                    label="Folders"
                    mobile
                />
            </nav>
        </div>
    );
}

function NavButton({ active, onClick, icon, label, mobile }: { active: boolean, onClick: () => void, icon: ReactNode, label: string, mobile?: boolean }) {
    if (mobile) {
        return (
            <button
                onClick={onClick}
                className={cn(
                    "flex flex-col items-center justify-center p-2 flex-1 h-full gap-1 transition-colors",
                    active ? "bg-neo-secondary text-neo-dark" : "text-neo-dark/50 hover:bg-neo-secondary/30"
                )}
            >
                {icon}
                <span className="text-xs font-bold uppercase tracking-tighter">{label}</span>
            </button>
        )
    }

    return (
        <Button
            variant={active ? "default" : "ghost"}
            className={cn(
                "w-full justify-start gap-3 text-lg",
                active ? "bg-neo-secondary hover:bg-neo-secondary/80" : ""
            )}
            onClick={onClick}
        >
            {icon}
            {label}
        </Button>
    )
}
