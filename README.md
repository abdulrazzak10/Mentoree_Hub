# GetMentor (Mentoree Hub)

A modern mentorship platform built with React + Vite, Tailwind, shadcn/ui, and Supabase. Students can discover mentors, book sessions, and chat in realtime. Mentors manage requests and sessions. An Admin dashboard controls the entire platform (users, sessions, requests) with deactivation and hard-delete tools.

## Features

- Authentication (Supabase Auth)
- Profiles with avatar upload (Supabase Storage)
- Mentor discovery with filters (server-side + client-side)
- Session booking with availability + conflict validation
- Mentors: requests management, sessions view
- Students: dashboard, sessions view
- Chat with realtime messages (Supabase Realtime)
- Admin dashboard
  - Promote/demote admin
  - Activate/Deactivate with reason (blocks login + hides in discovery)
  - Hard delete profiles (note: removing auth.users requires Supabase dashboard or server function)
  - Manage session requests (accept/decline) and sessions (cancel/delete)

## Tech Stack

- React 18 + TypeScript + Vite
- TailwindCSS + shadcn/ui (Radix UI)
- TanStack Query (data fetching/caching)
- Supabase (Auth, PostgREST, Storage, Realtime)
