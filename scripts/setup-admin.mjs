import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_KEY) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'Admin@2026!Secure#';

async function setupAdminAccount() {
  try {
    console.log('Creating admin account...');

    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: `${ADMIN_USERNAME}@miaoda.com`,
      password: ADMIN_PASSWORD,
      options: {
        data: {
          username: ADMIN_USERNAME
        }
      }
    });

    if (signUpError) {
      if (signUpError.message.includes('already registered')) {
        console.log('Admin account already exists');
        return;
      }
      throw signUpError;
    }

    if (!authData.user) {
      throw new Error('Failed to create user');
    }

    console.log('Updating user role to admin...');

    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', authData.user.id);

    if (updateError) throw updateError;

    console.log('\n=== ADMIN ACCOUNT CREATED ===');
    console.log('Username: ' + ADMIN_USERNAME);
    console.log('Password: ' + ADMIN_PASSWORD);
    console.log('=============================\n');
    console.log('IMPORTANT: Please save these credentials securely!');
  } catch (error) {
    console.error('Error setting up admin account:', error);
    process.exit(1);
  }
}

setupAdminAccount();