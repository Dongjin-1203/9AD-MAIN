'use client';

import {
  fetchPointSummary,
  redeemPoint,
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
  Select,
} from 'antd';
import locale from 'antd/es/date-picker/locale/ko_KR';
import 'dayjs/locale/ko';
import { useRouter } from 'next/navigation';
import { UnitSelect } from '../components/UnitSelect';
import type { UnitType } from '../components/UnitSelect';
import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { checkIfNco } from '../give/actions';
import { debounce } from 'lodash';

const usageTemplates = [
  { label: '포상 외출 사용', value: 25 },
  { label: '포상 외박 사용', value: 50 },
  { label: '보상 휴가 1일 사용', value: 50 },
  { label: '징계위원회 회부로 인한 상점 초기화', value: null },
];

export default function UsePointFormPage() {
  const [form] = Form.useForm();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState<{ name: string; sn: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<UnitType | undefined>();
  const [availablePoints, setAvailablePoints] = useState<number | null>();
  const { message } = App.useApp();
  const [target, setTarget] = useState('');

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
    () => debounce((value: string) => setQuery(value), 300),
    [],
  );

  const handleSearch = (value: string) => {
    debouncedSearch(value);
  };

  // ✅ 수정된 부분: selectedUnit 포함하여 병사 검색
  useEffect(() => {
    if (!selectedUnit) return;

    setSearching(true);
    searchEnlisted(query, selectedUnit).then((value) => {
      setSearching(false);
      setOptions(value);
    });
  }, [query, selectedUnit]); // ✅ selectedUnit 의존성 추가

  const handleSubmit = useCallback(
    async (newForm: any) => {
      await form.validateFields();
      setLoading(true);
      redeemPoint({
        ...newForm,
        value: newForm.value,
      })
        .then(({ message: newMessage }) => {
          if (newMessage) {
            message.error(newMessage);
          } else {
            message.success('상점을 성공적으로 사용했습니다');
            router.push('/points');
          }
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
      <Form form={form} onFinish={handleSubmit}>
        <Form.Item name='givenAt' label='사용 일자' colon={false}>
          <DatePicker locale={locale} inputReadOnly style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item label='중대 선택'>
          <UnitSelect onChange={setSelectedUnit} />
        </Form.Item>

        <Form.Item<string>
          label={`사용 대상자 ${target ? `: ${target}` : ''}`}
          name='userId'
          rules={[
            { required: true, message: '사용용자를 입력해주세요' },
            {
              pattern: /^[0-9]{2}-[0-9]{5,8}$/,
              message: '잘못된 군번입니다',
            },
          ]}
        >
          <AutoComplete
            onSearch={handleSearch}
            options={options.map((t) => ({
              value: t.sn,
              label: (
                <div className="flex justify-between">
                  <span>{t.name}</span>
                  <span>{t.sn}</span>
                </div>
              ),
            }))}
            onChange={(value) => {
              const selected = options.find((t) => t.sn === value);
              setTarget(selected ? selected.name : '');
            }}
            getPopupContainer={(c) => c.parentElement}
          >
            <Input.Search loading={searching} />
          </AutoComplete>
        </Form.Item>

        <Form.Item label='사유 선택' colon={false} rules={[{ required: true }]}>
          <Select
            placeholder='사유를 선택하세요'
            onChange={(value: string) => {
              const selected = usageTemplates.find(t => t.label === value);
              form.setFieldValue('reason', selected?.label);
              if (selected?.value === null && availablePoints != null) {
                form.setFieldValue('value', availablePoints);
              } else if (selected?.value != null) {
                form.setFieldValue('value', selected.value);
              }
            }}
            options={usageTemplates.map(t => ({
              label: t.label,
              value: t.label,
            }))}
          />
        </Form.Item>

        <Form.Item<number>
          name='value'
          rules={[
            { required: true, message: '상점을 입력해주세요' },
            {
              validator: (_, value) => {
                if (
                  value != null &&
                  availablePoints != null &&
                  value > availablePoints
                ) {
                  return Promise.reject(new Error('입력 값이 사용 가능한 상점을 초과했습니다.'));
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <InputNumber<number>
            min={1}
            controls
            addonAfter={availablePoints != null ? `/ ${availablePoints}점` : '점'}
            type='number'
            inputMode='numeric'
          />
        </Form.Item>

        <Form.Item<string> name='reason' hidden>
          <Input type='hidden' />
        </Form.Item>

        <Form.Item>
          <Button htmlType='submit' type='primary' loading={loading}>
            사용하기
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
