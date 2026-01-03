
import type { TimerSettings } from '../hooks/useTimer';
import { Play } from 'lucide-react';

interface SettingsProps {
    settings: TimerSettings;
    onUpdate: (settings: Partial<TimerSettings>) => void;
    onStart: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ settings, onUpdate, onStart }) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-6 transition-colors duration-500">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h1 className="text-4xl font-bold tracking-tight mb-2">HIIT Timer</h1>
                    <p className="text-gray-400">Configure your training session</p>
                </div>

                <div className="space-y-6 bg-gray-800 p-8 rounded-2xl shadow-xl">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Work Time (seconds)</label>
                        <input
                            type="number"
                            value={settings.workTime}
                            onChange={(e) => onUpdate({ workTime: Math.max(1, parseInt(e.target.value) || 0) })}
                            className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-2xl font-bold text-center focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Rest Time (seconds)</label>
                        <input
                            type="number"
                            value={settings.restTime}
                            onChange={(e) => onUpdate({ restTime: Math.max(0, parseInt(e.target.value) || 0) })}
                            className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-2xl font-bold text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Total Sets</label>
                        <input
                            type="number"
                            value={settings.totalSets}
                            onChange={(e) => onUpdate({ totalSets: Math.max(1, parseInt(e.target.value) || 0) })}
                            className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-2xl font-bold text-center focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                        />
                    </div>
                </div>

                <button
                    onClick={onStart}
                    className="w-full group bg-white text-gray-900 rounded-2xl py-4 px-6 font-bold text-xl hover:bg-gray-100 active:scale-95 transition-all flex items-center justify-center gap-3 shadow-lg shadow-white/10"
                >
                    <Play className="w-6 h-6 fill-current group-hover:scale-110 transition-transform" />
                    Start Workout
                </button>
            </div>
        </div>
    );
};
