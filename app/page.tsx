import { DailyYongsaApp } from './daily-yongsa-app';
import { getDashboardState } from '@/lib/supabase-dashboard';

export default async function Page() {
  const initialState = await getDashboardState();

  return <DailyYongsaApp initialState={initialState} />;
}
