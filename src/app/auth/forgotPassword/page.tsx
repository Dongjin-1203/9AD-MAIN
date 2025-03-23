import { Button, Result } from 'antd';

export default function ForgotPasswordPage() {
  return (
    <div className='flex flex-col flex-1 justify-center items-center'>
      <Result title='비밀번호를 잊어버린 경우, 인사담당자에게 문의해주시길 바랍니다' />
      <Button
        type='primary'
        href='/auth/login'
      >
        돌아가기
      </Button>
    </div>
  );
}
