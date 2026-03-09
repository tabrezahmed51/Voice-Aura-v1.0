
import React, { useRef, useEffect } from 'react';
import { WaveformRegion } from '../types';

interface WaveformVisualizerProps {
  analyserNode?: AnalyserNode;
  audioBuffer?: AudioBuffer;
  isRecording: boolean;
  color?: string;
  regions?: WaveformRegion[];
  onSelectRange?: (start: number, end: number) => void;
}

const BG_COLOR = 'var(--carbon-base)'; 
const INACTIVE_LINE_COLOR = 'var(--tension-line)';

const drawRealtimeWaveform = (
  canvas: HTMLCanvasElement,
  analyserNode: AnalyserNode,
  color: string
) => {
  const canvasCtx = canvas.getContext('2d');
  if (!canvasCtx) return;

  const bufferLength = analyserNode.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  let animationFrameId: number;

  const draw = () => {
    animationFrameId = requestAnimationFrame(draw);
    analyserNode.getByteTimeDomainData(dataArray);

    canvasCtx.fillStyle = BG_COLOR;
    canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = color;
    canvasCtx.beginPath();

    const sliceWidth = (canvas.width * 1.0) / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0;
      const y = (v * canvas.height) / 2;

      if (i === 0) {
        canvasCtx.moveTo(x, y);
      } else {
        canvasCtx.lineTo(x, y);
      }
      x += sliceWidth;
    }

    canvasCtx.lineTo(canvas.width, canvas.height / 2);
    canvasCtx.stroke();
  };

  draw();
  return () => cancelAnimationFrame(animationFrameId);
};

const drawStaticWaveform = (
  canvas: HTMLCanvasElement,
  audioBuffer: AudioBuffer,
  color: string,
  regions: WaveformRegion[] = [],
  hoveredRegionIndex: number | null = null,
  zoom: number = 1,
  offset: number = 0
) => {
  const canvasCtx = canvas.getContext('2d');
  if (!canvasCtx) return;

  const data = audioBuffer.getChannelData(0);
  const totalSamples = data.length;
  const visibleSamples = totalSamples / zoom;
  const startSample = offset * totalSamples;
  const endSample = startSample + visibleSamples;
  
  const step = Math.ceil(visibleSamples / canvas.width);
  const amp = canvas.height / 2;

  canvasCtx.fillStyle = BG_COLOR;
  canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw Regions (Highlights)
  regions.forEach((region, idx) => {
      // Adjust region start/end based on zoom and offset
      const rStart = (region.start - offset) * zoom;
      const rEnd = (region.end - offset) * zoom;
      
      if (rEnd < 0 || rStart > 1) return; // Out of view

      const x = Math.max(0, rStart * canvas.width);
      const w = Math.min(canvas.width - x, (rEnd - rStart) * canvas.width);
      const isHovered = idx === hoveredRegionIndex;
      
      // Semi-transparent background
      const opacity = isHovered ? 0.45 : 0.2;
      canvasCtx.fillStyle = region.color.replace(')', `, ${opacity})`).replace('rgb', 'rgba').replace('var(--color-accent)', `rgba(6, 182, 212, ${opacity})`);
      canvasCtx.fillRect(x, 0, w, canvas.height);
      
      // Top and bottom borders
      canvasCtx.fillStyle = region.color;
      canvasCtx.fillRect(x, 0, w, isHovered ? 4 : 2);
      canvasCtx.fillRect(x, canvas.height - (isHovered ? 4 : 2), w, isHovered ? 4 : 2);

      // Label
      if (region.label && rStart >= 0) {
          canvasCtx.font = `${isHovered ? '900' : 'bold'} 10px "JetBrains Mono"`;
          canvasCtx.fillStyle = region.color;
          canvasCtx.fillText(region.label.toUpperCase(), x + 6, 14);
      }
  });

  canvasCtx.lineWidth = 1;
  canvasCtx.strokeStyle = color;
  canvasCtx.beginPath();

  for (let i = 0; i < canvas.width; i++) {
    let min = 1.0;
    let max = -1.0;

    const currentStart = startSample + (i * step);
    
    for (let j = 0; j < step; j++) {
      const idx = Math.floor(currentStart + j);
      if (idx >= totalSamples) break;
      const datum = data[idx];
      if (datum < min) min = datum;
      if (datum > max) max = datum;
    }
    
    if (min <= max) {
        canvasCtx.moveTo(i, (1 + min) * amp);
        canvasCtx.lineTo(i, (1 + max) * amp);
    }
  }
  canvasCtx.stroke();
};

