import React, { useMemo } from 'react';
import type { TimerSettings } from '../hooks/useTimer';
import { Clock } from 'lucide-react';

import { UserMenu } from './UserMenu';

interface TotalTimeHeaderProps {
    settings: TimerSettings;
    onLogout: () => void;
    onEditSchedule: () => void;
}

export const TotalTimeHeader: React.FC<TotalTimeHeaderProps> = ({ settings, onLogout, onEditSchedule }) => {
    const totalDuration = useMemo(() => {
        const { workTime, restTime, totalSets } = settings;
        // (Work + Rest) * Sets
        // Note: Usually the last rest is skipped in some logic, but requested calculation is (Work + Rest) * Sets
        // or sometimes rest is between intervals. Based on logic: Work -> Rest -> Work -> ...
        // If we want exact time, let's stick to the simple formula first as requested: (Work + Rest) × Sets
        const seconds = (workTime + restTime) * totalSets;
        return seconds;
    }, [settings]);

    const formatTime = (secs: number) => {
        const hrs = Math.floor(secs / 3600);
        const mins = Math.floor((secs % 3600) / 60);
        const remainingSecs = secs % 60;

        if (hrs > 0) {
            return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
        }
        return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between bg-[#121216]/80 backdrop-blur-md border-b border-white/5">
            <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">Total Time</span>
            </div>

            <div className="flex items-center gap-4">
                <div className="text-xl font-bold font-mono tracking-tight text-white">
                    {formatTime(totalDuration)}
                </div>
                <div className="h-6 w-px bg-white/10 mx-2" />
                <UserMenu onLogout={onLogout} onEditSchedule={onEditSchedule} />
            </div>
        </header>
    );
};
