import { useState, useEffect, useRef, useCallback } from 'react';
import { audioService } from '../utils/audio';

export type TimerPhase = 'idle' | 'work' | 'rest' | 'complete';

export interface TimerSettings {
    workTime: number;
    restTime: number;
    totalSets: number;
}

export const useTimer = (initialSettings: TimerSettings) => {
    const [settings, setSettings] = useState<TimerSettings>(initialSettings);
    const [phase, setPhase] = useState<TimerPhase>('idle');
    const [timeLeft, setTimeLeft] = useState(initialSettings.workTime);
    const [currentSet, setCurrentSet] = useState(1);
    const [isActive, setIsActive] = useState(false);

    // References to track state inside interval without dependencies
    const stateRef = useRef({
        phase,
        timeLeft,
        currentSet,
        settings,
        isActive
    });

    useEffect(() => {
        stateRef.current = { phase, timeLeft, currentSet, settings, isActive };
    }, [phase, timeLeft, currentSet, settings, isActive]);

    const tick = useCallback(() => {
        const { phase, timeLeft, currentSet, settings } = stateRef.current;

        if (timeLeft <= 0) {
            // Phase transition logic
            if (phase === 'work') {
                if (currentSet >= settings.totalSets) {
                    setPhase('complete');
                    setIsActive(false);
                    audioService.playBeep('long'); // Complete sound
                    return;
                }
                setPhase('rest');
                setTimeLeft(settings.restTime);
                audioService.playBeep('long');
            } else if (phase === 'rest') {
                setPhase('work');
                setTimeLeft(settings.workTime);
                setCurrentSet(s => s + 1);
                audioService.playBeep('long');
            }
            return;
        }

        // Countdown logic
        // Beep at 3, 2, 1
        if (timeLeft <= 3 && timeLeft > 0) {
            audioService.playBeep('short');
        }

        setTimeLeft(t => t - 1);
    }, []);

    useEffect(() => {
        let interval: number | null = null;
        if (isActive && phase !== 'complete') {
            interval = window.setInterval(tick, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isActive, phase, tick]);

    const start = () => {
        if (phase === 'idle' || phase === 'complete') {
            setPhase('work');
            setTimeLeft(settings.workTime);
            setCurrentSet(1);
            // Play start sound
            audioService.playBeep('long');
        }
        setIsActive(true);
    };

    const pause = () => setIsActive(false);

    const reset = () => {
        setIsActive(false);
        setPhase('idle');
        setTimeLeft(settings.workTime);
        setCurrentSet(1);
    };

    const updateSettings = (newSettings: Partial<TimerSettings>) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
        // If idle, update display time immediately if workTime changed
        if (phase === 'idle') {
            if (newSettings.workTime) setTimeLeft(newSettings.workTime);
        }
    };

    return {
        state: { phase, timeLeft, currentSet, isActive },
        settings,
        actions: { start, pause, reset, updateSettings }
    };
};
