import React, { useState, useEffect, useRef } from 'react';
import { InstagramHeader } from './components/InstagramHeader';
import { MessageItem } from './components/MessageItem';
import { ChatInput } from './components/ChatInput';
import { GroupInfoModal } from './components/GroupInfoModal';
import { ApiWebhookModal } from './components/ApiWebhookModal';
import { Message, Member, ReelAttachment } from './types/chat';
import { GROUP_MEMBERS, INITIAL_MESSAGES, SAMPLE_REELS } from './data/groupData';
import { soundFX, generateWaveform, speakWithBrowserVoice } from './utils/audio';

export default function App() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [members] = useState<Member[]>(GROUP_MEMBERS);
  const [voiceNoteMode, setVoiceNoteMode] = useState<boolean>(true);
  const [isIkkaTyping, setIsIkkaTyping] = useState<boolean>(false);
  const [isInfoOpen, setIsInfoOpen] = useState<boolean>(false);
  const [isApiModalOpen, setIsApiModalOpen] = useState<boolean>(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Map of members for fast lookup
  const membersMap = members.reduce((acc, m) => {
    acc[m.id] = m;
    acc[m.name] = m;
    return acc;
  }, {} as Record<string, Member>);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom('auto');
  }, []);

  useEffect(() => {
    scrollToBottom('smooth');
  }, [messages, isIkkaTyping]);

  // Handle reaction on a message
  const handleReaction = (messageId: string, emoji: string) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id !== messageId) return msg;

        const currentReactions = { ...(msg.reactions || {}) };
        const users = currentReactions[emoji] ? [...currentReactions[emoji]] : [];

        if (users.includes('You')) {
          const filtered = users.filter((u) => u !== 'You');
          if (filtered.length === 0) {
            delete currentReactions[emoji];
          } else {
            currentReactions[emoji] = filtered;
          }
        } else {
          currentReactions[emoji] = [...users, 'You'];
        }

        return { ...msg, reactions: currentReactions };
      })
    );
    soundFX.playReactionPop();
  };

  // Trigger Shabeer Ikka's AI response with Conversation Memory
  const triggerShabeerReply = async (userMsgText: string, currentHistory: Message[]) => {
    setIsIkkaTyping(true);

    try {
      // Call backend /chat with conversation memory and Kozhikode persona
      const res = await fetch('/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMsgText,
          senderName: 'You',
          sessionId: 'calicut-group-session',
          history: currentHistory.slice(-8).map((m) => ({
            sender: m.senderName,
            text: m.text,
          })),
        }),
      });

      const data = await res.json();
      const replyText = data.reply || data.text || 'Rabbe! Kozhi vetti kondirikuva muthey 😂🔪';

      // 2. If voice note mode is enabled, request voice synthesis from backend
      let voiceNoteData = undefined;

      if (voiceNoteMode) {
        try {
          const vRes = await fetch('/api/voice-reply', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: replyText }),
          });
          const vData = await vRes.json();

          if (vData.audioBase64) {
            voiceNoteData = {
              durationSeconds: Math.max(3, Math.ceil(replyText.length / 14)),
              waveform: generateWaveform(replyText, 26),
              audioBase64: vData.audioBase64,
              isPcm: true,
            };
          } else {
            // Client-side synthesized voice fallback
            voiceNoteData = {
              durationSeconds: Math.max(3, Math.ceil(replyText.length / 14)),
              waveform: generateWaveform(replyText, 26),
            };
          }
        } catch (vErr) {
          console.warn('Voice reply generation error, using waveform fallback:', vErr);
          voiceNoteData = {
            durationSeconds: Math.max(3, Math.ceil(replyText.length / 14)),
            waveform: generateWaveform(replyText, 26),
          };
        }
      }

      // Add Shabeer Ikka's message
      const ikkaMessage: Message = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        senderId: 'shabeer',
        senderName: 'Shabeer Ikka',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isIkka: true,
        voiceNote: voiceNoteData,
        reactions: Math.random() > 0.4 ? { '😂': ['Jithin'] } : undefined,
      };

      setMessages((prev) => [...prev, ikkaMessage]);
      soundFX.playReceiveChime();

      // If voice note mode is active, optionally auto-speak
      if (voiceNoteMode && !voiceNoteData?.audioBase64) {
        speakWithBrowserVoice(replyText, 1.0).catch(() => {});
      }

      // 3. Occasional spontaneous banter from other group members (including Ameen!)
      if (Math.random() > 0.60) {
        setTimeout(async () => {
          const randomMember = ['Ameen', 'Ameen', 'Jithin', 'Anandhu', 'Fathima', 'Amal'][Math.floor(Math.random() * 6)];
          triggerGroupMemberComment(randomMember, `Reaction to Shabeer Ikka saying: "${replyText}"`);
        }, 1800);
      }
    } catch (err) {
      console.error('Failed to get Shabeer reply:', err);
      const fallbackMsg: Message = {
        id: `msg-fallback-${Date.now()}`,
        senderId: 'shabeer',
        senderName: 'Shabeer Ikka',
        text: 'Eda kozhi vetti nilkkuvaayirunnu manushyaa, range poyi 😂',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isIkka: true,
      };
      setMessages((prev) => [...prev, fallbackMsg]);
      soundFX.playReceiveChime();
    } finally {
      setIsIkkaTyping(false);
    }
  };

  // Trigger group member banter
  const triggerGroupMemberComment = async (memberName: string, triggerDescription: string) => {
    try {
      const res = await fetch('/api/group-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          member: memberName,
          trigger: triggerDescription,
          recentMessages: messages.slice(-5),
        }),
      });

      const data = await res.json();
      const memberObj = members.find((m) => m.name === memberName) || members[2];

      const banterMessage: Message = {
        id: `msg-member-${Date.now()}`,
        senderId: memberObj.id,
        senderName: memberName,
        text: data.text || 'Machane scene aanu 😂',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        reactions: Math.random() > 0.5 ? { '😂': ['You'] } : undefined,
      };

      setMessages((prev) => [...prev, banterMessage]);
      soundFX.playReceiveChime();
    } catch (e) {
      console.warn('Member comment error', e);
    }
  };

  // Send text message or voice note from user
  const handleSendMessage = (text: string, voiceNoteData?: { durationSeconds: number; audioBase64?: string; waveform?: number[] }) => {
    if (!text.trim() && !voiceNoteData) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId: 'user',
      senderName: 'You',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      voiceNote: voiceNoteData
        ? {
            durationSeconds: voiceNoteData.durationSeconds,
            waveform: voiceNoteData.waveform || generateWaveform(text),
            audioBase64: voiceNoteData.audioBase64,
          }
        : undefined,
      replyTo: replyingTo
        ? {
            senderName: replyingTo.senderName,
            text: replyingTo.text,
          }
        : undefined,
    };

    const nextHistory = [...messages, userMessage];
    setMessages(nextHistory);
    setReplyingTo(null);
    soundFX.playSendPop();

    // Trigger Shabeer Ikka's AI reaction after a natural short delay
    setTimeout(() => {
      triggerShabeerReply(text || 'Sent a voice note', nextHistory);
    }, 600);
  };

  // Share an Instagram reel into the chat
  const handleShareReel = () => {
    const randomReel = SAMPLE_REELS[Math.floor(Math.random() * SAMPLE_REELS.length)];
    const reelMsg: Message = {
      id: `msg-reel-${Date.now()}`,
      senderId: 'user',
      senderName: 'You',
      text: `Sent a reel: "${randomReel.title}"`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      reel: randomReel,
    };

    const nextHistory = [...messages, reelMsg];
    setMessages(nextHistory);
    soundFX.playSendPop();

    setTimeout(() => {
      triggerShabeerReply(`Shared Instagram reel: ${randomReel.title}`, nextHistory);
    }, 1000);
  };

  const handleResetChat = () => {
    setMessages(INITIAL_MESSAGES);
    setReplyingTo(null);
    soundFX.playReceiveChime();
  };

  return (
    <div className="flex flex-col h-screen w-full bg-zinc-950 text-zinc-100 overflow-hidden font-sans selection:bg-purple-500 selection:text-white">
      {/* Instagram Header */}
      <InstagramHeader
        members={members}
        onOpenInfo={() => setIsInfoOpen(true)}
        onOpenApiModal={() => setIsApiModalOpen(true)}
        voiceNoteMode={voiceNoteMode}
        onToggleVoiceMode={() => setVoiceNoteMode(!voiceNoteMode)}
        isIkkaTyping={isIkkaTyping}
      />

      {/* Main Chat Messages Viewport */}
      <main className="flex-1 overflow-y-auto px-3 sm:px-4 py-3 space-y-1 scroll-smooth">
        {/* Chat Intro Notice */}
        <div className="my-6 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-400">
            <span>🔒 Messages are encrypted with Kozhikode Chicken &amp; Sulaimani security 🐓</span>
          </div>
          <p className="text-zinc-500 text-xs mt-2">
            Welcome to the official Kozhikode Instagram group chat with <strong className="text-amber-400">Shabeer Ikka</strong> &amp; his son <strong className="text-amber-300">Ameen</strong>.
          </p>
        </div>

        {/* Message Stream */}
        {messages.map((message) => (
          <MessageItem
            key={message.id}
            message={message}
            membersMap={membersMap}
            onReaction={handleReaction}
            onReply={(msg) => setReplyingTo(msg)}
          />
        ))}

        {/* Shabeer Ikka Typing / Recording Indicator */}
        {isIkkaTyping && (
          <div className="flex items-center gap-2 text-xs text-amber-400 py-2 px-1 animate-pulse">
            <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xs">
              🐓
            </div>
            <span className="font-medium">
              {voiceNoteMode
                ? 'Shabeer Ikka is cutting chicken & recording a voice note... 🎙️🔪'
                : 'Shabeer Ikka is cutting chicken & typing in Calicut slang...'}
            </span>
          </div>
        )}

        {/* Invisible Anchor for smooth auto-scroll */}
        <div ref={messagesEndRef} className="h-2" />
      </main>

      {/* Reply Snippet Banner */}
      {replyingTo && (
        <div className="px-4 py-2 bg-zinc-900 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-300">
          <div className="flex items-center gap-2 truncate">
            <span className="text-purple-400 font-semibold">Replying to {replyingTo.senderName}:</span>
            <span className="truncate opacity-80">"{replyingTo.text}"</span>
          </div>
          <button
            onClick={() => setReplyingTo(null)}
            className="text-zinc-400 hover:text-white px-2 py-0.5"
          >
            ✕
          </button>
        </div>
      )}

      {/* Chat Input Bar with Manglish Slang */}
      <ChatInput
        onSendMessage={handleSendMessage}
        onSendReel={handleShareReel}
        disabled={isIkkaTyping}
      />

      {/* Group Info & Members Modal */}
      <GroupInfoModal
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
        members={members}
        onTriggerMember={(name, bio) => {
          triggerGroupMemberComment(name, `Speaking about: ${bio}`);
        }}
        onResetChat={handleResetChat}
        voiceNoteMode={voiceNoteMode}
        onToggleVoiceMode={() => setVoiceNoteMode(!voiceNoteMode)}
        onOpenApiModal={() => setIsApiModalOpen(true)}
      />

      {/* Backend API, Webhook & Alwaysdata Modal */}
      <ApiWebhookModal
        isOpen={isApiModalOpen}
        onClose={() => setIsApiModalOpen(false)}
      />
    </div>
  );
}
