import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Flame, UserPlus, Users, Search } from 'lucide-react';

interface Profile {
    id: string;
    username: string;
    avatar_url: string | null;
}

export const SocialDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'friends' | 'find'>('friends');
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
    const [todaysLogs, setTodaysLogs] = useState<Set<string>>(new Set());
    const [currentUser, setCurrentUser] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const initData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            setCurrentUser(user.id);

            // Fetch who I follow
            const { data: followsData } = await supabase.from('follows').select('following_id').eq('follower_id', user.id);
            const following = new Set(followsData?.map(f => f.following_id) || []);
            setFollowingIds(following);

            // Fetch logs
            const today = new Date().toISOString().split('T')[0];
            const { data: logsData } = await supabase.from('workout_logs').select('user_id').gte('created_at', today);
            setTodaysLogs(new Set(logsData?.map(l => l.user_id)));

            // Fetch ALL profiles (for simple search - scalable for small app)
            const { data: allProfiles } = await supabase.from('profiles').select('*');
            if (allProfiles) setProfiles(allProfiles);
        };
        initData();
    }, []);

    const toggleFollow = async (targetId: string) => {
        if (!currentUser) return;
        const isFollowing = followingIds.has(targetId);

        if (isFollowing) {
            const { error } = await supabase.from('follows').delete().match({ follower_id: currentUser, following_id: targetId });
            if (!error) {
                const next = new Set(followingIds);
                next.delete(targetId);
                setFollowingIds(next);
            }
        } else {
            const { error } = await supabase.from('follows').insert({ follower_id: currentUser, following_id: targetId });
            if (!error) {
                const next = new Set(followingIds);
                next.add(targetId);
                setFollowingIds(next);
            }
        }
    };

    const sendPoke = async (receiverId: string, receiverName: string) => {
        if (!currentUser) return;
        const { error } = await supabase.from('pokes').insert({ sender_id: currentUser, receiver_id: receiverId, message: "Hey! Time to workout! 🔥" });
        if (!error) alert(`Poked ${receiverName}!`);
    };

    // Filter displayed profiles based on Tab
    const displayedProfiles = profiles.filter(p => {
        if (p.id === currentUser) return false;
        if (activeTab === 'friends') {
            return followingIds.has(p.id);
        } else {
            // Find tab: Show those NOT followed (and match search)
            if (followingIds.has(p.id)) return false;
            return p.username.toLowerCase().includes(searchQuery.toLowerCase());
        }
    });

    return (
        <div className="w-full max-w-md mx-auto p-4">

            {/* Tabs */}
            <div className="flex bg-gray-800/50 p-1 rounded-xl mb-6">
                <button
                    onClick={() => setActiveTab('friends')}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === 'friends' ? 'bg-gray-700 text-white shadow-lg' : 'text-gray-400 hover:text-gray-200'}`}
                >
                    <Users className="w-4 h-4" /> Friends
                </button>
                <button
                    onClick={() => setActiveTab('find')}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === 'find' ? 'bg-gray-700 text-white shadow-lg' : 'text-gray-400 hover:text-gray-200'}`}
                >
                    <UserPlus className="w-4 h-4" /> Add Friend
                </button>
            </div>

            {/* Find Search Bar */}
            {activeTab === 'find' && (
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full bg-gray-900/50 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-white/30"
                    />
                </div>
            )}

            {/* List */}
            <div className="space-y-3">
                {displayedProfiles.map(profile => {
                    const isDone = todaysLogs.has(profile.id);

                    return (
                        <div key={profile.id} className="glass-panel p-3 rounded-xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                                    {profile.avatar_url ? (
                                        <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-lg font-bold text-white">{profile.username?.charAt(0) || '?'}</span>
                                    )}
                                </div>
                                <div>
                                    <div className="font-bold text-white">{profile.username || 'Unknown User'}</div>
                                    {activeTab === 'friends' && (
                                        <div className={`text-xs ${isDone ? 'text-green-400' : 'text-gray-500'}`}>
                                            {isDone ? 'Completed Today' : 'Not yet'}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {activeTab === 'friends' ? (
                                    /* Friend Actions: Poke or Unfollow */
                                    <>
                                        {!isDone && (
                                            <button
                                                onClick={() => sendPoke(profile.id, profile.username)}
                                                className="bg-red-500/20 hover:bg-red-500/30 text-red-400 p-2 rounded-lg transition-colors"
                                                title="Poke"
                                            >
                                                <Flame className="w-4 h-4" />
                                            </button>
                                        )}
                                        {/* Optional: Small 'Unfollow' X or similar could go here if needed, keeping it simple for now */}
                                    </>
                                ) : (
                                    /* Find Actions: Follow */
                                    <button
                                        onClick={() => toggleFollow(profile.id)}
                                        className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                                    >
                                        <UserPlus className="w-3 h-3" /> Add
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}

                {displayedProfiles.length === 0 && (
                    <div className="text-center text-gray-500 text-sm py-8">
                        {activeTab === 'find' ? 'No users found.' : 'You haven\'t added any friends yet.'}
                    </div>
                )}
            </div>
        </div>
    );
};
