import { Member, Message, ReelAttachment } from '../types/chat';
import { generateWaveform } from '../utils/audio';

export const GROUP_MEMBERS: Member[] = [
  {
    id: 'shabeer',
    name: 'Shabeer Ikka 💅✨',
    username: 'shabeer_kozhi_official',
    avatar: '💅🐓',
    role: 'Fabulous Chicken Stall Diva & Admin',
    bio: 'Kozhikode\'s Most Fabulous Chicken Stall 💅✨ | Palayam Valiyangadi | Eyeliner sharper than chopper knife 🔪 | Serving fresh cuts, high fashion & spicy gossip',
    status: 'online',
    color: '#ec4899', // pink/magenta
  },
  {
    id: 'ameen',
    name: 'Ameen (Ikka\'s Son)',
    username: 'ameen_kozhi_junior',
    avatar: '🐣',
    role: 'Ikka\'s Son / Forced Apprentice',
    bio: 'Plucking chicken feathers after tuition 😭 | Vappachi roasts my skincare & outfits 24/7 | Secretly making reels',
    status: 'online',
    color: '#f59e0b', // amber
  },
  {
    id: 'user',
    name: 'You',
    username: 'machan_here',
    avatar: '🤙',
    role: 'Regular Customer',
    bio: 'Kozhikode group chat survivor | 1kg chicken lover',
    status: 'online',
    color: '#3b82f6', // blue
  },
  {
    id: 'jithin',
    name: 'Jithin',
    username: 'jithin_koyikode',
    avatar: '🛵',
    role: 'Member',
    bio: 'Food reels addict | Always begging Shabeer Ikka for chicken discount',
    status: 'online',
    color: '#f97316', // orange
  },
  {
    id: 'amal',
    name: 'Amal Crypto',
    username: 'amal_calicut_web3',
    avatar: '📉',
    role: 'Member',
    bio: 'Asking if chicken stall accepts Bitcoin | Loss guru',
    status: 'offline',
    color: '#10b981', // emerald
  },
  {
    id: 'anandhu',
    name: 'Anandhu Gym',
    username: 'anandhu_beast_mode',
    avatar: '💪',
    role: 'Gym Freak',
    bio: '2kg chicken breast daily | Shabeer Ikka\'s favorite gym boy | Calicut beast mode',
    status: 'online',
    color: '#ef4444', // red
  },
  {
    id: 'fathima',
    name: 'Fathima',
    username: 'fathuu_koyikode',
    avatar: '💄',
    role: 'Member',
    bio: 'Sipping tea & hyping Ikka\'s fabulous comebacks 🍿💅 | Kozhikode gossip queen',
    status: 'online',
    color: '#8b5cf6', // purple
  },
];

export const SAMPLE_REELS: ReelAttachment[] = [
  {
    id: 'reel-1',
    title: 'Kozhikode Live Chicken Master Cutting in 10s 🐓🔪',
    creator: 'calicut_street_foodies',
    likes: '168K',
    thumbnailUrl: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=600&q=80',
    duration: '0:22',
    caption: 'Kozhikode Valiyangadi chicken stall speed! Shabeer Ikka chopper knife skills 🔥',
  },
  {
    id: 'reel-2',
    title: 'When Vappachi catches Ameen watching Reels instead of cleaning stall 😂',
    creator: 'mallu_troll_koyikode',
    likes: '95K',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
    duration: '0:18',
    caption: 'Ameene! AA thara kazhukeda chekka 🔪😭 Ikka mass entry',
  },
  {
    id: 'reel-3',
    title: 'Calicut Beach Hot Sulaimani & Kallummakkaya ☕🌊',
    creator: 'kerala_food_stories',
    likes: '112K',
    thumbnailUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
    duration: '0:15',
    caption: 'Evening in Kozhikode is incomplete without beach sulaimani!',
  },
];

