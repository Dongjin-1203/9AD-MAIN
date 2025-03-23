'use server';

import { sql } from 'kysely';
import { kysely } from './kysely';
import { currentSoldier, fetchSoldier } from './soldiers';
import { hasPermission } from './utils';

export async function fetchPoint(pointId: string) {
  return kysely
    .selectFrom('points')
    .where('id', '=', pointId)
    .leftJoin('soldiers as g', 'g.sn', 'points.giver_id')
    .leftJoin('soldiers as r', 'r.sn', 'points.receiver_id')
    .selectAll(['points'])
    .select(['r.name as receiver', 'g.name as giver'])
    .executeTakeFirst();
}

export async function listPoints(sn: string) {
  const { type } = await kysely
    .selectFrom('soldiers')
    .where('sn', '=', sn)
    .select('type')
    .executeTakeFirstOrThrow();
  const query = kysely
    .selectFrom('points')
    .where(type === 'enlisted' ? 'receiver_id' : 'giver_id', '=', sn);

  const [data, usedPoints] = await Promise.all([
    query
      .orderBy('created_at desc')
      .select(['id', 'verified_at', 'rejected_at'])
      .execute(),
    type === 'enlisted' &&
      kysely
        .selectFrom('used_points')
        .where('user_id', '=', sn)
        .leftJoin('soldiers', 'soldiers.sn', 'used_points.recorded_by')
        .select('soldiers.name as recorder')
        .selectAll(['used_points'])
        .execute(),
  ]);
  return { data, usedPoints: usedPoints || null };
}

export async function fetchPendingPoints() {
  const { sn } = await currentSoldier();
  return kysely
    .selectFrom('points')
    .where('giver_id', '=', sn!)
    .where('verified_at', 'is', null)
    .where('rejected_at', 'is', null)
    .selectAll()
    .execute();
}

export async function fetchPointsCountsNco() {
  const { sn } = await currentSoldier();
  const query = kysely
    .selectFrom('points')
    .where('giver_id', '=', sn!)
  const [{ verified }, { pending }, { rejected }] = await Promise.all([
    query
    .where('verified_at', 'is not', null)
    .select((eb) => eb.fn.count<number>('id').as('verified'))
    .executeTakeFirstOrThrow(),
    query
      .where('verified_at', 'is', null)
      .where('rejected_at', 'is', null)
      .select((eb) => eb.fn.count<number>('id').as('pending'))
      .executeTakeFirstOrThrow(),
    query
      .where('rejected_at', 'is not', null)
      .select((eb) => eb.fn.count<number>('id').as('rejected'))
      .executeTakeFirstOrThrow(),
    ]);
  return { verified, pending, rejected };
}

export async function fetchPointsCountsEnlisted() {
  const { sn } = await currentSoldier();
  const query = kysely
    .selectFrom('points')
    .where('receiver_id', '=', sn!)
  const [{ verified }, { pending }, { rejected }] = await Promise.all([
    query
      .where('verified_at', 'is not', null)
      .select((eb) => eb.fn.count<number>('id').as('verified'))
      .executeTakeFirstOrThrow(),
    query
      .where('verified_at', 'is', null)
      .where('rejected_at', 'is', null)
      .select((eb) => eb.fn.count<number>('id').as('pending'))
      .executeTakeFirstOrThrow(),
    query
      .where('rejected_at', 'is not', null)
      .select((eb) => eb.fn.count<number>('id').as('rejected'))
      .executeTakeFirstOrThrow(),
    ]);
  return { verified, pending, rejected };
}

export async function deletePoint(pointId: string) {
  const { type, sn } = await currentSoldier();
  if (type === 'nco') {
    return { message: '간부는 상벌점을 지울 수 없습니다' };
  }
  const data = await fetchPoint(pointId);
  if (data == null) {
    return { message: '상벌점이 존재하지 않습니다' };
  }
  if (data.receiver_id !== sn) {
    return { message: '본인 상벌점만 삭제 할 수 있습니다' };
  }
  if (data.verified_at) {
    return { message: '이미 승인된 상벌점은 지울 수 없습니다' };
  }
  try {
    await kysely
      .deleteFrom('points')
      .where('id', '=', pointId)
      .executeTakeFirstOrThrow();
  } catch (e) {
    return { message: '알 수 없는 오류가 발생했습니다' };
  }
  return { message: null };
}

export async function verifyPoint(
  pointId:       string,
  value:         boolean,
  rejectReason?: string,
) {
  const [point, current] = await Promise.all([
    fetchPoint(pointId),
    currentSoldier(),
  ]);
  if (point == null) {
    return { message: '본 상벌점이 존재하지 않습니다' };
  }
  if (point.giver_id !== current.sn) {
    return { message: '본인한테 요청된 상벌점만 승인/반려 할 수 있십니다' };
  }
  if (current.type === 'enlisted') {
    return { message: '용사는 상벌점을 승인/반려 할 수 없습니다' };
  }
  if (!value && rejectReason == null) {
    return { message: '반려 사유를 입력해주세요' };
  }
  if (!hasPermission(current.permissions, ['Nco'])) {
    return { message: '상벌점을 줄 권한이 없습니다' };
  }
  try {
    await kysely
      .updateTable('points')
      .where('id', '=', pointId)
      .set({
        verified_at:     value ? new Date() : null,
        rejected_at:     !value ? new Date() : null,
        rejected_reason: rejectReason,
      })
      .executeTakeFirstOrThrow();
    return { message: null };
  } catch (e) {
    return { message: '승인/반려에 실패하였습니다' };
  }
}

