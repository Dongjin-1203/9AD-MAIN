'use client';

import { fetchPendingPoints, verifyPoint } from '@/app/actions/points';
import { useEffect, useState } from 'react';
import { Button, Input, Card, message } from 'antd';

export default function ApprovalPage() {
  const [points, setPoints] = useState<any[]>([]);

  useEffect(() => {
    fetchPendingPoints().then(setPoints);
  }, []);

  const handleApprove = async (id: string) => {
    const { message: msg } = await verifyPoint(id, true);
    msg ? message.error(msg) : message.success('승인 완료');
  };

  const handleReject = async (id: string, reason: string) => {
    if (!reason) return message.warning('반려 사유를 입력해주세요');
    const { message: msg } = await verifyPoint(id, false, reason);
    msg ? message.error(msg) : message.success('반려 완료');
  };

  return (
    <div className='flex flex-col gap-4'>
      {points.map((p) => (
        <Card key={p.id} title={`${p.receiver_id} → ${p.giver_id} (${p.value}점)`}>
          <p>사유: {p.reason}</p>
          <p>일자: {new Date(p.given_at).toLocaleDateString()}</p>
          <div className='flex gap-2 mt-2'>
            <Button type='primary' onClick={() => handleApprove(p.id)}>승인</Button>
            <Input
              placeholder='반려 사유'
              onChange={(e) => (p.rejectReason = e.target.value)}
            />
            <Button danger onClick={() => handleReject(p.id, p.rejectReason)}>반려</Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