export const INITIAL_MESSAGES: Message[] = [
  {
    id: 'msg-1',
    senderId: 'ameen',
    senderName: 'Ameen (Ikka\'s Son)',
    text: 'Machanmaare, aarkkelum oru 100 roopa GPay cheyyaan patto? Vappachi kadayil kozhi thookkaan paranju, njan bike eduth munghi 😭',
    timestamp: '10:14 AM',
    reactions: { '😂': ['Fathima', 'Amal'] },
  },
  {
    id: 'msg-2',
    senderId: 'shabeer',
    senderName: 'Shabeer Ikka 💅✨',
    text: 'Ameene! Eda drama queen! Aa mudiyude oru kolam kandilla... oru hair spa cheyyeda chekka! Ennit kadayil vannu aa cage kazhuk muthey 💅🐓✨',
    timestamp: '10:15 AM',
    isIkka: true,
    reactions: { '💅': ['Fathima', 'You'], '🔥': ['Jithin'] },
  },
  {
    id: 'msg-3',
    senderId: 'fathima',
    senderName: 'Fathima',
    text: 'Yaaasss Ikka slay! Ameente outfit roast cheythathu kidu aayi 🍿🤣 Ameene ippo thanne kadayilekku oodikko!',
    timestamp: '10:16 AM',
    reactions: { '💅': ['Fathima'], '😂': ['Anandhu'] },
  },
  {
    id: 'msg-4',
    senderId: 'anandhu',
    senderName: 'Anandhu Gym',
    text: 'Shabeer ikka, innathe kozhi rate ethrayaa? 2 kilo skinless chicken breast eduthu vekku bro 💪',
    timestamp: '10:17 AM',
    reactions: { '🐔': ['Jithin'] },
  },
  {
    id: 'msg-5',
    senderId: 'shabeer',
    senderName: 'Shabeer Ikka 💅✨',
    text: 'Anandhu baby! Aa muscular arms kandittu njan nalla juicy tender breast piece maatti vechittund ketto! Gym kazhinju nere vaa sweetie 😉💪💅🍗',
    timestamp: '10:19 AM',
    isIkka: true,
    voiceNote: {
      durationSeconds: 6,
      waveform: generateWaveform('Anandhu baby! Aa muscular arms kandittu njan nalla juicy tender breast piece maatti vechittund!'),
    },
    reactions: { '❤️': ['You'], '🔥': ['Anandhu', 'Fathima'] },
  },
  {
    id: 'msg-6',
    senderId: 'ameen',
    senderName: 'Ameen (Ikka\'s Son)',
    text: 'Vappachide oru kozhi cutting... njan ivide Calicut beach-il oru sulaimani kudikkuva 👀 ee reel onnu kandu nokk!',
    timestamp: '10:21 AM',
    reel: SAMPLE_REELS[0],
    reactions: { '🤤': ['Shabeer Ikka 💅✨', 'You'] },
  },
];

export const QUICK_PROMPTS = [
  { label: 'Slay Ikka 💅', text: 'Shabeer ikka you are slaying today!' },
  { label: 'Kozhi Rate Darling 🍗', text: 'Shabeer ikka innathe kozhi rate ethrayaa darling?' },
  { label: 'Flirt with Ikka 💖', text: 'Shabeer ikka oru fresh kozhi piece tharumo muthey?' },
  { label: 'Roast Ameen 😂', text: 'Ikka, Ameen kozhi clean cheyyaathe phone nokki irikkuva!' },
  { label: 'Boneless Piece ✨', text: 'Shabeer ikka 1 kilo skinless boneless aesthetic piece venam!' },
  { label: 'Calicut Sulaimani ☕', text: 'Ikka oru Kozhikodan sulaimani medichu tharo baby?' },
  { label: 'Borrow Cash 💸', text: 'Ikka oru 500 roopa Google Pay cheyyumo please?' },
  { label: 'Gym Bro Breast Piece 💪', text: 'Ikka 2kg chicken breast eduthu vekko?' },
];
