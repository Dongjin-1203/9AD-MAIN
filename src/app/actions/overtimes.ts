'use server';

import { sql } from 'kysely';
import { kysely } from './kysely';
import { currentSoldier, fetchSoldier } from './soldiers';
import { hasPermission } from './utils';

export async function fetchOvertime(overtimeId: string) {
  return kysely
    .selectFrom('overtimes')
    .where('id', '=', overtimeId)
    .leftJoin('soldiers as g', 'g.sn', 'overtimes.giver_id')
    .leftJoin('soldiers as r', 'r.sn', 'overtimes.receiver_id')
    .leftJoin('soldiers as a', 'a.sn', 'overtimes.approver_id')
    .selectAll(['overtimes'])
    .select(['r.name as receiver', 'g.name as giver', 'a.name as approver'])
    .executeTakeFirst();
}

export async function listOvertimes(sn: string, page: number = 0) {
  const { type } = await kysely
    .selectFrom('soldiers')
    .where('sn', '=', sn)
    .select('type')
    .executeTakeFirstOrThrow();
  const query = kysely
    .selectFrom('overtimes')
    .where(type === 'enlisted' ? 'receiver_id' : 'giver_id', '=', sn);

  const [data, usedOvertimes] = await Promise.all([
    query
      .orderBy('created_at desc')
      .select(['id', 'verified_at', 'approved_at', 'rejected_at', 'disapproved_at'])
      .execute(),
    type === 'enlisted' &&
      kysely
        .selectFrom('used_overtimes')
        .where('user_id', '=', sn)
        .leftJoin('soldiers', 'soldiers.sn', 'used_overtimes.recorded_by')
        .select('soldiers.name as recorder')
        .selectAll(['used_overtimes'])
        .execute(),
  ]);
  return { data, usedOvertimes: usedOvertimes || null };
}

export async function fetchPendingOvertimes() {
  const { sn } = await currentSoldier();
  return kysely
    .selectFrom('overtimes')
    .where('giver_id', '=', sn!)
    .where('verified_at', 'is', null)
    .where('rejected_at', 'is', null)
    .selectAll()
    .execute();
}

export async function fetchOvertimesCountsNco() {
  const { sn } = await currentSoldier();
  const query = kysely
    .selectFrom('overtimes')
    .where('giver_id', '=', sn!)
  const [{ needApprove }, { pending }, { rejected }] = await Promise.all([
    kysely
      .selectFrom('overtimes')
      .where('approver_id', '=', sn!)
      .where('verified_at', 'is not', null)
      .where('approved_at', 'is', null)
      .select((eb) => eb.fn.count<number>('id').as('needApprove'))
      .executeTakeFirstOrThrow(),
    query
      .where('verified_at', 'is', null)
      .where('rejected_at', 'is', null)
      .select((eb) => eb.fn.count<number>('id').as('pending'))
      .executeTakeFirstOrThrow(),
    query
      .where((eb) => eb.or([eb('rejected_at', 'is not', null), eb('disapproved_at', 'is not', null)]))
      .select((eb) => eb.fn.count<number>('id').as('rejected'))
      .executeTakeFirstOrThrow(),
    ]);
  return { needApprove, pending, rejected };
}

export async function fetchOvertimesCountsEnlisted() {
  const { sn } = await currentSoldier();
  const query = kysely
    .selectFrom('overtimes')
    .where('receiver_id', '=', sn!)
  const [{ needApprove }, { pending }, { rejected }] = await Promise.all([
    query
      .where('verified_at', 'is not', null)
      .where('approved_at', 'is', null)
      .select((eb) => eb.fn.count<number>('id').as('needApprove'))
      .executeTakeFirstOrThrow(),
    query
      .where('verified_at', 'is', null)
      .where('rejected_at', 'is', null)
      .select((eb) => eb.fn.count<number>('id').as('pending'))
      .executeTakeFirstOrThrow(),
    query
      .where((eb) => eb.or([eb('rejected_at', 'is not', null), eb('disapproved_at', 'is not', null)]))
      .select((eb) => eb.fn.count<number>('id').as('rejected'))
      .executeTakeFirstOrThrow(),
    ]);
  return { needApprove, pending, rejected };
}

