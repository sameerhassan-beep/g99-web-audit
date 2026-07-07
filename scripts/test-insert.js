const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testInsert() {
  const { data, error } = await supabase.from('audits').insert({
    id: Date.now().toString(),
    url: 'https://test.com',
    overall_score: 100,
    report: { overallScore: 100, executiveSummary: {} },
    screenshots: {},
    sub_pages: [],
  });
  
  if (error) {
    console.error('Insert Error:', error);
  } else {
    console.log('Insert Success:', data);
  }
}

testInsert();
