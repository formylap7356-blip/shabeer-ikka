# 🚀 Deploying Shabeer Ikka AI to Render (render.com)

Render is one of the easiest ways to host full-stack Node.js web services with **automatic HTTPS**, automatic GitHub deployments, and zero server configuration.

---

## 📋 Quick Specs for Render

| Field | Value |
| :--- | :--- |
| **Service Type** | **Web Service** |
| **Language / Runtime** | **Node** |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Environment Variables** | `GEMINI_API_KEY` = your API key |
| **Auto HTTPS URL** | `https://your-service-name.onrender.com` |

---

## 🛠️ Step-by-Step Deployment Guide

### Step 1: Push Your Code to GitHub / GitLab
1. Initialize git and push this repository to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Shabeer Ikka AI Backend"
   git remote add origin https://github.com/your-username/shabeer-ikka-ai.git
   git push -u origin main
   ```

---

### Step 2: Create a New Web Service on Render
1. Go to [dashboard.render.com](https://dashboard.render.com/) and sign in (free).
2. Click the **+ New** button (top right) ➔ Select **Web Service**.
3. Connect your GitHub repository (`shabeer-ikka-ai`).
4. Fill in the service settings:
   - **Name:** `shabeer-ikka-ai` (or any name you like)
   - **Region:** Any (e.g. *Oregon (US West)*, *Frankfurt (EU)*, or *Singapore (Asia)*)
   - **Branch:** `main`
   - **Runtime:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`

---

### Step 3: Add Your Gemini API Key
1. Scroll down to **Environment Variables**.
2. Click **Add Environment Variable**:
   - **Key:** `GEMINI_API_KEY`
   - **Value:** `your_gemini_api_key_here`
3. Click **Create Web Service**.

---

### Step 4: Verify Your Live Render Endpoints

Render will build the project and output a live HTTPS URL:
`https://shabeer-ikka-ai.onrender.com`

Test it with curl or in your browser:

#### 1. Health Check
```bash
curl https://shabeer-ikka-ai.onrender.com/health
```
**Response:**
```json
{
  "status": "healthy",
  "service": "Shabeer Ikka AI Backend",
  "personality": "Shabeer Ikka (Kozhikode Royal Live Chicken Stall Owner)",
  "language": "100% Perfect Manglish (Kozhikode / Malabar Slang)",
  "hasGeminiKey": true
}
```

#### 2. Chat API (with Multi-Turn Memory)
```bash
curl -X POST https://shabeer-ikka-ai.onrender.com/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Shabeer ikka innathe kozhi rate ethrayaa?",
    "sender": "Amal",
    "sessionId": "session-101"
  }'
```

---

## 📱 Step 5: Connecting Render to Instagram

Because Render gives you a secure `https://*.onrender.com` URL out of the box, you can connect it directly to Instagram:

### Method 1: Using ManyChat / Make.com Webhook (No Coding)
1. In Make.com or ManyChat, create a scenario:
   - **Trigger:** Instagram ➔ *Watch Messages / Direct Messages*.
2. Add an **HTTP Request** module:
   - **URL:** `https://shabeer-ikka-ai.onrender.com/webhook`
   - **Method:** `POST`
   - **Headers:** `Content-Type: application/json`
   - **Body:**
     ```json
     {
       "message": "{{incoming_message_text}}",
       "sender": "{{sender_username}}",
       "sessionId": "{{sender_id}}"
     }
     ```
3. Add action: **Instagram ➔ Send Direct Message** with the returned `reply`.

---

### 💡 Pro-Tip: Keeping Free Render Services Awake (Optional)
Free tier services on Render spin down after 15 minutes of inactivity. To keep your Shabeer Ikka bot responding in milliseconds 24/7 with zero cold starts:
1. Go to [cron-job.org](https://cron-job.org/) or [UptimeRobot](https://uptimerobot.com/) (both 100% free).
2. Set up a ping every 10 minutes to:
   `https://shabeer-ikka-ai.onrender.com/health`
3. This keeps your Render container warm and responsive 24/7!
