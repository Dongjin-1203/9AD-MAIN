import { Radio } from "antd";
import type { RadioChangeEvent } from "antd";

export type UnitTransferProps = {
  unit: 'headquarters' | 'security' | 'ammunition' | 'staff' | null;
  onchange?: (newUnit: 'headquarters' | 'security' | 'ammunition' | 'staff' | null) => void;
  disabled: boolean;
};

export function UnitTransfer({
  unit,
  onchange,
  disabled,
}: UnitTransferProps) {
  return (
    <Radio.Group
      className="flex flex-1 py-2"
      defaultValue={unit}
      onChange={(e: RadioChangeEvent) => {
        onchange?.(e.target.value as 'headquarters' | 'security' | 'ammunition' | 'staff' | null);
      }}
      disabled={disabled}
    >
      <Radio.Button value="headquarters">본부</Radio.Button>
      <Radio.Button value="security">경비</Radio.Button>
      <Radio.Button value="ammunition">탄약</Radio.Button>
      <Radio.Button value="staff">참모</Radio.Button>
      <Radio.Button value={null}>미분류</Radio.Button>
    </Radio.Group>
  );
}
