
import type { TimerPhase } from '../hooks/useTimer';
import { Pause, Play, RotateCcw } from 'lucide-react';
import { clsx } from 'clsx';

interface TimerDisplayProps {
    phase: TimerPhase;
    timeLeft: number;
    currentSet: number;
    totalSets: number;
    isActive: boolean;
    onPause: () => void;
    onResume: () => void;
    onReset: () => void;
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({
    phase,
    timeLeft,
    currentSet,
    totalSets,
    isActive,
    onPause,
    onResume,
    onReset
}) => {
    const getGradient = () => {
        switch (phase) {
            case 'work': return 'from-red-600 via-orange-600 to-red-800';
            case 'rest': return 'from-blue-600 via-cyan-600 to-blue-800';
            case 'complete': return 'from-emerald-500 via-green-500 to-emerald-700';
            default: return 'from-slate-800 to-slate-900';
        }
    };

    const getPhaseLabel = () => {
        switch (phase) {
            case 'work': return 'WORKOUT';
            case 'rest': return 'REST';
            case 'complete': return 'FINISHED';
            default: return 'READY';
        }
    };

    return (
        <div className={clsx(
            "fixed inset-0 flex flex-col items-center justify-between text-white transition-[background] duration-700 ease-in-out touch-none select-none overflow-hidden",
            "bg-gradient-to-br",
            getGradient()
        )}>
            {/* Background Animated Noise/Grain (Optional, keeping simple for performance) */}

            {/* Top Section: Progress */}
            <div className="w-full pt-12 px-8 flex justify-between items-start z-10">
                <div className="flex flex-col">
                    <span className="text-sm font-medium opacity-60 uppercase tracking-widest">Set</span>
                    <div className="text-3xl font-bold font-mono">
                        {currentSet}<span className="text-xl opacity-50 mx-1">/</span>{totalSets}
                    </div>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-sm font-medium opacity-60 uppercase tracking-widest">Phase</span>
                    <span className="text-xl font-bold tracking-wider">{getPhaseLabel()}</span>
                </div>
            </div>

            {/* Center Section: Timer */}
            <div className="relative z-10 flex-1 flex items-center justify-center">
                {/* Pulsing rings for Work/Rest */}
                {isActive && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-[300px] h-[300px] border-2 border-white/20 rounded-full animate-ping opacity-20" />
                        <div className="w-[400px] h-[400px] border border-white/10 rounded-full animate-ping delay-150 opacity-10" />
                    </div>
                )}

                <div className="text-[25vw] sm:text-[10rem] font-bold leading-none tracking-tighter tabular-nums drop-shadow-2xl font-mono">
                    {timeLeft}
                </div>
            </div>

            {/* Bottom Section: Controls */}
            <div className="w-full pb-16 px-8 flex items-center justify-center gap-8 z-10">
                <button
                    onClick={onReset}
                    className="w-16 h-16 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center hover:bg-black/30 transition-all active:scale-90"
                >
                    <RotateCcw className="w-6 h-6 text-white/80" />
                </button>

                <button
                    onClick={isActive ? onPause : onResume}
                    className="w-24 h-24 rounded-full bg-white text-black shadow-[0_0_40px_-5px_rgba(255,255,255,0.4)] flex items-center justify-center hover:scale-105 transition-all active:scale-95"
                >
                    {isActive ? (
                        <Pause className="w-10 h-10 fill-current" />
                    ) : (
                        <Play className="w-10 h-10 fill-current ml-1" />
                    )}
                </button>
            </div>

            {/* Progress Bar Top */}
            <div className="absolute top-0 left-0 w-full h-1 bg-black/20">
                <div
                    className="h-full bg-white/80 shadow-[0_0_10px_white] transition-all duration-1000 ease-linear"
                    style={{ width: `${(currentSet / totalSets) * 100}%` }}
                />
            </div>
        </div>
    );
};
