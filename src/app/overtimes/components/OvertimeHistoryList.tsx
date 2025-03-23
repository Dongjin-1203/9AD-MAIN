import { Collapse, ConfigProvider } from 'antd';
import { OvertimeCard } from './OvertimeCard';
import { useMemo } from 'react';

export type OvertimeHistoryListProps = {
  type: 'enlisted' | 'nco';
  data: {
    id: string;
    verified_at: Date | null;
    approved_at: Date | null;
    disapproved_at: Date | null;
    rejected_at: Date | null;
  } [];
};

export function OvertimeHistoryList({
  data,
  type,
}: OvertimeHistoryListProps) {
  const unverified = data?.filter((d) => d.verified_at === null && d.rejected_at === null) || [];
  const approved = data?.filter((d) => d.approved_at !== null) || [];
  const unapproved = data?.filter((d) => d.verified_at !== null && d.approved_at === null && d.disapproved_at === null) || [];
  const rejected = data?.filter((d) => d.disapproved_at !== null || d.rejected_at !== null) || [];

  const items = useMemo(() => {
    if (!data) return [];
    const newItems = [];

    if (type === 'enlisted') {
      newItems.push({
        key: 'unapproved',
        label: `초과근무 확인관 승인 대기 내역 (${unapproved.length})`,
        children: unapproved.map((d) => <OvertimeCard key={d.id} overtimeId={d.id} />),
      });
      newItems.push({
        key: 'unverified',
        label: `초과근무 지시자 승인 대기 내역 (${unverified.length})`,
        children: unverified.map((d) => <OvertimeCard key={d.id} overtimeId={d.id} />),
      });
    }

    newItems.push(
      {
        key: 'rejected',
        label: `초과근무 반려 내역 (${rejected.length})`,
        children: rejected.map((d) => <OvertimeCard key={d.id} overtimeId={d.id} />),
      },
      {
        key: 'approved',
        label: `초과근무 ${type === 'nco' ? '승인' : ''} 내역 (${approved.length})`,
        children: approved.map((d) => <OvertimeCard key={d.id} overtimeId={d.id} />),
      },
    );

    return newItems;
  }, [data, type, unverified, approved, unapproved, rejected]);

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
          defaultActiveKey={type === 'enlisted' ? ['unapproved', 'unverified', 'rejected'] : ['verified']}
        />
      </ConfigProvider>
    </div>
  );
}
