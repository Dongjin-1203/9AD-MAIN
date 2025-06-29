'use client';

import {
  createPoint,
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
  Typography,
} from 'antd';
import locale from 'antd/es/date-picker/locale/ko_KR';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { debounce } from 'lodash';
import dayjs from 'dayjs';
import { UnitSelect } from '../components/UnitSelect';
import type { UnitType } from '../components/UnitSelect';
import { CommanderSelect } from '../components/commanderSelect';
import type { CommanderInfo } from '../components/commanderSelect';
import { searchCommander } from '@/app/actions/soldiers';

export default function GiveMassPointPage() {
  const [form] = Form.useForm();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [merit, setMerit] = useState<1 | -1>(1);
  const [selectedUnit, setSelectedUnit] = useState<UnitType | undefined>();
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState<{ name: string; sn: string }[]>([]);
  const [target, setTarget] = useState('');
  const [searching, setSearching] = useState(false);
  const { message } = App.useApp();
  const [commanders, setCommanders] = useState<CommanderInfo[]>([]);
  const [approverId, setApproverId] = useState<string | undefined>();

  const debouncedSearch = useMemo(
    () => debounce((value: string) => setQuery(value), 300),
    []
  );

  const handleSearch = (value: string) => {
    debouncedSearch(value);
  };

  useEffect(() => {
    if (!selectedUnit) return;
    setSearching(true);
    searchEnlisted(query, selectedUnit).then((value) => {
      setSearching(false);
      setOptions(value);
    });
  }, [query, selectedUnit]);

  useEffect(() => {
    const fetch = async () => {
      const rawCommanders = await searchCommander('');
      const filtered = rawCommanders.filter(
        (c): c is CommanderInfo =>
          c.unit === 'headquarters' ||
          c.unit === 'security' ||
          c.unit === 'ammunition'
      );
      setCommanders(filtered);
    };
    fetch();
  }, []);

  const handleSubmit = useCallback(
    async (values: any) => {
      await form.validateFields();
      setLoading(true);

      if (!approverId) {
        message.error('중대장을 선택해주세요');
        setLoading(false);
        return;
      }

      const { message: err } = await createPoint({
        ...values,
        receiverId: values.receiverId,
        approverId,
        value: merit * values.value,
        givenAt: values.givenAt.$d as Date,
      });

      if (err) {
        message.error(err);
      } else {
        message.success('상벌점이 정상적으로 처리되었습니다.');
        form.resetFields();
        router.push('/points');
      }

      setLoading(false);
    },
    [approverId, merit, router]
  );

  return (
    <div className="p-6 max-w-2xl mx-auto text-left">
      <Typography.Title level={3}>상벌점 소급</Typography.Title>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ givenAt: dayjs() }}
      >
        {/* 1. 부여 일자 */}
        <Form.Item
          name="givenAt"
          label="부여 일자"
          rules={[{ required: true, message: '부여일자를 선택해주세요' }]}
        >
          <DatePicker locale={locale} inputReadOnly style={{ width: '100%' }} />
        </Form.Item>

        {/* 2. 중대 선택 */}
        <Form.Item label="중대 선택">
          <UnitSelect onChange={setSelectedUnit} />
        </Form.Item>

        {/* 3. 중대장 선택 */}
        <Form.Item label="중대장 선택" colon={false}>
          <CommanderSelect
            commanders={commanders}
            onChange={(sn) => {
              setApproverId(sn);
              form.setFieldValue('approverId', sn);
            }}
          />
        </Form.Item>

        {/* 4. 수령자 선택 */}
        <Form.Item
          name="receiverId"
          label={`수령자${target ? `: ${target}` : ''}`}
          rules={[
            { required: true, message: '수령자를 입력해주세요' },
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

        {/* 5. 점수 및 유형 */}
        <Form.Item label="점수 및 유형" required style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Form.Item
              name="value"
              noStyle
              rules={[{ required: true, message: '점수를 입력해주세요' }]}
            >
              <InputNumber
                min={1}
                style={{ width: '50%' }}
                placeholder="점수 입력"
              />
            </Form.Item>
            <Select
              value={merit}
              onChange={(val) => setMerit(val)}
              style={{ width: '50%' }}
            >
              <Select.Option value={1}>상점</Select.Option>
              <Select.Option value={-1}>벌점</Select.Option>
            </Select>
          </div>
        </Form.Item>

        {/* 6. 사유 입력 */}
        <Form.Item
          name="reason"
          label="사유"
          rules={[{ required: true, message: '사유를 입력해주세요' }]}
        >
          <Input.TextArea rows={4} placeholder="상벌점 부여 사유를 입력하세요" />
        </Form.Item>

        {/* 7. 제출 */}
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            상벌점 부여
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
