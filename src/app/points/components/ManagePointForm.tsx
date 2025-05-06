'use client';

import {
  createPoint,
  searchEnlisted,
  searchNco,
} from '@/app/actions';
import {
  App,
  AutoComplete,
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Select,
} from 'antd';
import locale from 'antd/es/date-picker/locale/ko_KR';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { debounce } from 'lodash';
import { checkIfNco } from '../give/actions';
import { UnitSelect } from '../components/UnitSelect';
import type { UnitType } from '../components/UnitSelect'; // 중대 선택


export type ManagePointFormProps = {
  type: 'request' | 'give';
};

export function ManagePointForm({ type }: ManagePointFormProps) {
  const [merit, setMerit] = useState(1);
  const [form] = Form.useForm();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState<{ name: string; sn: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const { message } = App.useApp();
  const [target, setTarget] = useState('')
  const [selectedUnit, setSelectedUnit] = useState<UnitType | undefined>(undefined);



  const renderPlaceholder = useCallback(
    ({ name, sn }: { name: string; sn: string }) => (
      <div className='flex flex-row justify-between'>
        <span className='text-black'>{name}</span>
        <span className='text-black'>{sn}</span>
      </div>
    ),
    [],
  );

  useEffect(() => {
    if (type === 'give') {
      checkIfNco();
    }
  }, [type]);

  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        setQuery(value);
      }, 300),
    [],
  );

  const handleSearch = (value: string) => {
    debouncedSearch(value);
  };

  useEffect(() => {
    setSearching(true);
    const searchFn = type === 'request' ? searchNco : searchEnlisted;
  
    searchFn(query, selectedUnit).then((value) => {
      setSearching(false);
      setOptions(value);
    });
  }, [query, type, selectedUnit]);

  const handleSubmit = useCallback(
    async (newForm: any) => {
      await form.validateFields();
      setLoading(true);
      createPoint({
        ...newForm,
        value: merit * newForm.value,
        givenAt: (newForm.givenAt.$d as Date),
      })
        .then(({ message: newMessage }) => {
          if (newMessage) {
            message.error(newMessage);
          } else {
            message.success(
              type === 'request'
                ? '상벌점 요청을 성공적으로 했습니다'
                : '상벌점을 성공적으로 부여했습니다',
            );
            router.push('/points');
          }
        })
        .finally(() => {
          setLoading(false);
        });
    },
    [router, merit, form, message, type],
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
          rules={[{ required: true, message: '받은 날짜를 입력해주세요' }]}
        >
          <DatePicker
            placeholder='상벌점을 받은 날짜를 선택해주세요'
            picker='date'
            inputReadOnly
            locale={locale}
          />
        </Form.Item>
        <Form.Item
          label="중대 선택"
          colon={false}
        >
          <UnitSelect onChange={setSelectedUnit} />
        </Form.Item>
        <Form.Item<string>
          label={(type === 'request' ? '수여자' : '수령자') + (target !== '' ? `: ${target}` : '')}
          name={type === 'request' ? 'giverId' : 'receiverId'}
          rules={[
            { required: true, message: `${type === 'request' ? '수여자' : '수령자'}를 입력해주세요` },
            { pattern: /^[0-9]{2}-[0-9]{5,8}$/, message: '잘못된 군번입니다' },
          ]}
        >
          <AutoComplete
            onSearch={handleSearch} // Debounced search handler
            options={options.map((t) => ({
              value: t.sn,
              label: renderPlaceholder(t),
            }))}
            onChange={(value) => {
              const selectedOption = options.find((t) => t.sn === value);
              if (selectedOption) {
                setTarget(selectedOption.name); // 선택된 sn에 대응하는 name 설정
              }
              else {
                setTarget('')
              }
            }}
            getPopupContainer={c => c.parentElement}
          >
            <Input.Search loading={searching} />
          </AutoComplete>
        </Form.Item>
        <Form.Item<number>
          name='value'
          rules={[{ required: true, message: '상벌점을 입력해주세요' }]}
        >
          <InputNumber
            min={1}
            controls
            addonAfter='점'
            type='number'
            inputMode='numeric'
            addonBefore={
              <Select
                value={merit}
                onChange={useCallback((value: number) => setMerit(value), [])}
              >
                <Select.Option value={1}>상점</Select.Option>
                <Select.Option value={-1}>벌점</Select.Option>
              </Select>
            }
          />
        </Form.Item>
        <Form.Item<string>
          name='reason'
          rules={[{ required: true, message: '지급이유를 입력해주세요' }]}
        >
          <Input.TextArea
            showCount
            maxLength={500}
            placeholder='상벌점 지급 이유'
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
            {type === 'request' ? '요청하기' : '부여하기'}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
