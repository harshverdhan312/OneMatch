💞

**OneMatch**

*Intentional Dating, One Match at a Time*

Product Requirements • System Design • Tech Stack

Version 1.0 \| March 18, 2026

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)

2. [Product Overview & Vision](#2-product-overview--vision)

3. [User Journey & App Flow](#3-user-journey--app-flow)

4. [Functional Requirements](#4-functional-requirements)

5. [Non-Functional Requirements](#5-non-functional-requirements)

6. [System Design & Architecture](#6-system-design--architecture)

7. [Database Design](#7-database-design)

8. [Matching Algorithm](#8-matching-algorithm)

9. [API Design](#9-api-design)

10. [Tech Stack](#10-tech-stack)

11. [Security & Privacy](#11-security--privacy)

12. [UI/UX Design System](#12-uiux-design-system)

13. [Milestones & Roadmap](#13-milestones--roadmap)


---

## 1. Executive Summary

OneMatch is an intentional dating app built on the philosophy that fewer, better matches lead to more meaningful relationships. Rather than presenting users with an endless swipe feed, OneMatch surfaces exactly one curated match at a time — chosen based on shared interests and partner preferences. Both people must mutually accept the match before any conversation begins. After a defined chat window, users explicitly decide whether to continue or move on.

*This document covers the full product requirements, user flows, system architecture, database design, and the technology stack required to build and scale OneMatch.*


---

## 2. Product Overview & Vision

### 2.1 Core Philosophy

Most dating apps are optimized for engagement, not relationships. Infinite scrolling and large match pools create a paradox of choice, leading to decision fatigue and shallow connections. OneMatch solves this by enforcing scarcity with intention — one match, full attention.

### 2.2 Key Differentiators


**Feature**        | **OneMatch Approach**

Match Volume       | One active match at a time — no queue, no distractions
Match Trigger      | Mutual acceptance required before chat unlocks
Chat Window        | 24-hour initial chat, then explicit continuation check-in
Long-term Check-in | 1-week follow-up to assess continued interest
Rejection Handling | Rejection triggers the next match cycle, never shows who rejected
Algorithm          | Interest overlap + partner preference compatibility score


---

## 3. User Journey & App Flow

### 3.1 Complete Flow Diagram (Text)


**STAGE 1 — Sign Up**

- Enter email / phone number
- OTP verification
- Set password and accept Terms & Privacy Policy


**STAGE 2 — Profiling**

- Basic details: name, age, gender, location, occupation
- Upload 3–6 photos (first photo is primary)
- Select interests from a curated tag library (min 5, max 20)
- Answer partner preference questions (age range, values, lifestyle, deal-breakers)
- Answer personality / icebreaker questions (optional, shown on profile)


**STAGE 3 — Matching Engine**

- System computes compatibility score against eligible users
- Highest-scored mutual candidate is selected as the match
- Both users independently see each other's full profile
- Each user makes a private Accept / Decline decision (no time pressure, but 48hr expiry)


**STAGE 4 — Mutual Acceptance & Chat**

- If BOTH accept → chat is unlocked immediately
- If EITHER declines → neither user is notified of who declined
- Declined user moves on; new match cycle begins for both
- Chat window: 24 hours (extendable if both are actively messaging)


**STAGE 5 — 24-Hour Check-in**

- After 24 hours of chat, system prompts both users: 'Still interested?'
- BOTH say Yes → chat continues for 1 week
- EITHER says No → conversation ends gracefully; next match cycle begins


**STAGE 6 — 1-Week Check-in**

- After 1 week, system prompts again: 'Do you want to keep talking?'
- BOTH say Yes → chat continues indefinitely; no further prompts
- EITHER says No → conversation ends; next match cycle begins for both

### 3.2 State Machine Summary

|                    |                            |                        |
|--------------------|----------------------------|------------------------|
| **Current State**  | **Event**                  | **Next State**         |
| Profiling Complete | System finds match         | Pending Review         |
| Pending Review     | Both Accept                | Chat Unlocked          |
| Pending Review     | Either Declines            | New Match Cycle        |
| Chat Unlocked      | 24hr Check-in: Both Yes    | Extended Chat (1 Week) |
| Chat Unlocked      | 24hr Check-in: Either No   | New Match Cycle        |
| Extended Chat      | 1-Week Check-in: Both Yes  | Open Chat              |
| Extended Chat      | 1-Week Check-in: Either No | New Match Cycle        |
| Open Chat          | —                          | Ongoing Relationship   |


---

## 4. Functional Requirements

### 4.1 Authentication & Account

- Email/phone sign-up with OTP verification

- Social login: Google, Apple

- JWT-based session with refresh tokens

- Account deactivation and permanent deletion (GDPR-compliant)

- Age gate: must be 18+, verified against DOB

### 4.2 User Profile

- Required fields: name, DOB, gender, city, profile photos (min 3)

- Interest tags: selected from a master taxonomy (e.g., Travel, Fitness, Books, Music)

- Partner preferences: age range, gender, distance radius, deal-breakers

- Personality questions: up to 5 open-ended prompts with text answers

- Profile completeness score shown to user (nudges completion)

- Edit profile at any time; re-matching triggers after significant edits

### 4.3 Matching

- Only one active match per user at any time

- Match algorithm runs nightly (or on-demand when user enters match pool)

- Match card shows: photos, bio, interest overlap highlights, icebreaker answers

- Both parties see the match card simultaneously

- Accept / Decline actions are private; no read receipts on decisions

- 48-hour decision window; if expired, match is released and new cycle starts

- Users cannot see who previously declined them

### 4.4 Chat

- Real-time messaging via WebSocket

- Supported message types: text, emoji, photos, voice notes (v2), GIFs

- Chat history persists for 30 days after conversation ends

- Report & block functionality available at all times

- Read receipts and typing indicators

- System messages for check-in prompts are rendered inline in chat

### 4.5 Check-in & Decision Flow

- 24-hour check-in: system notification + in-app modal

- Decision is private; if one declines, conversation ends with a gentle system message

- 1-week check-in follows same mechanic

- After Open Chat status, no further system-triggered prompts

### 4.6 Notifications

- Push notifications: new match, match accepted, new message, check-in reminder

- Email notifications for critical events (match expired, account security)

- In-app notification center

- Notification preferences configurable per type

### 4.7 Safety & Moderation

- Photo moderation via AI (nudity, face detection) before profile goes live

- User reporting with category selection (inappropriate, harassment, fake profile)

- Block user: removes from potential match pool permanently

- Admin dashboard for reviewing flagged content

- ID verification badge (optional, v2)


---

## 5. Non-Functional Requirements

|              |                            |                              |
|--------------|----------------------------|------------------------------|
| **Category** | **Requirement**            | **Target**                   |
| Performance  | API response time (p95)    | \< 300ms                     |
| Performance  | Match computation time     | \< 5 seconds                 |
| Performance  | Real-time message delivery | \< 100ms                     |
| Availability | Uptime SLA                 | 99.9% (\< 9hr/year downtime) |
| Scalability  | Concurrent users (MVP)     | 10,000                       |
| Scalability  | Concurrent users (Year 2)  | 500,000                      |
| Storage      | Photo storage per user     | ~50 MB average               |
| Security     | Data encryption at rest    | AES-256                      |
| Security     | Data encryption in transit | TLS 1.3                      |
| Privacy      | GDPR / data deletion       | Within 30 days of request    |
| Compliance   | Age verification           | DOB + optional ID check      |
| Reliability  | Message delivery guarantee | At-least-once                |


---

## 6. System Design & Architecture

### 6.1 Architecture Pattern

OneMatch uses a Monolithic MVC architecture built on the MERN stack (MongoDB, Express.js, React.js, Node.js). All modules live in a single deployable Node.js/Express server, communicating internally via function calls. Socket.IO handles real-time events. Scheduled jobs run via node-cron. This approach is optimal for an MVP — simple to develop, deploy, and debug.

### 6.2 Application Modules


**Module (Express Router)** | **Responsibility**

Auth Module                 | Sign-up, login, OTP, JWT issuance and refresh
User & Profile Module       | CRUD for user profiles, photo uploads via Cloudinary, preferences, interests
Matching Module             | Compatibility scoring, match document creation, decision tracking
Chat Module                 | Socket.IO rooms, message persistence in MongoDB, read receipts
Notification Module         | Email via Nodemailer/SendGrid, in-app events via Socket.IO
Check-in Module             | node-cron scheduled jobs for 24hr and 1-week prompts, state transitions
Admin Module                | Content moderation, user flag management, basic analytics

### 6.3 High-Level Architecture Diagram (Textual)


**Client Layer (Browser)**

- React.js SPA — Vite bundler, React Router v6
- Tailwind CSS for styling, Zustand for state management


**Express.js Server (API Layer)**

- REST API + Socket.IO server on a single Node.js process
- JWT middleware, express-rate-limit, helmet.js for security headers
- Multer for file uploads stored to Cloudinary


**Express Modules (MVC Controllers + Services)**

- Auth \| Profile \| Matching \| Chat (Socket.IO)
- Check-in (node-cron) \| Notifications \| Admin


**Data Layer**

- MongoDB Atlas — all collections: users, profiles, matches, messages, check-ins
- Redis — JWT session blocklist, rate limiting, Socket.IO presence cache
- Cloudinary — photo storage, CDN delivery, and on-the-fly image transforms


**Scheduled Jobs (node-cron)**

- Match computation cron — runs every 2 hours
- Check-in trigger cron — fires 24hr and 1-week timers after chat unlock
- Expired match cleanup — releases stale pending matches every hour


---

## 7. Database Design

### 7.1 MongoDB Collections & Schemas

**Collection: users**

|              |                          |                                     |
|--------------|--------------------------|-------------------------------------|
| **Column**   | **Type**                 | **Notes**                           |
| \_id         | ObjectId                 | Auto-generated primary key          |
| email        | String (unique, indexed) | Required                            |
| phone        | String (unique)          | Optional                            |
| passwordHash | String                   | bcrypt hashed                       |
| status       | String (enum)            | active \| suspended \| deleted      |
| createdAt    | Date                     | Auto-managed by Mongoose timestamps |
| lastActiveAt | Date                     | Updated on login and activity       |

**Collection: profiles**

|                    |                      |                                                             |
|--------------------|----------------------|-------------------------------------------------------------|
| **Column**         | **Type**             | **Notes**                                                   |
| \_id               | ObjectId             | Auto-generated                                              |
| userId             | ObjectId (ref: User) | One-to-one with users collection                            |
| name               | String               | Required, max 100 chars                                     |
| dateOfBirth        | Date                 | Age computed dynamically                                    |
| gender             | String               | Self-described                                              |
| city               | String               |                                                             |
| location           | GeoJSON Point        | { type: Point, coordinates: \[lng, lat\] } — 2dsphere index |
| bio                | String               | Max 500 chars                                               |
| photos             | \[String\]           | Array of Cloudinary URLs, max 6                             |
| interests          | \[ObjectId\]         | Refs to interest_tags collection                            |
| partnerPreferences | Object (embedded)    | See below                                                   |
| questions          | \[Object\]           | \[{ prompt, answer }\] max 5                                |
| completenessScore  | Number               | 0–100, recomputed on save                                   |
| isVisible          | Boolean              | False if completenessScore \< 70                            |

**Collection: (embedded in profiles.interests\[\])**

|                                    |                        |                                     |
|------------------------------------|------------------------|-------------------------------------|
| **Column**                         | **Type**               | **Notes**                           |
| Embedded in profiles.interests\[\] | Array of ObjectId refs | References interest_tags collection |
| No separate collection needed      | MongoDB embedding      | Interests queried via populate()    |

**Collection: (embedded in profiles.partnerPreferences)**

|                                         |              |                                          |
|-----------------------------------------|--------------|------------------------------------------|
| **Column**                              | **Type**     | **Notes**                                |
| Embedded in profiles.partnerPreferences | Object       | No separate collection                   |
| minAge / maxAge                         | Number       | Integer years                            |
| genderPreference                        | \[String\]   | Array, multi-select                      |
| maxDistanceKm                           | Number       |                                          |
| dealBreakers                            | Object       | Key-value flags (e.g. { smoking: true }) |
| valuesTags                              | \[ObjectId\] | Refs to interest_tags                    |

**Collection: matches**

|                       |                      |                                                    |
|-----------------------|----------------------|----------------------------------------------------|
| **Column**            | **Type**             | **Notes**                                          |
| \_id                  | ObjectId             | Auto-generated                                     |
| userA                 | ObjectId (ref: User) | Sorted alphabetically by \_id string               |
| userB                 | ObjectId (ref: User) |                                                    |
| compatibilityScore    | Number               | 0.0 – 1.0                                          |
| status                | String (enum)        | pending \| accepted \| declined \| expired \| open |
| userADecision         | String (enum)        | null \| accept \| decline                          |
| userBDecision         | String (enum)        | null \| accept \| decline                          |
| decisionDeadline      | Date                 | createdAt + 48 hours                               |
| chatUnlockedAt        | Date                 | Set when both decisions are accept                 |
| createdAt / updatedAt | Date                 | Auto-managed by Mongoose timestamps                |

**Collection: checkIns**

|               |                       |                            |
|---------------|-----------------------|----------------------------|
| **Column**    | **Type**              | **Notes**                  |
| \_id          | ObjectId              | Auto-generated             |
| matchId       | ObjectId (ref: Match) |                            |
| type          | String (enum)         | 24hr \| 1_week             |
| userAResponse | String (enum)         | null \| yes \| no          |
| userBResponse | String (enum)         | null \| yes \| no          |
| outcome       | String (enum)         | pending \| continue \| end |
| triggeredAt   | Date                  |                            |
| resolvedAt    | Date                  |                            |

**Collection: messages**

|            |                       |                                     |
|------------|-----------------------|-------------------------------------|
| **Column** | **Type**              | **Notes**                           |
| \_id       | ObjectId              | Auto-generated                      |
| matchId    | ObjectId (ref: Match) | Indexed for fast chat fetch         |
| senderId   | ObjectId (ref: User)  |                                     |
| content    | String                | Text content                        |
| type       | String (enum)         | text \| image \| gif                |
| mediaUrl   | String                | Cloudinary URL for image messages   |
| readAt     | Date                  | Null if unread                      |
| createdAt  | Date                  | Auto-managed by Mongoose timestamps |


---

## 8. Matching Algorithm

### 8.1 Overview

The matching algorithm computes a compatibility score between two users as a weighted sum of several sub-scores. Only users who pass hard filters are scored; the top candidate is proposed as the match.

### 8.2 Hard Filters (Eligibility)

- Age is within both users' stated preferences

- Gender matches both users' stated preferences

- Distance is within both users' maximum radius

- Neither user has previously matched or interacted with the other

- Both users have profile completeness score ≥ 70

- No existing active match for either user

### 8.3 Scoring Components

|                           |            |                                                 |
|---------------------------|------------|-------------------------------------------------|
| **Component**             | **Weight** | **Method**                                      |
| Interest Overlap          | 40%        | Jaccard similarity on interest tag sets         |
| Preference Alignment      | 30%        | Bidirectional preference satisfaction score     |
| Personality Compatibility | 20%        | Cosine similarity on question answer embeddings |
| Activity Freshness        | 10%        | Recency of last_active_at, decays over time     |

### 8.4 Score Formula

> ```
score = 0.40 × interest_score
      + 0.30 × preference_score
      + 0.20 × personality_score
      + 0.10 × freshness_score
```

### 8.5 Match Execution

- Algorithm runs as a scheduled job (cron: every 2 hours) via node-cron

- Also triggered on-demand: when a user completes profiling or a match cycle ends

- Candidate pool uses MongoDB Atlas Search with 2dsphere geo index and interest tag filtering

- Top-1 candidate is written to the matches table with status: pending

- Push notifications sent to both users simultaneously


---

## 9. API Design

### 9.1 REST API Conventions

- Base URL: `https://api.onematch.app/v1`

- Authentication: Bearer token (JWT) in Authorization header

- All responses: { data, error, meta } envelope

- Pagination: cursor-based

- Rate limiting: 100 req/min per user, 1000 req/min per IP

### 9.2 Key Endpoints


**Endpoint**                    | **Description**

POST /auth/register             | Create account with email/phone + OTP
POST /auth/login                | Authenticate and receive JWT pair
POST /auth/refresh              | Refresh access token
GET /profile/me                 | Fetch current user's profile
PUT /profile/me                 | Update profile details
POST /profile/photos            | Upload a photo (multipart)
GET /match/current              | Fetch current active match card
POST /match/{id}/decide         | Submit accept or decline decision
GET /chat/{matchId}/messages    | Paginated message history
POST /chat/{matchId}/messages   | Send a message (fallback REST)
POST /checkin/{matchId}/respond | Submit yes/no check-in response
POST /users/{id}/report         | Report a user
POST /users/{id}/block          | Block a user

### 9.3 WebSocket Events


**Event**                  | **Direction & Purpose**

message:new                | Server → Client: new chat message
message:read               | Client → Server: mark messages read
typing:start / typing:stop | Bidirectional: typing indicator
match:decision_made        | Server → Client: mutual accept notification
checkin:prompt             | Server → Client: check-in modal trigger
presence:update            | Server → Client: online/offline status


---

## 10. Tech Stack

### 10.1 Frontend (React.js)


**Technology**        | **Purpose / Justification**

React.js 18           | Core UI library — component-based, hooks-driven
Vite                  | Build tool and dev server — fast HMR, optimised bundles
React Router v6       | Client-side routing, protected routes, nested layouts
Tailwind CSS          | Utility-first CSS — consistent design tokens, dark mode
Zustand               | Lightweight global state management (auth, match, chat state)
TanStack Query        | Server state caching, background refetching, optimistic updates
Socket.IO Client      | Real-time WebSocket connection for chat and live events
Framer Motion         | Smooth page transitions and profile card animations
React Hook Form + Zod | Form state management and schema validation

### 10.2 Backend


**Technology**                | **Purpose / Justification**

Node.js 20 LTS                | JavaScript runtime — async I/O, non-blocking
Express.js                    | Minimal web framework — routing, middleware, REST API
Socket.IO (Server)            | WebSocket management for real-time chat and presence
Mongoose                      | MongoDB ODM — schema definitions, validation, middleware hooks
JSON Web Token (jsonwebtoken) | Stateless auth — access token (15min) + refresh token (7 days)
Passport.js                   | Auth strategies: local, Google OAuth
Multer + Cloudinary SDK       | File upload handling and cloud image storage
node-cron                     | Scheduled jobs: match runs, check-in timers, cleanup
Nodemailer                    | Transactional email for OTP and notifications
express-rate-limit + helmet   | Rate limiting and HTTP security headers

### 10.3 Data Storage


**Technology**             | **Purpose / Justification**

MongoDB Atlas              | Primary database — all collections, flexible document schema, Atlas free tier for MVP
Mongoose ODM               | Schema definitions, validation, virtuals, pre/post hooks
Redis (Upstash or Railway) | JWT blocklist, rate-limit counters, Socket.IO adapter for scaling
Cloudinary                 | Photo storage, CDN delivery, on-the-fly resizing and optimisation
MongoDB Atlas Search       | Full-text and geo search for candidate filtering (replaces Elasticsearch)

### 10.4 Hosting & DevOps (No Docker)


**Technology** | **Purpose / Justification**

Render.com     | Node.js/Express server hosting — free tier for MVP, auto-deploy from GitHub
Vercel         | React.js frontend hosting — instant CDN, preview deployments on every PR
MongoDB Atlas  | Managed MongoDB — free M0 tier for MVP, scale to M10+ for production
GitHub Actions | CI/CD pipeline — lint, test, deploy to Render and Vercel on push to main
Upstash Redis  | Serverless Redis — free tier, pay-per-request, no server management
Sentry         | Error tracking for both frontend and backend
LogRocket      | Frontend session replay and performance monitoring

### 10.5 Third-Party Services


**Service**      | **Purpose**

SendGrid         | Transactional email — OTP, welcome, match notifications
Twilio / MSG91   | OTP SMS delivery (optional, email OTP is primary)
Cloudinary       | Photo storage, CDN, automatic format conversion and resizing
Google OAuth 2.0 | Social login — via Passport.js google-oauth20 strategy
Sightengine API  | Photo moderation — nudity and face detection on upload (free tier available)
Stripe           | Premium subscription billing (v2 feature)


---

## 11. Security & Privacy

### 11.1 Data Security

- All API traffic over TLS 1.3; HTTP Strict Transport Security enabled

- Passwords hashed with bcrypt (cost factor 12)

- JWTs signed with RS256; short-lived access tokens (15 min) + refresh tokens (30 days)

- Message content encrypted at rest using AES-256 at the MongoDB field level via mongoose-field-encryption

- Cloudinary assets served via signed URLs with 1-hour expiry; upload API key is server-side only, never exposed to client

- Database credentials stored in AWS Secrets Manager; rotated every 90 days

### 11.2 Privacy

- Exact location is never shared; only city/neighbourhood is shown to matches

- Decision data (who accepted/declined) is never exposed via API

- Users can download all their data (GDPR Article 20) within 72 hours

- Account deletion purges PII within 30 days; anonymised analytics data retained

- Privacy Policy and consent explicitly collected at sign-up

### 11.3 Application Security

- Input validation and sanitisation on all endpoints via express-validator and Zod

- NoSQL injection protection via Mongoose schema validation and sanitise-html on user inputs

- Rate limiting per user and IP at API Gateway

- OWASP Top-10 review before each major release

- Penetration testing scheduled quarterly (v2+)


---

## 12. UI/UX Design System

This section is the single source of truth for visual identity, screen layouts, and interaction patterns — structured for direct use in Stitch (UI generation) and GitHub Copilot (code generation).

### 12.1 Design Philosophy

OneMatch targets 18–28 year-olds who are tired of gamified swiping. The visual language should feel like a premium consumer app — think Notion meets Hinge. Clean, intentional, and warm. Every screen should communicate: this is serious, but not stiff.


**Principle**         | **What it means in practice**

Warmth over sterility | Soft gradients, rounded corners, human photography — no cold corporate blues
Focused attention     | One thing per screen — no cluttered feeds or multi-column layouts
Micro-delight         | Spring animations on cards, haptic feedback on decisions, confetti on match
Honest UI             | No dark patterns — check-ins feel like a gentle nudge, not a pressure notification
Accessibility first   | WCAG AA contrast minimum, 44px touch targets, system font size respected

### 12.2 Colour Palette

Built around a warm violet primary and a rose accent — energetic and romantic without being juvenile. All tokens are ready for Stitch prompts and Tailwind CSS config.

|                        |               |                                                        |
|------------------------|---------------|--------------------------------------------------------|
| **Token Name**         | **Hex Value** | **Usage**                                              |
| --color-primary        | #7C3AED      | CTAs, active states, key headings, progress bars       |
| --color-primary-light  | #EDE9FE      | Card backgrounds, tag chips, subtle highlights         |
| --color-primary-dark   | #5B21B6      | Pressed button state, dark mode primary                |
| --color-accent         | #F43F5E      | Accept button, heart icons, match-confirmed animations |
| --color-accent-light   | #FFE4E6      | Decline button bg, gentle warning states               |
| --color-accent-gold    | #F59E0B      | Premium badge, check-in prompt highlight border        |
| --color-bg-base        | #FAFAFA      | App background (light mode)                            |
| --color-bg-card        | #FFFFFF      | Profile cards, chat bubbles (own), modals              |
| --color-bg-surface     | #F4F4F5      | Input fields, secondary cards, bottom sheets           |
| --color-text-primary   | #18181B      | Body copy, names, main content                         |
| --color-text-secondary | #71717A      | Captions, timestamps, placeholder text                 |
| --color-text-muted     | #A1A1AA      | Disabled states, fine print                            |
| --color-border         | #E4E4E7      | Card borders, dividers, input outlines                 |
| --color-success        | #10B981      | Match confirmed banner, both-interested state          |
| --color-dark-bg        | #09090B      | Dark mode base background                              |
| --color-dark-card      | #18181B      | Dark mode card surface                                 |

**Signature Gradient — Violet Rose:**

```css
linear-gradient(135deg, #7C3AED 0%, #F43F5E 100%)
```

Use on: primary CTA buttons, match reveal card overlay, onboarding hero, and the Its a Match banner.

### 12.3 Typography

Two typefaces only — both free on Google Fonts. Use Plus Jakarta Sans for all display and heading text, DM Sans for all body and UI copy.

|                      |                                 |                          |
|----------------------|---------------------------------|--------------------------|
| **Role**             | **Font & Weight**               | **Size / Line Height**   |
| Display / App Name   | Plus Jakarta Sans 800 ExtraBold | 32–40px / 1.2            |
| Screen Titles H1     | Plus Jakarta Sans 700 Bold      | 24–28px / 1.3            |
| Section Headings H2  | Plus Jakarta Sans 600 SemiBold  | 18–20px / 1.4            |
| Card Titles / Names  | Plus Jakarta Sans 700 Bold      | 20px / 1.3               |
| Body Copy            | DM Sans 400 Regular             | 15–16px / 1.6            |
| Secondary / Captions | DM Sans 400 Regular             | 13px / 1.5               |
| Buttons / Labels     | DM Sans 600 SemiBold            | 15px / 1.0               |
| Input Fields         | DM Sans 400 Regular             | 15px / 1.0               |
| Micro-copy / Legal   | DM Sans 400 Regular             | 12px / 1.5, color: muted |

### 12.4 Spacing, Radius & Elevation


**Token**                 | **Value & Usage**

Base unit                 | 4px — all spacing is multiples: 4, 8, 12, 16, 24, 32, 48, 64
Screen horizontal padding | 20px on all screens
Card border radius        | 20px — profile cards, modals, bottom sheets
Button border radius      | 14px primary buttons; 50px pill/tag chips
Input border radius       | 12px
Avatar radius             | 50% small avatars; 16px large profile photos
Card shadow (light mode)  | 0 4px 24px rgba(0,0,0,0.08)
Modal shadow              | 0 8px 40px rgba(0,0,0,0.14)
Bottom tab bar height     | 72px including safe area inset

### 12.5 Key Component Specs

**Primary Button**

Background: Violet Rose gradient. Text: white, DM Sans SemiBold 15px. Height: 52px. Border radius: 14px. Active state: scale(0.97) spring. Disabled: opacity 0.4.

**Profile Card**

Full-bleed photo, 3:4 ratio. Gradient overlay transparent → rgba(0,0,0,0.7) on bottom 40%. Name + age in white Plus Jakarta Sans Bold 22px at bottom-left. Interest tag chips above the name. Spring animation on accept/decline.

**Interest Tag Chip**

Background: --color-primary-light. Text: --color-primary, DM Sans SemiBold 13px. Padding: 6px 12px. Border radius: 50px. Selected: background --color-primary, text white.

**Chat Bubble**

Own messages: --color-primary bg, white text, border-radius 18px 18px 4px 18px, right-aligned. Partner: --color-bg-surface, primary text, border-radius 18px 18px 18px 4px, left-aligned.

**Check-in Bottom Sheet**

Slides up from bottom. White card, 24px top radius. Lottie heart+timer illustration. Heading: Still feeling it? Plus Jakarta Sans Bold 22px. Two buttons: Yes keep chatting (gradient) and Move on (outline accent). Cannot be dismissed without a response.

**Match Reveal Screen**

Full screen Violet Rose gradient. Confetti Lottie animation. Two circular 120px photos with glow rings converging to a heart. Text: Its a Match! — Plus Jakarta Sans ExtraBold 36px white. CTA: Start Chatting white button.

### 12.6 Screen-by-Screen Layout Specs

Feed these descriptions screen-by-screen into Stitch. Each spec covers layout, elements, and key interactions.


**Screen 1 — Onboarding / Splash**

- Layout: Full screen Violet Rose gradient background
- Elements: White app logo centred at 40% height; tagline in white DM Sans 16px italic below; Get Started white button pinned to bottom with 20px margins
- Interaction: Tap Get Started triggers horizontal slide to Sign Up screen


**Screen 2 — Sign Up & Login**

- Layout: White background; top 30% is a soft violet curved wave header with logo
- Elements: Sign Up / Log In tab switcher; email + password inputs; Google and Apple outlined secondary buttons below an or continue with divider
- OTP: Full-screen modal overlay with 6 large digit input boxes auto-advancing on entry


**Screen 3 — Profiling (5-step wizard)**

- Step 1 — Basic Info: Name, DOB wheel picker, gender pill selector, city search input
- Step 2 — Photos: 3x2 grid of photo slots; first slot has primary crown badge; drag to reorder
- Step 3 — Interests: Full-screen tag grid by category; selected tags fill with primary colour; X/20 counter
- Step 4 — Partner Prefs: Dual-handle age range slider, gender multi-select, distance slider, deal-breaker toggles
- Step 5 — Questions: Stack of 5 prompt cards; tap to open text input with character counter
- Progress bar at top (segmented, primary fill); back arrow on every step


**Screen 4 — Home / Match Card**

- Layout: Single full-bleed profile card centred with 16px inset; card casts soft shadow
- Top-right badge: Compatibility score e.g. 87% match — gradient pill chip
- Bottom overlay: Name + age, city, X interests in common, 3 interest chips
- Below card: Red X (decline) and green heart (accept) circular buttons 64px diameter with spring bounce
- Swipe up or info icon to flip card and reveal bio + personality answers


**Screen 5 — Match Reveal**

- Full screen Violet Rose gradient with confetti Lottie particle animation
- Two circular photos converge with glow rings; lock icon transitions to a heart
- Heading: Its a Match! — Plus Jakarta Sans ExtraBold 36px white
- Subtext: You and \[Name\] both liked each other — DM Sans 16px white 80% opacity
- CTA: Start Chatting white button


**Screen 6 — Chat**

- Header: partner circular avatar 40px + name + online dot; back arrow
- Own messages right-aligned primary bg; partner messages left-aligned surface bg
- Input bar: rounded text field radius 24px; attachment icon left; primary send button right
- Check-in prompt renders as a centred gold pill system message inline in the thread
- Keyboard pushes content up; input bar sticks above keyboard


**Screen 7 — Check-in Bottom Sheet**

- Slides up over chat with dimmed overlay; cannot be dismissed without response
- Lottie heart+timer animation at top
- Heading: Still feeling it? — Plus Jakarta Sans Bold 22px
- Body: 24-hour or 1-week version of the prompt copy
- Buttons: Yes keep chatting (gradient) stacked above Id like to move on (text button muted)


**Screen 8 — Profile & Settings**

- Top: 100px circular avatar with edit icon overlay; name + age below; completeness ring (circular progress)
- Sections: My Photos horizontal scroll; My Interests tag chips; My Answers expandable cards; Partner Prefs summary
- Settings: Notifications, Privacy, Account, Help, Log Out
- Edit mode: fields become inline inputs; Save/Cancel bar pinned to bottom

### 12.7 Navigation


**Tab** | **Icon & Label**

Home    | Heart icon — Todays Match
Chat    | Chat bubble with unread red badge — Messages
Profile | Person icon — Profile

Tab bar: 72px height, white bg, 1px top border. Active: filled icon + label in --color-primary SemiBold. Inactive: outline icon + label --color-text-muted.

### 12.8 Motion & Animation

- Spring physics on all interactions: stiffness 300, damping 20 (Framer Motion spring config)

- Card accept: slide right + 15deg rotation + green glow flash

- Card decline: slide left + -15deg rotation + red glow flash

- Screen transitions: horizontal slide for stack, vertical for modals and bottom sheets

- Match reveal: Lottie confetti JSON (search LottieFiles: confetti heart)

- Skeleton loaders: shimmer on card placeholders while data fetches

- Haptics: light on tag select, medium on accept/decline, success on match confirmed

### 12.9 Dark Mode Tokens


**Light**                        | **Dark**

--color-bg-base: #FAFAFA        | #09090B
--color-bg-card: #FFFFFF        | #18181B
--color-bg-surface: #F4F4F5     | #27272A
--color-text-primary: #18181B   | #FAFAFA
--color-text-secondary: #71717A | #A1A1AA
--color-border: #E4E4E7         | #3F3F46
Primary & accent                 | Unchanged — same hex in both modes

### 12.10 Stitch Prompt Template

Copy and fill in \[SCREEN\] and \[LAYOUT\] from Section 12.6 for each screen generation:

> Design a \[SCREEN\] screen for OneMatch, an intentional dating app for 18–28 year olds. Style: premium consumer app, warm and modern. Fonts: Plus Jakarta Sans (headings, bold/extrabold) and DM Sans (body, regular/semibold). Primary: #7C3AED. Accent: #F43F5E. Background: #FAFAFA. CTA gradient: 135deg #7C3AED to #F43F5E. Card radius: 20px. Button height: 52px, radius 14px. Layout: \[LAYOUT FROM SECTION 12.6\].


---

## 13. Milestones & Roadmap

|                           |              |                                                                  |
|---------------------------|--------------|------------------------------------------------------------------|
| **Phase**                 | **Timeline** | **Key Deliverables**                                             |
| Phase 0 — Foundation      | Weeks 1–4    | Repo setup, CI/CD, Auth Service, User Profile Service            |
| Phase 1 — Core MVP        | Weeks 5–10   | Matching engine, Match card UI, Chat (WebSocket), Check-in flow  |
| Phase 2 — Polish & Safety | Weeks 11–14  | Photo moderation, Report/block, Push notifications, QA & testing |
| Phase 3 — Beta Launch     | Week 15–16   | Closed beta (500 users), feedback loops, performance tuning      |
| Phase 4 — Public Launch   | Week 17+     | App Store / Play Store release, marketing, monitoring            |
| Phase 5 — Growth (v2)     | Month 5–6    | Premium tier (Stripe), ID verification, voice notes, web app     |

────────────────────────────────────────────────────────────────────────────────

*OneMatch — Product Document v1.0*

Confidential & Proprietary

---

*OneMatch — Product Document v1.0 | MERN Stack | Confidential & Proprietary*
