
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env manually
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');

const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        env[key.trim()] = value.trim();
    }
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testInsert() {
    console.log('Testing quiz insertion with questions: [] ...');
    const { data, error } = await supabase
        .from('quizzes')
        .insert([{
            title: 'Test Quiz Script 3',
            description: 'Created by verification script 3',
            thumbnail_url: 'http://example.com/image.jpg',
            quiz_type: 'mbti',
            is_active: true,
            questions: [] // Initial empty array
        }])
        .select();

    if (error) {
        console.error('Insert failed:', error);
    } else {
        console.log('Insert successful:', data);
        // Cleanup
        const { error: delError } = await supabase.from('quizzes').delete().eq('id', data[0].id);
        if (delError) console.error('Cleanup failed:', delError);
        else console.log('Cleanup successful');
    }
}

testInsert();
