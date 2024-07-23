import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const userTable = pgTable('user', {
    id: text('id').primaryKey(),
    email: text('email').notNull().unique(),
    password_hash: text('password_hash').notNull(),
    projectName: text('project_name'),
    mainDomain: text('main_domain'),
    projectDomain: text('project_domain'),
    dnsVerified: boolean('dns_verified'),
    paymentId: text('payment_id'),
    userPlan: text('user_plan')
});

export const sessionTable = pgTable('session', {
    id: text('id').primaryKey(),
    userId: text('user_id')
        .notNull()
        .references(() => userTable.id),
    expiresAt: timestamp('expires_at', {
        withTimezone: true,
        mode: "date"
    }).notNull()
});

export const domainTable = pgTable('domains', {
    id: text('id').primaryKey(),
    userId: text('user_id')
        .notNull()
        .references(() => userTable.id),
    domainName: text('domain_name').notNull(),
    createdAt: timestamp('created_at', { 
        withTimezone: true, 
        mode: 'date' 
    }).defaultNow().notNull(),
});

export const invitesTable = pgTable('invitesTable', {
    token: text('token').primaryKey(),
    createdAt: timestamp('created_at', { 
        withTimezone: true, 
        mode: 'date' 
    }).defaultNow().notNull(),
    expiresAt: timestamp('expires_at', { 
        withTimezone: true, 
        mode: 'date' 
    }).defaultNow().notNull(),
    used: boolean('used'),
    usedBy: text('used_by').references(() => userTable.id),
});

export const projectTable = pgTable('project', {
    id: text('id').primaryKey(),
    userId: text('user_id')
        .notNull()
        .references(() => userTable.id),
    domainId: text('domain_id')
        .notNull()
        .references(() => domainTable.id), // Ensure this is correctly defined
    domainName: text('domain_name').notNull(),
    projectName: text('project_name').notNull(),
    htmlContent: text('html_content').notNull(),
    projectDomain: text('project_domain').notNull(),
    createdAt: timestamp('created_at', { 
        withTimezone: true, 
        mode: 'date' 
    }).defaultNow().notNull()
});