import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://uisuyexwijpaylkxlvfc.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_vuD8rixDb-7Tk_ujybOnXw_r6nmuMX0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function uploadImages() {
  console.log('🚀 Starting Image Upload to Supabase Storage...');

  const imagesDir = path.join(__dirname, 'backend', 'data', 'images');
  if (!fs.existsSync(imagesDir)) {
    console.log('No images directory found at', imagesDir);
    return;
  }

  const files = fs.readdirSync(imagesDir);
  console.log(`Found ${files.length} images to upload.`);

  for (const file of files) {
    if (!file.endsWith('.png') && !file.endsWith('.jpg') && !file.endsWith('.jpeg')) continue;
    
    const filePath = path.join(imagesDir, file);
    const fileBuffer = fs.readFileSync(filePath);

    console.log(`Uploading ${file}...`);
    
    const { data, error } = await supabase
      .storage
      .from('quiz-images')
      .upload(file, fileBuffer, {
        contentType: 'image/png', // Assumption for now, most of our images are PNG
        upsert: true
      });

    if (error) {
      console.error(`❌ Error uploading ${file}:`, error.message);
    } else {
      console.log(`✅ Uploaded ${file}`);
    }
  }

  console.log('🎉 All images uploaded successfully!');
}

uploadImages();
