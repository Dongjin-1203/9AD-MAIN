'use client';

import { useEffect, useState } from 'react';
import { fetchPendingPoints, verifyPoint } from '@/app/actions/points';
import { Button, Input, Card, message } from 'antd';

export default function ApprovalPage() {
  const [points, setPoints] = useState<any[]>([]);
  const [reasons, setReasons] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchPendingPoints().then((data) => {
      if (data) setPoints(data);
    });
  }, []);

  const handleApprove = async (id: string) => {
    const res = await verifyPoint(id, true);
    if (res.message) {
      message.error(res.message);
    } else {
      message.success('승인 완료');
      setPoints((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const handleReject = async (id: string) => {
    const reason = reasons[id];
    if (!reason || reason.trim() === '') {
      return message.warning('반려 사유를 입력해주세요');
    }
    const res = await verifyPoint(id, false, reason);
    if (res.message) {
      message.error(res.message);
    } else {
      message.success('반려 완료');
      setPoints((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const updateReason = (id: string, value: string) => {
    setReasons((prev) => ({ ...prev, [id]: value }));
  };

  if (!points.length) {
    return <div className="text-center text-gray-500 mt-10">승인 대기 중인 상벌점이 없습니다.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {points.map((p) => (
        <Card
          key={p.id}
          title={`${p.giver} → ${p.receiver}`}
          className="shadow-md rounded-2xl"
        >
          <p><strong>점수:</strong> {p.value}</p>
          <p><strong>사유:</strong> {p.reason}</p>
          <p><strong>일자:</strong> {new Date(p.given_at).toLocaleDateString()}</p>
          <Input
            placeholder="반려 사유 입력"
            className="my-2"
            value={reasons[p.id] || ''}
            onChange={(e) => updateReason(p.id, e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button type="primary" onClick={() => handleApprove(p.id)}>
              승인
            </Button>
            <Button danger onClick={() => handleReject(p.id)}>
              반려
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
