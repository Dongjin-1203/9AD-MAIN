'use client';

import { useState } from 'react';
import {
  Form,
  DatePicker,
  Select,
  Input,
  Button,
  Typography,
  InputNumber,
} from 'antd';
import locale from 'antd/es/date-picker/locale/ko_KR';
import dayjs from 'dayjs';

export default function GiveMassPointPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [merit, setMerit] = useState<1 | -1>(1); // 상점: 1, 벌점: -1

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
    <div className="p-6 max-w-2xl mx-auto">
      <Typography.Title level={3}>상벌점 일괄 부여</Typography.Title>
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
          <DatePicker
            locale={locale}
            inputReadOnly
            style={{ width: '100%' }}
          />
        </Form.Item>

        {/* 2. 중대 선택 */}
        <Form.Item
          name="unit"
          label="중대 선택"
          rules={[{ required: true, message: '중대를 선택해주세요' }]}
        >
          <Select placeholder="중대를 선택하세요">
            <Select.Option value="headquarters">본부</Select.Option>
            <Select.Option value="security">경비</Select.Option>
            <Select.Option value="ammunition">탄약</Select.Option>
          </Select>
        </Form.Item>

        {/* 3. 수령자 입력 */}
        <Form.Item
          name="receiver"
          label="수령자 군번"
          rules={[
            { required: true, message: '수령자를 입력해주세요' },
            { pattern: /^[0-9]{2}-[0-9]{5,8}$/, message: '잘못된 군번 형식입니다' },
          ]}
        >
          <Input placeholder="예: 22-12345" />
        </Form.Item>

        {/* 4. 점수 입력 및 유형 선택 */}
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

        {/* 5. 사유 입력 */}
        <Form.Item
          name="reason"
          label="사유"
          rules={[{ required: true, message: '사유를 입력해주세요' }]}
        >
          <Input.TextArea rows={4} placeholder="상벌점 부여 사유를 입력하세요" />
        </Form.Item>

        {/* 6. 제출 */}
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            상벌점 부여
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
