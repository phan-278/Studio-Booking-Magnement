require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { error } = await supabase.rpc('execute_sql_string', {
    sql_query: `
      CREATE TABLE IF NOT EXISTS public.monthly_reports (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        year INT NOT NULL,
        month INT NOT NULL,
        gross_revenue NUMERIC DEFAULT 0,
        studio_revenue NUMERIC DEFAULT 0,
        equipment_revenue NUMERIC DEFAULT 0,
        forfeited_amount NUMERIC DEFAULT 0, 
        total_bookings_completed INT DEFAULT 0,
        forfeited_count INT DEFAULT 0,
        no_show_count INT DEFAULT 0,
        cancelled_after_deposit_count INT DEFAULT 0,
        cancelled_before_deposit_count INT DEFAULT 0,
        on_hold_count INT DEFAULT 0,
        is_finalized BOOLEAN DEFAULT false,
        generated_at TIMESTAMPTZ,
        generated_by UUID REFERENCES public.profiles(id),
        UNIQUE(year, month)
      );
    `
  });
  if (error) {
    console.error(error);
  } else {
    console.log("Success");
  }
}
run();
