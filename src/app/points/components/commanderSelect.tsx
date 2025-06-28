'use client';

import { Select, Form } from 'antd';

export type CommanderType = 'headquarters' | 'security' | 'ammunition';

export type CommanderSelectProps = {
  onChange?: (unit: CommanderType | undefined) => void;
};

export function CommanderSelect({ onChange }: CommanderSelectProps) {
  return (
    <Form.Item
      name="commander"
      rules={[{ required: true, message: '중대장을 선택해주세요' }]}
    >
      <Select<CommanderType>
        placeholder="중대장를 선택하세요"
        onChange={(value) => onChange?.(value)}
        allowClear
        options={[
          { label: '본부중대장', value: 'headquarters' },
          { label: '경비중대장', value: 'security' },
          { label: '탄약중대장', value: 'ammunition' },
        ]}
      />
    </Form.Item>
  );
}
