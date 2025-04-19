import z from 'zod';
import { Permission } from './permissions';

/**
 * 시스템에서 병사를 나타냅니다.
 */
export const Soldier = z.object({
  // 군번이자 ID (Military ID)
  sn: z
    .string()
    .trim()
    .regex(/^(\d{2}-\d{5,8}|\d{6})$/, {message: '유효하지 않은 군번 또는 군무원 순번 형식입니다',}),

  // 비밀번호 (Password)
  password: z
    .string()
    .trim()
    .min(1, { message: '비밀번호는 최소 1자 이상이어야 합니다' })
    .max(30, { message: '비밀번호는 최대 30자까지 가능합니다' }),

  // 병사 (enlisted) / 장교 (nco)
  type: z.enum(['enlisted', 'nco']),

  unit: z.enum(['headquarters', 'security', 'ammunition', 'staff']).nullable(),

  // 이름 (Name)
  name: z
    .string()
    .trim()
    .min(1, { message: '이름은 최소 1자 이상이어야 합니다' })
    .max(5, { message: '이름은 최대 5자까지 가능합니다' }),

  // 유저 인증 날짜 / 인증되지 않은 경우 null
  verified_at: z.date().nullable(),

  // 유저 인증 거부 날짜 / 인증되지 않은 경우 null
  rejected_at: z.date().nullable(),

  // 유저 삭제 날짜 / 삭제되지 않은 경우 null
  // 상점 기록을 추적하기 위해 DB에서 삭제하지 않고 deleted_at을 사용
  deleted_at: z.date().nullable(),

  // 유저 권한
  permissions: z.array(Permission),
});

export type Soldier = z.infer<typeof Soldier>;
