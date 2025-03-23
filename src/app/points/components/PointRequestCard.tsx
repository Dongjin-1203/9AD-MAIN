'use client';

import { fetchPoint, verifyPoint } from '@/app/actions';
import {
  ArrowRightOutlined,
  CheckOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Input,
  Modal,
  Popconfirm,
  Skeleton,
  message,
} from 'antd';
import moment from 'moment';
import { useRouter } from 'next/navigation';
import {
  ChangeEventHandler,
  useCallback,
  useLayoutEffect,
  useState,
} from 'react';

export type PointRequestCardProps = {
  pointId: string;
};

export function PointRequestCard({ pointId }: PointRequestCardProps) {
  const router = useRouter();
  const [point, setPoint] = useState<
    Awaited<ReturnType<typeof fetchPoint>> | undefined
  >(undefined);
  const [loading, setLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectError, setRejectError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean | null>(null);
  const [modalShown, setModalShown] = useState(false);

  const handleConfirm = useCallback(
    (value: boolean) => () => {
      if (success != null) {
        return;
      }
      if (value) {
        setLoading(true);
        return verifyPoint(pointId, value)
          .then(({ message: newMessage }) => {
            if (newMessage) {
              return message.error(newMessage);
            }
            setSuccess(true);
            message.success('부여했습니다');
          })
          .finally(() => {
            setLoading(false);
            router.refresh();
          });
      } else {
        setModalShown(true);
      }
    },
    [pointId, success, router],
  );

  const handleReject = useCallback(() => {
    if (rejectReason.trim() === '') {
      return setRejectError('반려 사유를 입력해주세요');
    }
    setLoading(true);
    verifyPoint(pointId, false, rejectReason)
      .then(({ message: newMessage }) => {
        if (newMessage) {
          return message.error(newMessage);
        }
        setModalShown(false);
        setSuccess(true);
        message.success('반려했습니다');
        setRejectError(null);
      })
      .finally(() => {
        setLoading(false);
        router.refresh();
      });
  }, [pointId, rejectReason, router]);

  useLayoutEffect(() => {
    fetchPoint(pointId).then((data) => {
      setPoint(data);
    });
  }, [pointId]);

  return (
    <>
    {success === null && (
      <Card
        className={success != null ? 'line-through' : ''}
        style={{ backgroundColor: success == null ? '#A7C0FF' : '#D9D9D9' }}
        size='small'
        title={
          point != null ? (
            <div className='flex flex-row justify-between items-center'>
              <div className='flex flex-row align-middle'>
                <p>{point.giver}</p>
                <ArrowRightOutlined className='mx-2' />
                <p>{point.receiver}</p>
              </div>
              <p>{`${point?.value ?? 0}점`}</p>
            </div>
          ) : null
        }
      >
        <Skeleton
          active
          paragraph={{ rows: 0 }}
          loading={point == null}
        >
          <div className='flex flex-row'>
            <div className='flex-1'>
              {point?.given_at
                ? moment(point.given_at).local().format('YYYY년 MM월 DD일')
                : null}
              <p>{point?.reason}</p>
            </div>
            <Popconfirm
              className='mx-2'
              title='부여하겠습니까?'
              okText='부여'
              cancelText='취소'
              onConfirm={handleConfirm(true)}
            >
              <Button
                type='primary'
                icon={<CheckOutlined key='confirm' />}
                loading={loading}
                disabled={success != null}
              />
            </Popconfirm>
            <Popconfirm
              className='mx-2'
              title='반려하겠습니까?'
              okText='반려'
              cancelText='취소'
              onConfirm={handleConfirm(false)}
            >
              <Button
                danger
                icon={<CloseOutlined key='delete' />}
                loading={loading}
                disabled={success != null}
              />
            </Popconfirm>
          </div>
        </Skeleton>
      </Card>
    )}
      <Modal
        open={modalShown}
        confirmLoading={loading}
        okText='반려'
        okType='danger'
        onOk={handleReject}
        onCancel={useCallback(() => setModalShown(false), [])}
      >
        <div className='py-5'>
          <span>반려 사유를 입력해주세요</span>
          <Input.TextArea
            status={rejectError ? 'error' : undefined}
            showCount
            maxLength={1000}
            style={{ minHeight: 150 }}
            value={rejectReason}
            onChange={
              useCallback(
                (event) => setRejectReason(event.target.value),
                [],
              ) as ChangeEventHandler<HTMLTextAreaElement>
            }
          />
          {rejectError && <p className='text-red-400 mt-2'>{rejectError}</p>}
        </div>
      </Modal>
    </>
  );
}
