'use client';
import { fetchPointSummary } from '@/app/actions';
import { Soldier } from '@/interfaces';
import { CheckOutlined, DislikeOutlined, FileDoneOutlined, LikeOutlined } from '@ant-design/icons';
import { Card, Row, Skeleton, Statistic } from 'antd';
import { useLayoutEffect, useState } from 'react';

export function TotalPointBox({ user }: { user: Soldier }) {
  const [data, setData] = useState<Awaited<
    ReturnType<typeof fetchPointSummary>
  > | null>(null);

  useLayoutEffect(() => {
    fetchPointSummary(user.sn).then(setData);
  }, [user.sn]);

  return (
    <div>
      <Row>
        <Card className='flex-1' size='small'>
          <Skeleton
            paragraph={{ rows: 1 }}
            active
            loading={data == null}
            >
            {data ? (
              <Statistic
              title='상점'
                value={`${data.merit}점`}
                prefix={<LikeOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            ) : null}
          </Skeleton>
        </Card>
        <Card className='flex-1' size='small'>
          <Skeleton
            paragraph={{ rows: 1 }}
            active
            loading={data == null}
            >
            {data ? (
              <Statistic
                title='벌점'
                value={`${-data.demerit}점`}
                prefix={<DislikeOutlined />}
                valueStyle={{ color: '#cf1322' }}
                />
              ) : null}
          </Skeleton>
        </Card>
      </Row>
      <Row>
        <Card className='flex-1' size='small'>
          <Skeleton
            paragraph={{ rows: 1 }}
            active
            loading={data == null}
            >
            {data ? (
              <Statistic
                title='사용한 상점'
                value={`${data.usedMerit}점`}
                prefix={<FileDoneOutlined />}
                valueStyle={{ color: '#f7bc19' }}
                />
            ) : null}
          </Skeleton>
        </Card>
        <Card className='flex-1' size='small'>
          <Skeleton
            paragraph={{ rows: 1 }}
            active
            loading={data == null}
            >
            {data ? (
              <Statistic
              title='사용가능 상점'
              value={`${data.merit + data.demerit - data.usedMerit}점`}
                prefix={<CheckOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            ) : null}
          </Skeleton>
        </Card>
      </Row>
    </div>
  );
}
