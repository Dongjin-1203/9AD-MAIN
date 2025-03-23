'use client';

import { resetPassword } from '@/app/actions';
import { App, Button, Form, FormInstance, Input } from 'antd';
import { useRouter } from 'next/navigation';
import { useCallback, useRef, useState } from 'react';

export type PasswordFormProps = { sn: string, force: boolean };

export function PasswordForm({ sn, force }: PasswordFormProps) {
  const router = useRouter();
  const formRef = useRef<FormInstance | null>(null);
  const { notification } = App.useApp();
  const [mutating, setMutating] = useState(false);

  const handlePasswordForm = useCallback(() => {
    resetPassword({
      sn,
      oldPassword: force ? sn : formRef.current?.getFieldValue('password') as string,
      newPassword: formRef.current?.getFieldValue('newPassword') as string,
      confirmation: formRef.current?.getFieldValue('newPasswordConfirmation') as string,
    })
    .then(({ message }) => {
      if (message) {
        notification.error({
          message: '비밀번호 변경 실패',
          description: message,
        });
        formRef.current?.resetFields();
      } else {
        notification.success({
          message: '비밀번호 변경 성공',
          description: '비밀번호를 변경하였습니다',
        });
        if (force) {
          router.push('/');
        }
      }
    })
    .finally(() => {
      setMutating(false);
    });
  }, [notification, sn, force, router]);

  return (
    <Form
      name='password'
      ref={formRef}
      onFinish={handlePasswordForm}
    >
      {force ? null : 
      <Form.Item
        label='현재 비밀번호'
        name='password'
        required
      >
        <Input.Password />
      </Form.Item>}
      
      <Form.Item
        label='새 비밀번호'
        name='newPassword'
        rules={[
          { required: true, message: '비밀번호를 입력해주세요' },
          { min: 6, message: '최소 6자리 입니다' },
          { max: 30, message: '최대 30자리 입니다' },
        ]}
      >
        <Input.Password />
      </Form.Item>
      <Form.Item
        label='새 비밀번호 재입력'
        name='newPasswordConfirmation'
        required
      >
        <Input.Password />
      </Form.Item>
      <Form.Item>
        <Button
          type='primary'
          htmlType='submit'
          loading={mutating}
        >
          변경
        </Button>
      </Form.Item>
    </Form>
  );
}
