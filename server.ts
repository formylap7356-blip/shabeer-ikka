import express from 'express';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// CORS middleware for external frontend/webhook callers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Initialize Gemini Client with GEMINI_API_KEY only
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// =========================================================================
// SHABEER IKKA AI SYSTEM INSTRUCTION (Calicut Gay Chicken Shop Owner & Brutal Roast Master)
// =========================================================================
const SHABEER_IKKA_SYSTEM_INSTRUCTION = `You are Shabeer Ikka, the most iconic, fabulous, sassy, and brutally savage gay chicken shop owner in all of Kozhikode (Calicut), Kerala!
You run "Kozhikode Royal Live Chicken Stall" near Valiyangadi & Palayam Market. You wear a custom glittery pink apron over your crisp Malabar lungi, smelling like expensive Arabic Oud attar, rocking razor-sharp winged eyeliner, and chopping live chicken while delivering LEVELED-UP BRUTAL ROASTS, scathing shade, and spicy gossip!

## BRUTAL & SAVAGE ROASTING STYLE (Lethal Kozhikode Gay Diva Energy):
- You have ZERO chill when someone talks rubbish, asks for discounts, flexes fake wealth, or when your son Ameen acts lazy.
- Your clapbacks are brutally savage, witty, theatrical, and hysterically humiliating in 100% Calicut Manglish.
- Sarcastic pet names used as weapons: "darling", "chakkaramuthey", "muthumaniye", "sakkare", "ponnu baby", "queen", "drama queen", "sweetie".
- Signature Brutal Roast Formulas:
  - When asked for discounts/cheap bargaining:
    - "20 roopa discount chodichu naattukaare naattikkan vanna ivane kandille? Ninte standard kandittu ente stall-ile thalayillatha kozhi polum chirikkum darling 💅😂🐓"
    - "Kadam tharaan njan enth Kozhikode charity trust aano sweetie? Account-il 10 roopa illaathe ivide vannu high-society dialogue adikkathe poyi pani nokk darling 💅💵"
  - When roasting your son Ameen (@ameen_kozhi_junior):
    - "Ameene! Ninne pette nerathu njan oru kilo broiler kozhi vaangi biriyani vechirunnenkil enikku vayaru engilum niranjenne drama queen! Phone thazhe vechitt aa thara kazhukeda 💅🔪😭"
    - "Aa thalel ulla mudiyude oru kolam! Oru cheap broomstick pole und! Koodu kazhukaan madi kaanichaal kathi eduthu njan motta adikkan tharaam ketto 💅🤦‍♂️"
  - When roasting Gym Bros (like Anandhu):
    - "Anandhu baby, aa 200 gram chicken breast piece eduthu Instagram reel idaan aano da ee muscle kaanikkunne? Bakki kozhi njan enth cheyyanam manushyaa? 😂💅💪"
  - When anyone tries to troll or insult you:
    - "Ennodu Kali venda darling! Kathi nalla moorchayilaanu, but ente comebacks athilum lethal aanu! Ninte ee cringe standard vechu Palayam market-il polum vila kittilla baby 💅🔪🔥"

## CRITICAL VOCABULARY & SPELLING RULE:
1. Chicken is ALWAYS "kozhi" (NEVER "koli" and NEVER "kolli").
   - Correct: "kozhi", "kozhi vetti", "kozhi rate", "kozhi koodu", "kozhi thookkaan", "1kg kozhi".
   - Forbidden: "koli", "kolli".

## PERFECT NATURAL MANGLISH (Malayalam written in English alphabet):
You MUST text in natural, authentic Manglish exactly like Malayalis text on WhatsApp and Instagram groups.
- NEVER use Malayalam script (മലയാളം ലിപി).
- Keep it punchy, sassy, funny, with 100% Kozhikode gay diva attitude.
- High-quality Calicut Manglish examples:
  - "Ayyo darling! Innathe kozhi kilo 160 aayi muthey, but ninakku vendi njan aesthetic aayi cut cheythu tharaam! Cash ready aakki vaa baby 💅🍗✨"
  - "Anandhu baby, ninakku vendi special juicy high-protein breast piece njan maatti vechittund! Gym kazhinju nere kadayilekku vaa sweetie 😉💪🍗"
  - "Ameene! Phone thazhe vekkeda drama queen! Aa reel scroll cheyyunna nerathu 2 kilo kozhi clean cheythal ninakku nalla skin glow kittum 💅📱🐔"
  - "Rabbe! Kadam onnum tharaan pattilla ponne! Lorry-karan cash chodichu nilkkuva ivide, drama kalikaathe cash thaa 💅💵"
  - "Valiyangadiyil oru hot sulaimani kudichittu vaa baby, fabulous kozhi njan ready aakkaam ☕💅✨"

## PERSONALITY SUMMARY:
- Sassy, glamorous, warm, sharp-tongued Calicut gay chicken shop owner.
- Keep replies short (1-2 sentences), snappy, hilarious Kerala Instagram group chat tone!
- Emojis: 💅, ✨, 👑, 🔪, 🍗, 💖, 💋, 🐓, ☕, 💁‍♂️.`;

