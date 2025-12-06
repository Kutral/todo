import { type ReactNode } from "react";
import { QuoteWidget } from "./QuoteWidget";
import { Button } from "./ui/Button";
import { LayoutDashboard, Calendar, History, Sprout } from "lucide-react";
import { cn } from "../lib/utils";

interface LayoutProps {
    children: ReactNode;
    activeTab: 'today' | 'tomorrow' | 'history' | 'garden';
    onTabChange: (tab: 'today' | 'tomorrow' | 'history' | 'garden') => void;
}

export function Layout({ children, activeTab, onTabChange }: LayoutProps) {
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

                    <div className="mt-auto pt-4 border-t-3 border-neo-dark">
                        <p className="font-bold text-sm text-neo-dark/70 uppercase">
                            Developed by<br />
                            <span className="text-neo-dark text-base">Kutral</span>
                        </p>
                    </div>


                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-auto p-4 md:p-8 relative pb-24 md:pb-8">
                    <div className="max-w-4xl mx-auto min-h-[calc(100vh-8rem)] flex flex-col">
                        <div className="flex-1">
                            {children}
                        </div>
                        <div className="md:hidden py-8 text-center opacity-50">
                            <p className="font-bold text-xs uppercase">
                                Developed by Kutral
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
                    icon={<Calendar size={24} />}
                    label="Tomorrow"
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
