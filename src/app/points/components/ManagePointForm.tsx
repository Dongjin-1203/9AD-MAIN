'use client';

import {
  createPoint,
  searchEnlisted,
  searchNco,
} from '@/app/actions';
import {
  App,
  AutoComplete,
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Select,
} from 'antd';
import locale from 'antd/es/date-picker/locale/ko_KR';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { debounce } from 'lodash';
import { checkIfNco } from '../give/actions';
import { UnitSelect } from '../components/UnitSelect';
import type { UnitType } from '../components/UnitSelect';

const pointTemplates = [
  { label: '경계근무: 근무공백(환자, 훈련 등) 발생 시, 자발적 근무교대 1점', value: 1},
  { label: '경계근무: 근무공백(환자, 훈련 등) 발생 시, 자발적 근무교대 2점', value: 2},
  { label: '경계근무: 근무공백(환자, 훈련 등) 발생 시, 자발적 근무교대 3점', value: 3},
  { label: '병영생활: 솔선수범', value: 3},
  { label: '병영생활: 군 기본자세 유지 우수', value: 1},
  { label: '병영생활: 간부 지시사항 이행 우수', value: 1},
  { label: '병영생활: 점호 간 담당구역 청소상태 양호', value: 1},
  { label: '병영생활: 생활관 및 관물대 정리 우수', value: 1},
  { label: '병영생활: 유실된 보급품, 은닉탄(피)회수/보고', value: 5},
  { label: '병영생활: 손실 또는 훼손된 비품 발견 및 자발적 조치/보고', value: 1},
  { label: '자기개발: 어학점수 및 각종 자격증 취득(90% 이상 & 1급 이와 준하는 수준)', value: 5},
  { label: '자기개발: 어학점수 및 각종 자격증 취득(70% 이상 & 2급 이와 준하는 수준)', value: 3},

  { label: '경계근무/배식조: 근무(CCTV, 당직부사관, 상황병) 간 2회 이상 졸음', value: -1},
  { label: '경계근무/배식조: 경계작전 명령서 대리서명', value: -1},
  { label: '경계근무/배식조: 중대장(당직사관) 미보고 하 근무 상호 조정', value: -3},
  { label: '병영생활: 통제된 시간 외 TV시청', value: -3},
  { label: '병영생활: 군 기본자세 불량(두발, 복장, 위생상태 불량, 세면세족 미실시 등)', value: -1},
  { label: '병영생활: 병영생활 임무분담제 미참여', value: -5},
  { label: '병영생활: 담당구역 및 생활관 등 청소 미흡', value: -1},
  { label: '병영생활: 미보고 하 연등', value: -3},
  { label: '병영생활: 지연기상', value: -1},
  { label: '병영생활: 관물대 정리정돈 불량', value: -1},
  { label: '병영생활: 생활관 내 빨래 방치 / 세탁실 세탁물 장기간 방치', value: -1},
  { label: '병영생활: 생활관 퇴실시 불필요 전원 미차단, 소등 미실시', value: -1},
  { label: '병영생활: 승인되지 않은 생활관 내 취식 행위', value: -3},
  { label: '병영생활: 지시불이행 1점', value: -1},
  { label: '병영생활: 지시불이행 2점', value: -2},
  { label: '병영생활: 지시불이행 3점', value: -3},
  { label: '병영생활: 지시불이행 4점', value: -4},
  { label: '병영생활: 지시불이행 5점', value: -5},
  { label: '교육훈련: 교육훈련 / 일과 태도 불량', value: -3},
  { label: '교육훈련: 체력단련 임의 열외', value: -3},
  { label: '교육훈련: 장병 기본훈련 고의적 점수 미달 / 미실시자(과목별 누적 부여 가능)', value: -5},
];

export type ManagePointFormProps = {
  type: 'request' | 'give';
};

