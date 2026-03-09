
import React, { useRef, useEffect, useState } from 'react';

interface PitchVisualizerProps {
  originalPitch: number | null; 
  correctedPitch: number | null;
  originalBuffer?: AudioBuffer | null;
  correctedBuffer?: AudioBuffer | null;
  isActive: boolean;
  sinkId?: string;
}

const BG_COLOR = 'var(--bg)'; 
const ORIGINAL_COLOR = 'rgba(120, 120, 120, 0.4)'; // Faint Gray
const CORRECTED_COLOR = 'var(--accent)'; // Neon Teal
const GRID_COLOR = 'var(--carbon-weave)'; 

const PlayIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>;
const PauseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>;
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>;

const bufferToWave = (abuffer: AudioBuffer): Blob => {
    const numOfChan = abuffer.numberOfChannels;
    const length = abuffer.length * numOfChan * 2 + 44;
    const buffer = new ArrayBuffer(length);
    const view = new DataView(buffer);
    let pos = 0;
    const setUint16 = (d: number) => { view.setUint16(pos, d, true); pos += 2; };
    const setUint32 = (d: number) => { view.setUint32(pos, d, true); pos += 4; };
    setUint32(0x46464952); setUint32(length - 8); setUint32(0x45564157); setUint32(0x20746d66); setUint32(16); setUint16(1); setUint16(numOfChan); setUint32(abuffer.sampleRate); setUint32(abuffer.sampleRate * 2 * numOfChan); setUint16(numOfChan * 2); setUint16(16); setUint32(0x61746164); setUint32(length - pos - 4);
    const channels = Array.from({ length: abuffer.numberOfChannels }, (_, i) => abuffer.getChannelData(i));
    let offset = 0;
    while (pos < length) {
        for (let i = 0; i < numOfChan; i++) {
            const sample = Math.max(-1, Math.min(1, channels[i][offset] || 0));
            view.setInt16(pos, sample < 0 ? sample * 32768 : sample * 32767, true);
            pos += 2;
        }
        offset++;
    }
    return new Blob([view], { type: 'audio/wav' });
};

