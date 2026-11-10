# PrepTrack — Database Backup and Disaster Recovery Runbook

This document defines the formal database backup, disaster recovery, and data retention procedures for the **PrepTrack Student Preparation and Competitive Examination Platform**.

---

## 1. Supabase Architecture & Backup Availability

PrepTrack uses **Supabase Managed PostgreSQL** as its primary authoritative datastore.

### 1.1 Automated Physical Backups (Managed by Supabase)
- **Free / Pro Tier Standard:** Daily automated database backups taken by Supabase WAL-G backup infrastructure.
- **Retention:**
  - Free Tier: Daily automated backups retained for 1 day.
  - Pro / Team Tier: 7-day retention standard, with Point-In-Time-Recovery (PITR) extending up to 30 days.
- **Physical Isolation:** Backups are stored encrypted at rest in high-durability cloud object storage geographically co-located with the PostgreSQL cluster region.

### 1.2 Logical Schema Backups (Version Controlled in Git)
All relational DDL, security rules, and seed definitions are preserved as deterministic, immutable migrations within the PrepTrack repository under:
- `supabase/migrations/20261109000000_create_profiles.sql` (Phase 1: Auth & Profiles)
- `supabase/migrations/20261110000000_phase2_syllabus_and_study_management.sql` (Phase 2: Syllabus & Study)
- `supabase/migrations/20261110000001_phase3_mcq_question_bank.sql` (Phase 3: MCQ Question Bank)
- `supabase/migrations/20261110000002_phase4_online_examination_system.sql` (Phase 4: CBT Online Exams)
- `supabase/migrations/20261110000003_phase5_analytics_and_advanced_features.sql` (Phase 5: Analytics & Notifications)

---

## 2. On-Demand Database Export Procedure

Administrators can perform full or table-level logical backups using the Supabase CLI or native `pg_dump`.

### 2.1 Full Database Schema & Data Export
Execute the following command using the Supabase project connection string (obtain the pooled connection URI from the Supabase Project Dashboard):

```bash
# Export schema and data (excluding sensitive internal roles)
pg_dump -h db.<PROJECT_REF>.supabase.co \
        -p 5432 \
        -d postgres \
        -U postgres \
        --clean \
        --if-exists \
        --quote-all-identifiers \
        --no-owner \
        --no-privileges \
        -F p \
        -f preptrack_backup_$(date +%Y%m%d_%H%M%S).sql
```

### 2.2 Phase-Specific Critical Tables Export
To create targeted backups of candidate exam records and questions:

```bash
pg_dump -h db.<PROJECT_REF>.supabase.co \
        -p 5432 \
        -d postgres \
        -U postgres \
        -t 'public.profiles' \
        -t 'public.exams' \
        -t 'public.topics' \
        -t 'public.questions' \
        -t 'public.exam_templates' \
        -t 'public.exam_attempts' \
        -t 'public.exam_results' \
        -f preptrack_core_tables_$(date +%Y%m%d).sql
```

---

## 3. Database Restoration Procedure

### 3.1 Restoring to a Fresh or Staging Database
1. Provision the target PostgreSQL instance or reset the Supabase staging database:
   ```bash
   npx supabase db reset
   ```
2. Apply the deterministic migration chain in chronological order:
   ```bash
   npx supabase migration up
   ```
3. If restoring data from a logical backup file:
   ```bash
   psql -h db.<TARGET_PROJECT_REF>.supabase.co \
        -p 5432 \
        -d postgres \
        -U postgres \
        -f preptrack_backup_<TIMESTAMP>.sql
   ```
4. Verify Row Level Security is active on all restored tables:
   ```sql
   SELECT tablename, rowsecurity
   FROM pg_tables
   WHERE schemaname = 'public';
   ```

---

## 4. Supabase Storage & Object Backup
- **Storage Independence:** Supabase Storage objects (e.g. user avatars, question diagrams, syllabus reference PDFs) are stored in cloud storage buckets, **not** inside the relational PostgreSQL tables.
- **Storage Backup Procedure:**
  Use the Supabase Management API or AWS S3 CLI with Supabase Storage S3-compatible credentials to synchronize buckets:
  ```bash
  aws s3 sync s3://<SUPABASE_BUCKET_NAME> ./backups/storage_backup/ \
      --endpoint-url https://<PROJECT_REF>.supabase.co/storage/v1/s3
  ```

---

## 5. Recovery Time Objective (RTO) & Recovery Point Objective (RPO)
- **Target RPO (Data Freshness):** 24 hours (Free automated backups) or 5 minutes (Pro Tier with PITR).
- **Target RTO (Downtime before recovery):** < 45 minutes to execute migrations and restore schema state on a replacement cluster.
