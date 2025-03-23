'use client';

import { LoadingOutlined, QuestionOutlined } from '@ant-design/icons';
import { Card, FloatButton, Spin } from 'antd';
import { useState, useEffect } from 'react';
import { HelpModal, PasswordForm } from '../components';
import { currentSoldier } from '@/app/actions';

export default function ResetPasswordPage() {
  const [helpShown, setHelpShown] = useState(false);
  const [sn, setSn] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { sn } = await currentSoldier();
      setSn(sn);
    })();
  }, []);

  if (!sn) {
    return (
      <div className='flex flex-1 min-h-full justify-center items-center'>
        <Spin indicator={<LoadingOutlined spin />} />
      </div>
    );
  }

  return (
    <div className='flex flex-1 flex-col py-2 px-3'>
      <Card>
        <div className='pb-2'>
          비밀번호가 초기화되었습니다
        </div>
        <div>
          비밀번호를 변경하시기 바랍니다
        </div>
      </Card>
      <PasswordForm sn={sn!} force={true} />

      <FloatButton
        icon={<QuestionOutlined />}
        onClick={() => setHelpShown(true)}
      />
      <HelpModal
        shown={helpShown}
        onPressClose={() => setHelpShown(false)}
      />
    </div>
  );
}
