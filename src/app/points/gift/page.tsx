'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Form,
  DatePicker,
  Select,
  Input,
  Button,
  Typography,
  InputNumber,
  AutoComplete,
} from 'antd';
import locale from 'antd/es/date-picker/locale/ko_KR';
import dayjs from 'dayjs';

type Soldier = {
  name: string;
  sn: string; // 군번
  unit: string;
};

// 임시 병사 목록
const soldiers: Soldier[] = [
  { name: '김상병', sn: '23-12345', unit: 'headquarters' },
  { name: '박일병', sn: '23-23456', unit: 'security' },
  { name: '이병장', sn: '22-98765', unit: 'ammunition' },
];

export default function GiveMassPointPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [merit, setMerit] = useState<1 | -1>(1);
  const [selectedUnit, setSelectedUnit] = useState<string>();
  const [soldierOptions, setSoldierOptions] = useState<Soldier[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (selectedUnit) {
      const filtered = soldiers.filter((s) => s.unit === selectedUnit);
      setSoldierOptions(filtered);
    }
  }, [selectedUnit]);

  const filteredOptions = useMemo(() => {
    return soldierOptions
      .filter((s) =>
        s.name.includes(query) || s.sn.includes(query)
      )
      .map((s) => ({
        label: `${s.name} (${s.sn})`,
        value: s.sn,
      }));
  }, [query, soldierOptions]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    const payload = {
      ...values,
      givenAt: values.givenAt.format('YYYY-MM-DD'),
      value: values.value * merit,
    };

    try {
      console.log('제출 데이터:', payload);
      // TODO: createPoint API 호출 등
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto text-left">
      <Typography.Title level={3}>상벌점 소급</Typography.Title>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ givenAt: dayjs() }}
      >
        <Form.Item
          name="givenAt"
          label="부여 일자"
          rules={[{ required: true, message: '부여일자를 선택해주세요' }]}
        >
          <DatePicker
            locale={locale}
            inputReadOnly
            style={{ width: '100%' }}
          />
        </Form.Item>

        <Form.Item
          name="unit"
          label="중대 선택"
          rules={[{ required: true, message: '중대를 선택해주세요' }]}
        >
          <Select
            placeholder="중대를 선택하세요"
            onChange={setSelectedUnit}
            allowClear
          >
            <Select.Option value="headquarters">본부</Select.Option>
            <Select.Option value="security">경비</Select.Option>
            <Select.Option value="ammunition">탄약</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="receiver"
          label="수령자 (이름 또는 군번)"
          rules={[{ required: true, message: '수령자를 선택해주세요' }]}
        >
          <AutoComplete
            options={filteredOptions}
            onSearch={setQuery}
            placeholder="예: 김상병 or 23-12345"
            allowClear
            style={{ width: '100%' }}
          />
        </Form.Item>

        <Form.Item
          label="점수 및 유형"
          required
          style={{ marginBottom: 0 }}
        >
          <InputNumber
            name="value"
            min={1}
            style={{ width: '50%' }}
            placeholder="점수 입력"
            onChange={(val) => form.setFieldValue('value', val)}
          />
          <Select
            value={merit}
            onChange={(val) => setMerit(val)}
            style={{ width: '50%' }}
          >
            <Select.Option value={1}>상점</Select.Option>
            <Select.Option value={-1}>벌점</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="reason"
          label="사유"
          rules={[{ required: true, message: '사유를 입력해주세요' }]}
        >
          <Input.TextArea rows={4} placeholder="상벌점 부여 사유를 입력하세요" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            상벌점 부여
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
