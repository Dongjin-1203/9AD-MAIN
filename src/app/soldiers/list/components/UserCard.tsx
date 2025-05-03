import {fetchPointSummary } from '@/app/actions';
import { Card, Row } from 'antd';
import Link from 'next/link';
import { useLayoutEffect, useState } from 'react';

export type UserCardProps = {
  sn: string;
  name: string;
  type: string;
};

export function UserCard({ type, sn, name }: UserCardProps) {
  const [pointData, setPointData] = useState<number | null>(null)

  useLayoutEffect(() => {
    if(type === 'enlisted'){
      fetchPointSummary(sn).then((d) => setPointData(d.merit+d.demerit));
    }
  }, [type, sn]);

  return (
    <Link href={`/soldiers?sn=${sn}`}>
      <Card>
        <div className='flex flex-row items-center justify-between'>
          <Row>
            <p className='font-bold'>
              {type === 'enlisted' ? '용사' : '간부'} {name}
            </p>
            <p className='px-1'>
              {'(**-' + '*'.repeat(sn.length - 6) + sn.slice(-3) + ')'}
            </p>
          </Row>
          {type === 'enlisted'? <Row className='font-bold'>
            <p style={pointData! < 0 ? {color: '#cf1322'} : {color: '#3f8600'}}>{pointData}점</p>
            <p className='px-1'>{'|'}</p>
          </Row>
          : null}
        </div>
      </Card>
    </Link>
  );
}
