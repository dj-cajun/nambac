import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://uisuyexwijpaylkxlvfc.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_vuD8rixDb-7Tk_ujybOnXw_r6nmuMX0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: quizzes } = await supabase.from('quizzes').select('*').limit(1);
  console.log('Sample Quiz:', quizzes.map(q => q.id));
  
  if (quizzes && quizzes.length > 0) {
    const quizId = quizzes[0].id;
    const { data: questions } = await supabase.from('questions').select('*').eq('quiz_id', quizId);
    console.log(`Questions for Quiz ${quizId}:`, questions.length);
    
    // Check all questions to see what quiz_ids they have
    const { data: allQuestions } = await supabase.from('questions').select('quiz_id, id').limit(5);
    console.log('Sample Question quiz_ids:', allQuestions);
  }
}
check();
