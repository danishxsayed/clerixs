# Clerixs: Storage Logic & Quota Policy

## "No Free Storage" Policy
Every byte of information—including plain text medical notes—counts toward the clinic's allocated storage quota.

## Quota Thresholds
- **Starter / Trial**: 5 GB
- **Pro Plan**: 10 GB

## Quota Enforcement (Hard Blocking)
We implement a "Block-on-Write" strategy. Before any data-saving server action proceeds, it must pass the `ensureStorageQuota` check.
- **Location**: `src/lib/quota.ts`
- **Error**: Throws `STORAGE_QUOTA_EXCEEDED` if usage >= limit.
- **Affected Areas**:
    - Patient creation (including CSV bulk import).
    - Lab orders and result entries.
    - Prescription generation.
    - Appointment scheduling.
    - Treatment plan creation.
    - Invoice generation.
    - General file uploads.

## Usage Calculation
Total Usage = **File Usage** + **Record (Text) Usage**

### 1. File Usage
- Calculated by summing `file_size_bytes` from the `patient_files` table.
- Covers X-Rays, Lab Reports, and all files in Supabase Storage buckets.

### 2. Record (Text) Usage
- Calculated via the PostgreSQL RPC `calculate_organization_data_size`.
- It uses `pg_column_size` to sum the actual byte weight of rows across 13+ related tables (Notes, Prescriptions, Appointments, etc.).
- **Fallback**: If the RPC fails or returns 0, a TypeScript fallback in `quota.ts` estimates usage based on note content length and patient row count.
