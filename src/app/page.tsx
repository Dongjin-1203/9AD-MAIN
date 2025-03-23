import { 
  currentSoldier, 
  fetchOvertimesCountsEnlisted, 
  fetchOvertimesCountsNco, 
  fetchPointsCountsEnlisted, 
  fetchPointsCountsNco,
  fetchUnverifiedSoldiersCount,
  hasPermission 
} from "./actions";
import { TotalPointBox } from "./points/components";
import { Card, Divider } from "antd";
import Link from "next/link";
import { TotalOvertimeBox } from "./overtimes/components";

export default async function Home() {
  const user = await currentSoldier();

  if(user.type == 'nco'){
    const {verified, pending, rejected} = await fetchPointsCountsNco();
    const needVerify = await fetchUnverifiedSoldiersCount()
    const { needApprove, pending:pendingOvertimes, rejected: rejectedOvertimes } = await fetchOvertimesCountsNco();
    return (
      <div>
        {hasPermission(user.permissions, ['Admin', 'Commander', 'UserAdmin']) ?
        <div>
          <Link href={'/soldiers/signup'}>
            <Card className='my-1 mx-1' size='small'>
              <div className='flex flex-row items-center justify-between'>
                <p className='font-bold'> 회원가입 승인 요청 </p>
                <p className='font-bold'> { needVerify } 건 </p>
              </div>
            </Card>
          </Link>
          <Divider style={{margin: '10px 0px'}}/>
        </div> : null}
        <Link href={`/points`}>
          <Card className='my-1 mx-1' size='small'>
            <div className='flex flex-row items-center justify-between'>
              <p className='font-bold'> 승인한 상벌점 요청 </p>
              <p className='font-bold'> { verified } 건 </p>
            </div>
          </Card>
          <Card className='my-1 mx-1' size='small'>
            <div className='flex flex-row items-center justify-between'>
              <p className='font-bold'> 승인 대기중인 상벌점 요청 </p>
              <p className='font-bold'> { pending } 건 </p>
            </div>
          </Card>
          <Card className='my-1 mx-1' size='small'>
            <div className='flex flex-row items-center justify-between'>
              <p className='font-bold'> 반려한 상벌점 요청 </p>
              <p className='font-bold'> { rejected } 건 </p>
            </div>
          </Card>
        </Link>
        <Divider style={{margin: '10px 0px'}}/>
        <Link href={'/overtimes'}>
          {hasPermission(user.permissions, ['Approver']) ?
          <Card className='my-1 mx-1' size='small'>
            <div className='flex flex-row items-center justify-between'>
              <p className='font-bold'> 확인관 승인 대기중인 초과근무 요청 </p>
              <p className='font-bold'> { needApprove } 건 </p>
            </div>
          </Card>: null}
          <Card className='my-1 mx-1' size='small'>
            <div className='flex flex-row items-center justify-between'>
              <p className='font-bold'> 지시자 승인 대기중인 초과근무 요청 </p>
              <p className='font-bold'> { pendingOvertimes } 건 </p>
            </div>
          </Card>
          <Card className='my-1 mx-1' size='small'>
            <div className='flex flex-row items-center justify-between'>
              <p className='font-bold'> 반려한 초과근무 요청 </p>
              <p className='font-bold'> { rejectedOvertimes } 건 </p>
            </div>
          </Card>
        </Link>
      </div>
    );
  } else {
    const { verified:_, pending: pendingPoints, rejected: rejectedPoints } = await fetchPointsCountsEnlisted();
    const { needApprove, pending:pendingOvertimes, rejected: rejectedOvertimes } = await fetchOvertimesCountsEnlisted();
    return (
      <div>
        <Link href={`/points`}>
          <TotalPointBox user={user as any}/>
          <Card className='my-1 mx-1' size='small'>
            <div className='flex flex-row items-center justify-between'>
              <p className='font-bold'> 승인 대기중인 상벌점 요청 </p>
              <p className='font-bold'> { pendingPoints } 건 </p>
            </div>
          </Card>
          <Card className='my-1 mx-1' size='small'>
            <div className='flex flex-row items-center justify-between'>
              <p className='font-bold'> 반려된 상벌점 요청 </p>
              <p className='font-bold'> { rejectedPoints } 건 </p>
            </div>
          </Card>
        </Link>
        <Divider style={{margin: '10px 0px'}}/>
        <Link href={'/overtimes'}>
          <TotalOvertimeBox user={user as any}/>
          <Card className='my-1 mx-1' size='small'>
            <div className='flex flex-row items-center justify-between'>
              <p className='font-bold'> 확인관 승인 대기중인 초과근무 요청 </p>
              <p className='font-bold'> { needApprove } 건 </p>
            </div>
          </Card>
          <Card className='my-1 mx-1' size='small'>
            <div className='flex flex-row items-center justify-between'>
              <p className='font-bold'> 지시자 승인 대기중인 초과근무 요청 </p>
              <p className='font-bold'> { pendingOvertimes } 건 </p>
            </div>
          </Card>
          <Card className='my-1 mx-1' size='small'>
            <div className='flex flex-row items-center justify-between'>
              <p className='font-bold'> 반려된 초과근무 요청 </p>
              <p className='font-bold'> { rejectedOvertimes } 건 </p>
            </div>
          </Card>
        </Link>
      </div>
    );
  }
}