export function ManagePointForm({ type }: ManagePointFormProps) {
  const [merit, setMerit] = useState(1);
  const [form] = Form.useForm();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState<{ name: string; sn: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const { message } = App.useApp();
  const [target, setTarget] = useState('');
  const [selectedUnit, setSelectedUnit] = useState<UnitType | undefined>(undefined);

  const renderPlaceholder = useCallback(
    ({ name, sn }: { name: string; sn: string }) => (
      <div className='flex flex-row justify-between'>
        <span className='text-black'>{name}</span>
        <span className='text-black'>{sn}</span>
      </div>
    ),
    [],
  );

  useEffect(() => {
    if (type === 'give') {
      checkIfNco();
    }
  }, [type]);

  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        setQuery(value);
      }, 300),
    [],
  );

  const handleSearch = (value: string) => {
    debouncedSearch(value);
  };

  useEffect(() => {
    setSearching(true);
    const searchFn = type === 'request' ? searchNco : searchEnlisted;

    searchFn(query, selectedUnit).then((value) => {
      setSearching(false);
      setOptions(value);
    });
  }, [query, type, selectedUnit]);

  const handleSubmit = useCallback(
    async (newForm: any) => {
      await form.validateFields();
      setLoading(true);
      createPoint({
        ...newForm,
        value: merit * newForm.value,
        givenAt: newForm.givenAt.$d as Date,
      })
        .then(({ message: newMessage }) => {
          if (newMessage) {
            message.error(newMessage);
          } else {
            message.success(
              type === 'request'
                ? '상벌점 요청을 성공적으로 했습니다'
                : '상벌점을 성공적으로 부여했습니다',
            );
            router.push('/points');
          }
        })
        .finally(() => {
          setLoading(false);
        });
    },
    [router, merit, form, message, type],
  );

  return (
    <div className='px-4'>
      <div className='my-5' />
      <Form form={form} onFinish={handleSubmit}>
        <Form.Item
          name='givenAt'
          label='받은 날짜'
          colon={false}
          rules={[{ required: true, message: '받은 날짜를 입력해주세요' }]}
        >
          <DatePicker
            placeholder='상벌점을 받은 날짜를 선택해주세요'
            picker='date'
            inputReadOnly
            locale={locale}
          />
        </Form.Item>
        <Form.Item label='중대 선택' colon={false}>
          <UnitSelect onChange={setSelectedUnit} />
        </Form.Item>
        <Form.Item label='사유 선택' colon={false}>
          <Select
            placeholder='사유를 선택하세요'
            onChange={(value, option: any) => {
              const selected = pointTemplates.find(t => t.label === value);
              if (selected) {
                form.setFieldValue('reason', selected.label);
                form.setFieldValue('value', Math.abs(Number(selected.value)));
                setMerit(Number(selected.value) > 0 ? 1 : -1);
              }
            }}
            options={pointTemplates.map((template) => ({
              label: template.label,
              value: template.label,
            }))}
          />
        </Form.Item>
        <Form.Item<string>
          label={(type === 'request' ? '수여자' : '수령자') + (target !== '' ? `: ${target}` : '')}
          name={type === 'request' ? 'giverId' : 'receiverId'}
          rules={[
            { required: true, message: `${type === 'request' ? '수여자' : '수령자'}를 입력해주세요` },
            { pattern: /^[0-9]{2}-[0-9]{5,8}$/, message: '잘못된 군번입니다' },
          ]}
        >
          <AutoComplete
            onSearch={handleSearch}
            options={options.map((t) => ({
              value: t.sn,
              label: renderPlaceholder(t),
            }))}
            onChange={(value) => {
              const selectedOption = options.find((t) => t.sn === value);
              setTarget(selectedOption ? selectedOption.name : '');
            }}
            getPopupContainer={(c) => c.parentElement}
          >
            <Input.Search loading={searching} />
          </AutoComplete>
        </Form.Item>
        <Form.Item<number>
          name='value'
          rules={[{ required: true, message: '상벌점을 입력해주세요' }]}
        >
          <InputNumber
            readOnly
            controls={false}
            value={form.getFieldValue('value')}
            addonAfter='점'
            type='number'
            inputMode='numeric'
            addonBefore={<span>{merit === 1 ? '상점' : '벌점'}</span>}
          />
        </Form.Item>
        <Form.Item<string>
          name='reason'
          rules={[{ required: true, message: '지급이유를 입력해주세요' }]}
        >
          <Input.TextArea
            showCount
            maxLength={500}
            placeholder='상벌점 지급 이유'
            style={{ height: 150 }}
          />
        </Form.Item>
        <Form.Item>
          <Button
            ghost={false}
            htmlType='submit'
            type='primary'
            loading={loading}
          >
            {type === 'request' ? '요청하기' : '부여하기'}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
