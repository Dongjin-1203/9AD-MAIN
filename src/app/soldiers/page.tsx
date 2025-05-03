'use client';

import { Permission, Soldier } from '@/interfaces';
import { LoadingOutlined, QuestionOutlined } from '@ant-design/icons';
import {
  Alert,
  Button,
  FloatButton,
  Input,
  Popconfirm,
  Select,
  Spin,
  message,
} from 'antd';
import _ from 'lodash';
import { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import {
  currentSoldier,
  deleteSoldier,
  fetchSoldier,
  hasPermission,
  resetPasswordForce,
  updatePermissions,
  updateUnit,
} from '../actions';
import {
  HelpModal,
  PasswordForm,
  PasswordModal,
  PermissionsTransfer,
  UnitTransfer,
} from './components';

export default function MyProfilePage({
  searchParams: { sn },
}: {
  searchParams: { sn: string };
}) {
  const [current, setCurrent] = useState<Omit<Soldier, 'password'> | null>(null);
  const [targetSoldier, setTargetSoldier] = useState<Omit<Soldier,'password'> | null>(null);
  const viewingSoldier = targetSoldier ?? current;
  const isViewingMine = targetSoldier == null || current?.sn === targetSoldier.sn;
  const [helpShown, setHelpShwon] = useState(false);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [newPassword, setNewPassword] = useState<string | null>(null);
  const [unit, setUnit] = useState<'headquarters' | 'security' | 'ammunition' | 'staff' | null>(null)

  useLayoutEffect(() => {
    Promise.all([currentSoldier(), sn ? fetchSoldier(sn) : null]).then(
      ([newMySoldier, newTargetSoldier]) => {
        setCurrent(newMySoldier);
        setPermissions(newTargetSoldier?.permissions ?? newMySoldier.permissions);
        setTargetSoldier(newTargetSoldier);
        setUnit(newTargetSoldier?.unit ?? newMySoldier.unit)
      },
    );
  }, [sn]);

  const handleUpdateChanges = useCallback(() => {
    updatePermissions({ sn, permissions }).then(({ message: newMessage }) => {
      if (newMessage != null) {
        message.error(newMessage);
      } else {
        setTargetSoldier(
          (state) => ({
            ...state,
            permissions: permissions,
          } as any),
        );
      }
    });
    updateUnit({ sn, unit }).then(({ message: newMessage }) => {
      if (newMessage != null) {
        message.error(newMessage);
      } else {
        setTargetSoldier(
          (state) => ({
            ...state,
            unit: unit,
          } as any),
        );
      }
    });
    message.success('정보를 수정하였습니다.')
  }, [sn, permissions, unit]);

  const permissionAlertMessage = useMemo(() => {
    if (isViewingMine) {
      return '본인 권한은 수정할 수 없습니다';
    }
    if (!hasPermission(current!.permissions, ['Admin', 'Commander', 'UserAdmin'])) {
      return '권한 변경 권한이 없습니다';
    }
    return null;
  }, [isViewingMine, current]);

  const handleResetPassword = useCallback(() => {
    if (isViewingMine) {
      return;
    }
    resetPasswordForce(sn).then(({ password, message: newMessage }) => {
      if (newMessage) {
        return message.error(newMessage);
      }
      setNewPassword(password);
    });
  }, [sn, isViewingMine]);

  const handleUserDelete = useCallback(() => {
    deleteSoldier({ sn, value: viewingSoldier?.deleted_at == null }).then(
      ({ message: newMessage }) => {
        if (newMessage) {
          message.error(newMessage);
        }
        setTargetSoldier((state) => {
          if (state == null) {
            return null;
          }
          message.success(
            `유저를 ${state.deleted_at == null ? '삭제' : '복원'}하였습니다`,
          );
          return {
            ...state,
            deleted_at: state.deleted_at == null ? new Date() : null,
          };
        });
      },
    );
  }, [sn, viewingSoldier?.deleted_at]);

  if (viewingSoldier == null) {
    return (
      <div className='flex flex-1 min-h-full justify-center items-center'>
        <Spin indicator={<LoadingOutlined spin />} />
      </div>
    );
  }

  return (
    <div className='flex flex-1 flex-col py-2 px-3'>
      <div className='flex flex-row items-center'>
        <div className='flex flex-col'>
          <span>유형</span>
          <Select
            disabled
            value={viewingSoldier?.type ?? 'nco'}
          >
            <Select.Option value='enlisted'>용사</Select.Option>
            <Select.Option value='nco'>간부</Select.Option>
          </Select>
        </div>
        <div className='mx-2' />
        <div>
          <span>군번</span>
          <Input
            value={viewingSoldier?.sn || ''}
            disabled
          />
        </div>
        <div className='mx-3' />
        <div>
          <span>이름</span>
          <Input
            value={viewingSoldier?.name || ''}
            disabled
          />
        </div>
      </div>
      <UnitTransfer 
        unit={unit}
        onchange={(u) => setUnit(u)}
        disabled={!hasPermission(current!.permissions, ['Admin', 'Commander', 'UserAdmin'])}
      />
      {(!isViewingMine && hasPermission(current!?.permissions, ['Admin', 'Commander'])) ? (
        <div className='pb-2'>
          <Button href={`/points?sn=${targetSoldier.sn}`}>
            상점 내역 보기
          </Button>
        </div>
      ): null}
      {(!isViewingMine && hasPermission(current!?.permissions, ['Admin', 'Commander'])) ? (
        <div className='pb-2'>
        </div>
      ): null}
      {isViewingMine ? <PasswordForm sn={sn} force={false}/> : null}
      <div className='' />
      {viewingSoldier?.type !== 'enlisted' && (
        <>
          <PermissionsTransfer
            currentUserPermissions={current?.permissions!}
            permissions={permissions as Permission[]}
            onChange={(t) => setPermissions(t)}
          />
          {permissionAlertMessage && (
            <>
              <div className='my-1' />
              <Alert
                type='warning'
                message={permissionAlertMessage}
              />
            </>
          )}
        </>
      )}
      <div className='flex flex-row mt-5 justify-start'>
        {!isViewingMine && (
          <>
            <Popconfirm
              title='초기화'
              description='정말 초기화하시겠습니까?'
              cancelText='취소'
              okText='초기화'
              okType='danger'
              onConfirm={handleResetPassword}
            >
              <Button danger>비밀번호 초기화</Button>
            </Popconfirm>
            <div className='mx-2' />
          </>
        )}
        {!isViewingMine && (
          <>
            <Popconfirm
              title={`${
                viewingSoldier?.deleted_at == null ? '삭제' : '복원'
              }하시겠습니까?`}
              cancelText='취소'
              okText={viewingSoldier?.deleted_at == null ? '삭제' : '복원'}
              okType='danger'
              onConfirm={handleUserDelete}
            >
              <Button danger>
                {viewingSoldier?.deleted_at == null ? '삭제' : '복원'}
              </Button>
            </Popconfirm>
            <div className='mx-2' />
          </>
        )}
        <Button
          type='primary'
          disabled={
            isViewingMine || (_.isEqual(targetSoldier.permissions, permissions) && _.isEqual(targetSoldier.unit, unit))
          }
          onClick={handleUpdateChanges}
        >
          저장
        </Button>
      </div>
      <FloatButton
        icon={<QuestionOutlined />}
        onClick={() => setHelpShwon(true)}
      />
      <HelpModal
        shown={helpShown}
        onPressClose={() => setHelpShwon(false)}
      />
      <PasswordModal
        password={newPassword}
        onClose={() => setNewPassword(null)}
      />
    </div>
  );
}