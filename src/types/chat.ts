export interface Member {
  id: string;
  name: string;
  username: string;
  avatar: string;
  role?: string;
  bio: string;
  status: 'online' | 'offline' | 'typing' | 'recording';
  color: string;
}

export interface Reaction {
  emoji: string;
  count: number;
  users: string[];
}

export interface ReelAttachment {
  id: string;
  title: string;
  creator: string;
  likes: string;
  thumbnailUrl: string;
  duration: string;
  caption: string;
}

export interface VoiceNote {
  durationSeconds: number;
  waveform: number[];
  audioBase64?: string;
  isPcm?: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  isIkka?: boolean;
  isUser?: boolean;
  voiceNote?: VoiceNote;
  reel?: ReelAttachment;
  reactions?: Record<string, string[]>; // emoji -> array of user names
  replyTo?: {
    senderName: string;
    text: string;
  };
}
