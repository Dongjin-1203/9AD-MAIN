import { listUnverifiedSoldiers } from '@/app/actions';
import { UnverifiedUserCardList } from './components';
import { Empty } from 'antd';


export default async function ManageSignUpPage() {
  const { message, data } = await listUnverifiedSoldiers();

  if (data?.length === 0) {
    return (
      <div className='py-5 my-5'>
        <Empty
          description={<p>회원 가입 승인 요청이 없습니다</p>}
        />
      </div>
    );
  }
  return (
    <UnverifiedUserCardList
      data={data}
      message={message}
    />
  );
}
