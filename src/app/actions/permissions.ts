'use server';

import { Permission } from '@/interfaces';
import { kysely } from './kysely';
import { currentSoldier, fetchSoldier } from './soldiers';
import { hasPermission } from './utils';
import _ from 'lodash';

export async function updatePermissions({
  sn,
  permissions,
}: {
  sn:          string;
  permissions: Permission[];
}) {
  const current = await currentSoldier();
  if (sn === current.sn) {
    return { message: '본인 정보는 수정할 수 없습니다' };
  }
  const target = await fetchSoldier(sn);
  if (_.isEqual(target.permissions, permissions)){
    return { message: null}
  }
  if (hasPermission(target.permissions, ['Admin'])) {
    return { message: '관리자는 수정할 수 없습니다' };
  }
  if (!hasPermission(current.permissions, ['Admin', 'Commander', 'UserAdmin'])) {
    return { message: '권한 수정 권한이 없습니다' };
  }
  if (hasPermission(permissions, ['Admin'])) {
    return { message: '관리자 권한은 추가할 수 없습니다' };
  }
  try {
    await kysely
      .deleteFrom('permissions')
      .where('soldiers_id', '=', sn)
      .executeTakeFirstOrThrow();
    if (permissions.length === 0) {
      return { message: null };
    }
    await kysely
      .insertInto('permissions')
      .values(
        permissions.map((p) => ({ soldiers_id: sn, value: p } as any)),
      )
      .executeTakeFirstOrThrow();
    return { message: null };
  } catch (e) {
    return { message: '권한 변경에 실패하였습니다' };
  }
}
