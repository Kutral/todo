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
            <Card className="bg-neo-accent border-neo-dark">
                <CardHeader>
                    <CardTitle>Your Digital Garden</CardTitle>
                </CardHeader>
                <CardContent className="text-center py-12">
                    <motion.div
                        key={stats.streak}
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", bounce: 0.5 }}
                        className="text-9xl mb-4"
                    >
                        {getTreeStage(stats.streak)}
                    </motion.div>

                    <div className="space-y-2">
                        <h3 className="text-2xl font-bold">Current Streak: {stats.streak} Days</h3>
                        <p className="text-lg font-medium">Total Tasks Completed: {stats.totalCompleted}</p>
                    </div>

                    <div className="mt-8 p-4 bg-neo-white border-3 border-neo-dark inline-block transform -rotate-1">
                        <p className="font-bold">"Consistency waters your garden. Keep the streak alive!"</p>
                    </div>
                </CardContent>
            </Card>

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
