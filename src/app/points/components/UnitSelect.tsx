'use client';

import { Select, Form } from 'antd';

export type UnitSelectProps = {
  onChange?: (unit: string) => void;
};

export function UnitSelect({ onChange }: UnitSelectProps) {
  return (
    <Form.Item
      name="unit"
      label="중대 선택"
      rules={[{ required: true, message: '중대를 선택해주세요' }]}
    >
      <Select
        placeholder="중대를 선택하세요"
        onChange={(value) => onChange?.(value)}
        allowClear
      >
        <Select.Option value="headquarters">본부</Select.Option>
        <Select.Option value="security">경비</Select.Option>
        <Select.Option value="ammunition">탄약</Select.Option>
      </Select>
    </Form.Item>
  );
}
