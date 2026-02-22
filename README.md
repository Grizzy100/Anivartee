# Anivartee

Anivartee is a community-driven ecosystem that merges social media mechanics with rigorous, crowd-sourced fact-checking. Designed as a distributed microservice architecture, it aims to solve the problem of viral misinformation by intrinsically tying content visibility to truth verification and user reputation.

Unlike traditional social platforms where moderation is an afterthought or handled by opaque central authorities, Anivartee makes fact-checking a core, gamified gameplay loop. Users earn reputation through accurate reporting and verification, advancing through ranks that grant them higher moderation privileges and system limits.

Building Anivartee was my transition into designing complex, distributed backend architectures. It forced me to move beyond simple CRUD applications and think deeply about service boundaries, eventual consistency, race conditions, and event-sourced state management.

## Tech Stack

### Backend
- **Node.js & Express**
- **TypeScript**
- **Prisma ORM**

### Database
- **PostgreSQL** (Database-per-service logical isolation: `identity`, `points`, `posts`)

### Frontend
- **Next.js & React**
- **Tailwind CSS**

### DevOps & Infrastructure
- **Docker** & **Docker Compose** for containerization and local orchestration

The backend follows a **database-per-service microservices pattern**. The architecture is decoupled into `user-service`, `post-service`, and `points-service`. Each service manages its own bounded context and isolated database schema, currently communicating via synchronous REST APIs, laying the groundwork for future asynchronous message-driven evolution.

---

## Core Features

### 1. Unified Social & Moderation Ecosystem
Anivartee consolidates content discovery and content moderation into a single cohesive platform. The objective was to eliminate the friction between "consuming" and "governing" content, turning the user base into a self-regulating immune system for the platform.

### 2. Intelligent Moderation Queue & Claim State Machine
When content is flagged or requires review, it enters a global moderation queue. To prevent duplicate work and race conditions, the system uses a strict **Claim-Based Workflow**:
- Fact-checkers actively "claim" a post, locking it exclusively to them for a 30-minute window.
- If no verdict is submitted before the timer expires, a specialized background worker (`claimExpiry.job.ts`) automatically reaps the expired claim and returns the post to the general pool.
- The system enforces strict invariant checks: fact-checkers cannot claim their own posts (conflict of interest), and claims disappear the exact millisecond they expire, preventing race conditions.

### 3. Event-Sourced Reputation Engine 
Instead of simply updating a user's score in a database column, the `points-service` utilizes an **Event Sourcing / CQRS-lite pattern**:
- Every point addition or deduction is appended as an immutable event to a `PointsLedger`. This guarantees flawless auditability for the platform's economy.
- To prevent calculating sums across thousands of rows on every read, the system maintains a synchronous materialized view (`PointsBalance`), allowing for `O(1)` score lookups.

### 4. Dynamic Algorithmic Feed
The home feed requires sophisticated ranking to surface content that is both new and highly engaged. Anivartee implements a Reddit-style "Hot Score" algorithm that balances initial likes, views, and recency. The score dynamically recalculates based on interactions and state changes (e.g., when a post transitions from `PENDING` to `UNDER_REVIEW`).

---

## Architectural Challenges & Learnings

Building Anivartee introduced several real-world engineering hurdles that tested my understanding of distributed systems.

### Concurrency and Distributed Race Conditions
Handling the moderation claim flow exposed the harsh realities of concurrent requests. Initially, if a claim expired but the 60-second cron job hadn't reaped it yet, the database still marked it as "Active". If another fact-checker tried to claim it, the database threw unique constraint violations.

I had to redesign the queries to evaluate `expiresAt` timestamps strictly at query time, effectively creating a system where records become implicitly "invisible" the moment they expire, bridging the gap between database state and real-time execution. Furthermore, replacing simple `create` operations with database-level `upsert` locks completely eliminated unique constraint violations during high-concurrency re-claims.

### Cross-Service State Synchronization
Because each service has an isolated database, maintaining referential integrity is complex.
If a post is deleted in the `post-service`, wiping it completely would orphan the points associated with it in the `points-service` ledger, ruining the financial audit log.

To solve this, I implemented strict **Soft Deletion (`deletedAt`)** patterns. This ensures that while a post vanishes from the user's feed, its UUID and history remain intact, allowing the `points-service` to maintain a globally consistent state.

### Breaking the Monolith
During development, I extracted an older monolith-style `social-service` into bounded contexts (`post-service` and `points-service`).
This extraction forced me to map out deep dependency chains (`Post -> Points -> User`). It highlighted the dangers of synchronous service coupling: if the `user-service` experiences a latency spike, it cascades back to the `post-service`.

This experience taught me to identify boundaries not just by data models, but by failure domains and operational lifecycles.

### The True Meaning of Microservices
Designing Anivartee fundamentally reshaped my engineering approach. I stopped thinking in terms of mere "endpoints and controllers" and started thinking in terms of **system boundaries, eventual consistency, operational resilience, and domain invariants.**

I learned that strong architectures are not defined by the tools they use, but by how cleanly they handle failure, edge cases, and changing business requirements.

---

## Future Improvements

Anivartee is actively evolving. To push it toward production-grade maturity, the following architectural upgrades are planned:

- **Message Broker (RabbitMQ/Kafka):** Implementing the **Outbox Pattern** to replace synchronous internal HTTP calls with asynchronous events, ensuring zero data loss if a downstream service goes offline.
- **Redis Caching Strategy:** Caching user ranks, rate limits, and hot-score leaderboards to protect the databases from read-heavy traffic spikes.
- **API Gateway:** Centralizing authentication token validation, rate-limiting, and request routing.
- **Circuit Breakers:** Preventing cascading failures across the synchronous service chain.
- **Observability:** Centralized logging, distributed tracing (OpenTelemetry), and Prometheus metrics to monitor system health.

---

## Running the Project

Ensure you have Docker and Node.js installed.

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd Anivartee
   ```
2. Start the infrastructure (Databases):
   ```bash
   docker-compose up -d
   ```
3. Install dependencies and start the services.
