# Turfington Platform Architecture & Developer Guide

## 1. System Overview
Turfington is a high-performance sports venue discovery, turf booking, and athlete networking platform built for web and mobile.

### Tech Stack
- **Frontend Core**: React 19, Vite, Tailwind CSS, Framer Motion
- **Icons & Typography**: Lucide React, ITC Avant Garde Gothic Std, Inter, Outfit
- **Data & Realtime**: Firebase Firestore, Firebase Authentication, Firebase Storage, Node Express API
- **Payments & Maps**: Razorpay Payment Gateway, Google Maps JavaScript API

---

## 2. Directory Structure

```
d:/PDD DRAFT 1/
├── src/
│   ├── assets/              # Static media, icons, and branding
│   ├── config/              # Centralized environment & domain constants
│   │   ├── env.js           # Environment variable validation & fallbacks
│   │   └── constants.js     # Sports list, user roles, navigation tabs
│   ├── context/             # Global React Context state providers
│   │   ├── AuthContext.jsx  # Active user session, role, and profile sync
│   │   ├── ToastContext.jsx # Reactive notifications system
│   │   └── index.js         # Context barrel exports
│   ├── hooks/               # Custom hooks separating business logic from UI
│   │   ├── useAuth.js       # Authentication hook
│   │   ├── useToast.js      # Global toast notification hook
│   │   ├── useVenues.js     # Venue filtering, distance sorting, and search
│   │   ├── useBookings.js   # Booking workflow and status mutations
│   │   └── index.js         # Hooks barrel exports
│   ├── components/          # Reusable UI components & modals
│   │   ├── layout/          # Core layout: Header, MobileNav, MobileMenu, Footer
│   │   ├── modals/          # Profile switcher, support, match modals
│   │   ├── UserAvatar.jsx   # Dynamic letter/image avatar with gradient fallbacks
│   │   ├── SportIcon.jsx    # SVG icons for all supported sports
│   │   ├── VenueImage.jsx   # Responsive venue image with loading skeletons
│   │   ├── ErrorBoundary.jsx# React boundary catching rendering crashes
│   │   └── index.js         # Component exports
│   ├── pages/               # Route views (thin orchestrators)
│   │   ├── Landing.jsx      # High-conversion public portal
│   │   ├── Home.jsx         # Personalized athlete feed & matches
│   │   ├── Discovery.jsx    # Venue discovery, interactive map, & booking slots
│   │   ├── Marketplace.jsx  # Sports gear and merchandise shop
│   │   ├── Tournaments.jsx  # Tournament brackets and registration
│   │   ├── VenueManager.jsx # Facility owner dashboard & slot management
│   │   ├── Dashboard.jsx    # Player bookings and reservation vouchers
│   │   ├── Profile.jsx      # Athlete profile, stats, and reviews
│   │   ├── Community.jsx    # Real-time messaging and chat channels
│   │   └── Auth.jsx         # Dual OTP / Google authentication modal
│   ├── services/            # API integration & backend communication
│   │   ├── firebase.js      # Firebase SDK client initialization
│   │   ├── db.js            # Firestore & local API database service
│   │   ├── chatService.js   # Realtime WebSocket/Firestore message sync
│   │   └── razorpay.js      # Payment checkout SDK integration
│   ├── utils/               # Pure utility functions
│   │   ├── sanitize.js      # Input sanitization and XSS protection
│   │   ├── formatters.js    # Currency, date, and text formatters
│   │   ├── geo.js           # Haversine coordinate distance calculations
│   │   └── index.js         # Utility barrel exports
│   ├── App.jsx              # Application router & navigation controller
│   ├── main.jsx             # React DOM root entry
│   └── index.css            # Tailwind directives & global styling
├── server.js                # Express REST API & automated daily backup daemon
├── firestore.rules          # Strict zero-trust Cloud Firestore security rules
├── .env.example             # Clean environment variable blueprint
└── .gitignore               # Strict git exclusion for secrets and backups
```

---

## 3. Separation of Concerns & State Management

### Context Layer (`src/context/`)
1. **`AuthContext` (`useAuth`)**:
   - Manages active user profile state, role (`'player'` vs `'owner'`), and session persistence in `localStorage`.
   - Automatically synchronizes with Firebase Auth state via `onAuthStateChanged`.
   - Provides methods: `login()`, `logout()`, `switchProfile()`, `updateUser()`.

2. **`ToastContext` (`useToast`)**:
   - Centralizes all feedback (success, error, warning, notice).
   - Replaces disruptive native browser `alert()` popups with animated, accessible toast cards.

### Business Logic via Custom Hooks (`src/hooks/`)
- UI pages do not perform raw data manipulation or coordinate distance calculations directly.
- **`useVenues`**: Handles venue fetching, sport category filtering, search querying, and geo-distance calculations.
- **`useBookings`**: Manages player bookings, owner requests, and real-time approval/rejection status changes.

---

## 4. Security & Data Protection Architecture

1. **Environment & Secrets**:
   - All API keys, Firebase configuration, and secrets reside in `.env` (strictly excluded from Git tracking via `.gitignore`).
   - Clean defaults and schema are documented in `.env.example`.
   - `src/config/env.js` validates environment parameters during initialization.

2. **Password Security**:
   - Passwords stored in `turfington_db.json` are cryptographically hashed using PBKDF2 with SHA-512, 100,000 iterations, and unique cryptographic salts.

3. **Access Control & RBAC**:
   - `VenueManager.jsx` enforces strict role-based access control (RBAC). Non-owner accounts cannot inspect or manage venue assets.
   - `firestore.rules` enforces zero-trust rules where documents can only be created, read, or modified by verified owners.

4. **API Hardening in `server.js`**:
   - **Rate Limiting**: `authRateLimiter` limits authentication endpoints (`/api/auth/send-otp`, `/api/auth/verify-otp`) to 10 requests per 15-minute window.
   - **Data Isolation**: `/api/bookings` and `/api/chats` require valid `userId` parameters to prevent unauthorized bulk data exposure.
   - **Security Headers**: Enforces HSTS, `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, and CSP `upgrade-insecure-requests`.
   - **Automated Backups**: Creates daily timestamped snapshots in `backups/turfington_db_YYYY-MM-DD.json` every 24 hours.

---

## 5. Coding & Naming Conventions

- **React Components**: `PascalCase` filenames (`Header.jsx`, `UserAvatar.jsx`).
- **Custom Hooks**: `camelCase` prefixed with `use` (`useAuth.js`, `useVenues.js`).
- **Utility Modules**: `camelCase` (`formatters.js`, `geo.js`, `sanitize.js`).
- **Constants**: `UPPER_SNAKE_CASE` exported from `src/config/constants.js`.
- **Imports**: Prefer barrel exports (`import { useAuth, useToast } from '../hooks'`).

---

## 6. Build & Verification
- **Production Build**: `npm run build`
- **Development Server**: `npm run dev`
- **Database Server**: `node server.js`

