# LoveLock – Dating Experience & Trust Platform

LoveLock is a dating experience review platform designed to make dating safer, smarter, and more transparent. It allows users to share their experiences with potential matches, contribute to a trusted community, and build accountability within the dating ecosystem.

---

## 🚀 Core Features

- **User Authentication**: Sign up, login, and manage sessions (via Supabase Auth).
- **User Profiles (`profiles`)**: Required profiles linked to registered users, storing bio, avatar, location, and preferences.
- **People of Interest (`person_of_interest`)**: Profiles for individuals users interact with—separate from user profiles.
- **Interactions (`interactions`)**: Logs of dating experiences, including feedback, ratings, and profile accuracy.
- **Circles (`circles` + `circle_members`)**: Private groups for sharing profiles and discussions.
- **Messaging (`message`, `message_threads`, `inbox`)**: Private messaging system with threads, requests, and inbox view.
- **Tags & Trust**: Tags (`tags`, `tag_suggestion`) and trust scores to classify POIs and provide transparency.
- **Comments (`comment`)**: User-submitted comments on POIs for additional context.

---

## 📊 Database Structure

- **users**: Managed by Supabase Auth
- **profiles**: One-to-one with users (required for all)
- **person_of_interest**: Profiles for dating subjects (multiple per user)
- **interactions**: Linked to person_of_interest + reporter (user)
- **circles**: User-created groups
- **circle_members**: Members of circles (many-to-many)
- **message_threads**: Messaging threads between users
- **message**: Messages within threads
- **inbox**: Combined view for messaging
- **comment**: Comments on POIs
- **tags**: Predefined tags for classification
- **tag_suggestion**: User-suggested tags
- **rating_criteria**: Admin-defined rating factors
- **zipcodes**: US Zipcodes table
- **user_subscription**: Tracks premium access

Relationships:
- users → profiles (1:1)
- users → person_of_interest (1:M)
- users → interactions (1:M)
- person_of_interest → interactions (1:M)
- users → circles (1:M)
- circles → circle_members (M:M via circle_members)
- users → message_threads (M:M)
- users → message (M:M)
- person_of_interest → comment (1:M)

---

## 🛡️ Security & Policies

- Row-Level Security (RLS) enforced on all tables.
- Users can only access or modify their own data.
- Admins control global settings and rating criteria.

---

## 📂 Project Structure

LOVE-LOCK-SUPABASE/
├── frontend/
│   ├── node_modules/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── AvatarMenu.js
│   │   │   ├── CircleForm.js
│   │   │   ├── ErrorBoundary.js
│   │   │   ├── Header.js
│   │   │   ├── Layout.js
│   │   │   ├── Loading.js
│   │   │   ├── NavButton.js
│   │   │   ├── RateDateModal.js
│   │   │   ├── RatingCriteriaAdmin.js
│   │   │   ├── RequireAdmin.js
│   │   │   ├── RequireAuth.js
│   │   │   ├── RouteLoader.js
│   │   ├── context/
│   │   │   └── ProfileProvider.js
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── useCircles.js
│   │   │   ├── useCurrentUser.js
│   │   │   └── useRequireProfile.js
│   │   ├── layouts/
│   │   │   ├── PrivateLayout.js
│   │   │   └── PublicLayout.js
│   │   ├── lib/
│   │   │   └── circles.js
│   │   ├── pages/
│   │   │   ├── CircleDetailPage.js
│   │   │   ├── Compose.js
│   │   │   ├── DashboardPage.js
│   │   │   ├── Inbox.js
│   │   │   ├── InteractionsPage.js
│   │   │   ├── LogIn.js
│   │   │   ├── MyCirclesPage.js
│   │   │   ├── Preferences.js
│   │   │   ├── ProfileCreate.js
│   │   │   ├── ProfileDetail.js
│   │   │   ├── ProfileEdit.js
│   │   │   ├── ProfilesPage.js
│   │   │   ├── RateDatePage.js
│   │   │   ├── ResetPassword.js
│   │   │   ├── ResetRequest.js
│   │   │   ├── Settings.js
│   │   │   ├── SignUp.js
│   │   │   ├── Thread.js
│   │   │   └── VerifyEmail.js
│   │   ├── App.css
│   │   ├── App.js
│   │   ├── Auth.js
│   │   ├── HomePage.js
│   │   ├── index.css
│   │   ├── index.js
│   │   ├── reportWebVitals.js
│   │   ├── setupTests.js
│   │   └── supabaseClient.js
│   ├── .env
│   ├── .gitignore
│   ├── package-lock.json
│   ├── package.json
│   └── README.md
├── supabase/
│   ├── .gitignore
│   ├── config.toml
├── BACKLOG.md
├── default-avatar.png


---

## 🌱 Future Enhancements

- Trust score algorithms.
- Enhanced profile sharing & background verification.
- Regional activity alerts & moderation tools.

---

## 🛠️ Quickstart

1. Clone the repo & install dependencies.
2. Set up your `.env` file with Supabase keys.
3. Run the frontend: `npm start`.
4. Log in, create a profile, and start logging experiences!