const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({
  analyserNode,
  audioBuffer,
  isRecording,
  color = 'var(--accent)',
  regions = [],
  onSelectRange
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredRegionIndex, setHoveredRegionIndex] = React.useState<number | null>(null);
  const [zoom, setZoom] = React.useState(1);
  const [offset, setOffset] = React.useState(0); // 0 to 1
  const [selection, setSelection] = React.useState<{ start: number, end: number } | null>(null);
  const [isSelecting, setIsSelecting] = React.useState(false);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isRecording || !audioBuffer || e.shiftKey) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const xPercent = x / canvas.width;
    const actualPercent = offset + (xPercent / zoom);
    
    setSelection({ start: actualPercent, end: actualPercent });
    setIsSelecting(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isRecording || !audioBuffer) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const xPercent = x / canvas.width;
    
    // Adjust xPercent for zoom and offset
    const actualPercent = offset + (xPercent / zoom);
    
    const idx = regions.findIndex(r => actualPercent >= r.start && actualPercent <= r.end);
    setHoveredRegionIndex(idx !== -1 ? idx : null);

    // Handle Selection
    if (isSelecting && selection) {
        setSelection(prev => prev ? { ...prev, end: actualPercent } : null);
    }

    // Handle Panning if mouse is down and shift is held
    if (e.buttons === 1 && e.shiftKey) {
        const movementX = e.movementX;
        const movementPercent = movementX / canvas.width;
        const offsetChange = movementPercent / zoom;
        setOffset(prev => Math.max(0, Math.min(1 - 1/zoom, prev - offsetChange)));
    }
  };

  const handleMouseUp = () => {
    if (isSelecting && selection && onSelectRange) {
        const s = Math.min(selection.start, selection.end);
        const e = Math.max(selection.start, selection.end);
        if (e - s > 0.001) {
            onSelectRange(s, e);
        } else {
            setSelection(null);
        }
    }
    setIsSelecting(false);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
      if (isRecording || !audioBuffer) return;
      e.preventDefault();
      
      const zoomFactor = 1.1;
      const direction = e.deltaY > 0 ? 1 / zoomFactor : zoomFactor;
      
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const xPercent = x / canvas.width;
      
      const mousePosBeforeZoom = offset + (xPercent / zoom);
      
      const newZoom = Math.max(1, Math.min(50, zoom * direction));
      const newOffset = Math.max(0, Math.min(1 - 1/newZoom, mousePosBeforeZoom - (xPercent / newZoom)));
      
      setZoom(newZoom);
      setOffset(newOffset);
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

    let cancelAnimation: (() => void) | undefined;

    if (isRecording && analyserNode) {
      cancelAnimation = drawRealtimeWaveform(canvas, analyserNode, color);
    } else if (!isRecording && audioBuffer) {
      // Create a temporary regions array that includes the current selection
      const displayRegions = [...regions];
      if (selection) {
          displayRegions.push({
              start: Math.min(selection.start, selection.end),
              end: Math.max(selection.start, selection.end),
              color: 'rgba(255, 255, 255, 0.4)',
              label: 'Selection'
          });
      }
      drawStaticWaveform(canvas, audioBuffer, color, displayRegions, hoveredRegionIndex, zoom, offset);
    } else {
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.fillStyle = BG_COLOR;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.strokeStyle = INACTIVE_LINE_COLOR; 
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, canvas.height / 2);
            ctx.lineTo(canvas.width, canvas.height / 2);
            ctx.stroke();
        }
    }

    return () => {
      if (cancelAnimation) {
        cancelAnimation();
      }
      window.removeEventListener('resize', resizeCanvas); 
    };
  }, [analyserNode, audioBuffer, isRecording, color, regions, hoveredRegionIndex, zoom, offset]);

  return (
    <div className="w-full h-full bg-carbon-base rounded-lg shadow-inner border border-tension-line relative overflow-hidden group/waveform">
        <canvas 
          ref={canvasRef} 
          className="w-full h-full cursor-crosshair"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => { setHoveredRegionIndex(null); setIsSelecting(false); }}
          onWheel={handleWheel}
        ></canvas>
        {!isRecording && audioBuffer && (
            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover/waveform:opacity-100 transition-opacity pointer-events-none">
                <div className="px-2 py-1 bg-black/60 backdrop-blur rounded text-[8px] font-mono text-text-dim border border-white/5">
                    SHIFT+DRAG TO PAN | DRAG TO SELECT
                </div>
            </div>
        )}
        {!isRecording && audioBuffer && (
            <div className="absolute bottom-2 right-2 flex gap-2 opacity-0 group-hover/waveform:opacity-100 transition-opacity">
                <div className="px-2 py-1 bg-black/60 backdrop-blur rounded text-[8px] font-mono text-text-dim border border-white/5">
                    ZOOM: {zoom.toFixed(1)}x
                </div>
                <button 
                    onClick={() => { setZoom(1); setOffset(0); }}
                    className="px-2 py-1 bg-accent/20 hover:bg-accent/40 backdrop-blur rounded text-[8px] font-mono text-accent border border-accent/30 transition-colors"
                >
                    RESET
                </button>
            </div>
        )}
    </div>
  );
};

export default WaveformVisualizer;
