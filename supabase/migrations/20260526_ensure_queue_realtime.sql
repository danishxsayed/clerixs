-- Migration: Ensure queue_entries table has Full Replication for RLS Realtime updates
-- File: supabase/migrations/20260526_ensure_queue_realtime.sql

ALTER TABLE public.queue_entries REPLICA IDENTITY FULL;
