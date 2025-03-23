import z from 'zod';

export const Overtimes = z.object({
  id:                 z.string().uuid(),   // 초과근무 ID
  giver_id:           z.string(),          // 지시자
  receiver_id:        z.string(),          // 수행자
  approver_id:        z.string(),          // 확인관
  started_at:         z.string().time(),   // 시작 날짜 및 시간
  ended_at:           z.string().time(),   // 종료 날짜 및 시간
  value:              z.number(),          // 초과근무 시간(단위: 분)
  reason:             z.string(),          // 초과근무 내용
  created_at:         z.date(),            // 초과근무 생성일
  verified_at:        z.date().nullable(), // 지시자 확인
  approved_at:        z.date().nullable(), // 확인관 확인
  rejected_at:        z.date().nullable(), // 지시자 반려
  rejected_reason:    z.string(),          // 지시자 반려 사유
  disapproved_at:     z.date().nullable(), // 확인관 반려
  disapproved_reason: z.string(),          // 확인관 반려 사유
});

export type Overtimes = z.infer<typeof Overtimes>;