export async function fetchPointSummary(sn: string) {
  const pointsQuery = kysely.selectFrom('points').where('receiver_id', '=', sn);
  const usedPointsQuery = kysely
    .selectFrom('used_points')
    .where('user_id', '=', sn);
  const [meritData, demeritData, usedMeritData] = await Promise.all([
    pointsQuery
      .where('value', '>', 0)
      .where('verified_at', 'is not', null) // verified_at이 null이 아닌 경우
      .select((eb) => eb.fn.sum<string>('value').as('value'))
      .executeTakeFirst(),
    pointsQuery
      .where('value', '<', 0)
      .where('verified_at', 'is not', null) // 승인된 상벌점만 가져오도록 수정
      .select((eb) => eb.fn.sum<string>('value').as('value'))
      .executeTakeFirst(),
    usedPointsQuery
      .where('value', '>', 0)
      .select((eb) => eb.fn.sum<string>('value').as('value'))
      .executeTakeFirst(),
  ]);
  return {
    merit: parseInt(meritData?.value ?? '0', 10),
    demerit: parseInt(demeritData?.value ?? '0', 10),
    usedMerit: parseInt(usedMeritData?.value ?? '0', 10),
  };
}

export async function createPoint({
  value,
  giverId,
  receiverId,
  reason,
  givenAt,
}: {
  value:       number;
  giverId?:    string | null;
  receiverId?: string | null;
  reason:      string;
  givenAt:     Date;
}) {
  if (reason.trim() === '') {
    return { message: '상벌점 수여 이유를 작성해주세요' };
  }
  if (value !== Math.round(value)) {
    return { message: '상벌점은 정수여야 합니다' };
  }
  if (value === 0) {
    return { message: '1점 이상이거나 -1점 미만이어야합니다' };
  }
  const { type, sn, permissions } = await currentSoldier();
  if (
    (type === 'enlisted' && giverId == null) ||
    (type === 'nco' && receiverId == null)
  ) {
    return { message: '대상을 입력해주세요' };
  }
  const target = await fetchSoldier(
    type === 'enlisted' ? giverId! : receiverId!,
  );
  if (target == null) {
    return { message: '대상이 존재하지 않습니다' };
  }
  if (type === 'enlisted') {
    if (giverId === sn) {
      return { message: '스스로에게 수여할 수 없습니다' };
    }
    try {
      await kysely
        .insertInto('points')
        .values({
          given_at:    givenAt,
          receiver_id: sn!,
          giver_id:    giverId!,
          value,
          reason,
          verified_at: null,
        } as any)
        .executeTakeFirstOrThrow();
      return { message: null };
    } catch (e) {
      return { message: '알 수 없는 오류가 발생했습니다' };
    }
  }
  if (!hasPermission(permissions, ['Nco'])) {
    return { message: '상벌점을 줄 권한이 없습니다' };
  }
  try {
    await kysely
      .insertInto('points')
      .values({
        given_at:    givenAt,
        receiver_id: receiverId!,
        giver_id:    sn!,
        value,
        reason,
        verified_at: new Date(),
      } as any)
      .executeTakeFirstOrThrow();
    return { message: null };
  } catch (e) {
    return { message: '알 수 없는 오류가 발생했습니다' };
  }
}

export async function redeemPoint({
  value,
  userId,
  reason,
}: {
  value:  number;
  userId: string;
  reason: string;
}) {
  if (reason.trim() === '') {
    return { message: '상벌점 사용 이유를 작성해주세요' };
  }
  if (value !== Math.round(value)) {
    return { message: '상벌점은 정수여야 합니다' };
  }
  if (value <= 0) {
    return { message: '1점 이상이어야합니다' };
  }
  const { type, sn, permissions } = await currentSoldier();
  if (sn == null) {
    return { message: '로그아웃후 재시도해 주세요' };
  }
  if (type === 'enlisted') {
    return { message: '용사는 상점을 사용할 수 없습니다' };
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
    const [{ total }, { used_points }] = await Promise.all([
      kysely
        .selectFrom('points')
        .where('receiver_id', '=', userId)
        .where('verified_at', 'is not', null)
        .select(({ fn }) =>
          fn
            .coalesce(fn.sum<string>('points.value'), sql<string>`0`)
            .as('total'),
        )
        .executeTakeFirstOrThrow(),
      kysely
        .selectFrom('used_points')
        .where('user_id', '=', userId)
        .select(({ fn }) =>
          fn
            .coalesce(fn.sum<string>('used_points.value'), sql<string>`0`)
            .as('used_points'),
        )
        .executeTakeFirstOrThrow(),
    ]);
    if (parseInt(total, 10) - parseInt(used_points, 10) < value) {
      return { message: '상점이 부족합니다' };
    }
    await kysely
      .insertInto('used_points')
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

export async function fetchPointTemplates() {
  return kysely.selectFrom('point_templates').selectAll().execute();
}