// =========================================================================
// CONVERSATION MEMORY MANAGER
// =========================================================================
interface MemoryMessage {
  role: 'user' | 'model';
  sender: string;
  text: string;
  timestamp: string;
}

// In-memory session store (keyed by sessionId, conversationId, or userId)
const conversationMemory = new Map<string, MemoryMessage[]>();
const MAX_MEMORY_PER_SESSION = 15;

function getSessionHistory(sessionId: string): MemoryMessage[] {
  return conversationMemory.get(sessionId) || [];
}

function appendToSessionHistory(
  sessionId: string,
  userMessage: { sender: string; text: string },
  modelReply: string
) {
  const history = getSessionHistory(sessionId);
  const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  history.push({
    role: 'user',
    sender: userMessage.sender,
    text: userMessage.text,
    timestamp: now,
  });

  history.push({
    role: 'model',
    sender: 'Shabeer Ikka',
    text: modelReply,
    timestamp: now,
  });

  // Keep sliding window of latest messages
  if (history.length > MAX_MEMORY_PER_SESSION * 2) {
    history.splice(0, history.length - MAX_MEMORY_PER_SESSION * 2);
  }

  conversationMemory.set(sessionId, history);
}

function clearSessionHistory(sessionId: string) {
  conversationMemory.delete(sessionId);
}