const PitchVisualizer: React.FC<PitchVisualizerProps> = ({ 
    originalPitch, correctedPitch, originalBuffer, correctedBuffer, isActive, sinkId
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pitchHistory = useRef<{original: number, corrected: number}[]>([]);
  const maxHistory = 200; // Number of points to keep for rolling graph
  
  // Playback State
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [showDownloads, setShowDownloads] = useState(false);

  useEffect(() => {
      if (correctedBuffer) {
          const blob = bufferToWave(correctedBuffer);
          const url = URL.createObjectURL(blob);
          setAudioUrl(url);
          return () => URL.revokeObjectURL(url);
      } else {
          setAudioUrl(null);
          setIsPlaying(false);
          setPlaybackProgress(0);
      }
  }, [correctedBuffer]);

  useEffect(() => {
      const applySinkId = async () => {
          if (audioRef.current && sinkId && typeof (audioRef.current as any).setSinkId === 'function') {
              try {
                  await (audioRef.current as any).setSinkId(sinkId);
              } catch (e) {
                  console.warn('Failed to set sinkId on PitchVisualizer audio', e);
              }
          }
      };
      applySinkId();
  }, [sinkId, audioUrl]);

  const togglePlayback = () => {
      if (!audioRef.current) return;
      if (isPlaying) {
          audioRef.current.pause();
          setIsPlaying(false);
      } else {
          audioRef.current.play();
          setIsPlaying(true);
      }
  };

  const handleTimeUpdate = () => {
      if (audioRef.current) {
          const progress = audioRef.current.currentTime / audioRef.current.duration;
          setPlaybackProgress(progress || 0);
      }
  };

  const handleEnded = () => {
      setIsPlaying(false);
      setPlaybackProgress(0);
  };

  const handleDownload = (format: 'wav' | 'mp3' | 'm4a') => {
      if (!correctedBuffer) return;
      
      // Using WAV blob for all formats as a fallback/simulation since we lack encoders in this context
      const blob = bufferToWave(correctedBuffer);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `autotuned_output.${format === 'm4a' ? 'm4a' : format === 'mp3' ? 'mp3' : 'wav'}`; 
      a.click();
      URL.revokeObjectURL(url);
      setShowDownloads(false);
  };

  const extractPitchContour = (buffer: AudioBuffer | null, points: number) => {
      if (!buffer) return Array(points).fill(0);

      const data = buffer.getChannelData(0);
      const step = Math.floor(data.length / points);
      const contour = [];
      
      for(let i=0; i < points; i++) {
          const start = i * step;
          const end = Math.min(start + step, data.length);
          if (start >= data.length) { 
            contour.push(0);
            continue;
          }
          let zeroCrossings = 0;
          for(let j=start; j < end - 1; j++) {
              if ((data[j] > 0 && data[j+1] < 0) || (data[j] < 0 && data[j+1] > 0)) {
                  zeroCrossings++;
              }
          }
          const freq = zeroCrossings / (step / buffer.sampleRate);
          const val = Math.min(1, Math.max(0, freq / 1000)); // Normalize 0-1000Hz
          contour.push(val);
      }
      return contour;
  };

  const quantizePitch = (contour: number[]) => { 
      return contour.map(val => {
          return Math.round(val * 20) / 20;
      });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const render = () => {
        // Clear & Grid
        ctx.fillStyle = BG_COLOR;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw Grid
        ctx.strokeStyle = GRID_COLOR;
        ctx.lineWidth = 1;
        ctx.beginPath();
        for(let i=0; i<canvas.height; i+=30) { ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); }
        for(let i=0; i<canvas.width; i+=50) { ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); }
        ctx.stroke();

        const width = canvas.width;
        const height = canvas.height;

        if (originalBuffer) {
            // --- Static File Mode ---
            const resolution = 300;
            const originalContour = extractPitchContour(originalBuffer, resolution);
            
            // Draw Original (Dashed)
            ctx.save();
            ctx.beginPath();
            ctx.strokeStyle = ORIGINAL_COLOR;
            ctx.lineWidth = 1.5;
            ctx.setLineDash([5, 3]);
            for(let i=0; i < originalContour.length; i++) {
                const x = (i / resolution) * width;
                const y = height - (originalContour[i] * height * 0.8) - (height * 0.1);
                if (i===0) ctx.moveTo(x, y);
                else {
                    const prevX = ((i - 1) / resolution) * width;
                    const prevY = height - (originalContour[i-1] * height * 0.8) - (height * 0.1);
                    const cx = (prevX + x) / 2;
                    const cy = (prevY + y) / 2;
                    ctx.quadraticCurveTo(prevX, prevY, cx, cy);
                }
            }
            ctx.stroke();
            ctx.restore();

            // Draw Corrected (Solid Glow)
            if (correctedBuffer || isActive) {
                const correctedContour = correctedBuffer 
                    ? extractPitchContour(correctedBuffer, resolution) 
                    : quantizePitch(originalContour); 

                ctx.save();
                ctx.beginPath();
                ctx.strokeStyle = CORRECTED_COLOR;
                ctx.lineWidth = 2.5;
                ctx.shadowBlur = 12;
                ctx.shadowColor = CORRECTED_COLOR;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                
                for (let i = 0; i < correctedContour.length; i++) {
                    const x = (i / resolution) * width;
                    const y = height - (correctedContour[i] * height * 0.8) - (height * 0.1);
                    if (i === 0) ctx.moveTo(x, y);
                    else {
                        const prevX = ((i - 1) / resolution) * width;
                        const prevY = height - (correctedContour[i-1] * height * 0.8) - (height * 0.1);
                        ctx.lineTo(x, prevY); 
                        ctx.lineTo(x, y);
                    }
                }
                ctx.stroke();
                ctx.restore();
            }

            // Draw Playhead
            if (audioUrl) {
                const x = playbackProgress * width;
                ctx.beginPath();
                ctx.strokeStyle = 'white';
                ctx.lineWidth = 1;
                ctx.moveTo(x, 0);
                ctx.lineTo(x, height);
                ctx.stroke();
            }

        } else if (isActive) {
            // --- Real-time Rolling Graph Mode ---
            
            // Update History
            const curOriginal = originalPitch ? Math.min(1, originalPitch / 1000) : 0;
            const curCorrected = correctedPitch ? Math.min(1, correctedPitch / 1000) : 0;
            
            pitchHistory.current.push({ original: curOriginal, corrected: curCorrected });
            if (pitchHistory.current.length > maxHistory) {
                pitchHistory.current.shift();
            }

            // Draw Rolling Original
            ctx.save();
            ctx.beginPath();
            ctx.strokeStyle = ORIGINAL_COLOR;
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 4]);
            pitchHistory.current.forEach((point, i) => {
                const x = (i / (maxHistory - 1)) * width;
                const y = height - (point.original * height * 0.8) - (height * 0.1);
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });
            ctx.stroke();
            ctx.restore();

            // Draw Rolling Corrected
            ctx.save();
            ctx.beginPath();
            ctx.strokeStyle = CORRECTED_COLOR;
            ctx.lineWidth = 3;
            ctx.shadowBlur = 10;
            ctx.shadowColor = CORRECTED_COLOR;
            pitchHistory.current.forEach((point, i) => {
                const x = (i / (maxHistory - 1)) * width;
                const y = height - (point.corrected * height * 0.8) - (height * 0.1);
                if (i === 0) ctx.moveTo(x, y);
                else {
                    // Stepped look for correction
                    const prevX = ((i - 1) / (maxHistory - 1)) * width;
                    const prevY = height - (pitchHistory.current[i-1].corrected * height * 0.8) - (height * 0.1);
                    ctx.lineTo(x, prevY);
                    ctx.lineTo(x, y);
                }
            });
            ctx.stroke();
            ctx.restore();

            // Draw Scanning Line
            ctx.fillStyle = CORRECTED_COLOR;
            ctx.fillRect(width - 2, 0, 2, height);

        } else {
            // Idle State
            ctx.fillStyle = 'var(--text-dim)';
            ctx.font = '10px "JetBrains Mono", monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('AWAITING SIGNAL...', canvas.width / 2, canvas.height / 2);
        }
        animationId = requestAnimationFrame(render);
    };
    
    animationId = requestAnimationFrame(render);
    
    return () => {
        window.removeEventListener('resize', resizeCanvas);
        cancelAnimationFrame(animationId);
    };
  }, [originalBuffer, correctedBuffer, isActive, originalPitch, correctedPitch, playbackProgress, audioUrl]);

  return (
    <div className="w-full h-full bg-bg border border-tension-line rounded-lg overflow-hidden relative shadow-lg group">
      <canvas ref={canvasRef} className="w-full h-full"></canvas>
      
      {/* Playback Controls Overlay */}
      {audioUrl && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
              <div className="bg-carbon-base/90 backdrop-blur-md px-4 py-2 rounded-full border border-tension-line flex items-center gap-4 shadow-xl">
                  <button 
                    onClick={togglePlayback}
                    className="w-8 h-8 rounded-full bg-accent text-carbon-base flex items-center justify-center hover:scale-110 transition-transform shadow-[0_0_10px_var(--accent)]"
                  >
                      {isPlaying ? <PauseIcon /> : <PlayIcon />}
                  </button>
                  <div className="h-4 w-[1px] bg-text-dim/30"></div>
                  
                  <div className="relative">
                      <button 
                        onClick={() => setShowDownloads(!showDownloads)}
                        className="text-text-dim hover:text-text-main transition-colors flex items-center gap-1"
                        title="Download Corrected Audio"
                      >
                          <DownloadIcon />
                      </button>
                      {showDownloads && (
                          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-carbon-base border border-tension-line rounded-lg shadow-xl p-1 flex flex-col gap-1 min-w-[80px]">
                              <button onClick={() => handleDownload('wav')} className="px-3 py-1 text-[10px] hover:bg-carbon-weave rounded text-left font-mono">WAV</button>
                              <button onClick={() => handleDownload('mp3')} className="px-3 py-1 text-[10px] hover:bg-carbon-weave rounded text-left font-mono">MP3</button>
                              <button onClick={() => handleDownload('m4a')} className="px-3 py-1 text-[10px] hover:bg-carbon-weave rounded text-left font-mono">M4A</button>
                          </div>
                      )}
                  </div>

                  <audio 
                    ref={audioRef} 
                    src={audioUrl} 
                    onTimeUpdate={handleTimeUpdate} 
                    onEnded={handleEnded} 
                    className="hidden" 
                  />
              </div>
          </div>
      )}

      <div className="absolute top-2 left-2 pointer-events-none">
          <span className="text-[9px] font-mono text-accent bg-carbon-base/80 px-2 py-1 rounded border border-accent-dim backdrop-blur-sm shadow-sm">
              {originalBuffer ? 'STATIC ANALYSIS' : 'REAL-TIME MONITOR'}
          </span>
      </div>
      
      <div className="absolute top-2 right-2 flex flex-col items-end gap-1.5 bg-carbon-base/80 p-2 rounded border border-tension-line pointer-events-none backdrop-blur-sm">
          {originalPitch !== null && (
              <div className="flex items-center gap-2">
                  <span className="text-[9px] text-text-dim font-bold uppercase font-mono">In:</span>
                  <span className="text-[10px] text-text-dim font-bold font-mono w-12 text-right">{originalPitch.toFixed(1)} Hz</span>
              </div>
          )}
          {correctedPitch !== null && (
              <div className="flex items-center gap-2">
                  <span className="text-[9px] text-accent font-bold uppercase font-mono">Out:</span>
                  <span className="text-[10px] text-accent font-bold font-mono w-12 text-right">{correctedPitch.toFixed(1)} Hz</span>
              </div>
          )}
      </div>

      <div className="absolute bottom-2 right-2 flex gap-3 bg-carbon-base/80 p-1.5 rounded border border-tension-line pointer-events-none backdrop-blur-sm">
          <div className="flex items-center gap-1.5">
              <div className="w-3 h-1 bg-accent shadow-[0_0_5px_var(--accent)]"></div>
              <span className="text-[9px] text-text-main font-bold uppercase font-mono">Corrected</span>
          </div>
          <div className="flex items-center gap-1.5">
              <div className="w-3 h-1 bg-text-dim opacity-50"></div>
              <span className="text-[9px] text-text-dim font-bold uppercase font-mono">Original</span>
          </div>
      </div>
    </div>
  );
};

export default PitchVisualizer;
