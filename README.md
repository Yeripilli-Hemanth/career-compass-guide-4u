# Career Compass

Product overview

Build "Career Compass" — a web app that gives students and early professionals a personalized career roadmap showing what skills are in demand and how to build them. The core insight: a person exploring careers, a person actively studying toward one, and a working professional pivoting all need different interfaces, not the same dashboard with more or less data.

Initial content focus: Computer Science (CSE) career paths, covered as broadly as possible at launch (full list below). Architecture must support adding non-CSE fields later without restructuring.

Budget constraint — read this before building anything

This build has zero budget. Every service used must stay on its free tier for this version — Supabase free tier, Lovable's own hosting, no paid APIs, no paid fonts/assets, no paid third-party integrations of any kind. Do not suggest or default to any paid add-on, even a cheap one. If a feature requires a paid service to work well, build the free-tier-compatible version instead and note the limitation, don't skip the feature silently.

Business model, in order, and why this build stays free-only:

Now — free, content-heavy, zero cost. The only goal of this version is to have enough real, useful career roadmaps that students actually visit and share the app. Breadth of content matters more than polish right now, because traffic is what unlocks every later stage.

Once there's real traffic — ads. Ad revenue (Google AdSense) is the funding source for everything after this. It only becomes viable once the app has enough visitors, which depends entirely on how much useful content is live now.

Once ads generate income — subscription tier. Paid personalization/extra features get built then, funded by ad revenue, not upfront investment.

Later — educational platform. Courses, certificates, etc., funded by subscription revenue.

The practical implication for this build: maximize the number of solid, real career roadmaps now, since that content is the entire growth engine until ad money exists. Do not build any ad, payment, or subscription UI in this version — see "Explicitly out of scope" below.

Career paths to cover at launch

Build the schema and content generously — this list is the actual product at this stage, since content breadth is what drives the free traffic the whole business model depends on. Seed all of these, not a subset:

Core development

Frontend Developer

Backend Developer

Full-Stack Developer

Mobile App Developer (Android/iOS)

Game Developer

Data and AI 6. Data Analyst 7. Data Scientist 8. Machine Learning Engineer 9. AI Engineer (applied/LLM-focused, distinct from classical ML) 10. Data Engineer

Infrastructure and operations 11. DevOps Engineer 12. Cloud Engineer 13. Site Reliability Engineer (SRE) 14. Database Administrator

Security 15. Cybersecurity Analyst 16. Penetration Tester / Ethical Hacker

Quality and product 17. QA / Test Engineer 18. Product Manager (technical) 19. Business Analyst (tech-focused)

Specialized/emerging 20. Blockchain Developer 21. AR/VR Developer 22. Embedded Systems Engineer 23. UI/UX Designer (tech-adjacent, high CSE-student interest)

Each of these needs the full structure defined in the schema below — 4 stages, 3-5 skills per stage, real free resources, and demand tags. Don't build shallow one-line entries; a thin roadmap page is exactly the kind of content that fails to earn trust, fails to rank on Google, and gets rejected by AdSense later. Depth on fewer of these is better than a sentence each on all 23 — if time constraints force a tradeoff, fully build out the "Core development" and "Data and AI" groups first, then fill in the rest.

Tech stack

Frontend: React (via Lovable)

Backend/DB/Auth: Supabase (Postgres, Row Level Security, email + Google auth)

Styling: Tailwind, following the design constraints below

No payment integration yet — do not build Stripe/paywall logic in this version

Users and the three-mode system

Every user picks one stage at onboarding, stored as profiles.stage. This single field controls which home-screen experience renders. Do not build three separate apps — build one component tree that branches on this value.

1. exploring — school students (classes 9-12), undecided. Home screen: low-pressure, browse-first framing. Leads with a short interest quiz, then shows career cards to browse, not a progress tracker. No jargon like "roadmap stage" or "skill gap" — this user hasn't chosen a direction yet.

2. studying — college students who've picked a direction (e.g., CSE student targeting SDE). Home screen: active progress tracker. Shows current stage out of N, percent complete, a highlighted "up next" skill card with a reason it matters ("ranked #1 in current job postings") and a resource link, and a completed-skills checklist below.

