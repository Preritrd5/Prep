const fs = require('fs');
const path = require('path');
const { loadEnvConfig } = require('@next/env');

loadEnvConfig(process.cwd());

const { createClient } = require('@supabase/supabase-js');

async function migrateData() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('[Migration] Missing Supabase URL or Service Role Key in environment.');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const backupFile = path.join(process.cwd(), '.data_backup', 'student_exams.json');
  if (!fs.existsSync(backupFile)) {
    console.log('[Migration] No .data_backup/student_exams.json found. Nothing to migrate.');
    return;
  }

  const raw = fs.readFileSync(backupFile, 'utf-8');
  let records = [];
  try {
    records = JSON.parse(raw);
  } catch (e) {
    console.error('[Migration] Failed to parse backup file:', e.message);
    return;
  }

  if (!Array.isArray(records) || records.length === 0) {
    console.log('[Migration] No records found in backup.');
    return;
  }

  console.log(`[Migration] Found ${records.length} student_exam records in backup. Attempting insert into Supabase...`);

  for (const record of records) {
    try {
      const { data, error } = await supabase
        .from('student_exams')
        .upsert(
          {
            id: record.id,
            student_id: record.student_id,
            exam_id: record.exam_id,
            target_date: record.target_date,
            priority: record.priority,
            notes: record.notes,
            created_at: record.created_at,
            updated_at: record.updated_at,
          },
          { onConflict: 'id' }
        );

      if (error) {
        console.warn(`[Migration] Notice for record ${record.id}: ${error.message}`);
      } else {
        console.log(`[Migration] Successfully synced record ${record.id} (${record.notes})`);
      }
    } catch (err) {
      console.warn(`[Migration] Error processing ${record.id}:`, err.message);
    }
  }

  console.log('[Migration] Migration check completed.');
}

migrateData();
