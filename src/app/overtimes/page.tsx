import { Soldier } from '@/interfaces';
import { PlusOutlined } from '@ant-design/icons';
import { Divider, FloatButton } from 'antd';
import { currentSoldier, fetchApproveOvertimes, fetchPendingOvertimes, fetchSoldier, listOvertimes} from '../actions';
import { hasPermission } from '../actions/utils';
import {
  OvertimeRequestList,
  OvertimeHistoryList,
  TotalOvertimeBox,
  UsedOvertimeList,
} from './components';
import { redirect } from 'next/navigation';

async function EnlistedPage({ user, page }: { user: Soldier; page: number }) {
  const { data, usedOvertimes } = await listOvertimes(user?.sn, page);
  return (
    <div className='flex flex-1 flex-col'>
      <TotalOvertimeBox user={user} />
      <div className='flex-1 mb-2'>
        <UsedOvertimeList data={usedOvertimes as any} />
        <OvertimeHistoryList
          type={user.type}
          data={data}
        />
      </div>
      <FloatButton
        icon={<PlusOutlined />}
        href='/overtimes/request'
      />
    </div>
  );
}

async function NcoPage({
  user,
  page,
  showRequest,
}: {
  user: Soldier;
  page: number;
  showRequest: boolean;
}) {
  const { data } = await listOvertimes(user?.sn, page);
  const request = await fetchPendingOvertimes();
  return (
    <div className='flex flex-1 flex-col'>
      <div className='flex-1 mb-2'>
        {showRequest && (
          <>
            <OvertimeRequestList type={'verify'} data={request}/>
          </>
        )}
        <OvertimeHistoryList
          type={user.type}
          data={data}
        />
      </div>
    </div>
  );
}

async function ApproverPage({
  user,
  page,
  showRequest,
}: {
  user: Soldier;
  page: number;
  showRequest: boolean;
}) {
  const { data } = await listOvertimes(user?.sn, page);
  const verify = await fetchPendingOvertimes();
  const approve = await fetchApproveOvertimes();
  return (
    <div className='flex flex-1 flex-col'>
      <div className='flex-1 mb-2'>
        {showRequest && (
          <>
            <OvertimeRequestList type={'approve'} data={approve}/>
          </>
        )}
        {showRequest && (
          <>
            <OvertimeRequestList type={'verify'} data={verify}/>
          </>
        )}
        <OvertimeHistoryList
          type={user.type}
          data={data}
        />
      </div>
    </div>
  )
}

export default async function ManagePointsPage({
  searchParams,
}: {
  searchParams: { sn?: string; page?: string };
}) {
  const [user, current] = await Promise.all([
    searchParams.sn ? fetchSoldier(searchParams.sn) : currentSoldier(),
    currentSoldier(),
  ]);
  const page = parseInt(searchParams?.page ?? '1', 10) || 1;

  if(searchParams.sn && !hasPermission(current.permissions, ['Admin', 'Commander', 'Approver'])){
    redirect('/overtimes')
  }
  if (user.type === 'enlisted') {
    return (
      <EnlistedPage
        user={user as any}
        page={page}
      />
    );
  }
  if (hasPermission(current.permissions, ['Approver'])){
    return (
      <ApproverPage
        user={user as any}
        page={page}
        showRequest={current.sn === user.sn}
      />
    )
  }
  return (
    <NcoPage
      user={user as any}
      page={page}
      showRequest={current.sn === user.sn}
    />
  );
}
