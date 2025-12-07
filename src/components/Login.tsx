import { useState } from 'react';
import { signInWithPopup, signInAnonymously } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { Button } from './ui/Button';
import { motion } from 'framer-motion';

export function Login() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError('');
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (err: any) {
            console.error(err);
            setError('Failed to sign in with Google');
        } finally {
            setLoading(false);
        }
    };

    const handleGuestLogin = async () => {
        setLoading(true);
        setError('');
        try {
            await signInAnonymously(auth);
        } catch (err: any) {
            console.error(err);
            setError('Failed to continue as Guest');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neo-bg flex flex-col items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full bg-neo-white border-4 border-neo-dark shadow-neo p-8 flex flex-col gap-6 text-center"
            >
                <h1 className="text-4xl font-black uppercase">NeoTodo</h1>
                <p className="text-neo-dark/70 font-bold">Focus on what matters. <br /> Get things done.</p>

                {error && (
                    <div className="bg-red-100 text-red-800 p-2 font-bold border-2 border-red-800 text-sm">
                        {error}
                    </div>
                )}

                <div className="flex flex-col gap-3">
                    <Button
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="w-full text-lg h-14 bg-white hover:bg-gray-50 text-neo-dark border-2 border-neo-dark"
                    >
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-6 h-6 mr-3" alt="G" />
                        Sign in with Google
                    </Button>

                    <div className="relative py-2">
                        <div className="absolute inset-0 flex items-center"><span className="w-full border-t-2 border-neo-dark/20"></span></div>
                        <div className="relative flex justify-center text-xs uppercase font-black"><span className="bg-neo-white px-2 text-neo-dark/40">Or</span></div>
                    </div>

                    <Button
                        onClick={handleGuestLogin}
                        disabled={loading}
                        variant="secondary"
                        className="w-full text-lg h-14 bg-neo-dark text-neo-white hover:bg-neo-primary hover:text-neo-dark"
                    >
                        Continue as Guest
                    </Button>
                </div>
            </motion.div>
        </div>
    );
}
