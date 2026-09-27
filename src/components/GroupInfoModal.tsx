import React from 'react';
import { X, ShieldCheck, Users, Volume2, Sparkles, RotateCcw, MessageSquarePlus, Film, ExternalLink } from 'lucide-react';
import { Member } from '../types/chat';

interface GroupInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  onTriggerMember: (memberName: string, triggerRole: string) => void;
  onResetChat: () => void;
  voiceNoteMode: boolean;
  onToggleVoiceMode: () => void;
  onOpenApiModal?: () => void;
}

export const GroupInfoModal: React.FC<GroupInfoModalProps> = ({
  isOpen,
  onClose,
  members,
  onTriggerMember,
  onResetChat,
  voiceNoteMode,
  onToggleVoiceMode,
  onOpenApiModal,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl text-zinc-100 flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800 sticky top-0 bg-zinc-900/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-400" />
            <h2 className="font-bold text-base">Group Details</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Group Hero Banner */}
        <div className="p-6 text-center border-b border-zinc-800 bg-gradient-to-b from-amber-900/20 via-purple-900/10 to-transparent">
          <div className="w-20 h-20 rounded-full mx-auto bg-gradient-to-tr from-amber-500 via-red-500 to-purple-600 p-1 shadow-xl">
            <div className="w-full h-full rounded-full bg-zinc-950 flex items-center justify-center text-3xl">
              🐓
            </div>
          </div>
          <h3 className="font-bold text-lg mt-3 text-white flex items-center justify-center gap-1.5">
            Koyikode Royal Chicken &amp; Sulaimani Gang 🍗
            <ShieldCheck className="w-4 h-4 text-amber-400" />
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            Valiyangadi Palayam Kozhikode | Shabeer Ikka's Fabulous Chicken Stall, High-Fashion Sass &amp; Family Drama 💅✨
          </p>

          {/* Backend API & Webhook Banner */}
          {onOpenApiModal && (
            <div className="mt-3 p-3 rounded-2xl bg-gradient-to-r from-amber-900/40 via-orange-900/40 to-purple-900/40 border border-amber-500/30 flex items-center justify-between text-left">
              <div>
                <p className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>Backend API &amp; Webhook</span>
                  <span className="px-1.5 py-0.2 rounded bg-amber-500 text-[9px] font-black text-black uppercase">Active</span>
                </p>
                <p className="text-[10px] text-zinc-300 mt-0.5">
                  /chat with memory, /health, /webhook, &amp; Alwaysdata deployment
                </p>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onOpenApiModal();
                }}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold text-xs shrink-0 shadow active:scale-95 transition-transform"
              >
                Docs &amp; Test 🚀
              </button>
            </div>
          )}
          <div className="mt-4 flex items-center justify-between p-3 rounded-2xl bg-zinc-800/80 border border-zinc-700">
            <div className="flex items-center gap-2.5 text-left">
              <Volume2 className="w-4 h-4 text-purple-400 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-white">Shabeer Ikka Voice Mode</p>
                <p className="text-[10px] text-zinc-400">Ikka replies with real Instagram audio notes</p>
              </div>
            </div>
            <button
              onClick={onToggleVoiceMode}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                voiceNoteMode
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'bg-zinc-700 text-zinc-300'
              }`}
            >
              {voiceNoteMode ? 'ENABLED' : 'OFF'}
            </button>
          </div>
        </div>

        {/* Group Members List */}
        <div className="p-4 flex-1">
          <div className="flex items-center justify-between mb-3 px-1">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Members ({members.length})
            </h4>
            <span className="text-[11px] text-purple-400">Tap "Nudge" to trigger banter</span>
          </div>

          <div className="space-y-2.5">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-2.5 rounded-2xl bg-zinc-850 hover:bg-zinc-800/80 border border-zinc-800 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold shrink-0"
                    style={{ backgroundColor: `${member.color}25`, border: `2px solid ${member.color}50` }}
                  >
                    {member.avatar}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-white truncate">{member.name}</p>
                      {member.role?.includes('Owner') && (
                        <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[9px] font-bold">
                          Stall Owner 🔪
                        </span>
                      )}
                      {member.id === 'ameen' && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[9px] font-bold">
                          Ikka's Son 🐣
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-400 truncate">{member.bio}</p>
                  </div>
                </div>

                {member.id !== 'user' && (
                  <button
                    onClick={() => {
                      onTriggerMember(member.name, member.bio);
                      onClose();
                    }}
                    className="px-2.5 py-1 rounded-xl bg-zinc-700 hover:bg-purple-600 hover:text-white text-zinc-300 text-[11px] font-medium transition-all shrink-0 active:scale-95"
                    title={`Make ${member.name} speak in the group chat`}
                  >
                    Nudge 💬
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between gap-3">
          <button
            onClick={() => {
              onResetChat();
              onClose();
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-red-500/20 hover:text-red-400 text-zinc-400 text-xs font-medium transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Chat</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold text-xs shadow-md shadow-purple-600/20 hover:scale-105 active:scale-95 transition-transform"
          >
            Back to Chat
          </button>
        </div>
      </div>
    </div>
  );
};
