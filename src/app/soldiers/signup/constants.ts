import { Permission } from '@/interfaces';

export const ALL_PERMISSIONS: {
  [key in Permission]: {
    key: Permission;
    title: string;
    disabled?: boolean;
  };
} = {
  Admin: {
    key: 'Admin',
    title: '관리자',
    disabled: true,
  },
  Commander: {
    key: 'Commander',
    title: '중대장',
  },
  UserAdmin: {
    key: 'UserAdmin',
    title: '인사담당관',
  },
  Nco: {
    key: 'Nco',
    title: '상벌점 / 초과근무 부여',
  },
  Approver: {
    key: 'Approver',
    title: '행정보급관',
  },
};
