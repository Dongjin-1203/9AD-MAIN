import z from 'zod';

export const Point = z.object({
  id:              z.string().uuid(),   // 상벌점 ID
  giver_id:        z.string(),          // 상벌점을 부여한 사용자 ID
  receiver_id:     z.string(),          // 상벌점을 받은 사용자 ID
  created_at:      z.date(),            // 상벌점 데이터 생성일
  verified_at:     z.date().nullable(), // 상벌점 검증일
  value:           z.number(),          // 상벌점 값 (양수: 상점, 음수: 벌점)
  reason:          z.string(),          // 상벌점 부여 이유
  given_at:        z.date(),            // 상벌점 받은 날짜
  rejected_at:     z.date().nullable(), // 상벌점 반려일, 반려되지 않은 경우 null
  rejected_reason: z.string(),          // 상벌점 반려 사유
});

export type Point = z.infer<typeof Point>;
