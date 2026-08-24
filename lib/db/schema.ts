import {
  pgTable,
  uuid,
  text,
  timestamp,
  bigint,
  integer,
  boolean,
  decimal,
  index,
  primaryKey,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// ──────────────────────────────────────────────
// Users
// ──────────────────────────────────────────────
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").unique().notNull(),
  name: text("name"),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ──────────────────────────────────────────────
// Photos
// ──────────────────────────────────────────────
export const photos = pgTable(
  "photos",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    // S3 keys (keys only, not full URLs — URLs are pre-signed on demand)
    s3Key: text("s3_key").notNull(),       // originals/<userId>/<uuid>.<ext>
    s3KeySm: text("s3_key_sm"),            // thumbnails/<userId>/<uuid>_sm.jpg
    s3KeyMd: text("s3_key_md"),            // thumbnails/<userId>/<uuid>_md.jpg
    filename: text("filename").notNull(),
    mimeType: text("mime_type").notNull(),
    fileSize: bigint("file_size", { mode: "number" }).notNull(),
    width: integer("width"),
    height: integer("height"),
    // EXIF-sourced date; null means fall back to uploadedAt in queries
    takenAt: timestamp("taken_at", { withTimezone: true }),
    uploadedAt: timestamp("uploaded_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    // processing | ready | error
    status: text("status").notNull().default("processing"),
    cameraInfo: text("camera_info"),       // "Apple iPhone 15 Pro"
    // GPS coordinates — explicitly extracted, user-disclosed
    gpsLat: decimal("gps_lat", { precision: 10, scale: 8 }),
    gpsLng: decimal("gps_lng", { precision: 11, scale: 8 }),
    gpsDisclosed: boolean("gps_disclosed").notNull().default(false),
    // Video-specific
    durationSecs: integer("duration_secs"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("photos_user_taken_idx").on(table.userId, table.takenAt),
    index("photos_user_status_idx").on(table.userId, table.status),
  ]
);

// ──────────────────────────────────────────────
// Albums
// ──────────────────────────────────────────────
export const albums = pgTable("albums", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ──────────────────────────────────────────────
// Album ↔ Photo  (many-to-many)
// ──────────────────────────────────────────────
export const albumPhotos = pgTable(
  "album_photos",
  {
    albumId: uuid("album_id")
      .notNull()
      .references(() => albums.id, { onDelete: "cascade" }),
    photoId: uuid("photo_id")
      .notNull()
      .references(() => photos.id, { onDelete: "cascade" }),
    addedAt: timestamp("added_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (table) => [primaryKey({ columns: [table.albumId, table.photoId] })]
);

// ──────────────────────────────────────────────
// Share links
// ──────────────────────────────────────────────
export const shares = pgTable(
  "shares",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: text("token").unique().notNull(), // 64-char hex (32 random bytes)
    // "photo" | "album"
    targetType: text("target_type").notNull(),
    targetId: uuid("target_id").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }),   // null = never
    revokedAt: timestamp("revoked_at", { withTimezone: true }),   // null = active
    viewCount: integer("view_count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("shares_token_idx").on(table.token)]
);

// ──────────────────────────────────────────────
// Type exports (inferred from schema)
// ──────────────────────────────────────────────
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Photo = typeof photos.$inferSelect;
export type NewPhoto = typeof photos.$inferInsert;
export type Album = typeof albums.$inferSelect;
export type NewAlbum = typeof albums.$inferInsert;
export type AlbumPhoto = typeof albumPhotos.$inferSelect;
export type Share = typeof shares.$inferSelect;
export type NewShare = typeof shares.$inferInsert;
