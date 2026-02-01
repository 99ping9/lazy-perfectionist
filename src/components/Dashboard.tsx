import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowLeft, RefreshCw } from 'lucide-react';
import { cn } from '../lib/utils';
import type { NanoTask } from '../utils/apiMock';
import confetti from 'canvas-confetti';
import { Timer } from './Timer';

interface DashboardProps {
    tasks: NanoTask[];
    onReset: () => void;
    duration: string;
}

export function Dashboard({ tasks: initialTasks, onReset, duration }: DashboardProps) {
    const [tasks, setTasks] = useState(initialTasks);

    const parseDurationToMinutes = (str: string) => {
        if (str.includes('시간')) return parseInt(str) * 60;
        return parseInt(str);
    };

    const durationMinutes = parseDurationToMinutes(duration);

    const handleToggle = (id: string) => {
        const taskIndex = tasks.findIndex(t => t.id === id);
        if (taskIndex === -1) return;

        const newTasks = [...tasks];
        newTasks[taskIndex].isCompleted = !newTasks[taskIndex].isCompleted;
        setTasks(newTasks);

        if (newTasks[taskIndex].isCompleted) {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe']
            });
        }
    };

    const firstTask = tasks.find(t => t.isFirstStep);
    const otherTasks = tasks.filter(t => !t.isFirstStep);

    return (
        <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in-95 duration-500">
            <div className="flex items-center justify-between">
                <button
                    onClick={onReset}
                    className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    처음으로
                </button>
                <div className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                    {duration} 집중 모드
                </div>
            </div>

            {/* Timer Section */}
            <Timer durationMinutes={durationMinutes} />

            <div className="space-y-6">
                {firstTask && (
                    <div className="bg-white rounded-2xl p-6 shadow-xl shadow-blue-500/10 border border-blue-100 ring-4 ring-blue-50 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span className="text-6xl font-black text-blue-600">1</span>
                        </div>
                        <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-2">
                            지금 당장 실행 시작할것
                        </h3>
                        <div className="flex items-start gap-4">
                            <button
                                onClick={() => handleToggle(firstTask.id)}
                                className={cn(
                                    "mt-1 flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                                    firstTask.isCompleted
                                        ? "bg-blue-600 border-blue-600 text-white scale-110"
                                        : "border-gray-200 text-transparent hover:border-blue-400"
                                )}
                            >
                                <Check className="w-5 h-5" />
                            </button>
                            <p className={cn(
                                "text-2xl font-semibold leading-tight transition-all duration-300",
                                firstTask.isCompleted ? "text-gray-300 line-through decoration-2 decoration-blue-200" : "text-gray-900"
                            )}>
                                {firstTask.text}
                            </p>
                        </div>
                    </div>
                )}

                <div className="relative">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="w-full border-t border-gray-100"></div>
                    </div>
                    <div className="relative flex justify-center">
                        <span className="bg-gray-50 px-3 text-xs text-gray-400">나머지 태스크</span>
                    </div>
                </div>

                <ul className="space-y-3">
                    <AnimatePresence>
                        {otherTasks.map((task, index) => (
                            <motion.li
                                key={task.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="group flex items-center gap-3 bg-white p-4 rounded-xl border border-gray-100 hover:border-blue-100 hover:shadow-sm transition-all"
                            >
                                <button
                                    onClick={() => handleToggle(task.id)}
                                    className={cn(
                                        "flex-shrink-0 w-6 h-6 rounded-full border flex items-center justify-center transition-all duration-200",
                                        task.isCompleted
                                            ? "bg-blue-100 border-blue-200 text-blue-600"
                                            : "border-gray-200 text-transparent hover:border-gray-300"
                                    )}
                                >
                                    <Check className="w-3.5 h-3.5" />
                                </button>
                                <span className={cn(
                                    "flex-grow text-gray-600 transition-colors",
                                    task.isCompleted && "text-gray-300 line-through decoration-gray-200"
                                )}>
                                    {task.text}
                                </span>
                            </motion.li>
                        ))}
                    </AnimatePresence>
                </ul>
            </div>

            {tasks.every(t => t.isCompleted) && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-8 space-y-4"
                >
                    <div className="text-4xl mb-2">🎉</div>
                    <h3 className="text-xl font-bold text-gray-900">완벽해요!</h3>
                    <p className="text-gray-500">오늘의 작은 목표를 모두 달성했습니다.</p>

                    <button
                        onClick={onReset}
                        className="inline-flex items-center gap-2 text-blue-600 font-medium hover:underline"
                    >
                        <RefreshCw className="w-4 h-4" />
                        다음 목표 이어서 진행하기
                    </button>
                </motion.div>
            )}
        </div>
    );
}