3. working — employed professionals upskilling or pivoting. Home screen: gap-analysis framing. Compares their self-reported current skills against the target role's required skills. Shows "skills you already have" vs "gap to close" as two stat cards, then a prioritized list of missing skills tagged by demand level (high/medium), and a CTA to generate a time-boxed catch-up plan.

Onboarding must ask stage directly in plain language (e.g., "Which sounds like you right now?" with three options mapped to the above) rather than inferring it from age, since a working adult might still be "exploring."

Database schema (Supabase)

profiles
  id uuid references auth.users primary key
  full_name text
  stage text check (stage in ('exploring','studying','working'))
  current_role text          -- e.g. "backend developer", null if student
  target_career_id uuid references careers(id)
  created_at timestamp

careers
  id uuid primary key
  name text                  -- "Software Developer"
  field text                 -- "CSE" (for future expansion beyond CSE)
  short_description text
  slug text unique           -- for SEO-friendly URLs later

career_stages
  id uuid primary key
  career_id uuid references careers(id)
  stage_order int            -- 1,2,3,4
  stage_name text            -- "Foundation", "Core skills", "Job-ready"

skills
  id uuid primary key
  career_stage_id uuid references career_stages(id)
  name text
  why_it_matters text        -- short, demand-justification sentence
  demand_level text check (demand_level in ('high','medium','low'))
  free_resource_url text
  free_resource_label text
  skill_order int

user_skills
  user_id uuid references profiles(id)
  skill_id uuid references skills(id)
  status text check (status in ('not_started','in_progress','completed'))
  updated_at timestamp
  primary key (user_id, skill_id)

quiz_responses               -- for 'exploring' stage users
  id uuid primary key
  user_id uuid references profiles(id)
  responses jsonb
  recommended_career_ids uuid[]
  created_at timestamp


Enable Row Level Security: users can only read/write their own profiles, user_skills, and quiz_responses rows. careers, career_stages, and skills are public read, no write access from the client (content gets managed separately, not through the app UI, in this version).

Screens to build

Auth — sign up / log in (email + Google via Supabase Auth)

Onboarding — 3-4 questions: stage (exploring/studying/working), field of interest (default CSE, allow "something else" as a disabled/coming-soon option), and if studying or working, which specific career they're targeting (dropdown from careers table)

Home — branches by profiles.stage into the three experiences described above

Career detail / roadmap page — full stage-by-stage breakdown for one career: all stages, all skills per stage, resource links, demand tags. Accessible whether or not it's the user's chosen target (so exploring users can browse any career in depth)

Interest quiz (exploring users) — 5-6 multiple choice questions on interests/work style, ends with 2-3 recommended careers linking to their detail pages

Skill gap plan (working users) — after selecting current skills from a checklist against the target career's full skill list, show the gap and let them mark a target timeframe; store in user_skills

Browse/search careers — grid of all careers in careers table, filterable by field (CSE now, others "coming soon")

Profile/settings — edit stage, target career, view completed skills

Design constraints

Flat, minimal UI — no gradients, no heavy shadows, generous whitespace

Sentence case everywhere, no ALL CAPS, no title case except proper nouns

One accent color used sparingly for primary actions and progress indicators; neutral grays for structure

Mobile-first responsive layout — most students will use this on phones

Every screen must have a clear single primary action, not multiple competing CTAs

Empty states should invite action ("Take the quiz to get started") not apologize ("No data yet")

Explicitly out of scope for this build

Payments, subscriptions, or any paywalled content

Ads or ad slots

Course/video hosting (educational platform phase — later)

Admin panel for managing career/skill content (content will be seeded directly into Supabase for now)

Non-CSE career content (schema supports it, but don't build UI assuming it exists yet)

Seed data instruction

After building the schema and UI, seed the careers, career_stages, and skills tables with real, complete content for as many of the 23 career paths listed above as possible — this is not placeholder/test data, it's the actual launch content. Each career needs 4 realistic stages and 3-5 skills per stage, each skill with a genuine free resource link and a demand tag. If full depth on all 23 isn't achievable in one pass, fully complete the "Core development" and "Data and AI" groups first (10 careers), then continue with the rest in the same depth — do not leave any career half-built with only 1-2 stages, since an incomplete roadmap page is worse for user trust than not having that career listed yet.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://career-compass-guide-4u.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/45b930bc-9a23-4115-bf35-20d45fea25ff).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
