import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Square, Trash2, Smile, Sparkles, Film, Flame, MessageCircleCode } from 'lucide-react';
import { QUICK_PROMPTS } from '../data/groupData';
import { soundFX, generateWaveform } from '../utils/audio';

const MANGLISH_SLANG_WORDS = [
  'Rabbe! 😱',
  'Endaa muthey 😂',
  'Ameeneee 🔪',
  'Kozhi rate ethrayaa? 🍗',
  'Sulaimani kudi ☕',
  'Kathi moorchayundo? 🔪',
  'Scene aanu aliyaa 🔥',
  'Thallalle Ikka 🤣',
  '1kg skinless tharo? 🥩',
  'Kozhikode mass 😎',
];

interface ChatInputProps {
  onSendMessage: (text: string, voiceNoteData?: { durationSeconds: number; audioBase64?: string; waveform?: number[] }) => void;
  onSendReel?: () => void;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onSendReel,
  disabled = false,
}) => {
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [showManglishSlang, setShowManglishSlang] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const handleSendText = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed || disabled) return;

    soundFX.playSendPop();
    onSendMessage(trimmed);
    setInputText('');
  };

  const handlePromptClick = (text: string) => {
    soundFX.playSendPop();
    onSendMessage(text);
  };

  const handleSlangClick = (slang: string) => {
    setInputText((prev) => {
      const trimmed = prev.trim();
      return trimmed ? `${trimmed} ${slang}` : slang;
    });
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Start voice recording
  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Microphone access is not supported by your browser.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      setRecordingSeconds(0);
      soundFX.playVoiceBeep();

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Failed to start microphone:', err);
      // Fallback: let user know or use prompt
    }
  };

  // Stop recording and send voice note
  const stopRecordingAndSend = async () => {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state !== 'recording') return;

    clearInterval(timerRef.current);
    setIsRecording(false);
    setIsTranscribing(true);

    const recorder = mediaRecorderRef.current;

    recorder.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      // Stop all tracks
      recorder.stream.getTracks().forEach((track) => track.stop());

      const duration = Math.max(1, recordingSeconds);

      try {
        // Convert blob to base64
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Data = (reader.result as string).split(',')[1];

          // Call backend transcription
          let transcription = '';
          try {
            const res = await fetch('/api/transcribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ audioBase64: base64Data, mimeType: 'audio/webm' }),
            });
            const data = await res.json();
            transcription = data.transcription || '';
          } catch (tErr) {
            console.warn('Transcription failed:', tErr);
          }

          const displayText = transcription.trim() || '🎙️ (Voice note)';
          const waveform = generateWaveform(displayText, 24);

          soundFX.playSendPop();
          onSendMessage(displayText, {
            durationSeconds: duration,
            waveform,
          });
          setIsTranscribing(false);
        };
      } catch (err) {
        console.error('Error processing audio:', err);
        setIsTranscribing(false);
      }
    };

    recorder.stop();
  };

  const cancelRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      mediaRecorderRef.current.stop();
    }
    audioChunksRef.current = [];
    setIsRecording(false);
    setRecordingSeconds(0);
  };

  const formatTimer = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <div className="sticky bottom-0 z-30 bg-zinc-900/95 backdrop-blur-md border-t border-zinc-800 p-2 sm:p-3">
      {/* Quick Prompts & Manglish Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none text-xs">
        <button
          type="button"
          onClick={() => setShowManglishSlang((prev) => !prev)}
          className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 border transition-all active:scale-95 ${
            showManglishSlang
              ? 'bg-amber-500 text-black border-amber-400 shadow-sm'
              : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/30'
          }`}
          title="Toggle Kozhikode Manglish Slang drawer"
        >
          <MessageCircleCode className="w-3.5 h-3.5" />
          <span>Manglish Slang 💬</span>
        </button>

        <span className="text-[11px] text-zinc-500 font-semibold uppercase tracking-wider shrink-0 flex items-center gap-1 pl-1">
          <Sparkles className="w-3 h-3 text-amber-400" /> Prompts:
        </span>
        {QUICK_PROMPTS.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handlePromptClick(p.text)}
            className="shrink-0 px-2.5 py-1 rounded-full bg-zinc-800/90 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700/60 transition-all active:scale-95 text-[11px]"
          >
            {p.label}
          </button>
        ))}
        {onSendReel && (
          <button
            onClick={onSendReel}
            className="shrink-0 px-2.5 py-1 rounded-full bg-gradient-to-r from-pink-600/30 to-purple-600/30 text-pink-300 hover:text-pink-200 border border-pink-500/40 transition-all active:scale-95 text-[11px] flex items-center gap-1 font-medium"
          >
            <Film className="w-3 h-3 text-pink-400" />
            <span>Drop Reel</span>
          </button>
        )}
      </div>

      {/* Expandable Manglish Calicut Slang Drawer */}
      {showManglishSlang && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 pt-0.5 scrollbar-none text-xs animate-in slide-in-from-bottom-1 duration-150">
          <span className="text-[10px] text-amber-400/80 font-bold uppercase tracking-wider shrink-0 pl-1">
            Tap to insert:
          </span>
          {MANGLISH_SLANG_WORDS.map((slang, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSlangClick(slang)}
              className="shrink-0 px-2 py-0.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-200 hover:text-white border border-amber-500/20 text-[11px] font-medium transition-colors active:scale-95"
            >
              {slang}
            </button>
          ))}
        </div>
      )}

      {/* Main Input Row */}
      {isRecording ? (
        /* Live Audio Recording State */
        <div className="flex items-center justify-between gap-3 p-2 bg-zinc-800/90 rounded-2xl border border-red-500/40 animate-pulse">
          <div className="flex items-center gap-2 text-red-400 font-mono text-xs pl-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            <span className="font-bold">{formatTimer(recordingSeconds)}</span>
            <span className="text-zinc-400 font-sans text-xs hidden sm:inline">Recording voice note for Ikka...</span>
          </div>

          {/* Animated Waveform Simulation */}
          <div className="flex items-center gap-1 h-6 flex-1 max-w-[140px] sm:max-w-xs px-2">
            {[4, 12, 18, 8, 22, 14, 26, 10, 19, 15, 24, 8, 16].map((h, i) => (
              <div
                key={i}
                className="flex-1 bg-red-500 rounded-full animate-bounce"
                style={{
                  height: `${h}px`,
                  animationDelay: `${(i % 5) * 120}ms`,
                  animationDuration: '600ms',
                }}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {/* Cancel Button */}
            <button
              onClick={cancelRecording}
              className="p-2 rounded-full hover:bg-zinc-700 text-zinc-400 hover:text-red-400 transition-colors"
              title="Cancel recording"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {/* Send Voice Note Button */}
            <button
              onClick={stopRecordingAndSend}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-red-500/20 active:scale-95 transition-transform"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Note</span>
            </button>
          </div>
        </div>
      ) : isTranscribing ? (
        /* Transcribing State */
        <div className="flex items-center justify-center gap-2 py-3 px-4 bg-zinc-800/70 rounded-2xl border border-purple-500/40 text-purple-300 text-xs animate-pulse">
          <Sparkles className="w-4 h-4 animate-spin text-purple-400" />
          <span>Transcribing voice note in Malayalam &amp; sending to Shabeer Ikka...</span>
        </div>
      ) : (
        /* Standard Typing Row */
        <form onSubmit={handleSendText} className="flex items-center gap-2">
          {/* Input field wrapper */}
          <div className="flex-1 flex items-center bg-zinc-800/90 rounded-2xl border border-zinc-700/80 px-3 py-1.5 focus-within:border-purple-500 transition-colors">
            <button
              type="button"
              onClick={() => setInputText((prev) => prev + ' 😂')}
              className="text-zinc-400 hover:text-amber-400 transition-colors p-1"
              title="Add Laugh Emoji"
            >
              <Smile className="w-5 h-5" />
            </button>

            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type in Manglish (e.g. Shabeer ikka kozhi rate ethrayaa?)..."
              disabled={disabled}
              className="flex-1 bg-transparent px-2.5 py-1 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none"
            />
          </div>

          {/* Action button: Send Text or Record Voice */}
          {inputText.trim().length > 0 ? (
            <button
              type="submit"
              disabled={disabled}
              className="p-2.5 rounded-full bg-gradient-to-tr from-purple-600 to-pink-600 text-white shadow-md shadow-purple-500/20 hover:scale-105 active:scale-95 transition-transform shrink-0"
              title="Send message"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={startRecording}
              className="p-2.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 transition-all hover:scale-105 active:scale-95 shrink-0 relative group"
              title="Record Voice Note for Shabeer Ikka"
            >
              <Mic className="w-4 h-4 text-purple-400 group-hover:text-pink-400" />
              <span className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-zinc-950 text-[10px] text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-zinc-800">
                Hold/Tap Mic
              </span>
            </button>
          )}
        </form>
      )}
    </div>
  );
};
