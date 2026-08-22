# 🌿 SkillBridge — Intelligent Skill Development & Mentorship Platform

> **SkillBridge** is a full-stack technical mentorship platform designed to transform mentor booking from a generic catalog search into a **structured learning goal roadmap** paired with an **explainable 6-factor recommendation engine** and a **transactional anti-double-booking engine**.

---

## 🌟 Key Technical Features

- 🔐 **Authentication & RBAC**: HTTP-only secure JWT sessions (`sb_session`), bcrypt password hashing, and role-based authorization for **Learner**, **Mentor**, and **Admin** roles.
- 🎯 **Milestone-Based Skill Progress**: Skill-specific milestone roadmaps (Next.js App Router, System Design, Python, React, AWS, Docker). Progress percentage is dynamically derived ($\frac{\text{completed}}{\text{total}} \times 100$) and goals auto-complete at 100%.
- 📅 **Dynamic 45-Minute Slot Generator**: Bookable slots are derived dynamically from recurring weekly availability windows (`MentorAvailability`) + existing non-cancelled sessions. Past slots are automatically excluded.
- 🔒 **Transactional Anti-Double-Booking Protection**: Session reservation requests run inside a **Prisma database transaction** evaluating overlap conditions (`scheduledStart < reqEnd AND scheduledEnd > reqStart`). Concurrent overlaps trigger HTTP 409 Conflict rejection.
- 🤖 **Explainable Multi-Factor Recommendation Engine**: Computes a deterministic 6-factor match score (45% - 99%) with complete mathematical breakdown and human-readable explanation bullets.
- 🔔 **In-App Notifications**: Real-time header notification bell displaying animated unread badge counter, drawer panel, and 1-click read status management.
- ⭐ **Verified Session Reviews**: Review submission requires strict backend ownership authorization (`session.learnerId === currentUserId`) and completion verification (`session.status === "COMPLETED"`). Mentor overall rating & review counts are recalculated inside a transaction upon review creation.

---

## 🏗️ System Architecture

```text
                               SkillBridge System
                                       │
            ┌──────────────────────────┼──────────────────────────┐
            │                          │                          │
         LEARNER                     MENTOR                     ADMIN
            │                          │                          │
       Skill Goals               Availability               Verification
            │                          │                          │
            └────────────┬─────────────┘                          │
                         │                                        │
                         ▼                                        │
             Recommendation Engine                                │
             ┌─────────────────────────┐                          │
             │ Skill Match       50%   │                          │
             │ Proficiency Gap   15%   │                          │
             │ Experience        10%   │                          │
             │ Rating            10%   │                          │
             │ Availability      10%   │                          │
             │ History            5%   │                          │
             └────────────┬────────────┘                          │
                          │                                       │
                          ▼                                       │
                   Match Breakdown                                │
                          │                                       │
                          ▼                                       │
                   Booking Engine ◄───────────────────────────────┘
                          │
                          ▼
                  Prisma Transaction
             (Overlap & Capacity Check)
                          │
                          ▼
                  Mentorship Session
                          │
             ┌────────────┴────────────┐
             ▼                         ▼
       Notifications               Completion
                                       │
                                       ▼
                                 Verified Review
                                       │
                                       ▼
                             Rating Feedback Loop
```

---

## 🧠 Explainable Recommendation Engine Breakdown

| Weight | Factor | Calculation Description |
| :--- | :--- | :--- |
| **50%** | **Skill Match Taxonomy** | Aligns learner active goals (`LearnerSkillGoal`) against mentor teaching skills. Boosts score for matching skills where mentor is `EXPERT` and `VERIFIED`. |
| **15%** | **Proficiency Depth** | Evaluates mentor proficiency level vs learner target level (`BEGINNER`=1, `INTERMEDIATE`=2, `EXPERT`=3). |
| **10%** | **Industry Experience** | Normalized experience using $\min(\frac{\text{years}}{10}, 1.0) \times 100$. |
| **10%** | **Review Rating** | Derived from average rating across verified reviews ($\frac{\text{rating}}{5.0} \times 100$). |
| **10%** | **Bookable Availability** | Checks if mentor has active 45-minute bookable slots available this week. |
| **5%** | **Mentorship History** | Evaluates prior completed sessions between learner & mentor (50 neutral baseline for new connections, 75 for 1 session, 100 for 2+ sessions). |

---

## 🔑 Seed Test Credentials

Run `npm run db:seed` to populate authentic fictional tech mentors and test credentials:

| Role | Email | Password | Access Path |
| :--- | :--- | :--- | :--- |
| **Learner Account** | `learner@skillbridge.dev` | `password123` | `/dashboard/learner` |
| **Mentor Account** | `mentor@skillbridge.dev` | `password123` | `/dashboard/mentor` |
| **Admin Account** | `admin@skillbridge.dev` | `password123` | `/dashboard/admin` |

---

## ⚡ Quick Start Guide

```bash
# 1. Install dependencies
npm install

# 2. Synchronize Prisma SQLite database
npm run db:push

# 3. Seed test credentials and verified mentors
npm run db:seed

# 4. Run automated system test suite
npm test

# 5. Start Next.js development server
npm run dev
```

Visit `http://localhost:3000` in your browser.

---

## 🛡️ Production & Security Considerations

- **Database Concurrency**: SQLite with Prisma transactions is used for lightweight local demo/portfolio deployment. For production-scale concurrent workloads, Prisma provides a zero-code migration path to PostgreSQL (`provider = "postgresql"`).
- **Session Security**: JWT tokens are signed via HMAC SHA-256 and stored in `HTTP-Only`, `SameSite=Lax`, `Secure` cookies (`sb_session`) to prevent XSS attacks.
- **Backend Authorization**: All mutation endpoints (`/api/skills/goals`, `/api/sessions/[id]`, `/api/reviews`, `/api/notifications`) enforce strict server-side resource ownership checks (`resource.userId === currentUser.id`).
