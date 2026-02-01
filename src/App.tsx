import { useState } from 'react';
import { Layout } from './components/Layout';
import { HeroInput } from './components/HeroInput';
import { Dashboard } from './components/Dashboard';
import { generateNanoTasksFromGemini } from './utils/gemini';
import { type NanoTask } from './utils/apiMock';
import { AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [tasks, setTasks] = useState<NanoTask[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState<string>('');

  const handleSubmit = async (goal: string, durationStr: string) => {
    setIsLoading(true);
    setError(null);
    setDuration(durationStr);
    try {
      const generatedTasks = await generateNanoTasksFromGemini(goal, durationStr);
      setTasks(generatedTasks);
    } catch (error: any) {
      console.error("Failed to generate tasks", error);
      if (error.message === "QUOTA_EXCEEDED") {
        setError("잠시만 쉬었다가 다시 시도해 주세요 (API 호출 횟수 초과)");
      } else {
        setError(`작업을 나누는 중 오류가 발생했습니다: ${error.message || "알 수 없는 오류"}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setTasks(null);
    setDuration('');
  };

  return (
    <Layout>
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 text-sm font-medium"
          >
            <AlertCircle className="w-4 h-4" />
            {error}
            <button onClick={() => setError(null)} className="ml-2 hover:bg-red-200 rounded p-0.5">✕</button>
          </motion.div>
        )}
      </AnimatePresence>
      {!tasks ? (
        <HeroInput onSubmit={handleSubmit} isLoading={isLoading} />
      ) : (
        <Dashboard tasks={tasks} onReset={handleReset} duration={duration} />
      )}
    </Layout>
  );
}

export default App;