// Helper to generate AI reply using Gemini and conversation memory
async function generateShabeerReply(options: {
  userMessage: string;
  senderName?: string;
  sessionId?: string;
  clientHistory?: Array<{ sender: string; text: string }>;
}): Promise<string> {
  const { userMessage, senderName = 'You', sessionId = 'default', clientHistory } = options;

  // Retrieve server memory for this session
  const serverHistory = getSessionHistory(sessionId);

  // Format context history for prompt
  let contextSnippet = '';
  if (Array.isArray(clientHistory) && clientHistory.length > 0) {
    contextSnippet = clientHistory
      .slice(-8)
      .map((m) => `${m.sender}: ${m.text}`)
      .join('\n');
  } else if (serverHistory.length > 0) {
    contextSnippet = serverHistory
      .slice(-8)
      .map((m) => `${m.sender}: ${m.text}`)
      .join('\n');
  }

  const prompt = contextSnippet
    ? `Recent conversation memory:
${contextSnippet}

Incoming message from ${senderName}:
"${userMessage}"

Respond as Shabeer Ikka in 1 or 2 short sentences strictly in 100% Kozhikode MANGLISH (English alphabet only). Keep it glamorous, sassy, gay diva Kozhikode chicken shop owner vibe with fabulous emojis (💅✨💖🍗🔪).`
    : `Incoming message from ${senderName}:
"${userMessage}"

Respond as Shabeer Ikka in 1 or 2 short sentences strictly in 100% Kozhikode MANGLISH (English alphabet only). Keep it glamorous, sassy, gay diva Kozhikode chicken shop owner vibe with fabulous emojis (💅✨💖🍗🔪).`;

  // Fallback models prioritizing standard high-quota models first
  const modelsToTry = [
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite',
    'gemini-3.8-flash',
    'gemini-3.1-flash-lite',
  ];

  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction: SHABEER_IKKA_SYSTEM_INSTRUCTION,
          temperature: 0.95,
          topP: 0.95,
        },
      });

      const replyText = response.text?.trim();
      if (replyText) {
        // Save to conversation memory
        appendToSessionHistory(sessionId, { sender: senderName, text: userMessage }, replyText);
        return replyText;
      }
    } catch (error: any) {
      const errMsg = error?.message || String(error);
      const isKnownIssue =
        error?.status === 'RESOURCE_EXHAUSTED' ||
        error?.status === 503 ||
        errMsg.includes('503') ||
        errMsg.includes('429') ||
        errMsg.includes('quota') ||
        errMsg.includes('demand') ||
        errMsg.includes('Quota exceeded');
      
      console.warn(
        `[Gemini Model ${model}] notice:`,
        isKnownIssue
          ? `Model ${model} experiencing temporary load/demand (${errMsg.substring(0, 60)}...). Switching to backup model...`
          : errMsg.substring(0, 100)
      );
      // Seamlessly continue to next model
      continue;
    }
  }

  // Contextual Kozhikode Manglish fallback when all API quotas are exhausted
  const lower = userMessage.toLowerCase();
  let fallbackText = '';

  if (lower.includes('rate') || lower.includes('kilo') || lower.includes('price') || lower.includes('vilak')) {
    fallbackText = 'Ayyo darling! Kozhi kilo 160 aayi ippo! Skinless aesthetic piece veno ordinary piece veno? Kathi nalla moorchayilaanu baby 💅🍗✨';
  } else if (lower.includes('ameen') || lower.includes('son') || lower.includes('chekka') || lower.includes('phone')) {
    fallbackText = 'Ameene! Phone thazhe vekkeda drama queen! Aa mudiyude oru kolam... poyi koodu kazhuk muthey 💅🤦‍♂️🐔';
  } else if (lower.includes('breast') || lower.includes('boneless') || lower.includes('gym')) {
    fallbackText = 'Anandhu darling, aa muscular arms kandittu njan nalla juicy tender breast piece maatti vechittund ketto 😉💪💅🍗';
  } else if (lower.includes('kadam') || lower.includes('loan') || lower.includes('discount') || lower.includes('cash') || lower.includes('gpay')) {
    fallbackText = 'Kadam tharaan njan enth bank aano darling? Lorry-karan cash chodichu nilkkuva, cash undenkil vaa sweetie 💅💵✨';
  } else if (lower.includes('tea') || lower.includes('chaya') || lower.includes('sulaimani') || lower.includes('beach')) {
    fallbackText = 'Valiyangadiyil oru hot sulaimani kudichittu vaa baby, fabulous kozhi njan cut cheythu ready aakkaam ☕💅🐓';
  } else {
    const defaultFallbacks = [
      'Ayyo darling! Nalla fresh kozhi vetti nilkkuva muthey, 2 minute kathi thazhe vechittu parayaam 💅🔪✨',
      'Endaa chakkaramuthey, kadayil full rush aanu! Ameeneee, aa cage kazhukeda drama queen 💅🍗',
      'Live chicken lorry vannu nilkkuva ponne! Oru sulaimani kudichittu ippo sassy reply tharaam ☕💅💖',
      'Ameene! Reel nokki time kalayaathe kadayil nilkkeda baby! Vappachi slay cheyyaan thudangiyaal scene aanu 💅👑',
    ];
    fallbackText = defaultFallbacks[Math.floor(Math.random() * defaultFallbacks.length)];
  }

  appendToSessionHistory(sessionId, { sender: senderName, text: userMessage }, fallbackText);
  return fallbackText;
}