export async function fetchApproveOvertimes() {
  const { sn } = await currentSoldier();
  return kysely
    .selectFrom('overtimes')
    .where('approver_id', '=', sn!)
    .where('verified_at', 'is not', null)
    .where('approved_at', 'is', null)
    .selectAll()
    .execute();
}

export async function deleteOvertime(overtimeId: string) {
  const { type, sn } = await currentSoldier();
  if (type === 'nco') {
    return { message: '간부는 초과근무를 지울 수 없습니다' };
  }
  const overtime = await fetchOvertime(overtimeId);
  if (overtime == null) {
    return { message: '초과근무가 존재하지 않습니다' };
  }
  if (overtime.receiver_id !== sn) {
    return { message: '본인 초과근무만 삭제 할 수 있습니다' };
  }
  if (overtime.approved_at) {
    return { message: '이미 승인된 초과근무는 지울 수 없습니다' };
  }
  try {
    await kysely
      .deleteFrom('overtimes')
      .where('id', '=', overtimeId)
      .executeTakeFirstOrThrow();
  } catch (e) {
    return { message: '알 수 없는 오류가 발생했습니다' };
  }
  return { message: null };
}

export async function verifyOvertime(
  overtimeId:    string,
  value:         boolean,
  rejectReason?: string,
) {
  const [overtime, current] = await Promise.all([
    fetchOvertime(overtimeId),
    currentSoldier(),
  ]);
  if (overtime == null) {
    return { message: '본 초과근무가 존재하지 않습니다' };
  }
  if (overtime.giver_id !== current.sn) {
    return { message: '본인한테 요청된 초과근무만 승인/반려 할 수 있십니다' };
  }
  if (current.type === 'enlisted') {
    return { message: '용사는 초과근무를 승인/반려 할 수 없습니다' };
  }
  if (!value && rejectReason == null) {
    return { message: '반려 사유를 입력해주세요' };
  }
  if (!hasPermission(current.permissions, ['Nco'])) {
    return { message: '초과근무를 승인할 권한이 없습니다' };
  }
  try {
    await kysely
      .updateTable('overtimes')
      .where('id', '=', overtimeId)
      .set({
        verified_at: value ? new Date() : null,
        rejected_at: !value ? new Date() : null,
        rejected_reason: rejectReason,
      })
      .executeTakeFirstOrThrow();
    return { message: null };
  } catch (e) {
    return { message: '승인/반려에 실패하였습니다' };
  }
}

export async function approveOvertime(
  overtimeId:         string,
  value:              boolean,
  disapprovedReason?: string,
) {
  const [overtime, current] = await Promise.all([
    fetchOvertime(overtimeId),
    currentSoldier(),
  ]);
  if (overtime == null) {
    return { message: '본 초과근무가 존재하지 않습니다' };
  }
  if (overtime.approver_id !== current.sn) {
    return { message: '본인한테 요청된 초과근무만 승인/반려 할 수 있십니다' };
  }
  if (current.type === 'enlisted') {
    return { message: '용사는 초과근무를 승인/반려 할 수 없습니다' };
  }
  if (!value && disapprovedReason == null) {
    return { message: '반려 사유를 입력해주세요' };
  }
  if (!hasPermission(current.permissions, ['Approver'])) {
    return { message: '초과근무를 승인할 권한이 없습니다' };
  }
  try {
    await kysely
      .updateTable('overtimes')
      .where('id', '=', overtimeId)
      .set({
        approved_at: value ? new Date() : null,
        disapproved_at: !value ? new Date() : null,
        disapproved_reason: disapprovedReason,
      })
      .executeTakeFirstOrThrow();
    return { message: null };
  } catch (e) {
    return { message: '승인/반려에 실패하였습니다' };
  }
}

export async function fetchOvertimeSummary(sn: string) {
  const overtimesQuery = kysely.selectFrom('overtimes').where('receiver_id', '=', sn);
  const usedOvertimesQuery = kysely
    .selectFrom('used_overtimes')
    .where('user_id', '=', sn);
  const [overtimeData, usedOvertimeData] = await Promise.all([
    overtimesQuery
      .where('value', '>', 0)
      .where('verified_at', 'is not', null)
      .where('approved_at', 'is not', null)
      .select((eb) => eb.fn.sum<string>('value').as('value'))
      .executeTakeFirst(),
    usedOvertimesQuery
      .select(({ fn }) =>
        fn
          .coalesce(fn.sum<string>('used_overtimes.value'), sql<string>`0`)
          .as('value'),
      )
      .executeTakeFirstOrThrow(),
  ]);
  return {
    overtime: parseInt(overtimeData?.value ?? '0', 10),
    usedOvertime: parseInt(usedOvertimeData?.value ?? '0', 10),
  };
}

