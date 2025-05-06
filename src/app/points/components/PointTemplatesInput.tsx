'use client';

import { Select } from 'antd';
import { useCallback } from 'react';

type PointTemplate = {
  label: string;
  value: string; // 사유
  score: number; // 점수
  type: 'merit' | 'demerit'; // 상점 or 벌점
};

type PointTemplatesInputProps = {
  onChange: (reason: string, score: number) => void;
  type: 'merit' | 'demerit'; // 부모 컴포넌트에서 전달
};

export function PointTemplatesInput({ onChange, type }: PointTemplatesInputProps) {
  const templates: PointTemplate[] = [
    { label: '경계근무', value: '근무공백(환자, 훈련 등) 발생 시, 자발적 근무교대', score: 1, type: 'merit'  },
    { label: '경계근무', value: '근무공백(환자, 훈련 등) 발생 시, 자발적 근무교대', score: 2, type: 'merit'  },
    { label: '경계근무', value: '근무공백(환자, 훈련 등) 발생 시, 자발적 근무교대', score: 3, type: 'merit'  },
    { label: '병영생활', value: '솔선수범', score: 3, type: 'merit'  },
    { label: '병영생활', value: '군 기본자세 유지 우수', score: 1, type: 'merit'  },
    { label: '병영생활', value: '간부 지시사항 이행 우수', score: 1, type: 'merit'  },
    { label: '병영생활', value: '점호 간 담당구역 청소상태 양호', score: 1, type: 'merit'  },
    { label: '병영생활', value: '생활관 및 관물대 정리 우수', score: 1, type: 'merit'  },
    { label: '병영생활', value: '유실된 보급품, 은닉탄(피)회수/보고', score: 5, type: 'merit'  },
    { label: '병영생활', value: '손실 또는 훼손된 비품 발견 및 자발적 조치/보고', score: 1, type: 'merit'  },
    { label: '자기개발', value: '어학점수 및 각종 자격증 취득(90% 이상 & 1급 이와 준하는 수준)', score: 5, type: 'merit'  },
    { label: '자기개발', value: '어학점수 및 각종 자격증 취득(70% 이상 & 2급 이와 준하는 수준)', score: 3, type: 'merit'  },

    { label: '경계근무/배식조', value: '근무(CCTV, 당직부사관, 상황병) 간 2회 이상 졸음', score: -1, type: 'demerit' },
    { label: '경계근무/배식조', value: '경계작전 명령서 대리서명', score: -1, type: 'demerit' },
    { label: '경계근무/배식조', value: '중대장(당직사관) 미보고 하 근무 상호 조정', score: -3, type: 'demerit' },
    { label: '병영생활', value: '통제된 시간 외 TV시청', score: -3, type: 'demerit' },
    { label: '병영생활', value: '군 기본자세 불량(두발, 복장, 위생상태 불량, 세면세족 미실시 등)', score: -1, type: 'demerit' },
    { label: '병영생활', value: '병영생활 임무분담제 미참여', score: -5, type: 'demerit' },
    { label: '병영생활', value: '담당구역 및 생활관 등 청소 미흡', score: -1, type: 'demerit' },
    { label: '병영생활', value: '미보고 하 연등', score: -3, type: 'demerit' },
    { label: '병영생활', value: '지연기상', score: -1, type: 'demerit' },
    { label: '병영생활', value: '관물대 정리정돈 불량', score: -1, type: 'demerit' },
    { label: '병영생활', value: '생활관 내 빨래 방치 / 세탁실 세탁물 장기간 방치', score: -1, type: 'demerit' },
    { label: '병영생활', value: '생활관 퇴실시 불필요 전원 미차단, 소등 미실시', score: -1, type: 'demerit' },
    { label: '병영생활', value: '승인되지 않은 생활관 내 취식 행위', score: -3, type: 'demerit' },
    { label: '병영생활', value: '지시불이행', score: -1, type: 'demerit' },
    { label: '병영생활', value: '지시불이행', score: -2, type: 'demerit' },
    { label: '병영생활', value: '지시불이행', score: -3, type: 'demerit' },
    { label: '병영생활', value: '지시불이행', score: -4, type: 'demerit' },
    { label: '병영생활', value: '지시불이행', score: -5, type: 'demerit' },
    { label: '교육훈련', value: '교육훈련 / 일과 태도 불량', score: -3, type: 'demerit' },
    { label: '교육훈련', value: '체력단련 임의 열외', score: -3, type: 'demerit' },
    { label: '교육훈련', value: '장병 기본훈련 고의적 점수 미달 / 미실시자(과목별 누적 부여 가능)', score: -5, type: 'demerit' },
  ];

  const filtered = templates.filter((t) => t.type === type);

  const handleSelect = useCallback((value: string) => {
    const selected = filtered.find((t) => t.value === value);
    if (selected) {
      onChange(selected.value, selected.score);
    }
  }, [filtered, onChange]);

  return (
    <Select
      showSearch
      placeholder="사유를 선택하세요"
      onChange={handleSelect}
      options={filtered.map((t) => ({
        label: t.label,
        value: t.value,
      }))}
    />
  );
}
