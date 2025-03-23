'use client';

import { listPoints } from '@/app/actions';
import { Card, Collapse, ConfigProvider, Row, Skeleton } from 'antd';
import moment from 'moment';
import { useMemo } from 'react';

export type UsedPointsListProps = {
  data: Awaited<ReturnType<typeof listPoints>>['usedPoints'];
};

export function UsedPointsList({
  data,
}: UsedPointsListProps) {
  
  const items = useMemo(() => {
    if (!data) return [];
    return [
      {
        key: 'unverified',
        label: `상점 사용 내역 (${data.length})`,
        children: data.map((p) => (
          <Card
          key={p.id}
          size='small'
          style={{ background: '#fac878' }}
          title={
            p != null ? (
              <div className='flex flex-row justify-between items-center'>
                <div className='flex flex-row align-middle'>
                  <p>
                    {p?.created_at
                      ? moment(p.created_at).local().format('YYYY년 MM월 DD일')
                      : null}
                  </p>
                  <p className='mx-2' />
                  <p>(발급자 : {p.recorder})</p>
                </div>
                <p>{`-${p?.value ?? 0}점`}</p>
              </div>
            ) : null
          }
        >
          <Skeleton
            active
            paragraph={{ rows: 0 }}
            loading={p == null}
          >
            <div className='flex flex-row'>
              <div className='flex-1'>
                
                <p>{p?.reason}</p>
              </div>
            </div>
          </Skeleton>
        </Card>
        ))
      },
    ];
  }, [data]);

  return (
    <ConfigProvider
      theme={{
        components: {
          Collapse: {
            headerBg: '#ffffff',
            contentPadding: '0px 0px',
            contentBg: 'rgba(0, 0, 0, 0)'
          },
        },
      }}
      >
      <Collapse items={items} />
    </ConfigProvider>
  );
}
