'use client';

import { Select, Form } from 'antd';
import { useEffect, useState } from 'react';
import { searchCommander } from '@/app/actions/soldiers';

export function CommanderSelect({ onChange }: { onChange?: (sn: string) => void }) {
  const [options, setOptions] = useState<{ label: string; value: string }[]>([]);

  useEffect(() => {
    const load = async () => {
      const commanders = await searchCommander('');
      const opt = commanders.map(c => ({
        label: `${c.name} (${c.sn})`,
        value: c.sn,
      }));
      setOptions(opt);
    };
    load();
  }, []);

  return (
    <Form.Item
      name="approverId"
      rules={[{ required: true, message: '중대장을 선택해주세요' }]}
    >
      <Select
        placeholder="중대장을 선택하세요"
        onChange={(value) => onChange?.(value)}
        options={options}
        showSearch
        filterOption={(input, option) =>
          (option?.label as string).toLowerCase().includes(input.toLowerCase())
        }
      />
    </Form.Item>
  );
}
