Run these migrations in order for a fresh project:

1. `20260301000100_baseline_schema.sql`
2. `20260301000200_seed_frame_catalog.sql`
3. `20260301000300_storage_buckets_and_policies.sql`
4. `20260301000400_admin_rls_minimal.sql`

Do not run legacy migrations from 2025 for this rollout. They contain superseded admin/password-reset logic.
