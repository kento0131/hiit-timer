
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
    const getBackgroundColor = () => {
        switch (phase) {
            case 'work': return 'bg-red-600';
            case 'rest': return 'bg-blue-600';
            case 'complete': return 'bg-green-600';
            default: return 'bg-gray-900';
        }
    };

    const getPhaseLabel = () => {
        switch (phase) {
            case 'work': return 'WORK';
            case 'rest': return 'REST';
            case 'complete': return 'COMPLETE';
            default: return 'READY';
        }
    };

    return (
        <div className={clsx(
            "fixed inset-0 flex flex-col items-center justify-center text-white transition-colors duration-500 ease-in-out touch-none select-none",
            getBackgroundColor()
        )}>
            {/* Set Counter */}
            <div className="absolute top-12 text-center opacity-80">
                <span className="text-xl font-medium tracking-widest uppercase">Set</span>
                <div className="text-4xl font-bold mt-1">
                    {currentSet} <span className="text-2xl font-normal opacity-60">/ {totalSets}</span>
                </div>
            </div>

            {/* Main Timer */}
            <div className="flex flex-col items-center z-10 scale-150 transform">
                <div className="text-2xl font-bold tracking-[0.5em] mb-4 opacity-75 animate-pulse">
                    {getPhaseLabel()}
                </div>
                <div className="text-[12rem] leading-none font-bold tabular-nums tracking-tighter drop-shadow-2xl">
                    {timeLeft}
                </div>
            </div>

            {/* Controls */}
            <div className="absolute bottom-16 flex gap-8 items-center z-20">
                <button
                    onClick={onReset}
                    className="p-4 rounded-full bg-black/20 hover:bg-black/30 backdrop-blur-sm transition-all active:scale-95"
                    aria-label="Reset"
                >
                    <RotateCcw className="w-8 h-8" />
                </button>

                <button
                    onClick={isActive ? onPause : onResume}
                    className="p-8 rounded-full bg-white text-black shadow-2xl hover:bg-gray-100 transition-all active:scale-95"
                    aria-label={isActive ? "Pause" : "Resume"}
                >
                    {isActive ? (
                        <Pause className="w-12 h-12 fill-current" />
                    ) : (
                        <Play className="w-12 h-12 fill-current ml-1" />
                    )}
                </button>
            </div>

            {/* Progress Bar */}
            <div className="absolute top-0 left-0 w-full h-2 bg-black/10">
                <div
                    className="h-full bg-white/50 transition-all duration-1000 ease-linear"
                    style={{ width: `${(currentSet / totalSets) * 100}%` }}
                />
            </div>
        </div>
    );
};
