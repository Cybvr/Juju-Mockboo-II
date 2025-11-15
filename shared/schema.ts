import { sql } from "drizzle-orm";
import { pgTable, text, varchar, real, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const canvasObjects = pgTable("canvas_objects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(), // rectangle, circle, line, triangle, star, hexagon, text, image
  x: real("x").notNull().default(0),
  y: real("y").notNull().default(0),
  width: real("width").notNull().default(100),
  height: real("height").notNull().default(100),
  fill: text("fill").default("#164e63"),
  stroke: text("stroke").default("#000000"),
  strokeWidth: real("stroke_width").default(1),
  rotation: real("rotation").default(0),
  scaleX: real("scale_x").default(1),
  scaleY: real("scale_y").default(1),
  opacity: real("opacity").default(1),
  properties: jsonb("properties"), // Additional type-specific properties
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertCanvasObjectSchema = createInsertSchema(canvasObjects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type CanvasObject = typeof canvasObjects.$inferSelect;
export type InsertCanvasObject = z.infer<typeof insertCanvasObjectSchema>;
