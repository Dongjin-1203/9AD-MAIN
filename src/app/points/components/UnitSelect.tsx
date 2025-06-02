'use client';

import { Select, Form } from 'antd';

export type UnitType = 'headquarters' | 'security' | 'ammunition';

export type UnitSelectProps = {
  onChange?: (unit: UnitType | undefined) => void;
};

export function UnitSelect({ onChange }: UnitSelectProps) {
  return (
    <Form.Item
      name="unit"
      rules={[{ required: true, message: '중대를 선택해주세요' }]}
    >
      <Select<UnitType>
        placeholder="중대를 선택하세요"
        onChange={(value) => onChange?.(value)}
        allowClear
        options={[
          { label: '본부', value: 'headquarters' },
          { label: '경비', value: 'security' },
          { label: '탄약', value: 'ammunition' },
        ]}
      />
    </Form.Item>
  );
}
