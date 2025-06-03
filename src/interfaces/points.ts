import z from 'zod';

export const Point = z.object({
  id:              z.string().uuid(),   // 상벌점 ID
  giver_id:        z.string(),          // 상벌점을 부여한 사용자 ID
  receiver_id:     z.string(),          // 상벌점을 받은 사용자 ID
  created_at:      z.date(),            // 상벌점 데이터 생성일
  value:           z.number(),          // 상벌점 값 (양수: 상점, 음수: 벌점)
  reason:          z.string(),          // 상벌점 부여 이유
  given_at:        z.date(),            // 상벌점 받은 날짜
  rejected_reason: z.string().optional(), // 반려 사유 (optional)

  // 새로 추가된 status 필드
  status: z.enum(['pending', 'approved', 'rejected']), // 상벌점 상태
});

export type Point = z.infer<typeof Point>;
