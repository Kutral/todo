import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const QUOTES = [
    "Thoughts become things.",
    "Believe you deserve it and the universe will serve it.",
    "What you think, you create.",
    "Energy flows where attention goes.",
    "Ask. Believe. Receive.",
    "You attract what you are.",
    "The universe has your back.",
    "Visualize your highest self.",
    "Gratitude is the magnet for miracles.",
    "Your vibe attracts your tribe.",
    "Everything is always working out for me.",
    "I am a powerful manifestor.",
    "Align with the energy of abundance.",
    "Expect miracles.",
    "Focus on the good.",
    "I am open to receiving.",
    "The universe is conspiring in my favor.",
    "Feel the feeling of the wish fulfilled.",
    "I attract success effortlessly.",
    "My reality is a reflection of my thoughts.",
    "I am a magnet for miracles.",
    "Abundance flows to me easily.",
    "I am worthy of my dreams.",
    "I trust the timing of my life.",
    "My potential is limitless.",
    "I radiate positive energy.",
    "I am in alignment with my purpose.",
    "Success follows me everywhere.",
    "I am grateful for this moment.",
    "I choose faith over fear."
];

export function QuoteWidget() {
    const [randomQuotes, setRandomQuotes] = useState<string[]>([]);

    useEffect(() => {
        // Shuffle and pick a few quotes
        setRandomQuotes([...QUOTES].sort(() => 0.5 - Math.random()));
    }, []);

    return (
        <div className="w-full overflow-hidden bg-neo-dark text-neo-accent border-y-2 md:border-y-3 border-neo-dark py-1 md:py-2">
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
    );
}
