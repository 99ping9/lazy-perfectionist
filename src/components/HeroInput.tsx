import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';


interface HeroInputProps {
    onSubmit: (goal: string, duration: string) => void;
    isLoading: boolean;
}

export function HeroInput({ onSubmit, isLoading }: HeroInputProps) {
    const [goal, setGoal] = useState('');
    const [duration, setDuration] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (goal && duration) {
            onSubmit(goal, duration);
        }
    };

    return (
        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="space-y-2 text-center">
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 leading-tight">
                    당신의 <span className="text-blue-600">완벽한 계획</span>을<br />
                    아주 작게 부셔드릴게요
                </h1>
                <p className="text-gray-500 text-sm sm:text-base">
                    거창한 목표 때문에 시작이 두려운가요?
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                <div className="space-y-1">
                    <label htmlFor="goal" className="block text-xs font-medium text-gray-500 uppercase tracking-wider pl-1">
                        이루고 싶은 목표
                    </label>
                    <input
                        id="goal"
                        type="text"
                        value={goal}
                        onChange={(e) => setGoal(e.target.value)}
                        placeholder="예: 1시간 집중해서 책 읽기"
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-base shadow-sm hover:border-gray-300"
                        required
                    />
                </div>

                <div className="space-y-1">
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider pl-1">
                        집중할 시간
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                        {['5분', '30분', '1시간', '2시간'].map((t) => (
                            <button
                                key={t}
                                type="button"
                                onClick={() => setDuration(t)}
                                className={cn(
                                    "px-2 py-3 rounded-xl text-sm font-medium transition-all border",
                                    duration === t
                                        ? "bg-blue-50 border-blue-200 text-blue-700 shadow-sm ring-1 ring-blue-500/20"
                                        : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                                )}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="pt-4">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={isLoading || !goal || !duration}
                        className={cn(
                            "w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-white font-medium shadow-lg shadow-blue-500/20 transition-all",
                            isLoading
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
                                : "bg-blue-600 hover:bg-blue-700 hover:shadow-blue-600/30"
                        )}
                    >
                        {isLoading ? (
                            <span className="flex items-center gap-2">
                                <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                                분석 중...
                            </span>
                        ) : (
                            <>
                                <Sparkles className="w-5 h-5" />
                                나노 단위로 쪼개기
                            </>
                        )}
                    </motion.button>
                </div>
            </form>
        </div>
    );
}
