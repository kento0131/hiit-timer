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

  const checkOnboarding = async (userId: string) => {
    // Check if user has target_days set
    const { data } = await supabase
      .from('profiles')
      .select('target_days')
      .eq('id', userId)
      .single();

    // If target_days exists and has length, onboarding is done
    if (data && data.target_days && data.target_days.length > 0) {
      setOnboardingComplete(true);
    } else {
      setOnboardingComplete(false);
    }
    setLoading(false);
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

  return (
    <>
      <TotalTimeHeader settings={settings} />
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
