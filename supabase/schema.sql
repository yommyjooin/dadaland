-- 다다랜드 운영요원 앱: Supabase SQL Editor에서 실행하세요. 여러 번 실행해도 안전해요.

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

drop policy if exists "anyone read status" on public.booth_status;
create policy "anyone read status" on public.booth_status for select to anon, authenticated using (true);
drop policy if exists "anyone write status" on public.booth_status;
create policy "anyone write status" on public.booth_status for insert to anon, authenticated with check (true);
drop policy if exists "anyone update status" on public.booth_status;
create policy "anyone update status" on public.booth_status for update to anon, authenticated using (true) with check (true);

drop policy if exists "anyone read breaks" on public.breaks;
create policy "anyone read breaks" on public.breaks for select to anon, authenticated using (true);
drop policy if exists "anyone write breaks" on public.breaks;
create policy "anyone write breaks" on public.breaks for insert to anon, authenticated with check (true);
drop policy if exists "anyone update breaks" on public.breaks;
create policy "anyone update breaks" on public.breaks for update to anon, authenticated using (true) with check (true);

drop policy if exists "anyone read notices" on public.notices;
create policy "anyone read notices" on public.notices for select to anon, authenticated using (true);
drop policy if exists "anyone post notices" on public.notices;
create policy "anyone post notices" on public.notices for insert to anon, authenticated with check (true);

drop policy if exists "anyone read detectives" on public.detectives;
create policy "anyone read detectives" on public.detectives for select to anon, authenticated using (true);
drop policy if exists "anyone get a number" on public.detectives;
create policy "anyone get a number" on public.detectives for insert to anon, authenticated with check (true);

-- 휴대폰 알림(웹 푸시) 구독. 앱(anon)은 아래 두 함수로만 저장·삭제하고, 목록은 서버(service_role)만 읽어요.
create table if not exists public.push_subs (
  endpoint text primary key,
  p256dh text not null,
  auth text not null,
  name text,
  level text not null default 'all' check (level in ('all', 'help')),
  updated_at timestamptz not null default now()
);
create table if not exists public.push_log (
  key text primary key,
  sent_at timestamptz not null default now()
);
alter table public.push_subs enable row level security;
alter table public.push_log enable row level security;

create or replace function public.save_push(p_endpoint text, p_p256dh text, p_auth text, p_name text, p_level text)
returns void language sql security definer set search_path = public as $$
  insert into public.push_subs (endpoint, p256dh, auth, name, level, updated_at)
  values (p_endpoint, p_p256dh, p_auth, nullif(p_name, ''), case when p_level = 'help' then 'help' else 'all' end, now())
  on conflict (endpoint) do update set p256dh = excluded.p256dh, auth = excluded.auth, name = excluded.name, level = excluded.level, updated_at = now();
$$;
create or replace function public.remove_push(p_endpoint text)
returns void language sql security definer set search_path = public as $$
  delete from public.push_subs where endpoint = p_endpoint;
$$;
-- 같은 알림을 짧은 시간에 여러 번 보내지 않게 (true면 보내도 됨)
create or replace function public.claim_push(p_key text, p_seconds int)
returns boolean language plpgsql security definer set search_path = public as $$
declare ok boolean;
begin
  insert into public.push_log (key, sent_at) values (p_key, now())
  on conflict (key) do update set sent_at = now()
    where public.push_log.sent_at < now() - make_interval(secs => p_seconds)
  returning true into ok;
  return coalesce(ok, false);
end $$;

revoke all on function public.save_push(text, text, text, text, text) from public;
revoke all on function public.remove_push(text) from public;
revoke all on function public.claim_push(text, int) from public;
grant execute on function public.save_push(text, text, text, text, text) to anon, authenticated;
grant execute on function public.remove_push(text) to anon, authenticated;
grant execute on function public.claim_push(text, int) to service_role;
grant usage on schema public to service_role;
grant select, insert, update, delete on public.push_subs to service_role;
grant select, insert, update on public.push_log to service_role;
grant select on public.booth_status, public.notices to service_role;

-- 실시간 반영
do $$ begin alter publication supabase_realtime add table public.booth_status; exception when duplicate_object then null; end $$;
do $$ begin alter publication supabase_realtime add table public.breaks; exception when duplicate_object then null; end $$;
do $$ begin alter publication supabase_realtime add table public.notices; exception when duplicate_object then null; end $$;
do $$ begin alter publication supabase_realtime add table public.detectives; exception when duplicate_object then null; end $$;

-- 정리 (행사 후 실행): 쓰기를 막고 데이터만 남겨 둡니다.
-- drop policy "anyone write status" on public.booth_status;
-- drop policy "anyone update status" on public.booth_status;
-- drop policy "anyone write breaks" on public.breaks;
-- drop policy "anyone update breaks" on public.breaks;
-- drop policy "anyone post notices" on public.notices;
-- drop policy "anyone get a number" on public.detectives;
