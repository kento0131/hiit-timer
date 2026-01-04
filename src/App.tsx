import { useTimer } from './hooks/useTimer';
import { Settings } from './components/Settings';
import { TimerDisplay } from './components/TimerDisplay';
import { TotalTimeHeader } from './components/TotalTimeHeader';
import { SocialDashboard } from './components/SocialDashboard';
import { PokeNotification } from './components/PokeNotification';

function App() {
  const { state, settings, actions } = useTimer({
    workTime: 20,
    restTime: 10,
    totalSets: 8
  });

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
