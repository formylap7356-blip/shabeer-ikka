# Hosting Shabeer Ikka AI on Oracle Cloud (OCI Always Free)

Oracle Cloud Infrastructure (OCI) offers an **Always Free Tier** that gives you a full Linux Virtual Machine (up to 4 ARM cores, 24GB RAM, and a static public IP address) that runs **24/7 forever with zero cost**.

This is one of the best platforms for hosting Shabeer Ikka AI and connecting your Instagram bot.

---

## Step 1: Create an Oracle Cloud Compute Instance (VM)

1. Sign in to your [Oracle Cloud Console](https://cloud.oracle.com/).
2. In the navigation menu, go to **Compute** ➔ **Instances** ➔ **Create instance**.
3. Choose:
   - **Image:** Ubuntu 22.04 LTS or Ubuntu 24.04 (Minimal / Standard).
   - **Shape:** 
     - *Ampere (ARM)*: VM.Standard.A1.Flex (Up to 4 OCPUs, 24GB RAM free) OR
     - *AMD (x86)*: VM.Standard.E2.1.Micro (1 OCPU, 1GB RAM free).
4. **Networking:** Select default VCN and make sure **Assign a public IPv4 address** is checked.
5. **Add SSH keys:** Download your private key (`ssh-key-*.key`) to your computer.
6. Click **Create**. Note your VM's **Public IP address**.

---

## Step 2: Open Firewall Ports in Oracle Cloud

Oracle Cloud has two firewalls: the **Cloud VCN Security List** and the **VM's internal iptables/ufw**.

### 1. In Oracle Cloud Web Console:
1. Go to your Instance details ➔ Click on your **Subnet** link under *Primary VNIC*.
2. Click **Default Security List**.
3. Click **Add Ingress Rules**:
   - **Source CIDR:** `0.0.0.0/0`
   - **IP Protocol:** `TCP`
   - **Destination Port Range:** `80, 443, 3000`
   - **Description:** `HTTP, HTTPS, Shabeer Ikka API`
4. Click **Add Ingress Rules**.

---

## Step 3: SSH into Your Oracle VM & Install Dependencies

From your local computer terminal:
```bash
# Set permissions for your private key
chmod 400 /path/to/your-ssh-key.key

# Connect to your Oracle VM (replace with your VM's Public IP)
ssh -i /path/to/your-ssh-key.key ubuntu@YOUR_ORACLE_PUBLIC_IP
```

Once connected, run these commands to install Node.js 20, Git, and PM2:
```bash
# 1. Update system packages
sudo apt update && sudo apt upgrade -y

# 2. Open firewall in Ubuntu
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3000/tcp
sudo ufw --force enable

# Also allow in iptables if needed by Oracle Ubuntu:
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 3000 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
sudo netfilter-persistent save 2>/dev/null || true

# 3. Install Node.js 20 LTS & PM2
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git
sudo npm install -g pm2 tsx
```

---

## Step 4: Clone & Configure Shabeer Ikka AI

```bash
# 1. Clone your project or upload files
cd /home/ubuntu
git clone <YOUR_REPO_URL> shabeer-ai
cd shabeer-ai

# 2. Install dependencies & build client
npm install
npm run build

# 3. Create .env file with your Gemini key
nano .env
```
Inside `.env`, paste:
```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3000
```
*(Press `Ctrl+O` then `Enter` to save, `Ctrl+X` to exit)*.

---

## Step 5: Start 24/7 Background Service with PM2

Run Shabeer Ikka with PM2 so it stays online 24/7 and restarts automatically if the server reboots:

```bash
# Start the backend server
pm2 start server.ts --name "shabeer-ai" --interpreter tsx

# Make PM2 restart automatically on system reboot
pm2 startup
# (Run the sudo command that PM2 outputs)
pm2 save
```

Check status:
```bash
pm2 status
pm2 logs shabeer-ai
```

Test your live endpoint:
```bash
curl http://localhost:3000/health
```

---

## Step 6: Free HTTPS / SSL with Cloudflare Tunnel (Zero Port-Forwarding Needed!)

Instagram requires HTTPS URLs for webhooks. The easiest way to get a secure HTTPS domain on Oracle Cloud is **Cloudflare Tunnel** (free, no domain purchase needed):

```bash
# Install cloudflared
curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared.deb

# Run quick tunnel for port 3000
cloudflared tunnel --url http://localhost:3000
```
This gives you a free HTTPS URL like:
`https://random-words.trycloudflare.com`

Your live webhook URL is now:
`https://random-words.trycloudflare.com/webhook`

---

## Step 7: Connecting Instagram

### Option A: Via ManyChat / Make.com Webhook
1. In Make.com or ManyChat, set the webhook destination to:
   `https://YOUR_DOMAIN/webhook` (or `/chat`)
2. Payload:
   ```json
   {
     "message": "{{incoming_instagram_message}}",
     "sender": "{{user_name}}",
     "sessionId": "{{user_id}}"
   }
   ```
3. Send the returned `reply` back to Instagram.

### Option B: Running the Instagram Bot Directly on Oracle Cloud
Run a background worker script on your Oracle Cloud VM alongside Shabeer Ikka using PM2:
```bash
pm2 start ig-bridge.js --name "shabeer-ig-bot"
pm2 save
```

---

## Summary of Useful Commands on Oracle Cloud:

| Action | Command |
| :--- | :--- |
| **View Live AI Logs** | `pm2 logs shabeer-ai` |
| **Restart Backend** | `pm2 restart shabeer-ai` |
| **Stop Backend** | `pm2 stop shabeer-ai` |
| **Update Code** | `git pull && npm run build && pm2 restart shabeer-ai` |
