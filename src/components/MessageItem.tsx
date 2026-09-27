import React, { useState } from 'react';
import { Volume2, VolumeX, Heart, SmilePlus, Reply } from 'lucide-react';
import { Message, Member } from '../types/chat';
import { VoiceNoteBubble } from './VoiceNoteBubble';
import { ReelCard } from './ReelCard';
import { speakWithBrowserVoice, stopSpeaking, soundFX } from '../utils/audio';

interface MessageItemProps {
  message: Message;
  membersMap: Record<string, Member>;
  onReaction: (messageId: string, emoji: string) => void;
  onReply?: (message: Message) => void;
  isIkkaSpeaking?: boolean;
}

const COMMON_EMOJIS = ['❤️', '😂', '🔥', '😭', '😮', '🌯'];

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  membersMap,
  onReaction,
  onReply,
}) => {
  const [showReactionBar, setShowReactionBar] = useState(false);
  const [isSpeakingLocally, setIsSpeakingLocally] = useState(false);
  const [showHeartPop, setShowHeartPop] = useState(false);

  const sender = membersMap[message.senderId] || {
    name: message.senderName,
    avatar: '👤',
    color: '#8b5cf6',
  };

  const isUser = message.isUser || message.senderId === 'user';
  const isIkka = message.isIkka || message.senderId === 'shabeer';

  const handleDoubleTap = () => {
    onReaction(message.id, '❤️');
    setShowHeartPop(true);
    soundFX.playVoiceBeep();
    setTimeout(() => setShowHeartPop(false), 900);
  };

  const handleSpeakText = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSpeakingLocally) {
      stopSpeaking();
      setIsSpeakingLocally(false);
      return;
    }

    setIsSpeakingLocally(true);
    try {
      await speakWithBrowserVoice(message.text, 1.0);
    } finally {
      setIsSpeakingLocally(false);
    }
  };

  return (
    <div
      className={`group relative flex gap-2.5 my-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end`}
      onDoubleClick={handleDoubleTap}
    >
      {/* Avatar for non-user */}
      {!isUser && (
        <div
          className="relative w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow shrink-0 select-none"
          style={{ backgroundColor: `${sender.color}25`, border: `2px solid ${sender.color}60` }}
          title={`${sender.name} (${sender.role || 'Member'})`}
        >
          <span>{sender.avatar || '👤'}</span>
          {isIkka && (
            <span
              className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-[8px] text-white font-black ring-1 ring-zinc-900"
              title="Verified Kerala Ikka"
            >
              ✓
            </span>
          )}
        </div>
      )}

      {/* Main Message Column */}
      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[82%] sm:max-w-[70%]`}>
        {/* Sender Name for group chat clarity */}
        {!isUser && (
          <div className="flex items-center gap-1.5 ml-1 mb-1 text-[11px]">
            <span className="font-semibold" style={{ color: sender.color }}>
              {sender.name}
            </span>
            {isIkka && (
              <span className="px-1.5 py-0.2 bg-purple-500/20 text-purple-300 rounded text-[9px] font-bold">
                Admin 😎
              </span>
            )}
            <span className="text-zinc-500 text-[10px]">{message.timestamp}</span>
          </div>
        )}

        {/* Reply Snippet if replied to */}
        {message.replyTo && (
          <div className="mb-1 text-[11px] px-2.5 py-1 rounded-lg bg-zinc-800/80 border-l-2 border-purple-500 text-zinc-300 max-w-full truncate">
            <span className="font-semibold text-purple-400">@{message.replyTo.senderName}: </span>
            <span>{message.replyTo.text}</span>
          </div>
        )}

        {/* Content Type: Voice Note, Reel, or Text */}
        {message.voiceNote ? (
          <VoiceNoteBubble
            voiceNote={message.voiceNote}
            text={message.text}
            isUser={isUser}
            senderName={message.senderName}
          />
        ) : message.reel ? (
          <div className="flex flex-col gap-1.5">
            <ReelCard reel={message.reel} />
            {message.text && (
              <div className="p-3 rounded-2xl bg-zinc-800 text-zinc-100 text-sm border border-zinc-700">
                {message.text}
              </div>
            )}
          </div>
        ) : (
          <div
            className={`relative px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm break-words ${
              isUser
                ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-br-xs'
                : isIkka
                ? 'bg-zinc-800 text-zinc-100 border border-purple-500/30 rounded-bl-xs'
                : 'bg-zinc-800 text-zinc-200 border border-zinc-700/60 rounded-bl-xs'
            }`}
          >
            {/* Message Text */}
            <p className="whitespace-pre-wrap">{message.text}</p>

            {/* Read aloud button for Shabeer Ikka */}
            {isIkka && (
              <button
                onClick={handleSpeakText}
                className="mt-1.5 -ml-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-[11px] font-medium transition-colors"
                title="Hear Shabeer Ikka voice this message"
              >
                {isSpeakingLocally ? (
                  <>
                    <VolumeX className="w-3 h-3 text-pink-400 animate-pulse" />
                    <span>Stop audio</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3 h-3 text-purple-400" />
                    <span>Hear Ikka 🎙️</span>
                  </>
                )}
              </button>
            )}

            {/* Double-tap heart pop animation */}
            {showHeartPop && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <Heart className="w-12 h-12 fill-red-500 text-red-500 animate-ping opacity-90" />
              </div>
            )}
          </div>
        )}

        {/* Display Reactions */}
        {message.reactions && Object.keys(message.reactions).length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1 px-1">
            {Object.entries(message.reactions).map(([emoji, users]) => (
              <button
                key={emoji}
                onClick={() => onReaction(message.id, emoji)}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-zinc-800/90 hover:bg-zinc-700 text-zinc-200 text-[11px] border border-zinc-700/60 transition-transform active:scale-90"
                title={`Reacted by: ${users.join(', ')}`}
              >
                <span>{emoji}</span>
                <span className="text-[10px] text-zinc-400 font-medium">{users.length}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Controls on Hover */}
      <div
        className={`opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-zinc-400 mb-1 ${
          isUser ? 'mr-1' : 'ml-1'
        }`}
      >
        <button
          onClick={() => setShowReactionBar(!showReactionBar)}
          className="p-1.5 rounded-full hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
          title="React to message"
        >
          <SmilePlus className="w-4 h-4" />
        </button>

        {onReply && (
          <button
            onClick={() => onReply(message)}
            className="p-1.5 rounded-full hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
            title="Reply"
          >
            <Reply className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Reaction Picker Popover */}
      {showReactionBar && (
        <div
          className={`absolute z-20 -top-8 ${
            isUser ? 'right-12' : 'left-12'
          } flex items-center gap-1 p-1 bg-zinc-900 border border-zinc-700 rounded-full shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150`}
        >
          {COMMON_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                onReaction(message.id, emoji);
                setShowReactionBar(false);
                soundFX.playSendPop();
              }}
              className="p-1.5 hover:scale-130 active:scale-95 transition-transform text-sm"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