export async function createOvertime({
  giverId,
  approverId,
  reason,
  startedAt,
  endedAt,
  value,
}: {
  giverId:    string;
  approverId: string;
  reason:     string;
  startedAt:  string; // format: YYYY-MM-DD HH:mm
  endedAt:    string; // format: YYYY-MM-DD HH:mm
  value:      number; // minutes
}) {
  if (reason.trim() === '') {
    return { message: '초과근무 내용을 작성해주세요' };
  }
  const { sn: sn } = await currentSoldier();
  if (giverId == null) {
    return { message: '지시자를 입력해주세요' };
  }
  const target = await fetchSoldier(giverId!);
  if (target.sn == null) {
    return { message: '지시자가 존재하지 않습니다' };
  }
  const approver = await fetchSoldier(approverId!);
  if (approver.sn == null) {
    return { message: '확인관이 존재하지 않습니다' }
  }
  if (!hasPermission(approver.permissions, ['Approver'])) {
    return { message: '확인관의 직책이 행정보급관이 아닙니다' }
  }
  if (giverId === sn) {
    return { message: '스스로에게 수여할 수 없습니다' };
  }
  try {
    await kysely
      .insertInto('overtimes')
      .values({
        receiver_id: sn!,
        giver_id:    giverId!,
        approver_id: approverId!,
        reason:      reason,
        value:       value,
        verified_at: null,
        started_at:  startedAt,
        ended_at:    endedAt,
      } as any)
      .executeTakeFirstOrThrow();
    return { message: null };
  } catch (e) {
    return { message: '알 수 없는 오류가 발생했습니다' };
  }
}

export async function redeemOvertime({
  value,
  userId,
  reason,
}: {
  value: number;
  userId: string;
  reason: string;
}) {
  if (reason.trim() === '') {
    return { message: '초과근무 사용 이유를 작성해주세요' };
  }
  if (value !== Math.round(value)) {
    return { message: '휴가일수는 정수여야 합니다' };
  }
  if (value <= 0) {
    return { message: '1일 이상이어야합니다' };
  }
  const { type, sn, permissions } = await currentSoldier();
  if (sn == null) {
    return { message: '로그아웃후 재시도해 주세요' };
  }
  if (type === 'enlisted') {
    return { message: '용사는 초과근무을 사용할 수 없습니다' };
  }
  if (userId == null) {
    return { message: '대상을 입력해주세요' };
  }
  const target = await fetchSoldier(userId);
  if (target == null) {
    return { message: '대상이 존재하지 않습니다' };
  }
  if (!hasPermission(permissions, ['Admin', 'Commander'])) {
    return { message: '권한이 없습니다' };
  }
  try {
    const [{ total }, { used_overtimes }] = await Promise.all([
      kysely
        .selectFrom('overtimes')
        .where('receiver_id', '=', userId)
        .where('verified_at', 'is not', null)
        .where('approved_at', 'is not', null)
        .select(({ fn }) =>
          fn
            .coalesce(fn.sum<string>('overtimes.value'), sql<string>`0`)
            .as('total'),
        )
        .executeTakeFirstOrThrow(),
      kysely
        .selectFrom('used_overtimes')
        .where('user_id', '=', userId)
        .select(({ fn }) =>
          fn
            .coalesce(fn.sum<string>('used_overtimes.value'), sql<string>`0`)
            .as('used_overtimes'),
        )
        .executeTakeFirstOrThrow(),
    ]);
    if (parseInt(total, 10) - parseInt(used_overtimes, 10) < value*60) {
      return { message: '초과근무 시간이 부족합니다' };
    }
    await kysely
      .insertInto('used_overtimes')
      .values({
        user_id:     userId,
        recorded_by: sn,
        reason,
        value,
      } as any)
      .executeTakeFirstOrThrow();
    return { message: null };
  } catch (e) {
    return { message: '알 수 없는 오류가 발생했습니다' };
  }
}
