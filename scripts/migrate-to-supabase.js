/**
 * Migration Script: Base44 to Supabase
 *
 * This script documents and helps automate the migration from Base44 SDK to Supabase.
 * Run with: node scripts/migrate-to-supabase.js
 */

import fs from 'fs';
import path from 'path';

const PAGES_DIR = './src/pages';

// Patterns to find and replace
const REPLACEMENTS = [
  // Import replacements
  {
    find: /import \{ base44 \} from ['"]@\/api\/base44Client['"];?/g,
    replace: `import { entities, integrations } from '@/api';
import { useAuth } from '@/contexts/AuthContext';`
  },
  // Entity method calls
  {
    find: /base44\.entities\.(\w+)\.(list|filter|create|update|delete|get)/g,
    replace: 'entities.$1.$2'
  },
  // Auth calls
  {
    find: /base44\.auth\.me\(\)/g,
    replace: 'auth.me()'
  },
  {
    find: /base44\.auth\.logout\(\)/g,
    replace: 'signOut()'
  },
  // Integration calls
  {
    find: /base44\.integrations\.Core\.(\w+)/g,
    replace: 'integrations.Core.$1'
  },
  // Field name mappings (created_date -> created_at)
  {
    find: /'-created_date'/g,
    replace: "'-created_at'"
  },
  {
    find: /created_date/g,
    replace: 'created_at'
  },
];

function migrateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  for (const { find, replace } of REPLACEMENTS) {
    if (find.test(content)) {
      content = content.replace(find, replace);
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`✓ Migrated: ${filePath}`);
    return true;
  }

  return false;
}

function main() {
  console.log('🚀 Starting Base44 to Supabase Migration\\n');

  const files = fs.readdirSync(PAGES_DIR)
    .filter(f => f.endsWith('.jsx') || f.endsWith('.js'));

  let migratedCount = 0;

  for (const file of files) {
    const filePath = path.join(PAGES_DIR, file);
    if (migrateFile(filePath)) {
      migratedCount++;
    }
  }

  console.log(`\\n✅ Migration complete! ${migratedCount} files updated.`);
  console.log('\\nNext steps:');
  console.log('1. Review the migrated files for any edge cases');
  console.log('2. Update .env with your Supabase credentials');
  console.log('3. Run the SQL schema in supabase/schema.sql');
  console.log('4. Create the "photos" storage bucket in Supabase');
  console.log('5. Test the application locally with npm run dev');
}

main();
