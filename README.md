# 🎫 AI-Powered Ticket Intelligence & SLA Management Platform

> Enterprise-grade SaaS support operations that ingests, classifies, risk-scores, and routes every ticket automatically — with SLA enforcement and real-time alerts built in.

---

## 📊 Platform at a Glance

| Metric | Value |
|---|---|
| 🗂 Issue Categories | 9 |
| 🚨 Priority Tiers | P1 → P4 |
| 👥 Access Roles | 2 (Lead & Member) |
| 🤖 AI Model | `gemini-3.5-flash` |
| 🛡 Offline Utility | 100% (fallback parser) |
| ⚡ Poll Interval | Every 5 minutes |

---

## 🏗 Architecture Flow

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐     ┌──────────────────┐     ┌──────────────┐
│                 │     │                  │     │                 │     │                  │     │              │
│  📥 INGESTION   │────▶│ 🧠 AI CLASSIFY   │────▶│  ⏱ SLA ENGINE  │────▶│  🎯 ASSIGNMENT   │────▶│  🔔 ALERTS   │
│                 │     │                  │     │                 │     │                  │     │              │
│ • Gmail poller  │     │ • 9 domains      │     │ • P1–P4 timers  │     │ • Suitability    │     │ • Discord    │
│ • Outlook poller│     │ • Complexity 1–5 │     │ • Live countdown│     │   score engine   │     │ • In-app     │
│ • Manual portal │     │ • Impact H/M/L   │     │ • Breach detect │     │ • Skill matching │     │ • 4 triggers │
│ • CSV bulk load │     │ • Runbook gen    │     │ • <30min alert  │     │ • Load balancing │     │              │
│                 │     │                  │     │                 │     │                  │     │              │
└─────────────────┘     └──────────────────┘     └─────────────────┘     └──────────────────┘     └──────────────┘
      Every 5 min           @google/genai              Real-time              Workload-aware          Multi-channel
```

---

## 🗂 AI Classification Domains

```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  🗄 Database │  │ 🌐 Network  │  │ 🔐 Security │  │ 🏗 Infra    │  │  ☁️ Cloud   │
└─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘
┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ 📱 App      │  │ ⚡ Perf     │  │ 🔑 Auth     │  │ 📋 Other    │
└─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘
```

Each ticket receives:
- **Domain** — one of the 9 categories above
- **Complexity** — rated 1 (simple) → 5 (critical)
- **Business Impact** — `High` / `Med` / `Low`
- **Runbook** — immediate action recommendation

> 🛡 **Offline Fallback**: If Gemini API is unavailable, a rule-based parser activates automatically, preserving 100% platform utility.

---

## ⏱ SLA Priority Matrix

```
Priority  Description               Response SLA   Urgency
────────  ────────────────────────  ─────────────  ──────────────────────────────────
  P1 🔴   Critical Outage            4 Hours        ████░░░░░░░░░░░░░░░░░░░░░
  P2 🟠   Major Outage               8 Hours        ████████░░░░░░░░░░░░░░░░░
  P3 🔵   Standard Request          24 Hours        ████████████████░░░░░░░░░
  P4 🟢   Documentation / Minor     48 Hours        █████████████████████████
```

**Live SLA Events:**
- 🟡 Warning fires when `remaining time < 30 minutes`
- 🔴 Breach alert fires when `deadline is exceeded`

---

## 🎯 Smart Assignment Engine

### Suitability Score Formula

```
╔══════════════════════════════════════════════════════════════════════╗
║                                                                      ║
║   Score  =  SkillMatchBonus  −  (OpenTickets × 5)  −  (CWt × 2)   ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
```

| Component | Points | Description |
|---|---|---|
| ✅ Skill Match Bonus | `+50 pts` | Engineer domain matches ticket domain |
| 📋 Open Ticket Penalty | `−5 pts each` | Per ticket already assigned to engineer |
| ⚡ Complexity Weight | `−2 pts each` | Per unit of active complexity in workload |

**Routing Logic:**

```
Ticket Domain        →   Assigned To
─────────────────────────────────────
🗄  Database         →   DB Engineering Expert
🔐  Security         →   Security Technician
🌐  Network          →   Network Specialist
☁️  Cloud            →   Cloud Engineer
...                  →   Highest scoring available engineer
```

---

## 🔔 Alert Dispatcher

Alerts fire across **Discord webhook** and **in-app** channels on four events:

```
┌──────────────────────────────────────────────────────────────────┐
│  #  Trigger                        Channel                       │
├──────────────────────────────────────────────────────────────────┤
│  1  P1 Critical ticket created     Discord + In-App              │
│  2  Risk score exceeds 80          Discord + In-App              │
│  3  SLA timeline < 30 minutes      Discord + In-App              │
│  4  SLA deadline breached          Discord + In-App              │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🛡 Role-Based Access Control

### 👑 Role 1 — Team Lead *(e.g. Sarah Jenkins)*

```
┌─────────────────────────────────────────────────────┐
│  ✅ View all tickets and workloads                  │
│  ✅ SLA & executive analytics dashboard             │
│  ✅ Onboard / deactivate technicians                │
│  ✅ Override & manually reassign any ticket         │
│  ✅ Discord premium alarm notifications             │
│  ✅ AI Executive Summaries across team              │
└─────────────────────────────────────────────────────┘
```

### 👤 Role 2 — Team Member *(e.g. Rahul Sharma, Priya Patel, John Doe)*

```
┌─────────────────────────────────────────────────────┐
│  ✅ Access the support board                        │
│  ✅ View only personally assigned tickets           │
│  ✅ Mark tickets In Progress and Resolved           │
│  ✅ Receive assignment notifications                │
│  ✅ Personal AI Strengths & Coaching Journey        │
│  ❌ Cannot view other engineers' tickets            │
│  ❌ Cannot reassign or override tickets             │
└─────────────────────────────────────────────────────┘
```

---

## ⚙️ Environment Configuration

```env
# Gemini AI — server-side reasoning & executive summaries
GEMINI_API_KEY="AI_STUDIO_INJECTED_SECRET_HERE"

# Discord — SLA breach alerts & critical ticket notifications
DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/..."

# Neon PostgreSQL — persistent store with enterprise mock seeds
DATABASE_URL="postgresql://username:passwd@neon-endpoint-slug/dbname"
```

---

## 🚀 Quick Start

```
Step 1   npm install       →   Install all dependencies
Step 2   npm run dev       →   Boot developer container
Step 3   npm run build     →   Build static assets (production)
Step 4   npm start         →   Boot production server
```

---

## 📂 Repository Map

```
/
├── server.ts                  Express core — Gmail pollers, API routing, Vite middleware
├── src/
│   ├── types.ts               Strict compiled TypeScript models (platform-wide)
│   ├── server/
│   │   ├── db.ts              Database client + enterprise mock seed data
│   │   ├── ai.ts              Gemini SDK engine, prompt templates, summary calculators
│   │   └── engines.ts         SLA timeline, risk scorer, smart workload router
│   └── components/
│       └── *                  Modular React components (Atlassian-styled)
```

---

> Built with **TypeScript** · **React** · **Express** · **PostgreSQL (Neon)** · **Gemini AI**
