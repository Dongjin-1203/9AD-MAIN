import { Collapse, ConfigProvider } from 'antd';
import { OvertimeRequestCard } from '.';
import { useMemo } from 'react';
import { fetchApproveOvertimes, fetchPendingOvertimes } from '@/app/actions';

type OvertimeRequestListProps = {
  type: 'verify' | 'approve';
  data: Awaited<ReturnType<typeof fetchPendingOvertimes | typeof fetchApproveOvertimes>>;
};

export function OvertimeRequestList({ type, data }: OvertimeRequestListProps) {
  const items = useMemo(() => {
    if (!data) return [];
    return [
      {
        key: 'requested',
        label: `초과근무 ${type === 'verify' ? '지시자' : '확인관'} 승인 요청 내역 (${data.length})`,
        children: data.map((d) => (
          <OvertimeRequestCard key={d.id} overtimeId={d.id} type={type} />
        )),
      },
    ];
  }, [data, type]);

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
