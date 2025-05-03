'use client';

import { signUp } from '@/app/actions';
import { LeftOutlined, LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Divider, Form, Input, Radio, message } from 'antd';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { withMask } from 'use-mask-input';
import { SignUpForm } from './interfaces';

export default function SignUpPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onFinish = useCallback(async (form: SignUpForm) => {
    if (form.password === form.sn) {
      return setError('비밀번호는 군번일 수 없습니다')
    }
    if (form.password !== form.passwordConfirmation) {
      return setError('비밀번호를 다시 한번 확인해주세요');
    }
    setLoading(true);
    const data = await signUp(form);
    if (data) {
      message.error(data.message);
    }
    setLoading(false);
  }, []);

  return (
    <div className='flex flex-1 flex-col p-5'>
      <Form onFinish={onFinish}>
        <div className='flex flex-row items-center'>
          <LeftOutlined
            className='mr-3 text-xl'
            onClick={() => router.back()}
          />
          <h1 className='text-3xl font-bold'>환영합니다!</h1>
        </div>
        <Divider />
        <div className='flex flex-row'>
          <Form.Item<string>
            name='type'
            initialValue='enlisted'
          >
            <Radio.Group>
              <Radio.Button value='enlisted'>용사</Radio.Button>
              <Radio.Button value='nco'>간부</Radio.Button>
            </Radio.Group>
          </Form.Item>
          <div className='mx-2' />
          <Form.Item<string>
            name='sn'
            rules={[{ required: true, message: '군번을 입력해주세요' }]}
            style={{ flex: 1 }}
          >
            <Input
              type='text'
              placeholder='군번'
              prefix={<UserOutlined />}
              inputMode='numeric'
            />
          </Form.Item>
        </div>
        <Form.Item<string>
          name='unit'
          initialValue='headquarters'
        >
          <Radio.Group className='flex flex-1'>
              <Radio.Button value='headquarters'>본부</Radio.Button>
              <Radio.Button value='security'>경비</Radio.Button>
              <Radio.Button value='ammunition'>탄약</Radio.Button>
              <Radio.Button value='staff'>참모</Radio.Button>
              <Radio.Button value={null}>미분류</Radio.Button>
          </Radio.Group>
        </Form.Item>
        <Form.Item<string>
          name='name'
          rules={[{ required: true, message: '이름을 입력해주세요' }]}
          style={{ flex: 1 }}
        >
          <Input
            placeholder='이름'
            prefix={<UserOutlined />}
          />
        </Form.Item>
        <Form.Item<string>
          name='password'
          rules={[
            { required: true, message: '비밀번호를 입력해주세요' },
            { min: 6, message: '최소 6자리 입니다' },
            { max: 30, message: '최대 30자리 입니다' },
          ]}
          style={{ flex: 1 }}
        >
          <Input.Password
            maxLength={30}
            placeholder='비밀번호'
            prefix={<LockOutlined />}
          />
        </Form.Item>
        <Form.Item<string>
          name='passwordConfirmation'
          rules={[{ required: true, message: '비밀번호를 재입력해주세요' }]}
          style={{ flex: 1 }}
        >
          <Input.Password
            placeholder='비밀번호 재입력'
            prefix={<LockOutlined />}
          />
        </Form.Item>
        {error && <p className='text-red-400 mb-2'>{error}</p>}
        <Form.Item>
          <Button
            htmlType='submit'
            type='primary'
            loading={loading}
          >
            회원가입
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
