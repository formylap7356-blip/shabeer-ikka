import React, { useState } from 'react';
import { Play, Heart, MessageCircle, Share2, Film } from 'lucide-react';
import { ReelAttachment } from '../types/chat';

interface ReelCardProps {
  reel: ReelAttachment;
  onPlayReel?: () => void;
}

export const ReelCard: React.FC<ReelCardProps> = ({ reel }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [likes, setLikes] = useState(reel.likes);
  const [hasLiked, setHasLiked] = useState(false);

  const toggleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setHasLiked(!hasLiked);
  };

  return (
    <div className="rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-700/80 shadow-lg max-w-xs sm:max-w-sm">
      {/* Reel Header */}
      <div className="px-3 py-2 flex items-center justify-between bg-zinc-900/90 text-xs text-zinc-300 border-b border-zinc-800">
        <div className="flex items-center gap-1.5 font-semibold">
          <Film className="w-3.5 h-3.5 text-pink-500" />
          <span>Instagram Reel</span>
        </div>
        <span className="text-[11px] text-zinc-400">@{reel.creator}</span>
      </div>

      {/* Video Preview / Mock Player */}
      <div
        onClick={() => setIsPlaying(!isPlaying)}
        className="relative aspect-[4/5] bg-zinc-950 overflow-hidden cursor-pointer group"
      >
        <img
          src={reel.thumbnailUrl}
          alt={reel.title}
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
            isPlaying ? 'brightness-75' : ''
          }`}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

        {/* Play Icon / Simulation */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className={`w-12 h-12 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white border border-white/20 transition-all ${
            isPlaying ? 'opacity-0 scale-75' : 'group-hover:scale-110 opacity-90'
          }`}>
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </div>
        </div>

        {isPlaying && (
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-pink-600 text-[10px] font-bold text-white animate-pulse">
            PLAYING
          </div>
        )}

        {/* Reel Duration */}
        <div className="absolute bottom-3 right-3 px-1.5 py-0.5 rounded bg-black/70 text-[10px] text-white font-mono">
          {reel.duration}
        </div>

        {/* Caption and Title on Bottom */}
        <div className="absolute bottom-3 left-3 right-12 text-left pointer-events-none">
          <p className="text-white text-xs font-semibold line-clamp-1 drop-shadow-md">
            {reel.title}
          </p>
          <p className="text-zinc-300 text-[11px] line-clamp-1 drop-shadow-md opacity-90">
            {reel.caption}
          </p>
        </div>
      </div>

      {/* Interaction Footer */}
      <div className="px-3 py-2 flex items-center justify-between text-zinc-300 bg-zinc-900 text-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleLike}
            className={`flex items-center gap-1 transition-colors ${
              hasLiked ? 'text-pink-500 font-bold' : 'hover:text-pink-400'
            }`}
          >
            <Heart className={`w-4 h-4 ${hasLiked ? 'fill-current' : ''}`} />
            <span>{hasLiked ? 'Liked' : likes}</span>
          </button>
          <div className="flex items-center gap-1 text-zinc-400">
            <MessageCircle className="w-4 h-4" />
            <span>Chat</span>
          </div>
        </div>
        <Share2 className="w-4 h-4 text-zinc-400 hover:text-white cursor-pointer" />
      </div>
    </div>
  );
};
