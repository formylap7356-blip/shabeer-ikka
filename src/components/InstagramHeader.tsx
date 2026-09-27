import React, { useState } from 'react';
import { Phone, Video, Info, Mic, ChevronLeft, Volume2, ShieldCheck, Server } from 'lucide-react';
import { Member } from '../types/chat';

interface InstagramHeaderProps {
  members: Member[];
  onOpenInfo: () => void;
  onOpenApiModal?: () => void;
  voiceNoteMode: boolean;
  onToggleVoiceMode: () => void;
  isIkkaTyping?: boolean;
}

export const InstagramHeader: React.FC<InstagramHeaderProps> = ({
  members,
  onOpenInfo,
  onOpenApiModal,
  voiceNoteMode,
  onToggleVoiceMode,
  isIkkaTyping,
}) => {
  const [callAlert, setCallAlert] = useState<string | null>(null);

  const handleFakeCall = (type: 'audio' | 'video') => {
    const responses = [
      'Shabeer Ikka declined the call: "Ayyo darling! Fresh kozhi vetti nilkkuva muthey, 2 minute kazhinju vaa 💅🔪✨"',
      'Shabeer Ikka is busy: "Live chicken lorry vannu nilkkuva Valiyangadiyil, call back in 1 hour sweetie 💅🚚"',
      'Call declined: "Ameeneee! Phone cut cheyyeda drama queen! Kadayil kozhi thookkaan aalund 📱💅"',
    ];
    const msg = responses[Math.floor(Math.random() * responses.length)];
    setCallAlert(msg);
    setTimeout(() => setCallAlert(null), 4000);
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between px-3 sm:px-4 py-2.5 bg-zinc-900/95 backdrop-blur-md border-b border-zinc-800 text-zinc-100">
        {/* Left: Back Arrow + Group Avatar + Title */}
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            onClick={onOpenInfo}
            className="p-1 -ml-1 text-zinc-400 hover:text-white transition-colors sm:hidden"
            title="Back / Info"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Group Avatar Stack */}
          <div
            onClick={onOpenInfo}
            className="relative cursor-pointer group flex items-center shrink-0"
            title="Group info"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 via-red-500 to-purple-600 p-0.5 shadow-md">
              <div className="w-full h-full rounded-full bg-zinc-950 flex items-center justify-center text-lg">
                🐓
              </div>
            </div>
            {/* Ikka mini badge */}
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[10px]">
              🔪
            </div>
          </div>

          {/* Title & Status */}
          <div onClick={onOpenInfo} className="min-w-0 cursor-pointer">
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm sm:text-base font-bold truncate tracking-tight text-white">
                Koyikode Royal Chicken &amp; Sulaimani Gang 🐓🔪
              </h1>
              <span title="Verified Calicut Stall">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              </span>
            </div>

            <p className="text-[11px] text-zinc-400 truncate">
              {isIkkaTyping ? (
                <span className="text-amber-400 font-medium animate-pulse flex items-center gap-1">
                  <span>Shabeer Ikka is cutting chicken &amp; typing...</span>
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                </span>
              ) : (
                <span>Shabeer Ikka (Stall Owner), Ameen (Son), Anandhu, You +3 others</span>
              )}
            </p>
          </div>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* API & Webhook Documentation / Tester */}
          {onOpenApiModal && (
            <button
              onClick={onOpenApiModal}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-600 via-orange-600 to-purple-600 text-white shadow-md hover:opacity-95 active:scale-95 transition-all"
              title="Backend API, Webhook endpoints & Alwaysdata Guide"
            >
              <Server className="w-3.5 h-3.5 text-amber-200" />
              <span className="hidden sm:inline">API &amp; Webhook</span>
            </button>
          )}

          {/* Voice Mode Toggle Pill */}
          <button
            onClick={onToggleVoiceMode}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
              voiceNoteMode
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-500/25 ring-1 ring-purple-400'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            }`}
            title="When active, Shabeer Ikka replies with voice notes"
          >
            <Mic className={`w-3.5 h-3.5 ${voiceNoteMode ? 'animate-bounce' : ''}`} />
            <span className="hidden md:inline">Voice Mode</span>
            <span className={`text-[10px] uppercase tracking-wider px-1 rounded ${
              voiceNoteMode ? 'bg-white/20' : 'bg-zinc-900'
            }`}>
              {voiceNoteMode ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* Phone Call */}
          <button
            onClick={() => handleFakeCall('audio')}
            className="p-2 rounded-full hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors"
            title="Audio call group"
          >
            <Phone className="w-5 h-5" />
          </button>

          {/* Video Call */}
          <button
            onClick={() => handleFakeCall('video')}
            className="p-2 rounded-full hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors hidden xs:block"
            title="Video call group"
          >
            <Video className="w-5 h-5" />
          </button>

          {/* Info Details */}
          <button
            onClick={onOpenInfo}
            className="p-2 rounded-full hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors"
            title="Group info"
          >
            <Info className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Call Alert Toast */}
      {callAlert && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-zinc-800/90 border border-zinc-700 backdrop-blur-md shadow-xl text-xs text-white flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <Volume2 className="w-4 h-4 text-purple-400 shrink-0" />
          <span>{callAlert}</span>
        </div>
      )}
    </>
  );
};
