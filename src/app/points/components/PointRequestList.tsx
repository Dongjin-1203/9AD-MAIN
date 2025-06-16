import { Collapse, ConfigProvider, Empty } from 'antd';
import { PointRequestCard } from '.';
import { useMemo } from 'react';
import { fetchPendingPoints } from '@/app/actions';

type PointRequestListProps = {
  data: Awaited<ReturnType<typeof fetchPendingPoints>>;
};

export function PointRequestList({ data }: PointRequestListProps) {
  const items = useMemo(() => {
    if (!data) return [];
    return [
      {
        key: 'requested',
        label: `상벌점 승인 요청 내역 (${data.length})`,
        children: data.map((d) => <PointRequestCard key={d.id} pointId={String(d.id)} />),
      },
    ];
  }, [data]);

  return (
    <div>
      <ConfigProvider
        theme={{
          components: {
            Collapse: {
              headerBg: '#ffffff',
              contentPadding: '0px 0px',
              contentBg: 'rgba(0, 0, 0, 0)',
            },
          },
        }}
      >
        <Collapse items={items} defaultActiveKey={['requested']} />
      </ConfigProvider>
    </div>
  );
}
