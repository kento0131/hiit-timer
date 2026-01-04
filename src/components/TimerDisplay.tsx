import React, { useEffect, useState } from 'react';
import { Play, Pause, RotateCcw, CheckCircle2 } from 'lucide-react';
import type { TimerPhase } from '../hooks/useTimer';

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
    const [bgColor, setBgColor] = useState('bg-slate-900');

    // Dynamic background based on phase
    useEffect(() => {
        if (phase === 'work') {
            setBgColor('bg-orange-600');
        } else if (phase === 'rest') {
            setBgColor('bg-teal-600');
        } else if (phase === 'complete') {
            setBgColor('bg-emerald-600');
        } else {
            setBgColor('bg-slate-900');
        }
    }, [phase]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getPhaseLabel = () => {
        switch (phase) {
            case 'work': return 'WORK IT!';
            case 'rest': return 'REST';
            case 'complete': return 'COMPLETED';
            default: return 'READY';
        }
    };

    return (
        <div className={`fixed inset-0 w-full h-full transition-colors duration-700 ease-in-out ${bgColor} flex flex-col items-center justify-center overflow-hidden`}>

            {/* Background Animations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vmax] h-[150vmax] rounded-full mix-blend-overlay opacity-20 filter blur-[100px] animate-pulse ${phase === 'work' ? 'bg-red-500' : 'bg-blue-500'}`} />
            </div>

            <div className="relative z-10 flex flex-col items-center gap-8 w-full max-w-md px-6">

                {/* Phase & Sets Info */}
                <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold tracking-[0.2em] text-white/80 animate-fade-in">
                        {getPhaseLabel()}
                    </h2>
                    {phase !== 'complete' && (
                        <div className="glass-panel px-6 py-2 rounded-full inline-flex items-center gap-2 text-white/90">
                            <span className="text-sm font-medium uppercase tracking-wider text-white/60">Set</span>
                            <span className="text-xl font-bold font-mono">{currentSet}</span>
                            <span className="text-white/40">/</span>
                            <span className="text-lg font-mono text-white/60">{totalSets}</span>
                        </div>
                    )}
                </div>

                {/* Main Timer */}
                <div className="relative">
                    <div className="text-[12rem] leading-none font-bold font-mono tracking-tighter tabular-nums drop-shadow-2xl">
                        {formatTime(timeLeft)}
                    </div>
                    {/* Ring or Progress could go here */}
                </div>

                {/* Controls */}
                <div className="flex items-center gap-6 mt-8">
                    {phase === 'complete' ? (
                        <button
                            onClick={onReset}
                            className="bg-white text-emerald-900 px-8 py-4 rounded-2xl font-bold text-lg flex items-center gap-3 shadow-lg hover:bg-emerald-50 hover:scale-105 transition-all"
                        >
                            <RotateCcw className="w-6 h-6" />
                            FINISH WORKOUT
                        </button>
                    ) : (
                        <>
                            {isActive ? (
                                <button
                                    onClick={onPause}
                                    className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 transition-all active:scale-95"
                                >
                                    <Pause className="w-8 h-8 fill-white" />
                                </button>
                            ) : (
                                <button
                                    onClick={onResume}
                                    className="w-20 h-20 rounded-full bg-white text-black flex items-center justify-center hover:bg-gray-100 transition-all active:scale-95 shadow-lg shadow-black/20"
                                >
                                    <Play className="w-8 h-8 fill-black" />
                                </button>
                            )}

                            {!isActive && (
                                <button
                                    onClick={onReset}
                                    className="absolute bottom-12 text-white/60 hover:text-white transition-colors text-sm font-medium uppercase tracking-widest"
                                >
                                    Cancel Workout
                                </button>
                            )}
                        </>
                    )}
                </div>

                {/* Complete State Extra */}
                {phase === 'complete' && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <CheckCircle2 className="w-64 h-64 text-white/20 animate-ping" />
                    </div>
                )}
            </div>
        </div>
    );
};
