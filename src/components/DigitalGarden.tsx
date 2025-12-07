import { motion } from "framer-motion";
import { useTodo } from "../context/TodoContext";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card";
import { eachDayOfInterval, endOfMonth, format, isToday, startOfMonth, startOfWeek, endOfWeek, parseISO } from "date-fns";

export function DigitalGarden() {
    const { stats, history } = useTodo();

    // Tree grows based on STREAK (Consistency)
    // 0-2: Seed, 3-7: Sprout, 7-14: Small Plant, 14-30: Big Tree, 30+: Forest
    const getTreeStage = (streak: number) => {
        if (streak < 3) return "🌱";
        if (streak < 7) return "🌿";
        if (streak < 14) return "🪴";
        if (streak < 30) return "🌳";
        return "🌲";
    };

    // Calendar Logic
    const today = new Date();
    const calendarStart = startOfWeek(startOfMonth(today));
    const calendarEnd = endOfWeek(endOfMonth(today));
    const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    // Get all unique dates where tasks were completed
    const activeDates = new Set(history.map(t => {
        const dateStr = t.completedAt || t.date;
        return format(parseISO(dateStr), 'yyyy-MM-dd');
    }));

    return (
        <div className="space-y-6">
            {/* Hero Section */}
            <div className="border-2 border-neo-dark rounded-lg shadow-sm overflow-hidden flex flex-col">
                {/* Top: Title Bar */}
                <div className="bg-[#FFF9C4] p-4 text-center border-b-2 border-neo-dark">
                    <h2 className="text-2xl font-black uppercase tracking-tight">Your Digital Garden</h2>
                    <p className="text-xs font-bold text-neo-dark/60 uppercase tracking-widest mt-1">A visual of your consistency</p>
                </div>

                {/* Middle: Stats & Plant */}
                <div className="bg-[#FFFFF0] p-8 flex flex-col items-center justify-center border-b-2 border-neo-dark/10">
                    <motion.div
                        key={stats.streak}
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", bounce: 0.5 }}
                        className="text-8xl md:text-9xl mb-6 drop-shadow-sm filter"
                    >
                        {getTreeStage(stats.streak)}
                    </motion.div>

                    <div className="text-center space-y-1">
                        <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight">
                            Current Streak: <span className="text-green-600">{stats.streak} Days</span>
                        </h3>
                        <div className="flex items-center justify-center gap-2">
                            <span className="h-1 w-1 rounded-full bg-neo-dark/30"></span>
                            <p className="text-sm font-bold text-neo-dark/50 uppercase tracking-wider">
                                Total Tasks Completed: {stats.totalCompleted}
                            </p>
                            <span className="h-1 w-1 rounded-full bg-neo-dark/30"></span>
                        </div>
                    </div>
                </div>

                {/* Bottom: Quote */}
                <div className="bg-white p-4 text-center">
                    <div className="inline-block px-4 py-2 bg-neo-bg/50 rounded-full border border-neo-dark/10 text-sm font-bold italic text-neo-dark/70">
                        "Consistency waters your garden. Keep the streak alive!"
                    </div>
                </div>
            </div>

            {/* Streak Calendar */}
            <Card className="bg-neo-white border-neo-dark">
                <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                        <span>Streak Calendar</span>
                        <span className="text-sm font-normal text-neo-dark/60">{format(today, 'MMMM yyyy')}</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-7 gap-2 text-center mb-2">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                            <div key={day} className="text-xs font-bold text-neo-dark/50">{day}</div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                        {calendarDays.map((day, i) => {
                            const dateKey = format(day, 'yyyy-MM-dd');
                            const isActive = activeDates.has(dateKey);
                            const isCurrentDay = isToday(day);
                            const isCurrentMonth = day.getMonth() === today.getMonth();

                            return (
                                <div
                                    key={i}
                                    className={`
                                        aspect-square flex items-center justify-center text-sm font-bold rounded-md border-2 transition-all
                                        ${!isCurrentMonth ? 'opacity-30' : ''}
                                        ${isActive ? 'bg-neo-secondary border-neo-dark text-neo-dark' : 'bg-transparent border-transparent text-neo-dark/70'}
                                        ${isCurrentDay ? 'border-neo-primary' : ''}
                                    `}
                                >
                                    {format(day, 'd')}
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
