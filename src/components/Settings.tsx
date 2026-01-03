
import type { TimerSettings } from '../hooks/useTimer';
import { Play, Minus, Plus } from 'lucide-react';

interface SettingsProps {
    settings: TimerSettings;
    onUpdate: (settings: Partial<TimerSettings>) => void;
    onStart: () => void;
}

const NumberStepper = ({
    label,
    value,
    onChange,
    min = 0,
    unit = ''
}: {
    label: string;
    value: number;
    onChange: (val: number) => void;
    min?: number;
    unit?: string;
}) => (
    <div className="bg-white/5 p-4 rounded-xl backdrop-blur-sm border border-white/10 flex items-center justify-between">
        <span className="text-gray-300 font-medium">{label}</span>
        <div className="flex items-center gap-4">
            <button
                onClick={() => onChange(Math.max(min, value - 1))}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors active:scale-95 touch-none"
            >
                <Minus className="w-5 h-5 text-white" />
            </button>
            <div className="w-20 text-center font-bold text-2xl text-white font-mono">
                {value}<span className="text-sm font-normal text-gray-400 ml-1">{unit}</span>
            </div>
            <button
                onClick={() => onChange(value + 1)}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors active:scale-95 touch-none"
            >
                <Plus className="w-5 h-5 text-white" />
            </button>
        </div>
    </div>
);

export const Settings: React.FC<SettingsProps> = ({ settings, onUpdate, onStart }) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[100dvh] w-full bg-slate-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black text-white p-6">

            <div className="w-full max-w-md space-y-8 relative z-10">
                <div className="text-center space-y-2">
                    <div className="inline-block p-3 rounded-2xl bg-gradient-to-br from-red-500 to-orange-600 mb-4 shadow-lg shadow-red-500/20">
                        <Play className="w-8 h-8 fill-white text-white" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                        HIIT Timer
                    </h1>
                    <p className="text-gray-400 text-sm">Design your perfect workout</p>
                </div>

                <div className="space-y-4">
                    <NumberStepper
                        label="Work"
                        value={settings.workTime}
                        onChange={(v) => onUpdate({ workTime: v })}
                        min={5}
                        unit="s"
                    />
                    <NumberStepper
                        label="Rest"
                        value={settings.restTime}
                        onChange={(v) => onUpdate({ restTime: v })}
                        min={5}
                        unit="s"
                    />
                    <NumberStepper
                        label="Sets"
                        value={settings.totalSets}
                        onChange={(v) => onUpdate({ totalSets: v })}
                        min={1}
                    />
                </div>

                <button
                    onClick={onStart}
                    className="w-full group relative overflow-hidden bg-white text-black rounded-2xl py-4 px-6 font-bold text-lg hover:bg-gray-100 active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]"
                >
                    <span className="relative z-10 flex items-center gap-2">
                        START WORKOUT
                        <Play className="w-5 h-5 fill-current" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                </button>
            </div>

            {/* Decorative background elements */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-red-500/10 rounded-full blur-[100px]" />
            </div>
        </div>
    );
};
