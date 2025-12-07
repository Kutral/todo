// v2.0 - Firebase Auth
import { type ReactNode, useState } from "react";
import { QuoteWidget } from "./QuoteWidget";
import { Button } from "./ui/Button";
import { LayoutDashboard, Calendar, History, Sprout, Layers, Plus, X, LogOut } from "lucide-react";
import { cn } from "../lib/utils";
import { useSwipeable } from "react-swipeable";
import { useTodo } from "../context/TodoContext";
import { Input } from "./ui/Input";
import { Login } from "./Login";

const EMPTY_MESSAGES = [
    "Don't Stop.\nKeep Creating.",
    "Build Your Legacy.\nOne Task at a Time.",
    "Action Over Anxiety.\nJust Start.",
    "Focus. Execute.\nRepeat.",
    "Small Steps.\nBig Impact.",
    "Create More.\nConsume Less.",
    "Your Potential\nis Limitless.",
    "Make It Happen.\nRight Now.",
    "Dream Big.\nStart Small.",
    "Discipline is\nFreedom."
];

interface LayoutProps {
    children: ReactNode;
    activeTab: string;
    onTabChange: (tab: string) => void;
}

export function Layout({ children, activeTab, onTabChange }: LayoutProps) {
    const {
        folders,
        addFolder,
        deleteFolder,
        user,
        logout,
        loading,
        error,
        showQuotes,
        toggleQuotes
    } = useTodo();

    const [isAddingFolder, setIsAddingFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useState("");
    // Pick a random message once on mount
    const [emptyMessage] = useState(() => EMPTY_MESSAGES[Math.floor(Math.random() * EMPTY_MESSAGES.length)]);

    const handlers = useSwipeable({
        onSwipedLeft: () => {
            if (activeTab === 'today') onTabChange('tomorrow');
            else if (activeTab === 'tomorrow') onTabChange('garden');
            else if (activeTab === 'garden') onTabChange('history');
        },
        onSwipedRight: () => {
            if (activeTab === 'history') onTabChange('garden');
            else if (activeTab === 'garden') onTabChange('tomorrow');
            else if (activeTab === 'tomorrow') onTabChange('today');
        },
        trackMouse: false
    });

    if (loading) {
        return (
            <div className="h-screen bg-neo-bg flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-neo-dark border-r-transparent"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-screen bg-neo-bg flex items-center justify-center p-4">
                <div className="bg-neo-white border-4 border-red-600 p-8 max-w-lg shadow-neo text-center">
                    <h1 className="text-3xl font-black text-red-600 uppercase mb-4">Critial Error</h1>
                    <p className="font-bold text-lg mb-6">{error}</p>
                    <p className="text-sm mb-6 font-mono bg-gray-100 p-2 border-2 border-gray-300">
                        Check Firebase Console -&gt; Firestore Database
                    </p>
                    <Button onClick={logout} className="bg-neo-dark text-neo-white border-2 border-black hover:bg-neo-primary hover:text-neo-dark">
                        Logout & Try Again
                    </Button>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Login />;
    }

    const handleAddFolder = (e: React.FormEvent) => {
        e.preventDefault();
        if (newFolderName.trim()) {
            addFolder(newFolderName.trim());
            setNewFolderName("");
            setIsAddingFolder(false);
        }
    };

    return (
        <div className="h-screen bg-neo-bg flex flex-col font-sans selection:bg-neo-primary selection:text-neo-dark">
            <QuoteWidget />

            {/* Mobile Welcome Bar */}
            <div className="md:hidden flex items-center justify-between px-4 py-2 bg-neo-white border-b-2 border-neo-dark">
                <div className="flex items-center gap-2">
                    {user.photoURL ? (
                        <img src={user.photoURL} className="w-6 h-6 rounded-full border border-neo-dark" alt="" />
                    ) : (
                        <div className="w-6 h-6 rounded-full border border-neo-dark bg-neo-secondary flex items-center justify-center text-xs font-bold">
                            {user.isAnonymous ? '?' : (user.displayName?.[0] || 'U')}
                        </div>
                    )}
                    <span className="font-bold text-sm">
                        Hi, {user.displayName?.split(' ')[0] || (user.isAnonymous ? 'Guest' : 'User')}!
                    </span>
                </div>
                <button onClick={logout} className="text-xs font-bold uppercase text-neo-dark/60 hover:text-neo-dark">
                    Logout
                </button>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <aside className="w-64 border-r-3 border-neo-dark bg-neo-white hidden md:flex flex-col p-4 gap-4">
                    <div className="mb-6 flex items-center justify-center">
                        <img src="/todo/logo.png" alt="NeoTodo" className="w-full h-auto object-contain" />
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
                            <h3 className="text-xs font-black uppercase tracking-widest text-neo-dark/50">Stacks</h3>
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
                                        icon={<Layers size={18} />}
                                        label={folder}
                                    />
                                    <button
                                        onClick={(e) => { e.stopPropagation(); deleteFolder(folder); }}
                                        className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-600 transition-opacity"
                                        title="Delete Stack"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                            {folders.length === 0 && (
                                <p className="text-xs text-neo-dark/40 italic px-2">No stacks yet</p>
                            )}
                        </nav>
                    </div>

                    <div className="mt-auto pt-6 border-t-3 border-neo-dark space-y-4">
                        <div className="flex items-center gap-3">
                            {user.photoURL ? (
                                <img src={user.photoURL} className="w-10 h-10 rounded-full border-2 border-neo-dark" alt="User" />
                            ) : (
                                <div className="w-10 h-10 rounded-full border-2 border-neo-dark bg-neo-secondary flex items-center justify-center font-bold text-neo-dark">
                                    {user.isAnonymous ? '?' : (user.displayName?.[0] || 'U')}
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-sm truncate">{user.displayName || (user.isAnonymous ? 'Guest' : 'User')}</p>
                                <p className="text-xs text-neo-dark/50 truncate">NeoTodo</p>
                            </div>
                            <button onClick={logout} className="p-2 hover:bg-neo-secondary rounded transition-colors" title="Logout">
                                <LogOut size={16} />
                            </button>
                        </div>

                        {!showQuotes && (
                            <button
                                onClick={() => toggleQuotes(true)}
                                className="w-full text-[10px] font-bold uppercase text-neo-dark/60 hover:text-neo-primary mb-2 hover:underline"
                            >
                                Show Ticker
                            </button>
                        )}

                        <div className="text-[10px] uppercase font-bold text-neo-dark/40 tracking-widest text-center">
                            Developed by Kutral Eswar
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-auto p-4 md:p-8 relative pb-28 md:pb-8 overflow-x-hidden" {...handlers}>
                    <div className="max-w-4xl mx-auto min-h-[110vh] md:min-h-[calc(100vh-8rem)] flex flex-col">
                        <div className="md:flex-1 relative">
                            {children}
                        </div>
                        <div className="md:hidden mt-20 text-center transition-opacity text-neo-dark/40">
                            <div className="flex items-center justify-center p-8 opacity-40 hover:opacity-100 transition-opacity">
                                <p className="font-black text-2xl uppercase text-center leading-tight rotate-[-2deg] whitespace-pre-line">
                                    {emptyMessage}
                                </p>
                            </div>
                            <div className="opacity-70 hover:opacity-100 mb-8 flex flex-col items-center">
                                {!showQuotes && (
                                    <button
                                        onClick={() => toggleQuotes(true)}
                                        className="text-[10px] font-bold uppercase text-neo-dark/60 hover:text-neo-primary mb-4 hover:underline"
                                    >
                                        Show Ticker
                                    </button>
                                )}
                                <p className="font-bold text-[10px] uppercase tracking-widest mb-1">
                                    © {new Date().getFullYear()} NeoTodo
                                </p>
                                <p className="font-black text-xs uppercase tracking-tight text-neo-dark">
                                    Developed by Kutral Eswar
                                </p>
                            </div>
                        </div>

                        {/* Desktop Empty State Message */}
                        <div className="hidden md:flex py-12 text-center transition-opacity text-neo-dark/40 flex-col items-center justify-end mt-auto">
                            <div className="flex items-center justify-center p-8 opacity-40 hover:opacity-100 transition-opacity">
                                <p className="font-black text-4xl lg:text-5xl uppercase text-center leading-tight rotate-[-1deg] whitespace-pre-line">
                                    {emptyMessage}
                                </p>
                            </div>
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
                    icon={<Calendar size={28} />}
                    label="Tmrw"
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
                    icon={<Layers size={24} />}
                    label="Stacks"
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
