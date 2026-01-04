import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Flame, X } from 'lucide-react';

interface PokePayload {
    message: string;
    sender_id: string;
}

export const PokeNotification: React.FC = () => {
    const [poke, setPoke] = useState<PokePayload | null>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const setupSubscription = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const channel = supabase
                .channel('pokes_channel')
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'pokes',
                        filter: `receiver_id=eq.${user.id}`
                    },
                    (payload) => {
                        const newPoke = payload.new as any; // Type assertion as payload structure varies
                        setPoke({
                            message: newPoke.message || 'You got poked!',
                            sender_id: newPoke.sender_id
                        });
                        setVisible(true);

                        // Auto hide after 5 seconds
                        setTimeout(() => setVisible(false), 5000);

                        // Play notification sound if possible?
                        // audioService.playBeep('short'); // Optional
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        };

        setupSubscription();
    }, []);

    if (!visible || !poke) return null;

    return (
        <div className="fixed top-20 right-4 z-[100] bg-red-600/90 backdrop-blur-md text-white p-4 rounded-xl shadow-2xl border border-red-500/50 flex items-start gap-4 animate-slide-in-right max-w-sm">
            <div className="bg-white/20 p-2 rounded-full">
                <Flame className="w-5 h-5 text-yellow-300" />
            </div>
            <div className="flex-1">
                <h4 className="font-bold text-sm uppercase tracking-wider mb-1">Get Moving!</h4>
                <p className="text-sm opacity-90">{poke.message}</p>
            </div>
            <button
                onClick={() => setVisible(false)}
                className="text-white/60 hover:text-white transition-colors"
            >
                <X className="w-5 h-5" />
            </button>
        </div>
    );
};
