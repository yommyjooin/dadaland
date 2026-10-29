import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Vercel 환경변수에 넣으면 빌드할 때 들어가요. 없으면 실시간 기능만 꺼지고 나머지는 그대로 동작해요.
const url = import.meta.env.PUBLIC_SUPABASE_URL as string | undefined;
const key = import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string | undefined;

export const supabase: SupabaseClient | null = url && key ? createClient(url, key) : null;
