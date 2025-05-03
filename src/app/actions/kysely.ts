import { Permissions, Point, PointTemplates, Soldier, UsedPoint} from '@/interfaces';
import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';

interface Database {
  points:          Point,
  soldiers:        Soldier,
  permissions:     Permissions,
  point_templates: PointTemplates,
  used_points:     UsedPoint,
}

export const kysely = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool: new Pool({ connectionString: process.env.POSTGRES_URL }),
  }),
});
