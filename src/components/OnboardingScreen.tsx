import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Check, CalendarDays, AtSign, ArrowRight, Loader2 } from 'lucide-react';

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
    initialStep?: 1 | 2;
    onCancel?: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete, initialStep = 1, onCancel }) => {
    const [step, setStep] = useState<1 | 2>(initialStep);
    const [customId, setCustomId] = useState('');
    const [selectedDays, setSelectedDays] = useState<Set<string>>(new Set());
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Prefetch existing data
    React.useEffect(() => {
        const loadProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase.from('profiles').select('target_days, custom_id').eq('id', user.id).single();
                if (data) {
                    if (data.custom_id) setCustomId(data.custom_id);
                    if (data.target_days) setSelectedDays(new Set(data.target_days));
                }
            }
            setLoading(false);
        };
        loadProfile();
    }, []);

    const toggleDay = (day: string) => {
        const next = new Set(selectedDays);
        if (next.has(day)) {
            next.delete(day);
        } else {
            next.add(day);
        }
        setSelectedDays(next);
    };

    const handleNextStep = async () => {
        if (!customId.trim()) return;
        setSaving(true);
        setError(null);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Check availability (exclude own ID)
        const { data } = await supabase
            .from('profiles')
            .select('id')
            .eq('custom_id', customId)
            .neq('id', user.id) // unique check excluding self
            .maybeSingle();

        if (data) {
            setError('This ID is already taken.');
            setSaving(false);
            return;
        }

        setStep(2);
        setSaving(false);
    };

    const handleSave = async () => {
        setSaving(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            try {
                const { error } = await supabase
                    .from('profiles')
                    .update({
                        target_days: Array.from(selectedDays),
                        custom_id: customId
                    })
                    .eq('id', user.id);

                if (error) throw error;
                onComplete();
            } catch (err: any) {
                if (err.message.includes('unique')) {
                    setError('This ID was just taken. Please choose another.');
                    setStep(1);
                } else {
                    setError('Failed to save. Please try again.');
                }
            }
        }
        setSaving(false);
    };

    if (loading) {
        return <div className="min-h-screen bg-[#121216] flex items-center justify-center text-white"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <div className="min-h-screen bg-[#121216] flex flex-col items-center justify-center p-6 text-white relative">
            <div className="w-full max-w-md animate-fade-in space-y-8">

                {/* Step Indicator */}
                <div className="flex justify-center gap-2 mb-8">
                    <div className={`h-1 w-8 rounded-full transition-colors ${step >= 1 ? 'bg-teal-500' : 'bg-gray-700'}`} />
                    <div className={`h-1 w-8 rounded-full transition-colors ${step >= 2 ? 'bg-teal-500' : 'bg-gray-700'}`} />
                </div>

                {step === 1 ? (
                    // STEP 1: Custom ID
                    <div className="animate-fade-in space-y-6">
                        <div className="text-center space-y-2">
                            <h2 className="text-3xl font-bold">Choose your ID</h2>
                            <p className="text-gray-400">Friends can find you with this ID.</p>
                        </div>

                        <div className="space-y-4">
                            <div className="relative">
                                <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="text"
                                    value={customId}
                                    onChange={e => {
                                        setCustomId(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''));
                                        setError(null);
                                    }}
                                    placeholder="your_unique_id"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-10 pr-4 text-lg font-mono focus:outline-none focus:border-teal-500/50 transition-all placeholder:text-gray-600"
                                    maxLength={20}
                                />
                            </div>
                            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                            <p className="text-xs text-gray-500 text-center">
                                Only lowercase letters, numbers, and underscores.
                            </p>
                        </div>

                        <div className="flex gap-3">
                            {onCancel && (
                                <button
                                    onClick={onCancel}
                                    className="flex-1 bg-white/5 text-gray-400 font-bold py-4 rounded-xl hover:bg-white/10 transition-all"
                                >
                                    Cancel
                                </button>
                            )}
                            <button
                                onClick={handleNextStep}
                                disabled={!customId || saving}
                                className="flex-[2] bg-teal-500 text-black font-bold py-4 rounded-xl hover:bg-teal-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {saving ? <Loader2 className="animate-spin" /> : <>Next <ArrowRight className="w-4 h-4" /></>}
                            </button>
                        </div>
                    </div>
                ) : (
                    // STEP 2: Schedule
                    <div className="animate-fade-in space-y-6">
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 bg-gradient-to-tr from-teal-400 to-emerald-500 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-teal-500/20 mb-6">
                                <CalendarDays className="w-8 h-8 text-black" />
                            </div>
                            <h2 className="text-3xl font-bold">Set Schedule</h2>
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
                        {error && <p className="text-red-400 text-sm text-center">{error}</p>}

                        <div className="flex gap-3 mt-8">
                            <button
                                onClick={() => setStep(1)}
                                className="flex-1 bg-white/5 text-gray-400 font-bold py-4 rounded-xl hover:bg-white/10 transition-all"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={selectedDays.size === 0 || saving}
                                className="flex-[2] bg-white text-black font-bold py-4 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving ? 'Saving...' : 'Start Training'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
