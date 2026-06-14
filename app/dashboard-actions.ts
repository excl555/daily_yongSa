'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';
import { TODAY } from '@/lib/quest-domain';

export async function updateQuestCompletion(questId: string, completed: boolean) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user || !questId) return;

  await supabase
    .from('daily_quests')
    .update({
      completed,
      completed_at: completed ? new Date().toISOString() : null
    })
    .eq('id', questId)
    .eq('user_id', user.id);

  revalidatePath('/');
}

export async function saveReflection(content: string) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return;

  const existing = await supabase
    .from('daily_reflections')
    .select('id')
    .eq('user_id', user.id)
    .eq('run_date', TODAY)
    .limit(1)
    .maybeSingle();

  if (existing.data?.id) {
    await supabase
      .from('daily_reflections')
      .update({ content, mood: 'calm' })
      .eq('id', existing.data.id)
      .eq('user_id', user.id);
  } else {
    await supabase.from('daily_reflections').insert({
      user_id: user.id,
      run_date: TODAY,
      user_label: 'account_user',
      content,
      mood: 'calm'
    });
  }

  revalidatePath('/');
}
