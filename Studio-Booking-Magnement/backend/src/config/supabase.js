require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env file');
  process.exit(1);
}

// Khởi tạo Supabase client với Service Role Key để có toàn quyền (Bypass RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

module.exports = supabase;
