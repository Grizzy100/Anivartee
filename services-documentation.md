# Backend Services Architecture: Deep Dive (Interview Focus)

This document provides an in-depth, interview-ready analysis of the `Anivartee` backend microservices architecture. It highlights system design choices, data modeling, concurrency handling, and inter-service communication patterns.

## 1. High-Level Architecture & Communication

The backend follows a **layered microservices architecture** relying on synchronous HTTP communication (via Axios) for internal requests. 
- **API Gateways:** All services expose public-facing routes under `/api` and internal service-to-service routes under `/api/internal`.
- **Database:** Each service maintains its own isolated PostgreSQL schema using Prisma ORM (Database-per-service pattern logical isolation: `identity`, `points`, `posts`).
- **Dependency Flow:** Downstream dependencies flow strictly in one direction to prevent circular dependencies: `post-service` -> `points-service` -> `user-service`.

---

## 2. Service Deep Dives

### A. User Service (Identity & Auth)
**Role:** Central authority for Authentication, Authorization, and User Identity.

**Key Technical Implementations:**
- **Authentication Strategy:** Utilizes JWT (JSON Web Tokens) for stateless authentication combined with `Passport.js` for OAuth (Google). 
  - *Interview Note:* It drops traditional stateful `passport.session()` in favor of custom JWT handling for better horizontal scaling.
- **Session Management:** Stores Refresh Tokens as hashed values (`refreshTokenHash`) in a dedicated `Session` table. This allows the system to revoke specific devices/sessions instantly while keeping short-lived access tokens stateless.
- **Data Modeling:** 
  - Schema: `identity`
  - Uses a Single Table Inheritance-like split: A core `User` table linked to polymorphic-like 1-to-1 profile tables (`UserProfile`, `FactCheckerProfile`, `AdminProfile`).
  - Roles (`USER`, `FACT_CHECKER`, `ADMIN`) are enforced at the database enum level and are treated as immutable after creation.
- **Security:** Implements rigorous input sanitization, strict Helmet CSP headers, and structured rate-limiting.

### B. Points Service (Economy & Reputation)
**Role:** Manages the platform's gamification, managing user balances, ranks, and leaderboard.

**Key Technical Implementations:**
- **Event Sourcing / CQRS Lite Pattern:** 
  - All point additions/deductions are appended to an **immutable `PointsLedger`** table. This serves as the system's source of truth and audit log.
  - A **materialized `PointsBalance`** table represents the aggregated current state to allow for `O(1)` balance lookups without summing the ledger on every read.
- **Dynamic Rank Computation:** Ranks (e.g., Novice, Apprentice) and their associated rate limits are calculated dynamically based on the user's role (retrieved via sync call to `user-service`) and their current point balance.
- **Caching:** The leaderboard endpoint uses an **In-Memory TTL Cache** (60 seconds) to protect the database from heavy `ORDER BY points DESC` queries on public traffic spikes.

### C. Post Service (Social Engine & Moderation)
**Role:** Handles all content lifecycle, user interactions, and moderation workflows.

**Key Technical Implementations:**
- **Asynchronous Workloads:** Critical paths (like post creation) return the HTTP response immediately to the client while deferring heavy operations (Awarding points, adding to moderation queues, recalculating "Hot Scores", recording daily activity) to un-awaited Background Promises. 
  - *Interview Note:* While fast, this lacks transactional guarantees across services (no distributed transactions/Saga pattern implemented yet). If the `points-service` is down, the points operation silently fails but the post is created.
- **Moderation Queue Management:**
  - Implements a claim-based worker queue (`ModerationQueue` & `ClaimRecord`). 
  - Fact-checkers claim posts to review. A Node.js `setInterval` background job (`claimExpiry.job.ts`) runs every 60 seconds to find claims older than 30 minutes and transitions them back to the `PENDING` queue. 
- **Soft Deletes:** `Link` deletions utilize a soft-delete (`deletedAt`) pattern to maintain referential integrity for historical points ledgers and moderation trails.
- **Hot Score algorithm:** Dedicated logic to calculate a Reddit-style "hot score" based on initial likes, views, and recency, automatically triggering a recalculation on state changes (e.g., status updates).

### D. Social Service (Deprecated/Migration State)
- Appears to be an older, monolith-style "social" module that has since been extracted and migrated into the robust `post-service`. It currently lacks an entry point in `docker-compose`, signaling the architecture's evolution towards more specialized bounded contexts.

---

## 3. Notable Interview Discussion Points

**Strengths:**
1. **Schema Isolation:** Prisma schemas are properly isolated, reducing coupling.
2. **Ledger Pattern:** Excellent choice for financial/point systems guaranteeing auditability.
3. **Optimized Read Paths:** Materialized balances and TTL leaderboards show strong read-heavy optimization.

**Potential System Design Trade-offs & Bottlenecks (For Discussion):**
1. **Distributed Transactions:** Moving async point awards to a message broker (RabbitMQ/Kafka) using the **Outbox Pattern** would resolve current race conditions and dropped requests if inner-services go down.
2. **Synchronous Service Coupling:** Deep dependency chains (`Post` -> `Points` -> `User` for a single request) can cause high latency and cascading failures. Introducing a caching layer (Redis) or JWT-embedded roles/limits could cut down internal HTTP traffic.
