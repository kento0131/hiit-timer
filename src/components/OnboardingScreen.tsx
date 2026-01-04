import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Check, CalendarDays } from 'lucide-react';

const DAYS = [
    { id: 'Mon', label: 'Mon' },
    { id: 'Tue', label: 'Tue' },
    { id: 'Wed', label: 'Wed' },
    { id: 'Thu', label: 'Thu' },
    { id: 'Fri', label: 'Fri' },
    { id: 'Sat', label: 'Sat' },
    { id: 'Sun', label: 'Sun' },
];

interface OnboardingScreenProps {
    onComplete: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
    const [selectedDays, setSelectedDays] = useState<Set<string>>(new Set());
    const [saving, setSaving] = useState(false);

    const toggleDay = (day: string) => {
        const next = new Set(selectedDays);
        if (next.has(day)) {
            next.delete(day);
        } else {
            next.add(day);
        }
        setSelectedDays(next);
    };

    const handleSave = async () => {
        setSaving(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            // Update profile with target days
            await supabase
                .from('profiles')
                .update({ target_days: Array.from(selectedDays) })
                .eq('id', user.id);
        }

        setSaving(false);
        onComplete();
    };

    return (
        <div className="min-h-screen bg-[#121216] flex flex-col items-center justify-center p-6 text-white relative">
            <div className="w-full max-w-md animate-fade-in space-y-8">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-gradient-to-tr from-teal-400 to-emerald-500 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-teal-500/20 mb-6">
                        <CalendarDays className="w-8 h-8 text-black" />
                    </div>
                    <h2 className="text-3xl font-bold">Set Your Schedule</h2>
                    <p className="text-gray-400">Which days do you plan to workout?</p>
                </div>

                <div className="grid grid-cols-4 gap-3">
                    {DAYS.map(day => {
                        const isSelected = selectedDays.has(day.id);
                        return (
                            <button
                                key={day.id}
                                onClick={() => toggleDay(day.id)}
                                className={`aspect-square rounded-xl text-sm font-bold flex flex-col items-center justify-center gap-1 transition-all duration-200 ${isSelected
                                        ? 'bg-teal-500 text-black shadow-lg shadow-teal-500/30 scale-105'
                                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                    }`}
                            >
                                {day.label}
                                {isSelected && <Check className="w-3 h-3" />}
                            </button>
                        );
                    })}
                </div>

                <button
                    onClick={handleSave}
                    disabled={selectedDays.size === 0 || saving}
                    className="w-full bg-white text-black font-bold py-4 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-8"
                >
                    {saving ? 'Saving...' : 'Start Training'}
                </button>
            </div>
        </div>
    );
};
