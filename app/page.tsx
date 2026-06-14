import { redirect } from 'next/navigation';
import { DailyYongsaApp } from './daily-yongsa-app';
import { getDashboardState } from '@/lib/supabase-dashboard';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const initialState = await getDashboardState(user.id);

  return <DailyYongsaApp initialState={initialState} userEmail={user.email || '계정'} />;
}
