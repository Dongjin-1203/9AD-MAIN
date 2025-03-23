'use client';

import { deleteOvertime, fetchOvertime } from '@/app/actions';
import { ArrowRightOutlined, DeleteOutlined } from '@ant-design/icons';
import { Button, Card, Popconfirm, Skeleton, message } from 'antd';
import moment from 'moment';
import { useRouter } from 'next/navigation';
import { useCallback, useLayoutEffect, useState } from 'react';

export type OvertimeCardProps = {
  overtimeId: string;
};

export function OvertimeCard({ overtimeId }: OvertimeCardProps) {
  const router = useRouter();
  const [overtime, setPoint] = useState<
    Awaited<ReturnType<typeof fetchOvertime>> | undefined
  >(undefined);
  const [deleted, setDeleted] = useState(false);

  const onDelete = useCallback(() => {
    deleteOvertime(overtimeId).then(({ message: newMessage }) => {
      if (newMessage == null) {
        message.success('삭제하였습니다');
        setDeleted(true);
        router.push('/overtimes')
      } else {
        message.error(newMessage);
      }
    });
  }, [overtimeId, router]);

  useLayoutEffect(() => {
    fetchOvertime(overtimeId).then((data) => {
      setPoint(data);
    });
  }, [overtimeId]);

  const backgroundColor = (() => {
    if (overtime == null) {
      return undefined;
    }
    if (overtime.approved_at) {
      if (overtime.value < 0) {
        return '#ff4a4a'
      }
      return '#98e39a'
    }
    if (overtime.verified_at) {
      if (overtime.value < 0) {
        return '#ed8429';
      }
      return '#A7C0FF';
    }
    if (overtime.rejected_at || overtime.rejected_reason || overtime.disapproved_at || overtime.disapproved_reason) {
      return '#ED2939';
    }
    return '#D9D9D9';
  })();
  

  return (
    <Card
      className={deleted ? 'line-through' : ''}
      size='small'
      style={{ backgroundColor }}
      title={
        overtime != null ? (
          <div className='flex flex-row justify-between items-center'>
            <div className='flex flex-row align-middle'>
              <p>{overtime.giver}</p>
              <ArrowRightOutlined className='mx-2' />
              <p>{overtime.receiver}</p>
              <p className='mx-2' />
              <p>(확인관 : {overtime.approver})</p>
            </div>
            <p>{`${Math.floor(overtime?.value/60)}시간 ${overtime?.value%60}분`}</p>
          </div>
        ) : null
      }
    >
      <Skeleton
        active
        paragraph={{ rows: 0 }}
        loading={overtime == null}
      >
        <div className='flex flex-row'>
          <div className='flex-1'>
            {overtime?.rejected_reason && (
              <p>반려 사유: {overtime?.rejected_reason}</p>
            )}
            <p>
              {
                moment(overtime?.started_at).format('YYYYMMDD') === moment(overtime?.ended_at).format('YYYYMMDD') ?
                  `${moment(overtime?.started_at).format('YYYY년 MM월 DD일 HH:mm')} ~ ${moment(overtime?.ended_at).format('HH:mm')}` :
                  `${moment(overtime?.started_at).format('YYYY년 MM월 DD일 HH:mm')} ~ ${moment(overtime?.ended_at).format('YYYY년 MM월 DD일 HH:mm')}`
              }
            </p>
            <p>{overtime?.reason}</p>
          </div>
          {overtime?.verified_at || overtime?.approved_at ? null : (
            <Popconfirm
              title='삭제하시겠습니까?'
              okText='삭제'
              cancelText='취소'
              onConfirm={onDelete}
            >
              <Button
                danger
                icon={<DeleteOutlined key='delete' />}
              />
            </Popconfirm>
          )}
        </div>
      </Skeleton>
    </Card>
  );
}
