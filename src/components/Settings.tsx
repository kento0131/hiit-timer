import { Play, Minus, Plus, Zap, Coffee, Layers } from 'lucide-react';
import type { TimerSettings } from '../hooks/useTimer';

interface SettingsProps {
    settings: TimerSettings;
    onUpdate: (settings: Partial<TimerSettings>) => void;
    onStart: () => void;
}

const PresetButton = ({ label, onClick, active }: { label: string; onClick: () => void; active?: boolean }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${active
            ? 'bg-white text-black border-white shadow-lg scale-105'
            : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'
            }`}
    >
        {label}
    </button>
);

const Section = ({ title, icon: Icon, colorClass, children }: { title: string; icon: any; colorClass: string; children: React.ReactNode }) => (
    <div className="glass-panel p-6 rounded-2xl space-y-4">
        <div className={`flex items-center gap-2 ${colorClass}`}>
            <Icon className="w-5 h-5" />
            <h3 className="font-bold uppercase tracking-wider text-sm">{title}</h3>
        </div>
        {children}
    </div>
);

export const Settings: React.FC<SettingsProps> = ({ settings, onUpdate, onStart }) => {
    return (
        <div className="flex flex-col items-center w-full max-w-md mx-auto p-6 pb-24 space-y-6 pt-24">

            {/* Work Settings */}
            <Section title="Work (Active)" icon={Zap} colorClass="text-orange-500">
                <div className="flex flex-col gap-4">
                    <div className="flex items-end justify-between">
                        <span className="text-4xl font-bold font-mono text-white">{settings.workTime}<span className="text-lg text-gray-500 ml-1">s</span></span>
                        <div className="flex gap-2">
                            {[20, 30, 45, 60].map(val => (
                                <PresetButton
                                    key={val}
                                    label={`${val}s`}
                                    onClick={() => onUpdate({ workTime: val })}
                                    active={settings.workTime === val}
                                />
                            ))}
                        </div>
                    </div>
                    <input
                        type="range"
                        min="5"
                        max="180"
                        step="5"
                        value={settings.workTime}
                        onChange={(e) => onUpdate({ workTime: Number(e.target.value) })}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500 hover:accent-orange-400 transition-all"
                    />
                </div>
            </Section>

            {/* Rest Settings */}
            <Section title="Rest (Relax)" icon={Coffee} colorClass="text-teal-400">
                <div className="flex flex-col gap-4">
                    <div className="flex items-end justify-between">
                        <span className="text-4xl font-bold font-mono text-white">{settings.restTime}<span className="text-lg text-gray-500 ml-1">s</span></span>
                        <div className="flex gap-2">
                            {[10, 15, 30, 60].map(val => (
                                <PresetButton
                                    key={val}
                                    label={`${val}s`}
                                    onClick={() => onUpdate({ restTime: val })}
                                    active={settings.restTime === val}
                                />
                            ))}
                        </div>
                    </div>
                    <input
                        type="range"
                        min="5"
                        max="120"
                        step="5"
                        value={settings.restTime}
                        onChange={(e) => onUpdate({ restTime: Number(e.target.value) })}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-teal-400 hover:accent-teal-300 transition-all"
                    />
                </div>
            </Section>

            {/* Sets Settings */}
            <Section title="Sets" icon={Layers} colorClass="text-purple-400">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <span className="text-4xl font-bold font-mono text-white">{settings.totalSets}<span className="text-lg text-gray-500 ml-1">sets</span></span>
                        <div className="flex gap-2">
                            <button onClick={() => onUpdate({ totalSets: Math.max(1, settings.totalSets - 1) })} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                                <Minus className="w-5 h-5" />
                            </button>
                            <button onClick={() => onUpdate({ totalSets: settings.totalSets + 1 })} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                    <input
                        type="range"
                        min="1"
                        max="20"
                        step="1"
                        value={settings.totalSets}
                        onChange={(e) => onUpdate({ totalSets: Number(e.target.value) })}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-400 hover:accent-purple-300 transition-all"
                    />
                </div>
            </Section>

            {/* Start Button */}
            <button
                onClick={onStart}
                className="w-full group relative overflow-hidden bg-white text-black rounded-2xl py-4 px-6 font-bold text-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] mt-8"
            >
                <span className="relative z-10 flex items-center gap-2">
                    START WORKOUT
                    <Play className="w-6 h-6 fill-current" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            </button>
        </div>
    );
};