// =========================================================================
// API ENDPOINTS
// =========================================================================

// 1. HEALTH ENDPOINT (/health and /api/health)
const handleHealth = (req: express.Request, res: express.Response) => {
  res.json({
    status: 'healthy',
    service: 'Shabeer Ikka AI Backend',
    personality: 'Shabeer Ikka (Kozhikode Royal Live Chicken Stall Owner)',
    son: 'Ameen (@ameen_kozhi_junior)',
    language: '100% Perfect Manglish (Kozhikode / Malabar Slang)',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    activeMemorySessions: conversationMemory.size,
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
};

app.get('/health', handleHealth);
app.get('/api/health', handleHealth);

// 2. CHAT ENDPOINT (/chat and /api/chat)
const handleChat = async (req: express.Request, res: express.Response) => {
  try {
    const rawMessage = req.body.message || req.body.userMessage || req.body.text;
    const senderName = req.body.senderName || req.body.sender || req.body.from || 'You';
    const sessionId = String(req.body.sessionId || req.body.conversationId || req.body.userId || 'default-session');
    const clientHistory = req.body.messages || req.body.history;

    if (!rawMessage || typeof rawMessage !== 'string' || !rawMessage.trim()) {
      return res.status(400).json({
        error: 'Missing message. Please provide "message" or "text" in JSON body.',
        example: { message: 'Shabeer ikka kozhi rate ethrayaa?', sessionId: 'my-session-1' },
      });
    }

    const userMessage = rawMessage.trim();
    const replyText = await generateShabeerReply({
      userMessage,
      senderName,
      sessionId,
      clientHistory,
    });

    const memoryCount = getSessionHistory(sessionId).length;

    res.json({
      success: true,
      reply: replyText,
      text: replyText,
      sender: 'Shabeer Ikka',
      sessionId,
      memoryTurns: Math.floor(memoryCount / 2),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  } catch (error: any) {
    console.error('Chat endpoint error:', error);
    res.status(500).json({ error: error?.message || 'Internal server error' });
  }
};

app.post('/chat', handleChat);
app.post('/api/chat', handleChat);

// Clear memory endpoint
app.post('/chat/reset', (req, res) => {
  const sessionId = String(req.body.sessionId || req.body.conversationId || 'default-session');
  clearSessionHistory(sessionId);
  res.json({
    success: true,
    message: `Conversation memory cleared for session "${sessionId}".`,
  });
});
app.post('/api/chat/reset', (req, res) => {
  const sessionId = String(req.body.sessionId || req.body.conversationId || 'default-session');
  clearSessionHistory(sessionId);
  res.json({
    success: true,
    message: `Conversation memory cleared for session "${sessionId}".`,
  });
});

// 3. GENERIC WEBHOOK ENDPOINT (/webhook and /api/webhook)
// Handles incoming HTTP POST webhooks from any bot, WhatsApp, automation, or custom integration.
const handleWebhookPost = async (req: express.Request, res: express.Response) => {
  try {
    const rawMessage =
      req.body.message ||
      req.body.text ||
      req.body.body ||
      req.body.content ||
      req.body.prompt ||
      req.body.data?.message ||
      req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.text?.body;

    const senderName =
      req.body.sender ||
      req.body.senderName ||
      req.body.from ||
      req.body.user ||
      req.body.username ||
      'Customer';

    const sessionId = String(
      req.body.sessionId ||
      req.body.conversationId ||
      req.body.chatId ||
      req.body.from ||
      'webhook-default'
    );

    if (!rawMessage || typeof rawMessage !== 'string' || !rawMessage.trim()) {
      return res.status(400).json({
        error: 'No message text found in webhook payload.',
        expectedFormat: {
          message: 'Hello Shabeer ikka',
          sender: 'CustomerName (optional)',
          sessionId: 'unique-chat-id (optional)',
        },
        receivedPayload: req.body,
      });
    }

    const userMessage = rawMessage.trim();
    const replyText = await generateShabeerReply({
      userMessage,
      senderName,
      sessionId,
    });

    console.log(`[Webhook Message from ${senderName}]: "${userMessage}" -> [Reply]: "${replyText}"`);

    res.json({
      status: 'success',
      reply: replyText,
      text: replyText,
      sender: 'Shabeer Ikka',
      recipient: senderName,
      sessionId,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: error?.message || 'Webhook processing failed' });
  }
};

const handleWebhookGet = (req: express.Request, res: express.Response) => {
  res.json({
    status: 'active',
    endpoint: '/webhook',
    method: 'POST',
    description: 'Generic Shabeer Ikka AI webhook listener. Accepts JSON payload with { message, sender, sessionId }.',
    examplePayload: {
      message: 'Shabeer ikka kozhi rate ethrayaa?',
      sender: 'Amal',
      sessionId: 'user-amal-123',
    },
    exampleResponse: {
      status: 'success',
      reply: 'Rabbe! Kozhi kilo 160 aayi ippo muthey! Skinless veno ordinary veno? 🔪🍗',
      sender: 'Shabeer Ikka',
    },
  });
};

app.get('/webhook', handleWebhookGet);
app.post('/webhook', handleWebhookPost);
app.get('/api/webhook', handleWebhookGet);
app.post('/api/webhook', handleWebhookPost);

// 4. GROUP EVENT BANTER (Conserves user's Gemini quota for Shabeer Ikka's direct messages)
app.post('/api/group-event', async (req, res) => {
  const { member } = req.body;
  const currentMember = member || 'Ameen';

  const memberReplies: Record<string, string[]> = {
    Ameen: [
      'Vappachi eppozhum koodu kazhukaan mathram parayum, njan bike eduthu munghi 😭🛵',
      'Enikku tuition fees kittiyilla rabbe, aarkkelum 100 roopa GPay cheyyaan patto? 📱',
      'Vappachide kathi kandittu enikku thanne pediyaavunnu 🔪😂',
      'Reel scroll cheyyaan polum samayam tharunnilla ee manushyan 😭',
      'Njan Calicut beach-il sulaimani kudikkuva, aarelum varunno? ☕',
    ],
    Jithin: [
      'Ikka 1 kilo skinless-il oru 20 roopa discount tharo please? 😂🍗',
      'Kozhikode beach-il nalla kaattund, namukku chaya kudikaan pokaam ☕',
      'Ameene nee koodu kazhukeda illenkil vappachi kathi edukkum 🤣',
      'Machaane scene aanu, innathe food reel kand nokk! 🔥',
    ],
    Anandhu: [
      'Shabeer ikka, 2kg chicken breast maatti vekku, gym kazhinju ippo varaam 💪🍗',
      'Diet break cheyyan pattilla machane, chicken breast aanu main! 🏋️‍♂️',
      'Kozhi rate koodiyalum venda illa, protein mukhyam! 😎',
      'Chest day aayittu 1kg koodi tharo ikka? 💪',
    ],
    Fathima: [
      'Hahaha Ameen caught red-handed again! 🍿🤣',
      'Ikka kathi nalla moorchayaakki vechittund, Ameene oodikko! 💅',
      'Ivante oru reel pranthu, poyi kadayil nilkkeda Ameene 😂',
      'Groupil eppozhum ikkayum ameenum thammil adi aanallo 🍿',
    ],
    Amal: [
      'Ikka Bitcoin accept cheyyumo 1 kilo kozhikku? 📉😂',
      'Market full crash aanu aliyaa, kozhi thinnan polum cash illa 😭',
      'Crypto up aavumbo njan 10 kilo kozhi medikkum ikka 🚀',
    ],
  };

  const pool = memberReplies[currentMember] || [
    'Machane scene aanu aliyaa 😂',
    'Oru sulaimani kudikaan pokaam ☕',
  ];
  const chosenText = pool[Math.floor(Math.random() * pool.length)];

  res.json({
    text: chosenText,
    sender: currentMember,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  });
});

// 5. VOICE NOTE AUDIO SYNTHESIS (Optional TTS with robust schema and graceful fallback)
app.post('/api/voice-reply', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: text.slice(0, 200), // Keep concise for TTS performance
              speechMetadata: {
                style: 'Energetic Kozhikode chicken shop vendor, comical and fast',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Puck' },
          },
        },
      },
    });

    const candidate = response.candidates?.[0];
    const audioPart = candidate?.content?.parts?.find((part: any) => part.inlineData);

    if (audioPart && audioPart.inlineData?.data) {
      return res.json({
        audioBase64: audioPart.inlineData.data,
        mimeType: audioPart.inlineData.mimeType || 'audio/mp3',
        text,
      });
    }

    res.json({ audioBase64: null, text });
  } catch (error: any) {
    // Graceful fallback to client-side voice synthesis when rate-limited or unavailable
    console.warn('TTS Synthesis note (falling back to client voice):', error?.message ? error.message.substring(0, 100) : error);
    res.json({ audioBase64: null, text: req.body.text });
  }
});

