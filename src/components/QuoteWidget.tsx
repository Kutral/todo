import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useTodo } from "../context/TodoContext";
import { NeoAlert } from "./NeoAlert";

const QUOTES = [
    "Discipline is doing what needs to be done, even if you don't want to.",
    "Don't stop when you're tired. Stop when you're done.",
    "Your future is created by what you do today, not tomorrow.",
    "Dream big. Start small. Act now.",
    "Success is the sum of small efforts, repeated day in and day out.",
    "The only way to do great work is to love what you do.",
    "Action is the foundational key to all success.",
    "It always seems impossible until it is done.",
    "Don't watch the clock; do what it does. Keep going.",
    "The secret of getting ahead is getting started.",
    "You are what you do, not what you say you'll do.",
    "Though no one can go back and make a brand new start, anyone can start from now and make a brand new ending.",
    "Opportunities don't happen. You create them.",
    "It is never too late to be what you might have been.",
    "Everything you've ever wanted is on the other side of fear.",
    "Hard work beats talent when talent doesn't work hard.",
    "The harder you work for something, the greater you'll feel when you achieve it.",
    "Don't limit your challenges. Challenge your limits.",
    "Wake up with determination. Go to bed with satisfaction.",
    "Do something today that your future self will thank you for.",
    "Little things make big days.",
    "It’s going to be hard, but hard does not mean impossible.",
    "Don’t wait for opportunity. Create it.",
    "Sometimes later becomes never. Do it now.",
    "Great things never came from comfort zones.",
    "Dream it. Wish it. Do it.",
    "Success doesn’t just find you. You have to go out and get it."
];

export function QuoteWidget() {
    const { showQuotes, toggleQuotes } = useTodo();
    const [randomQuotes, setRandomQuotes] = useState<string[]>([]);
    const [showConfirm, setShowConfirm] = useState(false);

    useEffect(() => {
        // Shuffle and pick a few quotes
        setRandomQuotes([...QUOTES].sort(() => 0.5 - Math.random()));
    }, []);

    if (!showQuotes) return null;

    return (
        <>
            <div
                onClick={() => setShowConfirm(true)}
                className="w-full overflow-hidden bg-neo-dark text-neo-accent border-y-2 md:border-y-3 border-neo-dark py-1 md:py-2 cursor-pointer hover:opacity-90 transition-opacity"
                title="Click to hide"
            >
                <motion.div
                    className="flex whitespace-nowrap"
                    animate={{ x: [0, -1000] }}
                    transition={{
                        repeat: Infinity,
                        ease: "linear",
                        duration: 60,
                    }}
                >
                    {randomQuotes.map((quote, i) => (
                        <span key={i} className="mx-4 md:mx-8 text-sm md:text-lg font-bold uppercase tracking-widest">
                            {quote} ///
                        </span>
                    ))}
                    {randomQuotes.map((quote, i) => (
                        <span key={`dup-${i}`} className="mx-4 md:mx-8 text-sm md:text-lg font-bold uppercase tracking-widest">
                            {quote} ///
                        </span>
                    ))}
                </motion.div>
            </div>

            <NeoAlert
                isOpen={showConfirm}
                title="Turn Off Ticker?"
                message="Do you want to hide the motivational running text?"
                onConfirm={() => {
                    toggleQuotes(false);
                    setShowConfirm(false);
                }}
                onCancel={() => setShowConfirm(false)}
            />
        </>
    );
}
