# Deploy Shabeer Ikka AI Backend to Alwaysdata (Free 24/7 Hosting)

This guide shows you how to deploy the **Shabeer Ikka AI Backend** to Alwaysdata.
**No Instagram tokens, session IDs, browser automation, or developer credentials required.**
Only your Google Gemini API key is needed.

---

## 1. Quick Overview

- **Service:** Shabeer Ikka Kozhikode Chicken Shop AI Backend
- **Language:** 100% Manglish & Malayalam
- **Features:**
  - `GET /health` : Health check & service status
  - `POST /chat` : Multi-turn conversation with memory
  - `POST /chat/reset` : Clear conversation memory for a session
  - `POST /webhook` : Generic webhook for custom bots & external integrations
  - `GET /webhook` : Webhook status check
- **Required Env Var:** `GEMINI_API_KEY`

---

## 2. Deploy on Alwaysdata (Step-by-Step)

### Step 1: Sign up & Create a Site
1. Register for free at [alwaysdata.com](https://www.alwaysdata.com).
2. Go to **Web** > **Sites** > **Add a site**:
   - **Name:** `shabeer-ikka`
   - **Type:** `Node.js`
   - **Working directory:** `/home/[your-account]/shabeer-ikka`
   - **Command:** `npm start` (or `npx tsx server.ts`)

### Step 2: Set Environment Variables
In your Alwaysdata site settings, go to **Environment** (or **Environment variables**):
```env
GEMINI_API_KEY="your_actual_gemini_api_key"
NODE_ENV="production"
PORT=3000
```

### Step 3: Upload Code & Install
Upload this project folder to `/home/[your-account]/shabeer-ikka`, then in the Alwaysdata SSH terminal run:
```bash
cd /home/[your-account]/shabeer-ikka
npm install
npm run build
```

Click **Restart site** in the Alwaysdata dashboard. Your backend is now live 24/7!

---

## 3. Testing Your Endpoints

### 1. Health Check
```bash
curl https://[your-account].alwaysdata.net/health
```
**Response:**
```json
{
  "status": "healthy",
  "service": "Shabeer Ikka AI Backend",
  "personality": "Shabeer Ikka (Kozhikode Royal Live Chicken Stall Owner)",
  "language": "100% Manglish (Kozhikode / Malabar Slang)",
  "hasGeminiKey": true,
  "activeMemorySessions": 0
}
```

### 2. Chat with Conversation Memory
```bash
curl -X POST https://[your-account].alwaysdata.net/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Shabeer ikka kozhi rate ethrayaa?",
    "sender": "Amal",
    "sessionId": "session-101"
  }'
```
**Response:**
```json
{
  "success": true,
  "reply": "Rabbe! Kozhi kilo 160 aayi ippo muthey! Skinless veno ordinary veno? Kathi nalla moorchayilaanu 🔪🐓",
  "sender": "Shabeer Ikka",
  "sessionId": "session-101",
  "memoryTurns": 1
}
```

Subsequent messages with the same `sessionId` will remember prior conversation context!

### 3. Clear Memory for a Session
```bash
curl -X POST https://[your-account].alwaysdata.net/chat/reset \
  -H "Content-Type: application/json" \
  -d '{ "sessionId": "session-101" }'
```

### 4. Generic Webhook
```bash
curl -X POST https://[your-account].alwaysdata.net/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Ikka Ameen koodu kazhukiyo?",
    "sender": "Jithin",
    "sessionId": "group-chat-1"
  }'
```
**Response:**
```json
{
  "status": "success",
  "reply": "Ameeneee! Phone thazhe vechedada chekka! Vappachi koli thookaatha nerath groupil chali adikkunnoda 📱🔪",
  "sender": "Shabeer Ikka",
  "recipient": "Jithin"
}
```
