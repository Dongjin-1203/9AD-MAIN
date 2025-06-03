'use client';

import { signIn } from '@/app/actions';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Form, Input, Checkbox } from 'antd';
import Image from 'next/image';
import Link from 'next/link';
import React, { useCallback, useState } from 'react';

export default function LoginClientPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false); // ✅ 자동 로그인 상태 추가

  const onSubmit = useCallback(async (form: any) => {
    setLoading(true);
    setError(null);
    const data = await signIn({
      sn: form?.sn,
      password: form?.password,
      rememberMe: rememberMe, // ✅ 전달
    });
    if (data?.message) {
      setError(data?.message);
    }
    setLoading(false);
  }, [rememberMe]);

  return (
    <div className='w-full h-dvh flex flex-col items-center justify-center gap-10'>
      <Image priority width={250} height={250} src='/images/flag.svg' alt='Divison Logo' />
      <h1 className='text-center font-black text-3xl'>The 9ood! M&D</h1>
      <Form onFinish={onSubmit} className='flex flex-col gap-2 w-full max-w-sm'>
        <Form.Item<string>
          name='sn'
          rules={[{ required: true, message: '군번을 입력해주세요' }]}
        >
          <Input
            type='text'
            placeholder='군번'
            prefix={<UserOutlined />}
            inputMode='numeric'
          />
        </Form.Item>
        <Form.Item<string>
          name='password'
          rules={[{ required: true, message: '비밀번호를 입력해주세요.' }]}
        >
          <Input.Password
            required
            placeholder='비밀번호'
            name='password'
            prefix={<LockOutlined />}
          />
        </Form.Item>

        {/* ✅ 자동 로그인 체크박스 */}
        <Form.Item>
          <Checkbox checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)}>
            자동 로그인
          </Checkbox>
        </Form.Item>

        {error && <p className='mb-3 text-red-400'>{error}</p>}
        <Button type='primary' loading={loading} htmlType='submit'>
          로그인
        </Button>

        <div className='flex flex-row mt-3 justify-center'>
          <Link href='/auth/forgotPassword' className='text-blue-300'>
            비밀번호 찾기
          </Link>
          <div className='mx-3 bg-gray-500 w-px' />
          <Link href='/auth/signup' className='text-blue-300'>
            회원가입
          </Link>
        </div>
      </Form>
    </div>
  );
}
