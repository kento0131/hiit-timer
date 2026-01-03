
import { useTimer } from './hooks/useTimer';
import { Settings } from './components/Settings';
import { TimerDisplay } from './components/TimerDisplay';

function App() {
  const { state, settings, actions } = useTimer({
    workTime: 20,
    restTime: 10,
    totalSets: 8
  });

  // If timer is idle, show settings. Otherwise (work, rest, complete), show timer display.
  // Note: 'complete' phase should probably also show timer display or a summary, 
  // currently TimerDisplay handles 'complete' phase visual.
  // We can add a "Back to Settings" or "Reset" flow.

  if (state.phase === 'idle') {
    return (
      <Settings
        settings={settings}
        onUpdate={actions.updateSettings}
        onStart={actions.start}
      />
    );
  }

  return (
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
  );
}

export default App;
