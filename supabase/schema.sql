-- 다다랜드 운영요원 앱: Supabase SQL Editor에서 한 번 실행하세요.

create table if not exists public.booth_status (
  booth text primary key,
  status text not null default 'ok' check (status in ('ok', 'busy', 'help')),
  note text,
  updated_by text,
  updated_at timestamptz not null default now()
);

create table if not exists public.breaks (
  name text primary key,
  state text not null check (state in ('out', 'back')),
  updated_at timestamptz not null default now()
);

create table if not exists public.notices (
  id bigint generated always as identity primary key,
  body text not null check (char_length(body) between 1 and 300),
  author text,
  created_at timestamptz not null default now()
);

-- 신입 탐정 번호: 이름 등 개인정보 없이 번호와 시각만 남겨요.
create table if not exists public.detectives (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now()
);

-- 행사 하루용 공개 앱이라 로그인 없이 읽고 쓰게 열어 둡니다.
-- QR은 운영요원 카드에만 들어가요. 행사가 끝나면 아래 '정리' 부분을 실행하세요.
alter table public.booth_status enable row level security;
alter table public.breaks enable row level security;
alter table public.notices enable row level security;
alter table public.detectives enable row level security;

-- 'Automatically expose new tables'를 끈 프로젝트에서도 앱이 쓸 수 있게 필요한 권한만 직접 줘요.
grant usage on schema public to anon, authenticated;
grant select, insert, update on public.booth_status to anon, authenticated;
grant select, insert, update on public.breaks to anon, authenticated;
grant select, insert on public.notices to anon, authenticated;
grant select, insert on public.detectives to anon, authenticated;

create policy "anyone read status"  on public.booth_status for select to anon, authenticated using (true);
create policy "anyone write status" on public.booth_status for insert to anon, authenticated with check (true);
create policy "anyone update status" on public.booth_status for update to anon, authenticated using (true) with check (true);

create policy "anyone read breaks"  on public.breaks for select to anon, authenticated using (true);
create policy "anyone write breaks" on public.breaks for insert to anon, authenticated with check (true);
create policy "anyone update breaks" on public.breaks for update to anon, authenticated using (true) with check (true);

create policy "anyone read notices" on public.notices for select to anon, authenticated using (true);
create policy "anyone post notices" on public.notices for insert to anon, authenticated with check (true);

create policy "anyone read detectives" on public.detectives for select to anon, authenticated using (true);
create policy "anyone get a number"    on public.detectives for insert to anon, authenticated with check (true);

-- 실시간 반영
alter publication supabase_realtime add table public.booth_status;
alter publication supabase_realtime add table public.breaks;
alter publication supabase_realtime add table public.notices;
alter publication supabase_realtime add table public.detectives;

-- 정리 (행사 후 실행): 쓰기를 막고 데이터만 남겨 둡니다.
-- drop policy "anyone write status" on public.booth_status;
-- drop policy "anyone update status" on public.booth_status;
-- drop policy "anyone write breaks" on public.breaks;
-- drop policy "anyone update breaks" on public.breaks;
-- drop policy "anyone post notices" on public.notices;
-- drop policy "anyone get a number" on public.detectives;
