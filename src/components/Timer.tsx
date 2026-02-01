import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RefreshCw } from 'lucide-react';
import { cn } from '../lib/utils';

interface TimerProps {
    durationMinutes: number;
    onComplete?: () => void;
}

export function Timer({ durationMinutes, onComplete }: TimerProps) {
    const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);
    const [isActive, setIsActive] = useState(false);
    const [progress, setProgress] = useState(100);

    const totalTime = durationMinutes * 60;

    useEffect(() => {
        let interval: any;

        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => {
                    const newTime = prev - 1;
                    setProgress((newTime / totalTime) * 100);
                    return newTime;
                });
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            if (onComplete) onComplete();
        }

        return () => clearInterval(interval);
    }, [isActive, timeLeft, totalTime, onComplete]);

    const toggleTimer = () => setIsActive(!isActive);
    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(totalTime);
        setProgress(100);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-sm mx-auto">
            <div className="relative w-48 h-48 mb-6">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="#e2e8f0"
                        strokeWidth="8"
                    />
                    <motion.circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="8"
                        strokeLinecap="round"
                        initial={{ pathLength: 1 }}
                        animate={{ pathLength: progress / 100 }}
                        transition={{ duration: 1, ease: "linear" }}
                        style={{ transformOrigin: "50% 50%" }}
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl font-bold font-mono text-gray-800">
                        {formatTime(timeLeft)}
                    </span>
                </div>
            </div>

            <div className="flex gap-4">
                <button
                    onClick={toggleTimer}
                    className={cn(
                        "flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all text-white",
                        isActive
                            ? "bg-amber-500 hover:bg-amber-600 shadow-amber-500/30"
                            : "bg-blue-600 hover:bg-blue-700 shadow-blue-500/30",
                        "shadow-lg hover:scale-105 active:scale-95"
                    )}
                >
                    {isActive ? (
                        <>
                            <Pause className="w-5 h-5 fill-current" />
                            일시정지
                        </>
                    ) : (
                        <>
                            <Play className="w-5 h-5 fill-current" />
                            타이머 시작
                        </>
                    )}
                </button>
                <button
                    onClick={resetTimer}
                    className="p-3 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                >
                    <RefreshCw className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
