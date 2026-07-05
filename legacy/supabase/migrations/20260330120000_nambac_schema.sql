-- Nambac quiz platform schema

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
  status text default 'active',
  view_count int default 0,
  share_count int default 0,
  participant_count int default 0,
  created_at timestamptz default now()
);

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

create table if not exists results (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid references quizzes(id) on delete cascade,
  result_code int not null,
  title text not null,
  type_name text,
  description text,
  traits text[],
  image_url text
);

alter table quizzes enable row level security;
alter table questions enable row level security;
alter table results enable row level security;

drop policy if exists "Public quizzes are viewable by everyone." on quizzes;
drop policy if exists "Questions are viewable by everyone." on questions;
drop policy if exists "Results are viewable by everyone." on results;
drop policy if exists "Allow all operations for now" on quizzes;
drop policy if exists "Allow all operations for now" on questions;
drop policy if exists "Allow all operations for now" on results;

create policy "Public quizzes are viewable by everyone." on quizzes for select using (true);
create policy "Questions are viewable by everyone." on questions for select using (true);
create policy "Results are viewable by everyone." on results for select using (true);
create policy "Allow all operations for now" on quizzes for all using (true) with check (true);
create policy "Allow all operations for now" on questions for all using (true) with check (true);
create policy "Allow all operations for now" on results for all using (true) with check (true);

insert into storage.buckets (id, name, public)
values ('quiz-images', 'quiz-images', true)
on conflict (id) do nothing;

drop policy if exists "Images are publicly accessible." on storage.objects;
drop policy if exists "Anyone can upload images." on storage.objects;
drop policy if exists "Anyone can update images." on storage.objects;
drop policy if exists "Anyone can delete images." on storage.objects;

create policy "Images are publicly accessible." on storage.objects for select using (bucket_id = 'quiz-images');
create policy "Anyone can upload images." on storage.objects for insert with check (bucket_id = 'quiz-images');
create policy "Anyone can update images." on storage.objects for update using (bucket_id = 'quiz-images');
create policy "Anyone can delete images." on storage.objects for delete using (bucket_id = 'quiz-images');

grant usage on schema public to anon, authenticated, service_role;
grant all on all tables in schema public to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
