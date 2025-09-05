-- Feedback RLS Policies
-- Run this once in Supabase SQL editor.

alter table public."Feedback" enable row level security;

do $$ begin
  perform 1 from pg_policies where schemaname='public' and tablename='Feedback' and policyname='Feedback select for all';
  if not found then
    create policy "Feedback select for all" on public."Feedback"
      for select using (true);
  end if;
end $$;

do $$ begin
  perform 1 from pg_policies where schemaname='public' and tablename='Feedback' and policyname='Feedback insert for authenticated';
  if not found then
    create policy "Feedback insert for authenticated" on public."Feedback"
      for insert
      with check (auth.role() = 'authenticated');
  end if;
end $$;


