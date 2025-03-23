import { Button, Result } from 'antd';

export default function NeedVerificationPage() {
  return (
    <div className='flex flex-col flex-1 justify-center items-center'>
      <Result
        status='success'
        title='회원 가입에 성공하였습니다!'
        subTitle='인사담당자의 승인이 필요합니다. 승인을 받았다면 로그아웃 후 재로그인 해주세요'
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
