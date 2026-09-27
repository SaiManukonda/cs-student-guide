import {sqliteTable,text} from 'drizzle-orm/sqlite-core';
export const workspaces=sqliteTable('workspaces',{userId:text('user_id').primaryKey(),data:text('data').notNull(),plan:text('plan').notNull().default('free'),updatedAt:text('updated_at').notNull()});
