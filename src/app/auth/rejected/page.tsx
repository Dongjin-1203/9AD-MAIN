import { Button, Result } from 'antd';

export default function SignupRejectedPage() {
  return (
    <div className='flex flex-col flex-1 justify-center items-center'>
      <Result
        status='error'
        title='회원 가입이 반려되었습니다!'
        subTitle='인사담당자에게 문의해주세요'
      />
      <Button
        danger
        type='primary'
        href='/auth/logout'
      >
        로그아웃
      </Button>
    </div>
  );
}
