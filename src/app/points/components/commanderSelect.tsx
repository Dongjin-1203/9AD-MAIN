// src/app/components/CommanderSelect.tsx
'use client';

import { Select, Form } from 'antd';
import { useEffect, useState } from 'react';
import { searchCommander } from '@/app/actions/soldiers';

export type CommanderInfo = {
  sn: string;
  name: string;
  unit: 'headquarters' | 'security' | 'ammunition';
};

export type CommanderSelectProps = {
  /** 검색 결과를 부모가 직접 주고 싶을 때(선택) */
  commanders?: CommanderInfo[];
  /** 선택된 중대장 군번이 바뀔 때 */
  onChange?: (sn: string | undefined) => void;
};

export function CommanderSelect({ commanders, onChange }: CommanderSelectProps) {
  const [options, setOptions] = useState<{ label: string; value: string }[]>([]);

  useEffect(() => {
    // commanders prop 이 넘어오면 그것을, 아니면 직접 fetch
    const load = async () => {
      const list = commanders ?? (await searchCommander(''));
      setOptions(
        list.map((c) => ({
          label: `${c.name} (${c.unit})`, // 보기엔 단위가 더 직관적
          value: c.sn,                   // **항상 군번(sn)을 value 로 사용**
        })),
      );
    };
    load();
  }, [commanders]);

  return (
    <Form.Item
      name="approverId" // → form 필드명은 approverId(군번)
      rules={[{ required: true, message: '중대장을 선택해주세요' }]}
    >
      <Select
        placeholder="중대장을 선택하세요"
        options={options}
        onChange={(v) => onChange?.(v)}
        allowClear
        showSearch
        filterOption={(input, option) =>
          String(option?.label).toLowerCase().includes(input.toLowerCase())
        }
      />
    </Form.Item>
  );
}
