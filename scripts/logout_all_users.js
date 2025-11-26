// Script to log out all users by clearing sessions
// Run this with: node scripts/logout_all_users.js

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables from .env.local
dotenv.config({ path: join(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  console.error('Make sure these are set in your .env.local file')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function logoutAllUsers() {
  try {
    console.log('🔄 Logging out all users...')
    
    // This requires the service role key and admin API access
    const { data, error } = await supabase.auth.admin.signOut('all')
    
    if (error) {
      throw error
    }
    
    console.log('✅ All users have been logged out successfully')
    console.log('📝 Users will need to sign in again')
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.log('\n💡 Alternative: Run this SQL query in your Supabase SQL Editor:')
    console.log('   DELETE FROM auth.sessions;')
    console.log('   DELETE FROM auth.refresh_tokens;')
  }
}

logoutAllUsers()
