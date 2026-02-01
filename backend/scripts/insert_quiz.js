/* eslint-disable no-undef */

import { createClient } from '@supabase/supabase-js';

// Environment variables are loaded via node --env-file=.env

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const newQuiz = {
    title: '호치민 그랩 기사 전생 테스트',
    category: 'Fresh Picks',
    description: '당신의 운전 스타일로 알아보는 전생의 그랩 기사 등급! 과연 당신은 5성급 기사였을까요?',
    is_active: true,
    image_url: 'https://api.dicebear.com/7.x/micah/svg?seed=Grab&backgroundColor=b6e3f4'
};

async function insertData() {
    console.log('Attempting to sign in anonymously...');
    const { data: authData, error: authError } = await supabase.auth.signInAnonymously();

    if (authError) {
        console.warn('Anonymous login failed (might be disabled):', authError.message);
        console.log('Trying insert anyway...');
    } else {
        console.log('Signed in as:', authData.user?.id);
    }

    console.log('Inserting data...', newQuiz);
    const { data, error } = await supabase
        .from('quizzes')
        .insert([newQuiz])
        .select();

    if (error) {
        console.error('Error inserting data:', error);
    } else {
        console.log('Success! Inserted data:', data);
    }
}

insertData();
