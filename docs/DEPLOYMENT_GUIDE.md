# ORGagent Cloud Deployment Guide

This guide walks you through deploying **ORGagent Organization OS** to the cloud so anyone around the world can access and interact with your platform via a live HTTPS URL for free.

---

## Architecture Overview

```
┌────────────────────────────────────────────────────────┐
│                   PUBLIC INTERNET                      │
└───────────────────────────┬────────────────────────────┘
                            │
              ┌─────────────┴─────────────┐
              ▼                           ▼
    ┌──────────────────┐        ┌──────────────────┐
    │  Frontend Client │        │  Backend API     │
    │  (Vercel)        │───────▶│  (Render/Railway)│
    │  Next.js 15 HUD  │        │  FastAPI + Agents│
    └──────────────────┘        └──────────────────┘
```

---

## Step 1: Deploy Backend API to Render (Free)

1. Go to [https://dashboard.render.com](https://dashboard.render.com) (sign up with GitHub).
2. Click **New +** → **Web Service** (or **Blueprint**).
3. Connect your GitHub repository: `aasish3187/Organisational-Agent`.
4. Configure the service:
   - **Name**: `orgagent-api`
   - **Root Directory**: `apps/api`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: `Free`
5. Under **Environment Variables**, add:
   - `ENVIRONMENT` = `production`
   - `ALLOWED_ORIGINS` = `*`
   - `DATABASE_URL` = `sqlite+aiosqlite:///./nexus.db`
   - `PRIMARY_PROVIDER` = `gemini`
   - `GEMINI_API_KEY` = `your_gemini_api_key_here` (Optional / Free from Google AI Studio)
   - `GROQ_API_KEY` = `your_groq_api_key_here` (Optional / Free from console.groq.com)
6. Click **Create Web Service**.
7. Once deployed, Render will provide a live HTTPS URL (e.g. `https://orgagent-api.onrender.com`).
   - Test it by visiting `https://orgagent-api.onrender.com/health` (should return `{"status":"ok", "app":"ORGagent Organization OS"}`).

---

## Step 2: Deploy Frontend to Vercel (Free)

1. Go to [https://vercel.com](https://vercel.com) (sign up with GitHub).
2. Click **Add New...** → **Project**.
3. Import your GitHub repository: `aasish3187/Organisational-Agent`.
4. In the configuration modal:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: Click **Edit** and select `apps/web`.
5. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_API_URL` = `https://orgagent-api.onrender.com` (use your Render API URL from Step 1 without trailing slash).
6. Click **Deploy**.
7. In ~60 seconds, Vercel will give you a public live domain (e.g. `https://organisational-agent.vercel.app` or `https://orgagent.vercel.app`).

---

## Step 3: Verify Your Live Platform

1. Open your Vercel URL in your browser or phone.
2. The navbar will show the glowing `LIVE` indicator connected to your Render backend.
3. Test creating a mission or running a simulation — anyone can now view and use ORGagent globally!

---

## Alternative: 1-Click Instant Live Sharing (Localtunnel / Cloudflare)

If you want to immediately share your locally running instance with someone right now without setting up cloud accounts:

```bash
# In a new terminal:
npx localtunnel --port 3000
```
This gives you an instant temporary public URL (e.g. `https://funny-tiger-42.loca.lt`) pointing directly to your running app!
