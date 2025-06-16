import { Collapse, ConfigProvider } from 'antd';
import { PointCard } from './PointCard';
import { useMemo } from 'react';

export type PointsHistoryListProps = {
  type: 'enlisted' | 'nco';
  data: { id: number; status: 'pending' | 'approved' | 'rejected' }[];
};

export function PointsHistoryList({ data, type }: PointsHistoryListProps) {
  const pending = data?.filter((d) => d.status === 'pending') || [];
  const approved = data?.filter((d) => d.status === 'approved') || [];
  const rejected = data?.filter((d) => d.status === 'rejected') || [];

  const items = useMemo(() => {
    const enlistedItems = [];

    if (type === 'enlisted') {
      enlistedItems.push({
        key: 'pending',
        label: `상벌점 요청 내역 (${pending.length})`,
        children: pending.map((d) => <PointCard key={d.id} pointId={String(d.id)} />),
      });
    }

    enlistedItems.push(
      {
        key: 'rejected',
        label: `상벌점 반려 내역 (${rejected.length})`,
        children: rejected.map((d) => <PointCard key={d.id} pointId={String(d.id)} />),
      },
      {
        key: 'approved',
        label: `상벌점 ${type === 'nco' ? '승인' : ''} 내역 (${approved.length})`,
        children: approved.map((d) => <PointCard key={d.id} pointId={String(d.id)} />),
      },
    );

    return enlistedItems;
  }, [type, pending, approved, rejected]);

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
        <Collapse
          items={items}
          defaultActiveKey={type === 'enlisted' ? ['pending', 'rejected'] : ['approved']}
        />
      </ConfigProvider>
    </div>
  );
}
