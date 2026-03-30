import {
    pgTable,
    text,
    integer,
    timestamp,
    real,
    json,
    serial,
} from 'drizzle-orm/pg-core'

// ========================
// Users
// ========================
export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    clerkId: text('clerk_id').notNull().unique(),
    email: text('email').notNull(),
    plan: text('plan').notNull().default('free'), // 'free' | 'pro'
    githubAccessToken: text('github_access_token'), // encrypted
    createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ========================
// Repositories
// ========================
export const repositories = pgTable('repositories', {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    githubRepoId: text('github_repo_id').notNull(),
    repoName: text('repo_name').notNull(),
    fullName: text('full_name').notNull(),
    description: text('description'),
    defaultBranch: text('default_branch').notNull().default('main'),
    language: text('language'),
    isPrivate: text('is_private').default('false'),
    lastScannedAt: timestamp('last_scanned_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ========================
// Scans
// ========================
export const scans = pgTable('scans', {
    id: serial('id').primaryKey(),
    repoId: integer('repo_id')
        .notNull()
        .references(() => repositories.id, { onDelete: 'cascade' }),
    overallScore: real('overall_score'),
    architectureScore: real('architecture_score'),
    securityScore: real('security_score'),
    scalabilityScore: real('scalability_score'),
    performanceScore: real('performance_score'),
    maintainabilityScore: real('maintainability_score'),
    technicalDebtIndex: real('technical_debt_index'),
    scanStatus: text('scan_status').notNull().default('pending'), // pending | processing | completed | failed
    progressMessage: text('progress_message'),
    architectureSummary: text('architecture_summary'),
    securitySummary: text('security_summary'),
    improvementSummary: text('improvement_summary'),
    shareToken: text('share_token').unique(), // for public share links
    createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ========================
// File Reviews
// ========================
export const fileReviews = pgTable('file_reviews', {
    id: serial('id').primaryKey(),
    scanId: integer('scan_id')
        .notNull()
        .references(() => scans.id, { onDelete: 'cascade' }),
    filePath: text('file_path').notNull(),
    fileScore: real('file_score'),
    issuesDetected: json('issues_detected').$type<Issue[]>(),
    riskLevel: text('risk_level'), // 'low' | 'medium' | 'high' | 'critical'
})

// ========================
// PR Reviews
// ========================
export const pullRequestReviews = pgTable('pull_request_reviews', {
    id: serial('id').primaryKey(),
    repoId: integer('repo_id')
        .notNull()
        .references(() => repositories.id, { onDelete: 'cascade' }),
    prNumber: integer('pr_number').notNull(),
    prTitle: text('pr_title'),
    riskScore: real('risk_score'),
    breakingChangeProbability: real('breaking_change_probability'),
    reviewSummary: text('review_summary'),
    issues: json('issues').$type<Issue[]>(),
    postedToGitHub: text('posted_to_github').default('false'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ========================
// Usage Logs
// ========================
export const usageLogs = pgTable('usage_logs', {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    tokensUsed: integer('tokens_used').default(0),
    scanType: text('scan_type'), // 'full' | 'pr' | 'file'
    timestamp: timestamp('timestamp').defaultNow().notNull(),
})

// ========================
// Relations (for Drizzle `with` queries)
// ========================
import { relations } from 'drizzle-orm'

export const usersRelations = relations(users, ({ many }) => ({
    repositories: many(repositories),
    usageLogs: many(usageLogs),
}))

export const repositoriesRelations = relations(repositories, ({ one, many }) => ({
    user: one(users, { fields: [repositories.userId], references: [users.id] }),
    scans: many(scans),
    pullRequestReviews: many(pullRequestReviews),
}))

export const scansRelations = relations(scans, ({ one, many }) => ({
    repository: one(repositories, { fields: [scans.repoId], references: [repositories.id] }),
    fileReviews: many(fileReviews),
}))

export const fileReviewsRelations = relations(fileReviews, ({ one }) => ({
    scan: one(scans, { fields: [fileReviews.scanId], references: [scans.id] }),
}))

export const pullRequestReviewsRelations = relations(pullRequestReviews, ({ one }) => ({
    repository: one(repositories, { fields: [pullRequestReviews.repoId], references: [repositories.id] }),
}))

export const usageLogsRelations = relations(usageLogs, ({ one }) => ({
    user: one(users, { fields: [usageLogs.userId], references: [users.id] }),
}))

// ========================
// Shared Types
// ========================
export type Issue = {
    file: string
    problem: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    suggestion: string
    line?: number
}

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Repository = typeof repositories.$inferSelect
export type NewRepository = typeof repositories.$inferInsert
export type Scan = typeof scans.$inferSelect
export type NewScan = typeof scans.$inferInsert
export type FileReview = typeof fileReviews.$inferSelect
export type PullRequestReview = typeof pullRequestReviews.$inferSelect
export type UsageLog = typeof usageLogs.$inferSelect
