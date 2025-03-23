'use client';

import {
  fetchOvertimeSummary,
  fetchSoldier,
  redeemOvertime,
  searchEnlisted,
} from '@/app/actions';
import {
  App,
  AutoComplete,
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
} from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import { debounce } from 'lodash';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { checkIfNco } from './actions';

export default function UsePointFormPage() {
  const [form] = Form.useForm();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState<{ name: string; sn: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [availableOvertimes, setAvailableOvertimes] = useState<number | null>();
  const { message } = App.useApp();
  const [target, setTarget] = useState('')

  const renderPlaceholder = useCallback(
    ({ name, sn }: { name: string; sn: string }) => (
      <div className='flex flex-row justify-between'>
        <span className='text-black'>{name}</span>
        <span className='text-black'>{sn}</span>
      </div>
    ),
    [],
  );

  useLayoutEffect(() => {
    checkIfNco();
  }, []);

  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        setQuery(value);
      }, 300),
    [],
  );

  useEffect(() => {
    setSearching(true);
    searchEnlisted(query).then((value) => {
      setSearching(false);
      setOptions(value);
    });
  }, [query]);

  const handleSubmit = useCallback(
    async (newForm: any) => {
      await form.validateFields();
      setLoading(true);
      redeemOvertime({
        ...newForm,
        value: newForm.value*60,
      })
        .then(({ message: newMessage }) => {
          if (newMessage) {
            message.error(newMessage);
          } else {
            message.success('초과근무를 성공적으로 사용했습니다');
          }
          router.push('/overtimes');
        })
        .finally(() => {
          setLoading(false);
        });
    },
    [router, form, message],
  );

  return (
    <div className='px-4'>
      <div className='my-5' />
      <Form
        form={form}
        onFinish={handleSubmit}
      >
        <Form.Item
          name='givenAt'
          label='받은 날짜'
          colon={false}
          initialValue={dayjs().locale('ko')}
        >
          <DatePicker
            disabled
            picker='date'
            inputReadOnly
          />
        </Form.Item>
        <Form.Item<string>
          label={'사용 대상자' + (target !== '' ? `: ${target}` : '')}
          name={'userId'}
          rules={[
            { required: true, message: '대상자를 입력해주세요' },
            {
              pattern: /^[0-9]{2}-[0-9]{5,8}$/,
              message: '잘못된 군번입니다',
            },
          ]}
        >
          <AutoComplete
            options={options.map((t) => ({
              value: t.sn,
              label: renderPlaceholder(t),
            }))}
            onChange={async (value: string) => {
              const { overtime, usedOvertime } = await fetchOvertimeSummary(value);
              setAvailableOvertimes(Math.floor((overtime - usedOvertime)/60));
              await fetchSoldier(value).then((soldier) => setTarget(soldier.name))
            }}
            onSearch={debouncedSearch}
          >
            <Input.Search loading={searching} />
          </AutoComplete>
        </Form.Item>
        <Form.Item<number>
          name='value'
          rules={[
            { required: true, message: '사용할 초과근무 시간을 입력해주세요' },
            {
              validator: (_, value) => {
                if (value != null && availableOvertimes != null && value > availableOvertimes) {
                  return Promise.reject(new Error('입력 값이 사용 가능한 초과근무 시간을 초과했습니다.'));
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <InputNumber<number>
            min={1}
            controls
            addonAfter={
              availableOvertimes != null ? `/ ${availableOvertimes}시간` : '시간'
            }
            type='number'
            inputMode='numeric'
            onChange={(value) => {
              if(value != null && value == 8){
                form.setFieldValue('reason', '외출 사용')
              }
              else if(value != null && value == 16){
                form.setFieldValue('reason', '외박 사용')
              }
              else if(value != null && value % 24 == 0){
                form.setFieldValue('reason', `위로 휴가 ${Math.floor(value/24)}일 사용`)
              }
              else{
                form.setFieldValue('reason', null)
              }
            }}
          />
        </Form.Item>
        <Form.Item<string>
          name='reason'
          rules={[{ required: true, message: '지급이유를 입력해주세요' }]}
        >
          <Input.TextArea
            showCount
            maxLength={500}
            placeholder='초과근무 사용 이유'
            style={{ height: 150 }}
          />
        </Form.Item>
        <Form.Item>
          <Button
            ghost={false}
            htmlType='submit'
            type='primary'
            loading={loading}
          >
            사용하기
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
