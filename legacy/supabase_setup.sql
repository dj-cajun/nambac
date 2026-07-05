-- ============================================
-- Nambac Supabase Setup Script
-- Paste this into the Supabase SQL Editor and run it.
-- ============================================

-- 1. Create Quizzes Table
create table if not exists quizzes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text,
  quiz_type text default 'binary_5q',
  image_url text,
  config jsonb,
  design jsonb,
  is_active boolean default true,
  view_count int default 0,
  share_count int default 0,
  created_at timestamptz default now()
);

-- 2. Create Questions Table
create table if not exists questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid references quizzes(id) on delete cascade,
  order_number int,
  question_text text not null,
  option_a text not null,
  option_b text not null,
  score_a int default 0,
  score_b int default 0,
  image_url text,
  dimension text,
  options jsonb
);

-- 3. Create Results Table
create table if not exists results (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid references quizzes(id) on delete cascade,
  result_code int not null,
  title text not null,
  description text,
  traits text[],
  image_url text
);

-- 4. Set up Row Level Security (RLS)
-- For now, allow public read access to all tables so the frontend can fetch them
alter table quizzes enable row level security;
alter table questions enable row level security;
alter table results enable row level security;

create policy "Public quizzes are viewable by everyone." on quizzes for select using (true);
create policy "Questions are viewable by everyone." on questions for select using (true);
create policy "Results are viewable by everyone." on results for select using (true);

-- Allow public insert/update for view count or admin (simplified for now)
create policy "Allow all operations for now" on quizzes for all using (true) with check (true);
create policy "Allow all operations for now" on questions for all using (true) with check (true);
create policy "Allow all operations for now" on results for all using (true) with check (true);

-- 5. Create Storage Bucket for Images
insert into storage.buckets (id, name, public) 
values ('quiz-images', 'quiz-images', true)
on conflict (id) do nothing;

create policy "Images are publicly accessible." on storage.objects for select using (bucket_id = 'quiz-images');
create policy "Anyone can upload images." on storage.objects for insert with check (bucket_id = 'quiz-images');
create policy "Anyone can update images." on storage.objects for update using (bucket_id = 'quiz-images');
create policy "Anyone can delete images." on storage.objects for delete using (bucket_id = 'quiz-images');
