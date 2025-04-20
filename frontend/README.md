# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

Love Lock

A social platform built with React and Supabase that enables users to connect, interact, and build trust through a combination of profiles, messaging, badges, and trust scores.

Table of Contents

Features

Tech Stack

Project Structure

Supabase Setup

Environment Variables

Scripts

Database Schema & Policies

Authentication & Authorization

API & RPC Endpoints

Trust Scoring & Badges

Notifications

Contributing

License

Features

User Authentication: Email signup, login, and email verification.

Profiles: Searchable list of user profiles with detailed view, trust scores, and badges.

Messaging: Secure threads and inbox between users and persons of interest (POIs).

Trust System: Automated trust score calculation, manual overrides, and badge assignment.

Moderation: Users can flag content; moderators review flags and adjust trust impact.

Notifications: Real-time notifications with dispatch logs and user preferences.

Tech Stack

Frontend: React, React Router DOM, Tailwind CSS (if used), Supabase JS client

Backend / Database: Supabase (Postgres), SQL + PL/pgSQL functions, Row-Level Security (RLS)

Local Development: Docker (via Supabase CLI), concurrently for dev workflow

Project Structure

love-lock-supabase/         # root
├── frontend/               # React app
│   ├── public/
│   ├── src/
│   │   ├── pages/          # SignUp, LogIn, ProfilesPage, ProfileDetail, ThreadsPage, Thread, Inbox, VerifyEmail
│   │   ├── components/     # RequireAuth, UI components
│   │   ├── supabaseClient.js
│   │   └── App.js
│   └── package.json
├── supabase/               # Supabase local config & migrations
│   ├── config.toml
│   ├── migrations/
│   └── seed.sql
├── .env                    # Frontend env (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)
├── package.json            # root scripts, devDependencies
└── README.md               # you are here

Supabase Setup

Install

npm install -g supabase

Initialize local project (already done)

supabase init

Start local services

npm start
# runs: npx supabase start && cd frontend && npm install && npm start

Run migrations

npm run migrate:push
npm run migrate:status

Reset / seed

supabase db reset

Environment Variables

Create a .env in frontend/:

NEXT_PUBLIC_SUPABASE_URL= http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY= <anon key printed by `supabase start`>

Scripts

Root (love-lock-supabase/package.json):

{
  "scripts": {
    "start": "concurrently \"npx supabase start\" \"npm run start:frontend\"",
    "start:frontend": "cd frontend && npm install && npm start",
    "build": "npm run build:frontend",
    "build:frontend": "cd frontend && npm install && npm run build",
    "migrate:push": "npx supabase db push",
    "migrate:status": "npx supabase db status",
    "supabase:login": "npx supabase login"
  }
}

Frontend (frontend/package.json):

{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  }
}

Database Schema & Policies

Tables include:

alias, comment, content_flag, inbox, interaction, interaction_reply, message, message_request, notification, notification_dispatch_log, pinned_message_user, person_of_interest, trust_score_log, user_profile, etc.

Each table is protected by Row‑Level Security policies (RLS) defined in your Supabase project, ensuring:

Public read on safe data (alias, comment, user_profile).

Users can only modify their own records (INSERT/UPDATE on their comments, interactions, profiles).

Moderators/Admins have elevated rights (flag review, dispatch logs).

Authentication & Authorization

Built using Supabase Auth (email + magic link / password).

Users must verify email before accessing protected routes (RequireAuth component).

JWT claims (app_metadata.role) determine moderator/admin privileges via custom functions is_admin().

API & RPC Endpoints

Supabase auto‑generated RESTful endpoints for tables/views and custom RPC functions:

Search Profiles: rpc/search_profiles for filtered profile lists.

Get Profile: rpc/get_profile_by_slug returns detailed POI record.

Messaging:

rpc/send_message, rpc/get_my_conversations, rpc/get_my_message_history, rpc/get_unread_count.

Notifications:

rpc/get_user_notifications, rpc/get_unread_notifications_count, rpc/mark_all_notifications_read, etc.

Use the Supabase JS client in supabaseClient.js to call these.

Trust Scoring & Badges

Trust Score: Aggregated via recalculate_trust_score() trigger on interaction changes.

Badge Assignment: assign_trust_badge() logic runs via trg_update_trust_badge trigger.

Manual Overrides: Moderators can use override_trust_score().

Flag Impact: Accepted flags on interactions deduct from trust via apply_trust_impact.

Badges (trusted, flagged, etc.) appear on profile views.

Notifications

New notifications inserted via triggers (notify_cringe_followers, dispatch_single_notification).

User preferences stored in user_notification_preference.

Audit logs saved to notification_dispatch_log.

Frontend polling or realtime listeners update the UI.

Contributing

Fork the repo

Create a feature branch

Commit your changes with clear messages

Run migrations & update seed.sql if needed

Submit a PR for review

License

MIT © Love Lock Team


