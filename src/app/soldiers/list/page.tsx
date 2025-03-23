'use client';

import { GroupSoldiers, listSoldiers } from '@/app/actions';
import {  Collapse, ConfigProvider, Empty, Input, Select } from 'antd';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { debounce } from 'lodash';
import { UserCard } from './components';

export default function ManageSoldiersPage() {
  const [data, setData] = useState<
    Awaited<ReturnType<typeof listSoldiers>> | null
  >(null);

  const [groupedData, setGroupedData] = useState<
    Awaited<ReturnType<typeof GroupSoldiers>> | null
  >(null);
  const [query, setQuery] = useState<string>('');
  const [type, setType] = useState<string>('')

  const updateQuery = useCallback(
    debounce((value: string) => {
      setQuery(value);
    }, 300),
    []
  );
  
  useEffect(() => {
    return () => {
      updateQuery.cancel();
    };
  }, [updateQuery]);
  

  const onChangeQuery: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    updateQuery(event.target.value);
  };

  useEffect(() => {
    if (query !== '') {
      listSoldiers({ query, type }).then((data) => {
        setData(data);
        setGroupedData(null);
      });
    } else {
      GroupSoldiers(type).then((group) => {
        setGroupedData(group);
        setData(null);
      });
    }
  }, [query, type]);

  useEffect(() => {
    return () => {
      updateQuery.cancel();
    };
  }, [updateQuery]);

  const items = useMemo(() => {
    if (!groupedData) return [];
    return [
      {
        key: 'headquarters',
        label: `본부 (${groupedData.headquarters.length})`,
        children: groupedData.headquarters.map((d) => <UserCard key={d.sn} {...d} />),
      },
      {
        key: 'security',
        label: `경비 (${groupedData.security.length})`,
        children: groupedData.security.map((d) => <UserCard key={d.sn} {...d} />),
      },
      {
        key: 'ammunition',
        label: `탄약 (${groupedData.ammunition.length})`,
        children: groupedData.ammunition.map((d) => <UserCard key={d.sn} {...d} />),
      },
      {
        key: 'staff',
        label: `참모 (${groupedData.staff.length})`,
        children: groupedData.staff.map((d) => <UserCard key={d.sn} {...d} />),
      },
      {
        key: 'unclassified',
        label: `미분류 (${groupedData.unclassified.length})`,
        children: groupedData.unclassified.map((d) => <UserCard key={d.sn} {...d} />),
      },
    ];
  }, [groupedData]);

  return (
    <div className='flex flex-1 flex-col'>
      <div className='flex flex-row items-center'>
        <div className='flex flex-col'>
          <Select style={{width : '80px'}}
            defaultValue={'all'}
            onChange={(v) => setType(v)}
          >
            <Select.Option value='all'>모두</Select.Option>
            <Select.Option value='enlisted'>용사</Select.Option>
            <Select.Option value='nco'>간부</Select.Option>
          </Select>
        </div>
        <Input placeholder='검색' onChange={onChangeQuery} />
      </div>
      {data?.length == 0 && groupedData == null &&
        <div className="py-5 my-5">
          <Empty description={<p>해당 사용자가 존재하지 않습니다</p>} />
        </div>}
      {data?.map((d) => (
        <UserCard key={d.sn} {...d} />
      ))}
      {groupedData && (
        <ConfigProvider
          theme={{
            components: {
              Collapse: {
                headerBg: '#ffffff',
                contentPadding: '0px 0px',
                contentBg: 'rgba(0, 0, 0, 0)',
              },
            },
          }}
        >
          <Collapse items={items} />
        </ConfigProvider>
      )}
    </div>
  );
}
