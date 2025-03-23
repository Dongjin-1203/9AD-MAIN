'use server';

import { currentSoldier } from '@/app/actions';
import { redirect } from 'next/navigation';

export async function checkIfNco() {
  const data = await currentSoldier();
  if (data?.type === 'enlisted') {
    redirect('/points/request');
  }
}
