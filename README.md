🧠 Anivartee
<div align="center">
🌐 A Social Platform Where Truth Competes for Visibility

Anivartee is a community-driven ecosystem combining social media mechanics with crowd-sourced fact-checking.

Instead of moderation being hidden behind opaque algorithms or centralized authorities, Anivartee transforms truth verification into a collaborative system driven by reputation, incentives, and transparency.

</div>
🎯 Platform Vision

Modern social platforms reward virality, not truth.

Anivartee aims to change that by creating a system where:

✔ Content visibility depends on verification
✔ Users gain reputation through accuracy
✔ Fact-checking becomes gamified community governance
✔ Moderation becomes transparent and distributed

Users progress through reputation ranks, unlocking higher moderation privileges and system capabilities.

📸 Platform Screenshots

Below are key interfaces of the platform.

🌐 Landing Page
![Landing Page](https://raw.githubusercontent.com/Grizzy100/Anivartee/main/client/public/photos/Landing%20Page.png)


🆕 Signup Page

Users can create accounts and choose their role in the platform.

![Signup](https://raw.githubusercontent.com/Grizzy100/Anivartee/main/client/public/photos/SignUp.png)


🔐 Login Page

Secure login interface for returning users.

![Login](https://raw.githubusercontent.com/Grizzy100/Anivartee/main/client/public/photos/SignIn.png)


🧑‍💻 User Dashboard

Main platform interface where users interact with content.

![User Dashboard](https://raw.githubusercontent.com/Grizzy100/Anivartee/main/client/public/photos/User%20Dashboard.png)

Users can:

✔ create posts
✔ participate in discussions
✔ view moderation outcomes
✔ track reputation points


🔎 Fact-Checker Moderation Queue

The moderation queue enables fact-checkers to claim and verify posts.

![Fact Checker Moderation Queue](https://raw.githubusercontent.com/Grizzy100/Anivartee/main/client/public/photos/Fact%20moderation.png)
💎 Subscription Plans

Subscription tiers unlock additional analytics and creator features.

![India Subscription](https://raw.githubusercontent.com/Grizzy100/Anivartee/main/client/public/photos/Screenshot%202026-03-07%20111141.png)

![Netherlands Subscription](https://raw.githubusercontent.com/Grizzy100/Anivartee/main/client/public/photos/Screenshot%202026-03-07%20112324.png)

![Singapore Subscription](https://raw.githubusercontent.com/Grizzy100/Anivartee/main/client/public/photos/Screenshot%202026-03-07%20112334.png)

![USA Subscription](https://raw.githubusercontent.com/Grizzy100/Anivartee/main/client/public/photos/Screenshot%202026-03-07%20112348.png)


🛠 Tech Stack
🧩 Backend

Node.js

Express

TypeScript

Prisma ORM

🗄 Database

PostgreSQL

Database-per-service isolation:

identity-service
posts-service
points-service
payment-service

Each service maintains its own schema and domain boundaries, forming a true microservice architecture.

💻 Frontend

Next.js

React

Tailwind CSS

⚙ Infrastructure

Docker

Docker Compose

Redis (caching + performance layer)

Redis powers:

⚡ session caching
⚡ feed ranking acceleration
⚡ reputation leaderboard caching
⚡ subscription lookup caching

🧱 System Architecture

The backend follows a database-per-service microservice architecture.

User Service
     │
Post Service
     │
Points Service
     │
Payment Service

Each service operates within its bounded context and communicates via REST APIs, preparing the system for future event-driven communication.

⭐ Core Features
🧩 Unified Social + Moderation Ecosystem

Anivartee merges content creation and moderation into a single ecosystem.

Users do not simply consume content — they govern the truthfulness of the platform.

This creates a self-regulating verification layer powered by community reputation.

🛡 Moderation Queue & Claim System

When content requires verification it enters a global moderation queue.

Fact-checkers can claim posts, preventing duplicate verification work.

Claim Workflow

1️⃣ Post enters moderation queue
2️⃣ Fact-checker claims the post
3️⃣ System locks claim for 30 minutes
4️⃣ Verification verdict submitted
5️⃣ Claim closes

If no verdict is submitted:

claimExpiry.job.ts

automatically releases the claim and returns the post to the queue.

🧾 Event-Sourced Reputation Engine

Instead of updating scores directly, Anivartee uses an event-sourced points engine.

Reputation Model
PointsLedger (immutable history)
       ↓
PointsBalance (materialized view)

Benefits:

✔ Complete auditability
✔ Tamper-proof reputation
✔ Fast O(1) score lookup

🔥 Dynamic Algorithmic Feed

The home feed uses a Reddit-style Hot Score algorithm.

Ranking factors:

👍 likes
👀 views
🕒 recency
🛡 moderation state

State transitions dynamically affect ranking:

PENDING → UNDER_REVIEW → VERIFIED
🔐 Authentication System

Users can register and authenticate using the built-in system.

Users can register as:

👤 User
🔎 Checker

Checkers gain fact-verification privileges within the moderation system.

⚠ Engineering Challenges
⚡ Concurrency & Race Conditions

Moderation claim logic introduced real-world concurrency problems.

Example scenario:

A claim expired but the cron job had not yet reaped it, leaving the record marked as active.

Another checker attempting to claim the post triggered unique constraint violations.

Solution

✔ expiration evaluated at query time
✔ database-level upsert locking

This eliminated race conditions during simultaneous claims.

🔗 Cross-Service State Synchronization

Deleting posts in post-service could break references inside points-service.

Solution: Soft Deletion
deletedAt timestamp

Posts disappear from feeds while maintaining ledger integrity.

🧩 Breaking the Monolith

The original monolith (social-service) was decomposed into:

user-service
post-service
points-service
payment-service

This revealed hidden coupling chains:

Post → Points → User

The experience reinforced designing services based on:

failure domains

operational boundaries

domain ownership

🚀 Future Improvements
📡 Event-Driven Architecture

Introduce:

RabbitMQ / Kafka

Using the Outbox Pattern to replace synchronous service calls.

⚡ Advanced Redis Caching

Future layers:

hot-score feed caching

moderation queue caching

reputation leaderboard caching

🌐 API Gateway

Centralized layer for:

authentication

routing

rate limiting

🛑 Circuit Breakers

Prevent cascading failures between services.

📊 Observability

Planned integration:

OpenTelemetry tracing

Prometheus metrics

centralized logging

🧪 Running the Project
Clone repository
git clone <repository-url>
cd Anivartee
Start infrastructure
docker-compose up -d
Install dependencies

Start each service individually.

🧠 Engineering Takeaway

Designing Anivartee changed how I think about system design.

I stopped thinking in terms of:

controllers → endpoints

and started thinking in terms of:

🧱 system boundaries
🔁 eventual consistency
⚙ operational resilience
🔒 domain invariants

A strong architecture is defined not by the tools it uses —
but by how gracefully it handles failure, scale, and change.
