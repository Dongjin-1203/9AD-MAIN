'use client';

import { fetchPointTemplates } from '@/app/actions';
import { Button, Input, Select } from 'antd';
import { useEffect, useState } from 'react';
import type { SelectProps } from 'antd';

export type PointTemplatesInputProps = {
  onChange?: (reason: string, value?: number | null) => void;
};

export function PointTemplatesInput({ onChange }: PointTemplatesInputProps) {
  const [options, setOptions] = useState<SelectProps['options']>([]);

  useEffect(() => {
    fetchPointTemplates().then((newData) => {
      const grouped = ['공통', '본부', '경비', '탄약'].map((unitLabel) => ({
        label: unitLabel,
        options: newData
          .filter(({ unit }) =>
            unitLabel === '공통' ? unit == null : unit === unitLabel,
          )
          .map((row) => ({
            label: (
              <div className="flex flex-1 flex-row items-center w-full" key={row.id}>
                <span className="flex-1 inline-block whitespace-normal">{row.reason}</span>
                {row.merit && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onChange?.(row.reason, row.merit);
                    }}
                    type="primary"
                  >
                    {row.merit}
                  </Button>
                )}
                {row.demerit && (
                  <Button
                    className="ml-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      onChange?.(row.reason, row.demerit);
                    }}
                    type="primary"
                    danger
                  >
                    {row.demerit}
                  </Button>
                )}
              </div>
            ),
            value: row.reason,
          })),
      }));
      setOptions(grouped);
    });
  }, [onChange]);

  return (
    <Select
      size="large"
      showSearch
      options={options}
      placeholder="상벌점 템플릿"
      onSelect={(value) => onChange?.(value)}
      optionLabelProp="label"
      style={{ width: '100%' }}
    />
  );
}
