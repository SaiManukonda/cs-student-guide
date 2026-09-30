import {sqliteTable,text,integer} from 'drizzle-orm/sqlite-core';
export const workspaces=sqliteTable('workspaces',{userId:text('user_id').primaryKey(),data:text('data').notNull(),plan:text('plan').notNull().default('free'),updatedAt:text('updated_at').notNull()});

export const practiceLimits=sqliteTable('practice_limits',{userId:text('user_id').primaryKey(),day:text('day').notNull(),runs:integer('runs').notNull(),nextAt:integer('next_at').notNull()});
