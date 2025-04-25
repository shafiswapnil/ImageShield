import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Schema for the watermark settings
export const watermarkSettings = pgTable("watermark_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  text: text("text").notNull().default("Not for AI training"),
  position: text("position").notNull().default("bottom-right"),
  opacity: integer("opacity").notNull().default(70),
  fontSize: integer("font_size").notNull().default(24),
  exifProtection: boolean("exif_protection").notNull().default(true),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const insertWatermarkSettingsSchema = createInsertSchema(watermarkSettings).pick({
  userId: true,
  text: true,
  position: true,
  opacity: true,
  fontSize: true,
  exifProtection: true,
});

// Schema for processed images
export const processedImages = pgTable("processed_images", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  originalFilename: text("original_filename").notNull(),
  processedFilename: text("processed_filename").notNull(),
  settingsId: integer("settings_id").references(() => watermarkSettings.id),
  metadata: jsonb("metadata"),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const insertProcessedImageSchema = createInsertSchema(processedImages).pick({
  userId: true,
  originalFilename: true,
  processedFilename: true,
  settingsId: true,
  metadata: true,
});

// Define relations
export const userRelations = relations(users, ({ many }) => ({
  watermarkSettings: many(watermarkSettings),
  processedImages: many(processedImages),
}));

export const watermarkSettingsRelations = relations(watermarkSettings, ({ one, many }) => ({
  user: one(users, { fields: [watermarkSettings.userId], references: [users.id] }),
  processedImages: many(processedImages),
}));

export const processedImagesRelations = relations(processedImages, ({ one }) => ({
  user: one(users, { fields: [processedImages.userId], references: [users.id] }),
  settings: one(watermarkSettings, { fields: [processedImages.settingsId], references: [watermarkSettings.id] }),
}));

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type WatermarkSetting = typeof watermarkSettings.$inferSelect;
export type ProcessedImage = typeof processedImages.$inferSelect;
