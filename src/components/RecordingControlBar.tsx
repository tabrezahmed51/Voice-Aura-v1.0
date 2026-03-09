
import React, { useState, useEffect } from 'react';

interface RecordingControlBarProps {
  isPaused: boolean;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onCancel: () => void;
  onRestart: () => void;
}

const PauseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
);

const PlayIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
);

const StopIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12"></rect></svg>
);

const RestartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6"></path><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
);

const CancelIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

const RecordingControlBar: React.FC<RecordingControlBarProps> = ({ isPaused, onPause, onResume, onStop, onCancel, onRestart }) => {
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    let interval: number | undefined;
    if (!isPaused) {
      interval = window.setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isPaused]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="w-full bg-carbon-base border border-tension-line rounded-lg p-3 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in shadow-xl">
      <div className="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-start">
        <div className="relative flex h-3 w-3">
          {!isPaused && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger opacity-75"></span>
          )}
          <span className={`relative inline-flex rounded-full h-3 w-3 ${isPaused ? 'bg-yellow-500' : 'bg-danger'}`}></span>
        </div>
        <div className="flex flex-col">
            <span className={`text-[10px] font-bold uppercase tracking-widest ${isPaused ? 'text-yellow-500' : 'text-danger'}`}>
                {isPaused ? 'Recording Paused' : 'Recording Live'}
            </span>
            <span className="text-sm font-mono text-text-main font-bold">{formatTime(duration)}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
        <button onClick={onRestart} className="p-2 rounded-lg bg-carbon-weave text-text-dim hover:text-text-main border border-tension-line transition-all hover:scale-110" title="Restart">
            <RestartIcon />
        </button>
        <button onClick={isPaused ? onResume : onPause} className="p-2 rounded-lg bg-carbon-weave text-text-main border border-tension-line transition-all hover:scale-110">
            {isPaused ? <PlayIcon /> : <PauseIcon />}
        </button>
        <button onClick={onStop} className="px-4 py-2 rounded-lg bg-danger text-carbon-base font-bold text-xs uppercase flex items-center gap-2 transition-all hover:brightness-110">
            <StopIcon /> STOP
        </button>
        <button onClick={onCancel} className="p-2 rounded-lg bg-carbon-weave text-text-dim hover:text-danger border border-tension-line transition-all">
            <CancelIcon />
        </button>
      </div>
    </div>
  );
};

export default RecordingControlBar;
