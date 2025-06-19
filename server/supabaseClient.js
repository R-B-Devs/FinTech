const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("❌ Supabase environment variables are missing.");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

module.exports = supabase;