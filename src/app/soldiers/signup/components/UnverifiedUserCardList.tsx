'use client';

import { App } from 'antd';
import { useEffect } from 'react';
import { UnverifiedUserCard } from './UnverifiedUserCard';

export type UnverifiedUserCardListProps = {
  message?: string | null;
  data?: { name: string; sn: string; type: 'enlisted' | 'nco' }[] | null;
};

export function UnverifiedUserCardList({
  data,
  message,
}: UnverifiedUserCardListProps) {
  const { notification } = App.useApp();

  useEffect(() => {
    if (message) {
      notification.error({ message: '오류', description: message });
    }
  }, [message, notification]);

  return data?.map((d) => (
    <UnverifiedUserCard
      key={d.sn}
      {...d}
    />
  ));
}
