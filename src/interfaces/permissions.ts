import z from 'zod';

/**
 * Admin 권한은 보안상 DB에서만 직접 수정할 수 있습니다.
 * 
 * 권한 관련 API는 actions/permissions.ts에서 사용할 수 있습니다.
 */

export const Permission = z.enum([
  'Admin',
    'Commander',
      'UserAdmin',
      'Nco',
    'Approver',
]);

export const Permissions = z.object({
  id:          z.string().uuid(),
  created_at:  z.date(),
  soldiers_id: z.string(),
  value:       Permission,
});

export type Permission = z.infer<typeof Permission>;
export type Permissions = z.infer<typeof Permissions>;
