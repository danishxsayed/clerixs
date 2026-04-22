# Clerixs: Architecture Documentation

## Technical Stack
- **Framework**: [Next.js](https://nextjs.org) (App Router)
- **Language**: TypeScript
- **Database/Auth**: [Supabase](https://supabase.com) (PostgreSQL)
- **Styling**: Tailwind CSS & Shadcn/UI
- **Deployment**: Netlify

## Data Security & Multi-tenancy
Clerixs uses a strict **Organization-based isolation** model via Row Level Security (RLS) in PostgreSQL.
- Every major table contains an `organization_id`.
- Users gain access via `organization_memberships`.
- Most server actions verify membership and scope all queries by the user's `default_organization_id`.

## Core Project Structure
- `src/app/(app)`: Contains the main application routes (Dashboard, Patients, Lab).
- `src/lib`: Shared utilities (Quota enforcement, Supabase clients, PDF generation).
- `supabase/migrations`: Version-controlled database schema and RPC functions.
- `.memory`: Persistent development context (this folder).

## Key Systems
- **Quota System**: Located in `src/lib/quota.ts`. Encapsulates limits and enforcement.
- **RPC Functions**:
    - `calculate_organization_data_size(target_org_id)`: Sums column size of all specific clinic records.
- **Middleware**: Handles route protection and session verification.
