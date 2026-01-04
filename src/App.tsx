import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { useTimer } from './hooks/useTimer';
import { Settings } from './components/Settings';
import { TimerDisplay } from './components/TimerDisplay';
import { TotalTimeHeader } from './components/TotalTimeHeader';
import { SocialDashboard } from './components/SocialDashboard';
import { PokeNotification } from './components/PokeNotification';
import { AuthScreen } from './components/AuthScreen';
import { OnboardingScreen } from './components/OnboardingScreen';

function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const { state, settings, actions } = useTimer({
    workTime: 20,
    restTime: 10,
    totalSets: 8
  });

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) checkOnboarding(session.user.id);
      else setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) checkOnboarding(session.user.id);
      else setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Handle timer completion
  useEffect(() => {
    if (state.phase === 'complete' && session?.user?.id) {
      recordWorkoutLog(session.user.id);
    }
  }, [state.phase, session]);

  const recordWorkoutLog = async (userId: string) => {
    try {
      // Check if already logged today to prevent duplicates (optional but good)
      const today = new Date().toISOString().split('T')[0];
      const { data: existing } = await supabase
        .from('workout_logs')
        .select('id')
        .eq('user_id', userId)
        .gte('created_at', today)
        .maybeSingle(); // Use maybeSingle to avoid error if 0 rows

      if (!existing) {
        // Calculate total duration roughly (sets * (work+rest))
        // For accuracy we could pass it from useTimer, but for now approximation is fine or 0
        const duration = settings.totalSets * (settings.workTime + settings.restTime);
        await supabase.from('workout_logs').insert({ user_id: userId, total_duration: duration });
        console.log('Workout logged!');
      }
    } catch (e) {
      console.error('Error logging workout:', e);
    }
  };

  const checkOnboarding = async (userId: string) => {
    // Check if user has target_days AND custom_id set
    const { data } = await supabase
      .from('profiles')
      .select('target_days, custom_id')
      .eq('id', userId)
      .single();

    // Both must be present to consider onboarding complete
    if (data && data.target_days && data.target_days.length > 0 && data.custom_id) {
      setOnboardingComplete(true);
    } else {
      setOnboardingComplete(false);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setOnboardingComplete(false);
  };

  if (loading) {
    return <div className="min-h-screen bg-[#121216] flex items-center justify-center text-white">Loading...</div>;
  }

  if (!session) {
    return <AuthScreen />;
  }

  if (!onboardingComplete) {
    return <OnboardingScreen onComplete={() => setOnboardingComplete(true)} />;
  }

  if (isEditing) {
    return (
      <OnboardingScreen
        onComplete={() => setIsEditing(false)}
        initialStep={2} // Jump to schedule
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  return (
    <>
      <TotalTimeHeader
        settings={settings}
        onLogout={handleLogout}
        onEditSchedule={() => setIsEditing(true)}
      />
      <PokeNotification />
      {state.phase === 'idle' ? (
        <>
          <Settings
            settings={settings}
            onUpdate={actions.updateSettings}
            onStart={actions.start}
          />
          <div className="pb-8">
            <SocialDashboard />
          </div>
        </>
      ) : (
        <TimerDisplay
          phase={state.phase}
          timeLeft={state.timeLeft}
          currentSet={state.currentSet}
          totalSets={settings.totalSets}
          isActive={state.isActive}
          onPause={actions.pause}
          onResume={actions.start}
          onReset={actions.reset}
        />
      )}
    </>
  );
}

export default App;