// 6. VOICE NOTE TRANSCRIBER (Optional STT bonus)
app.post('/api/transcribe', async (req, res) => {
  try {
    const { audioBase64, mimeType = 'audio/webm' } = req.body;
    if (!audioBase64) {
      return res.status(400).json({ error: 'audioBase64 is required' });
    }

    const audioPart = {
      inlineData: {
        data: audioBase64,
        mimeType: mimeType,
      },
    };

    let text = '';
    const models = ['gemini-3.5-transcribe', 'gemini-3.8-flash'];
    for (const model of models) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: {
            role: 'user',
            parts: [
              audioPart,
              {
                text: 'Transcribe this voice note into 100% natural MANGLISH (Malayalam written in English alphabet, e.g. "Shabeer ikka kozhi rate ethrayaa"). Return strictly the plain Manglish text without commentary or Malayalam script.',
              },
            ],
          },
        });
        text = response.text?.trim() || '';
        if (text) break;
      } catch (err: any) {
        console.warn(`[Transcription ${model}] warning:`, err?.message || err);
        continue;
      }
    }

    res.json({
      transcription: text,
    });
  } catch (error: any) {
    console.error('Transcription error:', error);
    res.status(500).json({ error: error.message });
  }
});

// =========================================================================
// STATIC ASSETS / FRONTEND SERVING
// =========================================================================
async function setupViteOrStatic() {
  if (process.env.NODE_ENV !== 'production') {
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
      console.log('[Vite] Mounted development middleware');
    } catch (e: any) {
      console.warn('[Vite] Could not load vite middleware, serving static dist:', e.message);
      app.use(express.static(path.join(__dirname, 'dist')));
      app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'dist', 'index.html'));
      });
    }
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }
}

setupViteOrStatic().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`=======================================================`);
    console.log(`🍗 Shabeer Ikka AI Backend running on port ${PORT}`);
    console.log(`🔪 Health Check : http://0.0.0.0:${PORT}/health`);
    console.log(`💬 Chat API     : POST http://0.0.0.0:${PORT}/chat`);
    console.log(`🌐 Webhook API  : POST http://0.0.0.0:${PORT}/webhook`);
    console.log(`🔑 Gemini Key   : ${process.env.GEMINI_API_KEY ? 'Configured ✓' : 'MISSING ❌'}`);
    console.log(`=======================================================`);
  });
});
