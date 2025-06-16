import z from 'zod';

export const Point = z.object({
  id:              z.number(),  // Prisma에서 Int (autoincrement) 사용
  giver_id:        z.string().min(1),    // 사용자 ID (군번)
  receiver_id:     z.string().min(1),
  approver_id:     z.string().min(1),    // 중대장이 승인 시 필요
  created_at:      z.coerce.date(),      // DB Timestamp
  given_at:        z.coerce.date(),      // 부여 날짜
  value:           z.number().int(),     // SmallInt
  reason:          z.string().nullable(),     // optional -> nullable로 변경
  rejected_reason: z.string().nullable(),     // optional -> nullable로 변경
  approved_at:     z.coerce.date().nullable(), // optional 필드
  rejected_at:     z.coerce.date().nullable(),
  status:          z.enum(['pending', 'approved', 'rejected']), // enum
});

export type Point = z.infer<typeof Point>;
