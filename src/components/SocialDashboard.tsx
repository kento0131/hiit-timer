import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Flame, UserPlus, Users, Search, CheckCircle2 } from 'lucide-react';

interface Profile {
    id: string;
    username: string;
    custom_id?: string; // Add optional custom_id
    avatar_url: string | null;
}

const VAPID_PUBLIC_KEY = 'BAmy3kdkAk5kcwoh_Fjfj6iky7R6OeEqjH5aBeXe1AVmDN6QFRmNbG7EThDmlq8CAOcefkUXw51U5h88iRM-8pk';

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export const SocialDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'friends' | 'find'>('friends');
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
    const [todaysLogs, setTodaysLogs] = useState<Set<string>>(new Set());
    const [currentUser, setCurrentUser] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [pokedUsers, setPokedUsers] = useState<Set<string>>(new Set());
    const [isSubscribed, setIsSubscribed] = useState(false);

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

            // Fetch ALL profiles (still fetching all for simplicity in this scale)
            const { data: allProfiles } = await supabase.from('profiles').select('*');
            if (allProfiles) setProfiles(allProfiles);
        };
        initData();

        // Check subscription status
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            navigator.serviceWorker.ready.then(registration => {
                registration.pushManager.getSubscription().then(subscription => {
                    setIsSubscribed(!!subscription);
                });
            });
        }
    }, [activeTab]); // Refresh when tab changes to get latest status if needed

    const toggleFollow = async (targetId: string) => {
        if (!currentUser) return;
        const isFollowing = followingIds.has(targetId);

        if (isFollowing) {
            await supabase.from('follows').delete().eq('follower_id', currentUser).eq('following_id', targetId);
            const next = new Set(followingIds);
            next.delete(targetId);
            setFollowingIds(next);
        } else {
            await supabase.from('follows').insert({ follower_id: currentUser, following_id: targetId });
            const next = new Set(followingIds);
            next.add(targetId);
            setFollowingIds(next);
        }
    };

    const subscribeUser = async () => {
        if (!('serviceWorker' in navigator)) return;
        const registration = await navigator.serviceWorker.ready;

        try {
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
            });

            // Save subscription to Supabase
            if (currentUser) {
                await supabase.from('profiles').update({ push_subscription: subscription }).eq('id', currentUser);
                setIsSubscribed(true);
                alert('Notifications enabled!');
            }
        } catch (err) {
            console.error('Failed to subscribe:', err);
            alert('Failed to enable notifications. Please check browser settings.');
        }
    };

    const sendPoke = async (receiverId: string) => {
        if (!currentUser) return;

        // Immediate visual feedback
        const next = new Set(pokedUsers);
        next.add(receiverId);
        setPokedUsers(next);

        // Call Vercel API
        try {
            await fetch('/api/poke', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sender_id: currentUser, receiver_id: receiverId })
            });
        } catch (e) {
            console.error('Error sending poke:', e);
            // Fallback to direct DB insert if API fails? 
            // For now, assume API works or failure is acceptable
        }
    };

    // Filter displayed profiles based on Tab
    const displayedProfiles = profiles.filter(p => {
        if (p.id === currentUser) return false;

        if (activeTab === 'friends') {
            return followingIds.has(p.id);
        } else {
            // Find tab: Show those NOT followed 
            if (followingIds.has(p.id)) return false;

            // Search Logic: Match by custom_id (preferred) or username
            if (!searchQuery) return false; // Don't show random people, only search results
            const query = searchQuery.toLowerCase().replace('@', '');
            const matchId = p.custom_id?.toLowerCase().includes(query);
            const matchName = p.username?.toLowerCase().includes(query);
            return matchId || matchName;
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
                        placeholder="Search ID (e.g. @kento)"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full bg-gray-900/50 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-white/30"
                    />
                    {displayedProfiles.length === 0 && searchQuery && (
                        <p className="text-center text-gray-500 text-sm mt-4">No users found.</p>
                    )}
                </div>
            )}

            {/* Notification Toggle */}
            <div className="mb-4 flex justify-end">
                {!isSubscribed && (
                    <button
                        onClick={subscribeUser}
                        className="text-xs text-teal-400 border border-teal-400/30 bg-teal-400/10 px-3 py-1 rounded-full hover:bg-teal-400/20"
                    >
                        Enable Notifications
                    </button>
                )}
            </div>

            {/* List */}
            <div className="space-y-3">
                {/* My Status */}
                {currentUser && profiles.find(p => p.id === currentUser) && (
                    <div className="glass-panel p-3 rounded-xl flex items-center justify-between border-2 border-teal-500/30 bg-teal-500/10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-teal-900/50 flex items-center justify-center overflow-hidden border border-teal-500/50">
                                {profiles.find(p => p.id === currentUser)?.avatar_url ? (
                                    <img src={profiles.find(p => p.id === currentUser)?.avatar_url!} alt="Me" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-lg font-bold text-teal-400">ME</span>
                                )}
                            </div>
                            <div>
                                <div className="font-bold text-white leading-tight">You</div>
                                <div className={`text-xs mt-1 ${todaysLogs.has(currentUser) ? 'text-green-400 flex items-center gap-1' : 'text-orange-400'}`}>
                                    {todaysLogs.has(currentUser) ? <><CheckCircle2 className="w-3 h-3" /> Done</> : 'Not yet'}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

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
                                    <div className="font-bold text-white leading-tight">{profile.username || profile.custom_id || 'Unknown'}</div>
                                    {profile.username && profile.custom_id && (
                                        <div className="text-xs text-teal-400 font-mono">@{profile.custom_id}</div>
                                    )}

                                    {activeTab === 'friends' && (
                                        <div className={`text-xs mt-1 ${isDone ? 'text-green-400 flex items-center gap-1' : 'text-orange-400'}`}>
                                            {isDone ? <><CheckCircle2 className="w-3 h-3" /> Done</> : 'Not yet'}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                {activeTab === 'friends' ? (
                                    !isDone && (
                                        !isDone && (
                                            <button
                                                onClick={() => !pokedUsers.has(profile.id) && sendPoke(profile.id)}
                                                disabled={pokedUsers.has(profile.id)}
                                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${pokedUsers.has(profile.id)
                                                    ? 'bg-green-500/20 text-green-400 cursor-default'
                                                    : 'bg-orange-500/20 text-orange-400 hover:bg-orange-500 hover:text-white active:scale-95'
                                                    }`}
                                                title="Poke friend"
                                            >
                                                {pokedUsers.has(profile.id) ? (
                                                    <CheckCircle2 className="w-5 h-5" />
                                                ) : (
                                                    <Flame className="w-5 h-5" />
                                                )}
                                            </button>
                                        )
                                    )
                                ) : (
                                    <button
                                        onClick={() => toggleFollow(profile.id)}
                                        className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all"
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
