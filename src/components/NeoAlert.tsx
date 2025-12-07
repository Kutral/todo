import { Button } from "./ui/Button";

interface NeoAlertProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export function NeoAlert({ isOpen, title, message, onConfirm, onCancel }: NeoAlertProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-neo-dark/50 backdrop-blur-sm">
            <div className="bg-neo-white border-4 border-neo-dark shadow-neo w-full max-w-sm animate-in zoom-in-95 duration-200">
                <div className="bg-neo-secondary border-b-4 border-neo-dark p-3 flex justify-between items-center">
                    <h3 className="font-black uppercase text-lg tracking-tight">{title}</h3>
                    <button onClick={onCancel} className="p-1 hover:bg-neo-white/50 rounded">
                        <span className="sr-only">Close</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                <div className="p-6">
                    <p className="font-bold text-lg mb-6 leading-relaxed">
                        {message}
                    </p>
                    <div className="flex gap-4">
                        <Button
                            className="flex-1 bg-white text-neo-dark hover:bg-gray-100"
                            onClick={onCancel}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="flex-1 bg-neo-primary text-neo-dark hover:bg-neo-primary/90"
                            onClick={onConfirm}
                        >
                            Yes, Do It
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
