import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, Sparkles } from 'lucide-react';
import { VoiceNote } from '../types/chat';
import { playPcmAudio, speakWithBrowserVoice, stopSpeaking } from '../utils/audio';

interface VoiceNoteBubbleProps {
  voiceNote: VoiceNote;
  text?: string;
  isUser?: boolean;
  senderName: string;
}

export const VoiceNoteBubble: React.FC<VoiceNoteBubbleProps> = ({
  voiceNote,
  text,
  isUser = false,
  senderName,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const timerRef = useRef<any>(null);

  const duration = voiceNote.durationSeconds || Math.max(3, Math.min(12, Math.ceil((text?.length || 20) / 14)));

  const handleTogglePlay = async () => {
    if (isPlaying) {
      stopSpeaking();
      clearInterval(timerRef.current);
      setIsPlaying(false);
      setCurrentTime(0);
      return;
    }

    setIsPlaying(true);
    setCurrentTime(0);

    // Track playback progress visually
    const intervalMs = 100;
    const totalMs = (duration / playbackSpeed) * 1000;
    const startTime = Date.now();

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(duration, (elapsed / totalMs) * duration);
      setCurrentTime(progress);

      if (elapsed >= totalMs) {
        clearInterval(timerRef.current);
        setIsPlaying(false);
        setCurrentTime(0);
      }
    }, intervalMs);

    try {
      if (voiceNote.audioBase64 && voiceNote.isPcm) {
        await playPcmAudio(voiceNote.audioBase64);
        setIsPlaying(false);
        setCurrentTime(0);
        clearInterval(timerRef.current);
      } else if (text) {
        await speakWithBrowserVoice(text, playbackSpeed);
        setIsPlaying(false);
        setCurrentTime(0);
        clearInterval(timerRef.current);
      }
    } catch (e) {
      console.warn('Audio play error, falling back:', e);
      if (text) {
        await speakWithBrowserVoice(text, playbackSpeed);
      }
      setIsPlaying(false);
      setCurrentTime(0);
      clearInterval(timerRef.current);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      stopSpeaking();
    };
  }, []);

  const progressFraction = duration > 0 ? currentTime / duration : 0;
  const bars = voiceNote.waveform || [10, 16, 22, 14, 28, 18, 12, 24, 20, 15, 26, 19, 14, 10];

  const formatTime = (secs: number) => {
    const s = Math.floor(secs);
    const m = Math.floor(s / 60);
    const remainder = s % 60;
    return `${m}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  const toggleSpeed = (e: React.MouseEvent) => {
    e.stopPropagation();
    const speeds = [1, 1.5, 2];
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    setPlaybackSpeed(speeds[nextIdx]);
  };

  return (
    <div className={`p-2.5 rounded-2xl max-w-xs sm:max-w-sm ${
      isUser
        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
        : 'bg-zinc-800/90 text-zinc-100 border border-zinc-700/60'
    } shadow-md`}>
      {/* Header Info */}
      <div className="flex items-center justify-between text-xs mb-1.5 opacity-80 px-1">
        <span className="flex items-center gap-1 font-medium">
          <Volume2 className="w-3.5 h-3.5" />
          {isUser ? 'Your voice note' : `${senderName}'s voice note`}
        </span>
        <button
          onClick={toggleSpeed}
          className="px-1.5 py-0.5 rounded bg-black/20 hover:bg-black/40 text-[10px] font-bold tracking-wider transition-colors"
          title="Playback speed"
        >
          {playbackSpeed}x
        </button>
      </div>

      {/* Audio Waveform Row */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleTogglePlay}
          className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-95 ${
            isUser
              ? 'bg-white text-blue-600 shadow'
              : 'bg-gradient-to-tr from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/20'
          }`}
          aria-label={isPlaying ? 'Pause' : 'Play voice note'}
        >
          {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
        </button>

        {/* Waveform Bars */}
        <div className="flex-1 flex items-center gap-0.5 h-8 px-1">
          {bars.map((height, i) => {
            const barFraction = i / bars.length;
            const isPlayed = barFraction <= progressFraction;

            return (
              <div
                key={i}
                className="flex-1 rounded-full transition-all duration-100"
                style={{
                  height: `${height}px`,
                  backgroundColor: isPlayed
                    ? isUser
                      ? '#ffffff'
                      : '#a855f7' // purple-500
                    : isUser
                    ? 'rgba(255, 255, 255, 0.35)'
                    : 'rgba(161, 161, 170, 0.4)', // zinc-400
                }}
              />
            );
          })}
        </div>

        {/* Time Remaining / Total */}
        <span className="text-[11px] font-mono opacity-80 tabular-nums shrink-0">
          {isPlaying ? formatTime(currentTime) : formatTime(duration)}
        </span>
      </div>

      {/* Transcription snippet if available */}
      {text && (
        <div className="mt-2 pt-2 border-t border-white/10 text-xs opacity-90 italic flex items-start gap-1">
          <Sparkles className="w-3 h-3 shrink-0 mt-0.5 text-amber-300" />
          <span>"{text}"</span>
        </div>
      )}
    </div>
  );
};
