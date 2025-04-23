# Love Lock Backlog

## ✅ Completed
- **Core schema & admin**  
  - `interaction_type` & `outcome_rating` enums  
  - `interactions`, `interaction_ratings`, `rating_criteria`, `admins`, `trust_badge_rule` tables  
  - RLS policies & RPCs (`log_interaction`, `review_interaction`)  
- **Admin UIs**  
  - Rating Criteria CRUD (`RatingCriteriaAdmin.js`)  
  - (Planned) Trust-Badge Rules CRUD scaffold  
- **Interaction flow**  
  - “Log an Experience” form & multi-criteria insert  
  - Seeded `rating_criteria` for all types  
- **Auth & routing**  
  - Sign-up, Login, Email verification flows  
  - Redirect after login → HomePage  
  - Protected routes via `RequireAuth`/`RequireAdmin`  
- **HomePage**  
  - Modern banner with avatar dropdown  
  - Menu items: Settings, Preferences, Logout  
  - Styles in `HomePage.css`  
- **Placeholder pages**  
  - Settings, Preferences  

## → In Progress
- **Profiles & Trust Scores**  
  - `/profiles` list page (pull from `public_profile_view_shared`)  
  - `/profiles/:id` detail view (show `person_trust_score`, stats, tags)  
- **Notifications UI**  
  - Real-time unread badge (via `inbox_with_unread_count_view`)  
  - In-app toasts/digests  
  - Preference toggles  
- **Attachments & Media**  
  - `interaction_attachments` table & Storage integration  
  - Photo upload flow in AddExperience  
- **Moderation & Appeals**  
  - `review_interaction` RPC UI (admin review queue)  
  - Private replies/appeals UI  

## ⭮ Next Up
### Settings Enhancements
1. Change email/password (`supabase.auth.updateUser`)  
2. Avatar upload & URL save (Supabase Storage)  
3. Two-factor auth (TOTP setup)  

### Preferences Enhancements
1. Notification toggles (email, in-app)  
2. Theme switch (light/dark)  
3. Language selector  
4. Default landing page choice  

### Experience & Trust Features
1. Heart-rating breakdown charts on interaction pages  
2. Alerts or digests for flagged users or regional activity  
3. Shareable “Cringe File” export for POI  
4. Personal POI log (user’s own history view)  

### Admin & Governance
1. Trust-Badge Rules CRUD UI (`TrustBadgeRuleAdmin.js`)  
2. Audit log view for interaction reviews  
3. Dynamic weight adjustment analytics (impact on trust scores)
