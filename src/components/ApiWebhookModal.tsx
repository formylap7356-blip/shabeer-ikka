import React, { useState, useEffect } from 'react';
import {
  X,
  Cloud,
  CheckCircle2,
  Copy,
  Terminal,
  Send,
  Sparkles,
  RefreshCw,
  Server,
  Activity,
  Trash2,
  Code2,
} from 'lucide-react';

interface ApiWebhookModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface HealthStatus {
  status: string;
  service: string;
  personality: string;
  language: string;
  hasGeminiKey: boolean;
  activeMemorySessions: number;
  uptimeSeconds: number;
  timestamp: string;
}

export const ApiWebhookModal: React.FC<ApiWebhookModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'endpoints' | 'chat_tester' | 'webhook_tester' | 'render' | 'oracle' | 'alwaysdata'>('endpoints');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Health state
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [isLoadingHealth, setIsLoadingHealth] = useState(false);

  // Chat tester state
  const [chatMessage, setChatMessage] = useState('Shabeer ikka kozhi rate ethrayaa?');
  const [chatSender, setChatSender] = useState('You');
  const [chatSessionId, setChatSessionId] = useState('session-test-1');
  const [chatResponse, setChatResponse] = useState<any>(null);
  const [isChatSending, setIsChatSending] = useState(false);

  // Webhook tester state
  const [webhookPayload, setWebhookPayload] = useState(
    JSON.stringify(
      {
        message: 'Ikka Ameen phone nokki irikkuva!',
        sender: 'Jithin',
        sessionId: 'group-chat-101',
      },
      null,
      2
    )
  );
  const [webhookResponse, setWebhookResponse] = useState<any>(null);
  const [isWebhookSending, setIsWebhookSending] = useState(false);

  const fetchHealth = async () => {
    setIsLoadingHealth(true);
    try {
      const res = await fetch('/health');
      const data = await res.json();
      setHealth(data);
    } catch (e) {
      console.warn('Failed to load health status', e);
    } finally {
      setIsLoadingHealth(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchHealth();
    }
  }, [isOpen]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleTestChat = async () => {
    if (!chatMessage.trim() || isChatSending) return;
    setIsChatSending(true);
    setChatResponse(null);

    try {
      const res = await fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: chatMessage,
          senderName: chatSender,
          sessionId: chatSessionId,
        }),
      });
      const data = await res.json();
      setChatResponse(data);
      fetchHealth();
    } catch (err: any) {
      setChatResponse({ error: err.message });
    } finally {
      setIsChatSending(false);
    }
  };

  const handleResetChatMemory = async () => {
    try {
      await fetch('/chat/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: chatSessionId }),
      });
      setChatResponse({ message: `Memory reset for session "${chatSessionId}"` });
      fetchHealth();
    } catch (e: any) {
      console.warn('Reset error', e);
    }
  };

  const handleTestWebhook = async () => {
    if (isWebhookSending) return;
    setIsWebhookSending(true);
    setWebhookResponse(null);

    try {
      const parsed = JSON.parse(webhookPayload);
      const res = await fetch('/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed),
      });
      const data = await res.json();
      setWebhookResponse(data);
      fetchHealth();
    } catch (err: any) {
      setWebhookResponse({ error: err.message || 'Invalid JSON' });
    } finally {
      setIsWebhookSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-hidden shadow-2xl text-zinc-100 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-zinc-900/95">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-600 to-red-600 flex items-center justify-center text-white shadow-md text-lg">
              🍗
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-sm sm:text-base text-white">
                  Shabeer Ikka AI Backend API
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase">
                  Standalone Backend
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                100% Manglish Kozhikode Chicken Shop Persona • Ready for Alwaysdata
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-zinc-800 bg-zinc-950/70 px-4 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('endpoints')}
            className={`py-3 px-3 flex items-center gap-1.5 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'endpoints'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Server className="w-4 h-4 text-amber-400" />
            <span>API Endpoints</span>
          </button>

          <button
            onClick={() => setActiveTab('chat_tester')}
            className={`py-3 px-3 flex items-center gap-1.5 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'chat_tester'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Terminal className="w-4 h-4 text-purple-400" />
            <span>Test /chat (Memory)</span>
          </button>

          <button
            onClick={() => setActiveTab('webhook_tester')}
            className={`py-3 px-3 flex items-center gap-1.5 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'webhook_tester'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Code2 className="w-4 h-4 text-blue-400" />
            <span>Test /webhook</span>
          </button>

          <button
            onClick={() => setActiveTab('render')}
            className={`py-3 px-3 flex items-center gap-1.5 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'render'
                ? 'border-cyan-500 text-cyan-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Cloud className="w-4 h-4 text-cyan-400" />
            <span>Render.com (Auto HTTPS)</span>
          </button>

          <button
            onClick={() => setActiveTab('oracle')}
            className={`py-3 px-3 flex items-center gap-1.5 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'oracle'
                ? 'border-orange-500 text-orange-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Server className="w-4 h-4 text-orange-400" />
            <span>Oracle Cloud (Free VM)</span>
          </button>

          <button
            onClick={() => setActiveTab('alwaysdata')}
            className={`py-3 px-3 flex items-center gap-1.5 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'alwaysdata'
                ? 'border-pink-500 text-pink-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Cloud className="w-4 h-4 text-pink-400" />
            <span>Alwaysdata 24/7</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* TAB 1: ENDPOINTS & HEALTH */}
          {activeTab === 'endpoints' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Health Banner */}
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    Live Backend Health Status
                  </span>
                  <button
                    onClick={fetchHealth}
                    className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingHealth ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 block">Status</span>
                    <span className="font-bold text-emerald-400">
                      {health?.status === 'healthy' ? 'HEALTHY ✓' : 'OFFLINE'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 block">Gemini API Key</span>
                    <span className="font-semibold text-zinc-200">
                      {health?.hasGeminiKey ? 'Configured ✓' : 'Missing ❌'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 block">Active Memories</span>
                    <span className="font-bold text-amber-400 text-sm">
                      {health?.activeMemorySessions ?? 0} sessions
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 block">Language</span>
                    <span className="text-zinc-300 text-[11px] font-medium">100% Manglish</span>
                  </div>
                </div>
              </div>

              {/* Endpoints List */}
              <div className="space-y-3 text-xs">
                {/* 1. GET /health */}
                <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono font-bold text-[11px]">
                        GET
                      </span>
                      <code className="text-white font-mono font-bold">/health</code>
                    </div>
                    <span className="text-[10px] text-zinc-500">Service Status</span>
                  </div>
                  <p className="text-zinc-400 text-[11px]">
                    Returns service status, uptime, and active conversation memory session count.
                  </p>
                </div>

                {/* 2. POST /chat */}
                <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 font-mono font-bold text-[11px]">
                        POST
                      </span>
                      <code className="text-white font-mono font-bold">/chat</code>
                    </div>
                    <span className="text-[10px] text-purple-400 font-semibold">Conversation Memory</span>
                  </div>
                  <p className="text-zinc-400 text-[11px]">
                    Chat with Shabeer Ikka with full multi-turn memory. Remembers past exchanges per <code className="text-pink-300">sessionId</code>.
                  </p>
                  <div className="p-2 rounded-lg bg-zinc-900 font-mono text-[11px] text-zinc-300 border border-zinc-800 flex items-center justify-between">
                    <code>{`{ "message": "kozhi rate ethrayaa?", "sessionId": "user-1" }`}</code>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          `curl -X POST http://localhost:3000/chat -H "Content-Type: application/json" -d '{"message":"kozhi rate ethrayaa?", "sessionId":"user-1"}'`,
                          'chat_curl'
                        )
                      }
                      className="text-zinc-400 hover:text-white px-1.5 py-0.5 text-[10px]"
                    >
                      {copiedKey === 'chat_curl' ? 'Copied' : 'Copy curl'}
                    </button>
                  </div>
                </div>

                {/* 3. POST /webhook */}
                <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-mono font-bold text-[11px]">
                        POST
                      </span>
                      <code className="text-white font-mono font-bold">/webhook</code>
                    </div>
                    <span className="text-[10px] text-blue-400 font-semibold">Generic Webhook</span>
                  </div>
                  <p className="text-zinc-400 text-[11px]">
                    Accepts any JSON body with <code className="text-blue-300">message</code> and <code className="text-blue-300">sender</code>. Returns Shabeer Ikka's AI reply.
                  </p>
                  <div className="p-2 rounded-lg bg-zinc-900 font-mono text-[11px] text-zinc-300 border border-zinc-800 flex items-center justify-between">
                    <code>{`{ "message": "Ameene koodu kazhukeda!", "sender": "Jithin" }`}</code>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          `curl -X POST http://localhost:3000/webhook -H "Content-Type: application/json" -d '{"message":"Ameene koodu kazhukeda!", "sender":"Jithin"}'`,
                          'webhook_curl'
                        )
                      }
                      className="text-zinc-400 hover:text-white px-1.5 py-0.5 text-[10px]"
                    >
                      {copiedKey === 'webhook_curl' ? 'Copied' : 'Copy curl'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CHAT TESTER */}
          {activeTab === 'chat_tester' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-purple-400" />
                    Test /chat Endpoint with Conversation Memory
                  </span>
                  <button
                    onClick={handleResetChatMemory}
                    className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white text-[10px] flex items-center gap-1 transition-colors"
                    title="Clear memory for this sessionId"
                  >
                    <Trash2 className="w-3 h-3 text-red-400" />
                    <span>Clear Memory</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] text-zinc-400 font-medium block mb-1">Session ID (Memory Key)</label>
                    <input
                      type="text"
                      value={chatSessionId}
                      onChange={(e) => setChatSessionId(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-400 font-medium block mb-1">Sender Name</label>
                    <input
                      type="text"
                      value={chatSender}
                      onChange={(e) => setChatSender(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 font-medium block mb-1">Message</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      placeholder="e.g. Shabeer ikka kozhi rate ethrayaa?"
                      className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                    />
                    <button
                      onClick={handleTestChat}
                      disabled={isChatSending}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold text-xs flex items-center gap-1.5 shadow active:scale-95 transition-transform disabled:opacity-50"
                    >
                      {isChatSending ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      <span>Send</span>
                    </button>
                  </div>
                </div>

                {chatResponse && (
                  <div className="mt-3 p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs space-y-2 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                      <span>Turns in Memory: {chatResponse.memoryTurns ?? 'N/A'}</span>
                      <span className="text-emerald-400">HTTP 200 OK</span>
                    </div>
                    <div className="text-purple-300 bg-purple-950/40 p-2.5 rounded-lg border border-purple-500/20 font-sans">
                      <strong>Shabeer Ikka:</strong> "{chatResponse.reply || chatResponse.text}"
                    </div>
                    <pre className="text-[10px] font-mono text-zinc-400 overflow-x-auto bg-zinc-950 p-2 rounded">
                      {JSON.stringify(chatResponse, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: WEBHOOK TESTER */}
          {activeTab === 'webhook_tester' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
                <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-blue-400" />
                  Test Generic /webhook Endpoint
                </span>

                <p className="text-[11px] text-zinc-400">
                  Send a generic JSON webhook payload. Shabeer Ikka will parse the text and respond in Manglish.
                </p>

                <div>
                  <label className="text-[10px] text-zinc-400 font-medium block mb-1">JSON Payload</label>
                  <textarea
                    rows={6}
                    value={webhookPayload}
                    onChange={(e) => setWebhookPayload(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-xs text-blue-300 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <button
                    onClick={handleTestWebhook}
                    disabled={isWebhookSending}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-xs flex items-center gap-1.5 shadow active:scale-95 transition-transform disabled:opacity-50"
                  >
                    {isWebhookSending ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    <span>POST to /webhook</span>
                  </button>
                  <span className="text-[11px] text-zinc-500">POST http://localhost:3000/webhook</span>
                </div>

                {webhookResponse && (
                  <div className="mt-3 p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs space-y-2 animate-in fade-in duration-150">
                    <div className="text-blue-300 bg-blue-950/40 p-2.5 rounded-lg border border-blue-500/20 font-sans">
                      <strong>Webhook Response:</strong> "{webhookResponse.reply || webhookResponse.text}"
                    </div>
                    <pre className="text-[10px] font-mono text-zinc-400 overflow-x-auto bg-zinc-950 p-2 rounded">
                      {JSON.stringify(webhookResponse, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: ALWAYSDATA 24/7 */}
          {activeTab === 'alwaysdata' && (
            <div className="space-y-4 animate-in fade-in duration-150 text-xs text-zinc-300">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-900/30 via-purple-900/30 to-indigo-900/30 border border-pink-500/30">
                <div className="flex items-center gap-2 font-bold text-white text-sm mb-1">
                  <Cloud className="w-4 h-4 text-pink-400" />
                  Deploying to Alwaysdata (Zero Instagram Config)
                </div>
                <p className="text-zinc-300 text-[11px]">
                  Only your Gemini API key is needed. Alwaysdata will host this backend 24/7 for free!
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1.5">
                <p className="font-semibold text-white">1. Alwaysdata Site Configuration</p>
                <ul className="list-disc list-inside space-y-1 text-zinc-400 text-[11px]">
                  <li><strong>Type:</strong> Node.js</li>
                  <li><strong>Command:</strong> <code className="text-pink-300">npm start</code></li>
                  <li><strong>Working directory:</strong> <code className="text-pink-300">/home/[account]/shabeer-backend</code></li>
                </ul>
              </div>

              <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1.5">
                <p className="font-semibold text-white">2. Environment Variables</p>
                <div className="p-2.5 rounded-lg bg-zinc-900 font-mono text-[11px] text-zinc-300 space-y-1 border border-zinc-800">
                  <div><span className="text-pink-400">GEMINI_API_KEY</span>="your_gemini_api_key"</div>
                  <div><span className="text-pink-400">NODE_ENV</span>="production"</div>
                  <div><span className="text-pink-400">PORT</span>=3000</div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1.5">
                <p className="font-semibold text-white">3. Build &amp; Start Command</p>
                <div className="p-2 bg-zinc-900 font-mono text-[11px] text-emerald-400 rounded border border-zinc-800 flex items-center justify-between">
                  <code>npm install &amp;&amp; npm run build</code>
                  <button
                    onClick={() => copyToClipboard('npm install && npm run build', 'build_cmd')}
                    className="text-zinc-400 hover:text-white px-2 py-0.5 text-[10px]"
                  >
                    {copiedKey === 'build_cmd' ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: ORACLE CLOUD ALWAYS FREE */}
          {activeTab === 'oracle' && (
            <div className="space-y-4 animate-in fade-in duration-150 text-xs text-zinc-300">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-900/30 via-amber-900/30 to-yellow-900/30 border border-orange-500/30">
                <div className="flex items-center gap-2 font-bold text-white text-sm mb-1">
                  <Server className="w-4 h-4 text-orange-400" />
                  Oracle Cloud (OCI) Always Free VM
                </div>
                <p className="text-zinc-300 text-[11px]">
                  Oracle gives you a full Linux Virtual Machine (up to 4 ARM cores, 24GB RAM, dedicated static IP) <strong>100% free forever</strong> with zero sleeping or downtime.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
                <p className="font-semibold text-white">1. One-Liner Setup on Oracle Ubuntu VM</p>
                <div className="p-2.5 bg-zinc-900 font-mono text-[11px] text-amber-400 rounded border border-zinc-800 space-y-1 overflow-x-auto">
                  <code>curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt install -y nodejs git && sudo npm install -g pm2 tsx</code>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
                <p className="font-semibold text-white">2. Run 24/7 with PM2 Process Manager</p>
                <div className="p-2.5 bg-zinc-900 font-mono text-[11px] text-emerald-400 rounded border border-zinc-800 space-y-1">
                  <div>pm2 start server.ts --name "shabeer-ai" --interpreter tsx</div>
                  <div>pm2 startup && pm2 save</div>
                </div>
                <p className="text-zinc-400 text-[11px]">
                  PM2 ensures the AI backend restarts automatically if the server reboots or crashes.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
                <p className="font-semibold text-white">3. Free HTTPS with Cloudflare Tunnel</p>
                <p className="text-zinc-400 text-[11px]">
                  Run <code className="text-orange-300">cloudflared tunnel --url http://localhost:3000</code> to get a free secure HTTPS webhook URL for Instagram instantly.
                </p>
                <p className="text-[11px] text-zinc-500">
                  Detailed step-by-step guide is saved in <strong className="text-zinc-300">ORACLE_CLOUD_GUIDE.md</strong>.
                </p>
              </div>
            </div>
          )}

          {/* TAB 6: RENDER.COM DEPLOYMENT */}
          {activeTab === 'render' && (
            <div className="space-y-4 animate-in fade-in duration-150 text-xs text-zinc-300">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-blue-950/40 to-indigo-950/40 border border-cyan-500/30">
                <div className="flex items-center gap-2 font-bold text-white text-sm mb-1">
                  <Cloud className="w-4 h-4 text-cyan-400" />
                  Render.com Web Service Deployment
                </div>
                <p className="text-zinc-300 text-[11px]">
                  Deploy with 1-click on Render. Render provides automatic <strong>free HTTPS SSL domains</strong> (e.g. <code>https://your-service.onrender.com</code>), automatic GitHub sync, and zero server maintenance.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1.5">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block">Service Type</span>
                  <p className="text-white font-semibold">Web Service (Node)</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1.5">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block">Runtime</span>
                  <p className="text-cyan-400 font-mono font-semibold">Node</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">Build Command</span>
                  <button
                    onClick={() => copyToClipboard('npm install && npm run build', 'render_build')}
                    className="text-zinc-400 hover:text-white text-[10px]"
                  >
                    {copiedKey === 'render_build' ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <div className="p-2.5 bg-zinc-900 font-mono text-[11px] text-cyan-300 rounded border border-zinc-800">
                  <code>npm install && npm run build</code>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">Start Command</span>
                  <button
                    onClick={() => copyToClipboard('npm start', 'render_start')}
                    className="text-zinc-400 hover:text-white text-[10px]"
                  >
                    {copiedKey === 'render_start' ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <div className="p-2.5 bg-zinc-900 font-mono text-[11px] text-emerald-300 rounded border border-zinc-800">
                  <code>npm start</code>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
                <span className="font-semibold text-white block">Environment Variable</span>
                <div className="p-2.5 bg-zinc-900 font-mono text-[11px] text-amber-300 rounded border border-zinc-800">
                  <code>GEMINI_API_KEY = your_gemini_api_key_here</code>
                </div>
                <p className="text-zinc-400 text-[11px]">
                  Add this in Render's <strong>Environment</strong> tab.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
                <span className="font-semibold text-white block">Your Render Webhook URL for Instagram</span>
                <p className="text-zinc-400 text-[11px]">
                  Once deployed, use your Render HTTPS URL in ManyChat, Make.com, or your Instagram webhook:
                </p>
                <div className="p-2.5 bg-zinc-900 font-mono text-[11px] text-zinc-200 rounded border border-zinc-800">
                  <code>https://&lt;your-app-name&gt;.onrender.com/webhook</code>
                </div>
                <p className="text-[11px] text-zinc-500">
                  Complete guide is available in <strong className="text-zinc-300">RENDER_GUIDE.md</strong> and <strong className="text-zinc-300">render.yaml</strong>.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>AI Backend: Ready</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
