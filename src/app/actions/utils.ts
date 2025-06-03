import { Permission } from '@/interfaces';
import _ from 'lodash';
import { kysely } from './kysely';

export function hasPermission(
  permissions: Permission[],
  requires:    Permission[],
) {
  return !!_.intersection(requires, permissions).length;
}
// utils.ts 또는 actions/soldiers.ts 등에서
export async function fetchCommanders() {
  return await kysely
    .selectFrom('soldiers')
    .innerJoin('permissions', 'soldiers.sn', 'permissions.soldiers_id')
    .where('permissions.value', '=', 'Commander')
    .select(['soldiers.sn', 'soldiers.name', 'soldiers.unit'])
    .execute();
}
