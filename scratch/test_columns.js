const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function test() {
  console.log("Introspecting profiles...");
  const { data: pData, error: pError } = await supabase.from('profiles').select('*').limit(1);
  if (pError) {
    console.error("Profiles error:", pError);
  } else {
    console.log("Profiles columns:", Object.keys(pData[0] || {}));
  }

  console.log("Introspecting organizations...");
  const { data: oData, error: oError } = await supabase.from('organizations').select('*').limit(1);
  if (oError) {
    console.error("Organizations error:", oError);
  } else {
    console.log("Organizations columns:", Object.keys(oData[0] || {}));
  }
}

test();
