import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Flame } from 'lucide-react';

interface Profile {
    id: string;
    username: string;
    avatar_url: string | null;
}

interface WorkoutLog {
    user_id: string;
    created_at: string;
}

export const SocialDashboard: React.FC = () => {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [todaysLogs, setTodaysLogs] = useState<Set<string>>(new Set());
    const [currentUser, setCurrentUser] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            // Get current user
            const { data: { user } } = await supabase.auth.getUser();
            setCurrentUser(user?.id || null);

            // Fetch profiles
            const { data: profilesData } = await supabase
                .from('profiles')
                .select('*');
            if (profilesData) setProfiles(profilesData);

            // Fetch today's logs
            const today = new Date().toISOString().split('T')[0];
            const { data: logsData } = await supabase
                .from('workout_logs')
                .select('user_id')
                .gte('created_at', today);

            if (logsData) {
                setTodaysLogs(new Set(logsData.map(log => log.user_id)));
            }
        };

        fetchData();

        // Subscribe to changes (simple refresh for now on mount)
        // Ideally utilize Realtime for instant updates
    }, []);

    const sendPoke = async (receiverId: string, receiverName: string) => {
        if (!currentUser) return;

        const { error } = await supabase
            .from('pokes')
            .insert({
                sender_id: currentUser,
                receiver_id: receiverId,
                message: "Hey! Time to workout! 🔥"
            });

        if (error) {
            console.error('Error sending poke:', error);
            alert('Failed to poke.');
        } else {
            alert(`Poked ${receiverName}!`);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto p-4 space-y-4">
            <h3 className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">Friends Status</h3>
            <div className="space-y-3">
                {profiles.map(profile => {
                    const isDone = todaysLogs.has(profile.id);
                    const isMe = profile.id === currentUser;

                    return (
                        <div key={profile.id} className="glass-panel p-3 rounded-xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                                    {/* Avatar placeholder */}
                                    {profile.avatar_url ? (
                                        <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-lg font-bold text-white">{profile.username?.charAt(0) || '?'}</span>
                                    )}
                                </div>
                                <div>
                                    <div className="font-bold text-white">{profile.username || 'Unknown User'}</div>
                                    <div className={`text-xs ${isDone ? 'text-green-400' : 'text-gray-500'}`}>
                                        {isDone ? 'Completed Today' : 'Not yet'}
                                    </div>
                                </div>
                            </div>

                            {!isDone && !isMe && (
                                <button
                                    onClick={() => sendPoke(profile.id, profile.username)}
                                    className="bg-red-500/20 hover:bg-red-500/30 text-red-400 p-2 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold"
                                >
                                    <Flame className="w-4 h-4" />
                                    POKE
                                </button>
                            )}
                            {isDone && <span className="text-green-500 text-xl">✓</span>}
                        </div>
                    );
                })}
                {profiles.length === 0 && (
                    <div className="text-center text-gray-500 text-sm py-4">No friends found.</div>
                )}
            </div>
        </div>
    );
};
