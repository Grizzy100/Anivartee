<div align="center">

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=700&size=40&pause=1000&color=6366F1&center=true&vCenter=true&width=700&lines=Anivartee;Where+Truth+Competes;For+Visibility" alt="Anivartee" />

<br/>

**A community-driven platform that transforms truth verification into a collaborative, reputation-powered game.**

<br/>

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Redis](https://img.shields.io/badge/Redis_7-FF4438?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io)
[![Stripe](https://img.shields.io/badge/Stripe-635BFF?style=for-the-badge&logo=stripe&logoColor=white)](https://stripe.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

</div>

---

## 🎯 What Is Anivartee?

> *Modern social platforms reward virality, not truth. Anivartee changes that.*

Anivartee merges social media mechanics with crowd-sourced fact-checking into a single, self-regulating ecosystem. Instead of hiding moderation behind opaque algorithms or centralized authorities, it transforms truth verification into a **gamified community governance layer** driven by reputation, incentives, and full transparency.

| Without Anivartee | With Anivartee |
|---|---|
| Virality determines visibility | Verification determines visibility |
| Moderation is opaque & centralised | Moderation is transparent & distributed |
| Social scores mean nothing | Reputation directly unlocks system privileges |
| Truth has no reward | Accuracy earns reputation & rank |

---

## 📸 Platform Showcase

<details>
<summary><b>🌐 Landing Page</b></summary>
<br/>

![Landing Page](https://raw.githubusercontent.com/Grizzy100/Anivartee/main/client/public/photos/Landing%20Page.png)

</details>

<details>
<summary><b>🆕 Signup & 🔐 Login</b></summary>
<br/>

| Signup | Login |
|---|---|
| ![Signup](https://raw.githubusercontent.com/Grizzy100/Anivartee/main/client/public/photos/SignUp.png) | ![Login](https://raw.githubusercontent.com/Grizzy100/Anivartee/main/client/public/photos/SignIn.png) |

</details>

<details open>
<summary><b>🧑‍💻 User Dashboard</b></summary>
<br/>

![User Dashboard](https://raw.githubusercontent.com/Grizzy100/Anivartee/main/client/public/photos/User%20Dashboard.png)

</details>

<details>
<summary><b>🔎 Fact-Checker Moderation Queue</b></summary>
<br/>

![Fact Checker Moderation Queue](https://raw.githubusercontent.com/Grizzy100/Anivartee/main/client/public/photos/Fact%20moderation.png)

</details>

<details>
<summary><b>💎 Region-Based Subscription Plans</b></summary>
<br/>

| India 🇮🇳 | Netherlands 🇳🇱 |
|---|---|
| ![India](https://raw.githubusercontent.com/Grizzy100/Anivartee/main/client/public/photos/Screenshot%202026-03-07%20111141.png) | ![Netherlands](https://raw.githubusercontent.com/Grizzy100/Anivartee/main/client/public/photos/Screenshot%202026-03-07%20112324.png) |

| Singapore 🇸🇬 | USA 🇺🇸 |
|---|---|
| ![Singapore](https://raw.githubusercontent.com/Grizzy100/Anivartee/main/client/public/photos/Screenshot%202026-03-07%20112334.png) | ![USA](https://raw.githubusercontent.com/Grizzy100/Anivartee/main/client/public/photos/Screenshot%202026-03-07%20112348.png) |

</details>

---

## ⭐ Core Features

### 🛡️ Claim-Based Moderation Queue

Content that requires verification enters a tamper-resistant distributed work queue. Each claim is exclusively held for **30 minutes**, preventing race conditions and duplicate work.

```
Post Created
    │
    ▼
[PENDING] ──────────────── Fact-Checker Claims
    │                              │
    ▼                              ▼
[UNDER_REVIEW] ◄──────── 30-minute exclusive window
    │                              │
    ├── Verdict submitted ─► [VALIDATED] or [DEBUNKED]
    │
    └── Claim expires    ─► Back to [PENDING]  (claimExpiry.job.ts)
```

- `ClaimRecord` evaluates `expiresAt` **at query time**, making stale claims instantly invisible without waiting for the background job — eliminating the race condition entirely.
- Upsert-based re-claims prevent unique constraint violations under concurrent access.

---

### 🧾 Event-Sourced Reputation Engine

Reputation is **never mutated directly**. Every change is an immutable event appended to a ledger — giving the system full auditability and tamper-proof history.

```
Every Interaction
      │
      ▼
PointsLedger  ←── Immutable, append-only log
      │             (POST_CREATED, FACT_CHECK_COMPLETED, PENALTY…)
      │ (same transaction)
      ▼
PointsBalance ←── Materialized view → O(1) balance reads
```

---

### 🔥 Hot Score Algorithmic Feed

The feed uses a **Reddit-style hot score** recalculated on every significant interaction:

```
hotScore = f(likes, views, recency, moderation_state)
```

Database index on `(status, hotScore DESC)` ensures feed queries stay fast regardless of table size. Post verification state directly influences visibility — verified content rises, debunked content falls.

---

### 🏆 Reputation Rank System

Users and Fact-Checkers level up independently, unlocking greater system privileges as their accuracy and contribution grow.

**User Ranks**

| Rank | Points Required | Posts/Day | Edit Window |
|---|---|---|---|
| 🌱 Novice | 0 | 3 | 12 hours |
| 📝 Contributor | 400 | 5 | 24 hours |
| 🔬 Researcher | 1,200 | 8 | 48 hours |
| ✅ Trusted | 3,000 | 12 | Unlimited |
| 💫 Elite | 7,000 | 20 | Unlimited |
| 👑 Legend | 15,000 | Unlimited | Unlimited |

**Fact-Checker Ranks**

| Rank | Points Required | Flag Weight | Max Penalty |
|---|---|---|---|
| 🎓 Apprentice | 0 | 1.0× | −50 pts |
| 📊 Analyst | 600 | 1.5× | −100 pts |
| 🕵️ Investigator | 1,800 | 2.0× | −200 pts |
| 🛡️ Specialist | 5,000 | 2.5× | −300 pts |
| 👁️ Sentinel | 12,000 | 3.0× | −450 pts |
| ⚔️ Guardian | 25,000 | 3.5× | −600 pts |

---

### 🔐 Authentication & Roles

Three distinct roles with scoped privileges:

| Role | Capabilities |
|---|---|
| **User** | Create posts, comment, like, flag, track reputation |
| **Fact Checker** | All User capabilities + claim & verify posts in moderation queue |
| **Admin** | Full platform access |

Auth stack: **JWT (15m access / 7d refresh)** with device-level revocable sessions, **Google OAuth 2.0**, Bcrypt password hashing, and single-use password reset tokens.

---

### 💳 Region-Based Subscription Tiers

Pricing adapts per region using a `(plan, regionTier)` pricing matrix supporting **IN · SEA · GLOBAL · EU · JP · ME**. Stripe webhook idempotency is enforced via a `PaymentEvent` deduplication table, ensuring no double-charges on network retries.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       Next.js Client                         │
│          (App Router · React 19 · Tailwind CSS v4)           │
└──────────────────────┬──────────────────────────────────────┘
                       │  REST
         ┌─────────────┼─────────────┬──────────────┐
         │             │             │              │
   ┌─────▼──────┐ ┌────▼──────┐ ┌───▼────────┐ ┌──▼───────────┐
   │user-service│ │post-      │ │points-     │ │payment-      │
   │   :3001    │ │service    │ │service     │ │service       │
   │            │ │  :3002    │ │  :3004     │ │  :3005       │
   │ identity   │ │  posts    │ │  points    │ │  payments    │
   │  schema    │ │  schema   │ │  schema    │ │  schema      │
   └─────┬──────┘ └────┬──────┘ └───┬────────┘ └──┬───────────┘
         │             │             │              │
         └─────────────┴──────┬──────┴──────────────┘
                              │
                   ┌──────────▼──────────┐
                   │   Redis 7 Alpine     │
                   │  · Rate limiting     │
                   │  · Leaderboard cache │
                   │  · Achievement cache │
                   └─────────────────────┘
```

**Database-per-service isolation** — each service owns its schema and PostgreSQL credentials. Cross-service calls use an `X-Service-Token` shared secret on internal `/api/internal/*` routes, bypassing public rate limiters.

**Dependency flow:** `post-service` → `points-service` → `user-service` · `payment-service` → `user-service`

---

## 🛠️ Tech Stack

### Backend (shared across all services)

| Layer | Technology | Version |
|---|---|---|
| Runtime | Node.js (ESM) | LTS |
| Framework | Express | ^5.2 |
| Language | TypeScript | ^5.9 |
| ORM | Prisma + `@prisma/adapter-pg` | ^7.4 |
| Database | PostgreSQL | 16 |
| Cache | Redis + ioredis | 7 / ^5.10 |
| Auth | JWT + Passport (Google OAuth) | ^9.0 / ^0.7 |
| Validation | Zod | ^4.3 |
| Payments | Stripe SDK | ^18.5 |
| Email | Resend + Nodemailer | ^6.9 |
| Image Uploads | Cloudinary | ^2.9 |
| Logging | Winston | ^3.19 |
| Security | Helmet + express-rate-limit | ^8.1 |
| HTTP Client | Axios | ^1.13 |

### Frontend

| Technology | Version |
|---|---|
| Next.js | 16.1.6 |
| React | 19.2.3 |
| Tailwind CSS | v4 |
| Framer Motion | ^12.34 |
| Radix UI / shadcn | ^1.4 |
| React Hook Form + Zod | ^7.71 |
| Lucide React | ^0.563 |
| react-joyride (onboarding tours) | ^2.9 |

### Infrastructure

| Tool | Purpose |
|---|---|
| Docker + Compose | Containerisation & orchestration |
| Redis 7 Alpine | Rate limiting, caching, leaderboard |
| PostgreSQL 16 | Primary data store (isolated per service) |

---

## ⚠️ Engineering Challenges Solved

### ⚡ Concurrency & Race Conditions in Claim Logic

A claim could expire just as a new checker tried to claim the same post, causing a unique constraint violation.

**Solution:** Expiration is evaluated **at query time** (`WHERE expiresAt > NOW()`), not by polling DB status. Combined with upsert-based re-claims, the race window was closed at the database level — making stale records implicitly invisible the millisecond they expire.

---

### 🔗 Cross-Service Referential Integrity

Deleting a post in `post-service` would orphan ledger entries in `points-service`, ruining the audit log.

**Solution:** Soft deletion via `deletedAt` timestamp. Posts vanish from feeds (`WHERE deletedAt IS NULL`) but remain in the database to preserve referential integrity and moderation audit trail.

---

### 🧩 Decomposing a Monolith

The original `social-service` monolith was decomposed into four bounded-context services, exposing hidden coupling chains:

```
Post → Points → User
```

This revealed the importance of designing services around **failure domains** and **operational boundaries**, not just resource types. If `user-service` spikes in latency, it could cascade back to `post-service` — making resilient fallbacks a necessity, not an afterthought.

---

### 🔁 Async Fire-and-Forget Side Effects

Post creation returns `HTTP 201` immediately. Points awarding, hot-score recalculation, moderation queue insertion, and daily activity tracking run as **un-awaited background promises** — keeping the user experience fast while accepting eventual consistency as a deliberate architectural trade-off.

---

## 🚀 Running the Project

### Prerequisites

- Docker & Docker Compose
- Node.js LTS (for local frontend development)

### 1. Clone the repository

```bash
git clone https://github.com/Grizzy100/Anivartee.git
cd Anivartee
```

### 2. Configure environment variables

Each service has a `.env.example`. Copy and populate before starting:

```bash
cp server/user-service/.env.example    server/user-service/.env
cp server/post-service/.env.example    server/post-service/.env
cp server/points-service/.env.example  server/points-service/.env
cp server/payment-service/.env.example server/payment-service/.env
```

Key variables to set: `DATABASE_URL`, `JWT_SECRET`, `INTERNAL_SERVICE_TOKEN`, `STRIPE_SECRET_KEY`, `RESEND_API_KEY`, `CLOUDINARY_*`, `GOOGLE_CLIENT_ID/SECRET`.

### 3. Start all backend services

```bash
docker-compose up -d
```

This starts Redis, all four backend microservices, and mounts `src/` for hot-reload in development.

| Service | URL |
|---|---|
| user-service | http://localhost:3001 |
| post-service | http://localhost:3002 |
| points-service | http://localhost:3004 |
| payment-service | http://localhost:3005 |

### 4. Start the frontend

```bash
cd client
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 🔮 Roadmap

| Area | Planned Improvement |
|---|---|
| 📡 **Event-Driven Arch** | Replace synchronous inter-service REST calls with RabbitMQ/Kafka using the Outbox Pattern |
| ⚡ **Advanced Caching** | Hot-score feed cache, moderation queue cache, full leaderboard Redis pipeline |
| 🌐 **API Gateway** | Centralised auth, routing, and rate limiting layer |
| 🛑 **Circuit Breakers** | Prevent cascading failures across service boundaries |
| 📊 **Observability** | OpenTelemetry tracing + Prometheus metrics + centralised log aggregation |
| 🔥 **Streaks Engine** | Complete the `streakUpdate.job.ts` scaffold |
| 🔒 **Admin Panel** | Build out the scaffolded admin dashboard |

---

## 🧠 Engineering Takeaway

> Building Anivartee changed how I think about system design.
>
> I stopped thinking in terms of **controllers → endpoints**, and started thinking in terms of **system boundaries → failure domains → operational resilience → domain invariants**.
>
> A strong architecture is defined not by the tools it uses —
> but by **how gracefully it handles failure, scale, and change**.

---

<div align="center">

Made with ❤️ by [Grizzy100](https://github.com/Grizzy100)

⭐ If you found this interesting, consider starring the repo!

</div>
