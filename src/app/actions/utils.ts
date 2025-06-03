import { Permission } from '@/interfaces';
import _ from 'lodash';

export function hasPermission(
  permissions: Permission[],
  requires:    Permission[],
) {
  return !!_.intersection(requires, permissions).length;
}

